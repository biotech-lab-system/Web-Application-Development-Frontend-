import os
from pathlib import Path

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"
os.environ["SEED_DEMO_DATA"] = "true"
os.environ["GEMINI_API_KEY"] = "test-key-not-sent-upstream"

from fastapi.testclient import TestClient

from app.ai_service import AIAnalysis
from app.main import app
import app.main as main_module


def auth_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "admin", "password": "Admin123!"},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def fake_analysis(*_: object, **__: object) -> tuple[AIAnalysis, str]:
    return AIAnalysis(
        answer="Evidence is limited but the selected records are internally consistent.",
        confidence=72,
        key_findings=["Two linked samples were supplied."],
        anomalies=[],
        next_steps=["Verify the source records."],
        disclaimer="Decision support only.",
    ), "gemini-test"


def test_persisted_ai_conversation(monkeypatch: object, tmp_path: Path) -> None:
    os.environ["AI_UPLOAD_DIR"] = str(tmp_path)
    monkeypatch.setattr(main_module, "generate_analysis", fake_analysis)
    with TestClient(app) as client:
        headers = auth_headers(client)
        created = client.post(
            "/api/v1/ai/conversations",
            json={"experiment_id": "EXP-26071"},
            headers=headers,
        )
        assert created.status_code == 201, created.text
        conversation_id = created.json()["id"]
        reply = client.post(
            f"/api/v1/ai/conversations/{conversation_id}/messages",
            data={"message": "Summarize the available evidence."},
            headers=headers,
        )
        assert reply.status_code == 200, reply.text
        assert reply.json()["assistant_message"]["analysis"]["confidence"] == 72
        loaded = client.get(f"/api/v1/ai/conversations/{conversation_id}", headers=headers)
        assert len(loaded.json()["messages"]) == 2


def test_real_pdf_and_xlsx_downloads(tmp_path: Path) -> None:
    os.environ["AI_UPLOAD_DIR"] = str(tmp_path)
    with TestClient(app) as client:
        headers = auth_headers(client)
        for file_format, signature in [("pdf", b"%PDF-"), ("xlsx", b"PK\x03\x04")]:
            created = client.post(
                "/api/v1/reports",
                json={
                    "report_type": "experiment_summary",
                    "format": file_format,
                    "language": "th",
                    "experiment_id": "EXP-26071",
                    "sample_ids": ["SMP-240711", "SMP-240715"],
                    "include_ai": False,
                },
                headers=headers,
            )
            assert created.status_code == 201, created.text
            assert created.json()["status"] == "Completed"
            downloaded = client.get(
                f"/api/v1/reports/{created.json()['id']}/download",
                headers=headers,
            )
            assert downloaded.status_code == 200, downloaded.text
            assert downloaded.content.startswith(signature)
            assert int(downloaded.headers["content-length"]) == len(downloaded.content)


def test_attachment_type_is_rejected(monkeypatch: object, tmp_path: Path) -> None:
    os.environ["AI_UPLOAD_DIR"] = str(tmp_path)
    monkeypatch.setattr(main_module, "generate_analysis", fake_analysis)
    with TestClient(app) as client:
        headers = auth_headers(client)
        conversation = client.post("/api/v1/ai/conversations", json={}, headers=headers).json()
        response = client.post(
            f"/api/v1/ai/conversations/{conversation['id']}/messages",
            data={"message": "Read this file"},
            files={"files": ("unsafe.exe", b"MZ", "application/octet-stream")},
            headers=headers,
        )
        assert response.status_code == 415
