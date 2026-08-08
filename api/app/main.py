from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta, timezone
import math
import os
import secrets
from typing import Any, Callable

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_, select, text
from sqlalchemy.orm import Session

from .auth import (
    create_access_token,
    decode_access_token,
    get_current_user,
    get_token,
    hash_password,
    verify_password,
)
from .db import Base, SessionLocal, engine, get_db
from .models import (
    Booking,
    Equipment,
    Experiment,
    ExperimentMember,
    ExperimentSample,
    LabNote,
    LabNoteVersion,
    RevokedToken,
    Sample,
    SampleMovement,
    User,
)
from .schemas import (
    BookingCreateIn,
    BookingUpdateIn,
    ChangePasswordIn,
    ExperimentCreateIn,
    ExperimentUpdateIn,
    LabNoteCreateIn,
    LabNoteUpdateIn,
    LoginIn,
    MemberLinkIn,
    MovementIn,
    RegisterIn,
    SampleCreateIn,
    SampleLinkIn,
    SampleUpdateIn,
    StatusIn,
    UserUpdateIn,
)


PREFIX = "/api/v1"
ROLES = {"Lab Manager", "Researcher", "Viewer"}
WRITE_ROLES = {"Lab Manager", "Researcher"}
SAMPLE_STATUSES = {"Stored", "In Use", "Processing", "Quarantined", "Archived"}
EXPERIMENT_STATUSES = {"Draft", "Planning", "Running", "On Hold", "Completed", "Archived"}
PRIORITIES = {"Low", "Medium", "High"}
EQUIPMENT_STATUSES = {"Available", "In Use", "Maintenance"}
NOTE_STATES = {"Draft", "Pinned", "Archived"}
BOOKING_STATUSES = {"Confirmed", "Cancelled"}


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def make_id(db: Session, model: type[Any], prefix: str) -> str:
    while True:
        candidate = f"{prefix}-{secrets.token_hex(4).upper()}"
        if db.get(model, candidate) is None:
            return candidate


def normalize_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def user_dict(user: User) -> dict[str, Any]:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "display_name": user.display_name,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


def get_user_or_404(db: Session, user_id: int, include_inactive: bool = False) -> User:
    user = db.get(User, user_id)
    if user is None or (not include_inactive and not user.is_active):
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_sample_or_404(db: Session, sample_id: str) -> Sample:
    sample = db.get(Sample, sample_id)
    if sample is None:
        raise HTTPException(status_code=404, detail="Sample not found")
    return sample


def get_experiment_or_404(db: Session, experiment_id: str) -> Experiment:
    experiment = db.get(Experiment, experiment_id)
    if experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return experiment


def get_equipment_or_404(db: Session, equipment_id: str) -> Equipment:
    equipment = db.get(Equipment, equipment_id)
    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment


def get_booking_or_404(db: Session, booking_id: str) -> Booking:
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


def get_note_or_404(db: Session, note_id: str) -> LabNote:
    note = db.get(LabNote, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="Lab note not found")
    return note


def ensure_write(user: User, owner_id: int | None = None) -> None:
    if user.role not in WRITE_ROLES:
        raise HTTPException(status_code=403, detail="Viewer role is read-only")
    if owner_id is not None and user.role != "Lab Manager" and user.id != owner_id:
        raise HTTPException(status_code=403, detail="You can only edit assigned records")


def ensure_manager(user: User) -> None:
    if user.role != "Lab Manager":
        raise HTTPException(status_code=403, detail="Lab Manager role required")


def can_edit_experiment(db: Session, user: User, experiment: Experiment) -> None:
    if user.role == "Lab Manager":
        return
    if user.role == "Viewer":
        raise HTTPException(status_code=403, detail="Viewer role is read-only")
    if experiment.owner_id == user.id:
        return
    member = db.scalar(
        select(ExperimentMember).where(
            ExperimentMember.experiment_id == experiment.id,
            ExperimentMember.user_id == user.id,
        )
    )
    if member is None:
        raise HTTPException(status_code=403, detail="You are not assigned to this experiment")


def paginate(
    db: Session,
    statement: Any,
    page: int,
    limit: int,
    serializer: Callable[[Any], dict[str, Any]],
) -> dict[str, Any]:
    total = db.scalar(select(func.count()).select_from(statement.order_by(None).subquery())) or 0
    rows = db.scalars(statement.offset((page - 1) * limit).limit(limit)).all()
    return {
        "items": [serializer(row) for row in rows],
        "page": page,
        "limit": limit,
        "total": total,
        "pages": math.ceil(total / limit) if total else 0,
    }


def validate_choice(value: str, choices: set[str], name: str) -> None:
    if value not in choices:
        raise HTTPException(
            status_code=422,
            detail=f"{name} must be one of: {', '.join(sorted(choices))}",
        )


def sample_dict(db: Session, sample: Sample) -> dict[str, Any]:
    owner = db.get(User, sample.owner_id)
    return {
        "id": sample.id,
        "name": sample.name,
        "type": sample.type,
        "owner_id": sample.owner_id,
        "owner": user_dict(owner) if owner else None,
        "collection_date": sample.collection_date,
        "location": sample.location,
        "status": sample.status,
        "temperature": sample.temperature,
        "intake_note": sample.intake_note,
        "updated_at": sample.updated_at,
        "created_at": sample.created_at,
    }


def movement_dict(db: Session, movement: SampleMovement) -> dict[str, Any]:
    moved_by = db.get(User, movement.moved_by_id)
    return {
        "id": movement.id,
        "sample_id": movement.sample_id,
        "from_location": movement.from_location,
        "to_location": movement.to_location,
        "note": movement.note,
        "moved_by": user_dict(moved_by) if moved_by else None,
        "moved_at": movement.moved_at,
    }


def experiment_dict(db: Session, experiment: Experiment) -> dict[str, Any]:
    owner = db.get(User, experiment.owner_id)
    sample_ids = db.scalars(
        select(ExperimentSample.sample_id).where(ExperimentSample.experiment_id == experiment.id)
    ).all()
    member_ids = db.scalars(
        select(ExperimentMember.user_id).where(ExperimentMember.experiment_id == experiment.id)
    ).all()
    members = [db.get(User, member_id) for member_id in member_ids]
    return {
        "id": experiment.id,
        "title": experiment.title,
        "owner_id": experiment.owner_id,
        "owner": user_dict(owner) if owner else None,
        "status": experiment.status,
        "priority": experiment.priority,
        "objective": experiment.objective,
        "protocol": experiment.protocol,
        "method_notes": experiment.method_notes,
        "start_date": experiment.start_date,
        "due_date": experiment.due_date,
        "sample_ids": sample_ids,
        "members": [user_dict(member) for member in members if member],
        "created_at": experiment.created_at,
        "updated_at": experiment.updated_at,
    }


def equipment_dict(equipment: Equipment) -> dict[str, Any]:
    return {
        "id": equipment.id,
        "name": equipment.name,
        "room": equipment.room,
        "status": equipment.status,
        "next_available": equipment.next_available,
        "utilization": equipment.utilization,
    }


def booking_dict(db: Session, booking: Booking) -> dict[str, Any]:
    equipment = db.get(Equipment, booking.equipment_id)
    researcher = db.get(User, booking.researcher_id)
    return {
        "id": booking.id,
        "equipment_id": booking.equipment_id,
        "equipment": equipment_dict(equipment) if equipment else None,
        "researcher_id": booking.researcher_id,
        "researcher": user_dict(researcher) if researcher else None,
        "purpose": booking.purpose,
        "start_at": booking.start_at,
        "end_at": booking.end_at,
        "status": booking.status,
        "created_at": booking.created_at,
        "updated_at": booking.updated_at,
    }


def note_dict(db: Session, note: LabNote) -> dict[str, Any]:
    author = db.get(User, note.author_id)
    experiment = db.get(Experiment, note.experiment_id)
    return {
        "id": note.id,
        "title": note.title,
        "experiment_id": note.experiment_id,
        "experiment_title": experiment.title if experiment else None,
        "author_id": note.author_id,
        "author": user_dict(author) if author else None,
        "content": note.content,
        "state": note.state,
        "current_version": note.current_version,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
    }


def seed_database(db: Session) -> None:
    if db.scalar(select(User).limit(1)) is None:
        admin_username = os.getenv("SEED_ADMIN_USERNAME", "admin")
        admin_email = os.getenv("SEED_ADMIN_EMAIL", "admin@helixlab.io")
        admin_password = os.getenv("SEED_ADMIN_PASSWORD", "Admin123!")
        db.add(
            User(
                username=admin_username,
                email=admin_email.lower(),
                display_name="Lab Manager",
                password_hash=hash_password(admin_password),
                role="Lab Manager",
            )
        )
    if db.scalar(select(Equipment).limit(1)) is None:
        seed_equipment = [
            ("PCR Machine", "Room A · Bench 1"),
            ("Centrifuge", "Room A · Bench 2"),
            ("Microscope", "Room B · Imaging"),
            ("Spectrophotometer", "Room B · Assay"),
            ("DNA Sequencer", "Room C · Sequencing"),
            ("Biosafety Cabinet", "Room D · Cell Culture"),
            ("Incubator", "Room D · Cell Culture"),
            ("Autoclave", "Utility Room"),
        ]
        for index, (name, room) in enumerate(seed_equipment, start=1):
            db.add(Equipment(id=f"EQ-{index:03d}", name=name, room=room, status="Available"))
    db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)
    yield


app = FastAPI(
    title="Helix Lab REST API",
    version="1.0.0",
    description="Core MVP API for laboratory samples, experiments, bookings and lab notes.",
    lifespan=lifespan,
)

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:3000,http://localhost:3001"
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "Helix Lab REST API", "version": "1.0.0", "docs": "/docs"}


# Authentication
@app.post(f"{PREFIX}/auth/register", status_code=201)
def register(body: RegisterIn, db: Session = Depends(get_db)) -> dict[str, Any]:
    requested_role = body.role or "Researcher"
    validate_choice(requested_role, ROLES, "role")
    if requested_role == "Lab Manager":
        raise HTTPException(
            status_code=403,
            detail="Lab Manager accounts must be provisioned by an administrator",
        )
    existing = db.scalar(
        select(User).where(or_(User.username == body.username, User.email == body.email.lower()))
    )
    if existing:
        raise HTTPException(status_code=409, detail="Username or email is already in use")
    user = User(
        username=body.username,
        email=body.email.lower(),
        display_name=body.display_name or body.username,
        password_hash=hash_password(body.password),
        role=requested_role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Registration successful", "user": user_dict(user)}


@app.post(f"{PREFIX}/auth/login")
def login(body: LoginIn, db: Session = Depends(get_db)) -> dict[str, Any]:
    identifier = body.username or body.email or body.identifier or ""
    user = db.scalar(
        select(User).where(or_(User.username == identifier, User.email == identifier.lower()))
    )
    if user is None or not user.is_active or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token, expires_at = create_access_token(user)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_at": expires_at,
        "user": user_dict(user),
    }


@app.post(f"{PREFIX}/auth/logout", status_code=204)
def logout(
    token: str = Depends(get_token),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    payload = decode_access_token(token)
    db.add(
        RevokedToken(
            jti=payload["jti"],
            expires_at=datetime.fromtimestamp(int(payload["exp"]), tz=timezone.utc),
        )
    )
    db.commit()
    return Response(status_code=204)


@app.post(f"{PREFIX}/auth/change-password")
def change_password(
    body: ChangePasswordIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if body.new_password != body.confirm_password:
        raise HTTPException(status_code=422, detail="New passwords do not match")
    current_user.password_hash = hash_password(body.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


# User management
@app.get(f"{PREFIX}/users/check-username/{{username}}")
def check_username(username: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    exists = db.scalar(select(User.id).where(User.username == username)) is not None
    return {"username": username, "available": not exists}


@app.get(f"{PREFIX}/users/me")
def me(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    return user_dict(current_user)


@app.get(f"{PREFIX}/users/{{user_id}}")
def get_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> dict[str, Any]:
    return user_dict(get_user_or_404(db, user_id))


@app.get(f"{PREFIX}/users")
def list_users(
    q: str | None = Query(default=None, min_length=1),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    ensure_manager(current_user)
    statement = select(User).where(User.is_active.is_(True)).order_by(User.created_at.desc())
    if q:
        term = f"%{q}%"
        statement = statement.where(
            or_(User.username.ilike(term), User.email.ilike(term), User.display_name.ilike(term))
        )
    return paginate(db, statement, page, limit, user_dict)


@app.put(f"{PREFIX}/users/{{user_id}}")
def update_user(
    user_id: int,
    body: UserUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    target = get_user_or_404(db, user_id)
    fields = body.model_dump(exclude_unset=True)
    if target.id != current_user.id:
        ensure_manager(current_user)
    if any(key in fields for key in ("role", "is_active")):
        ensure_manager(current_user)
    if "role" in fields and fields["role"] is not None:
        validate_choice(fields["role"], ROLES, "role")
    if "email" in fields and fields["email"] != target.email:
        duplicate = db.scalar(select(User).where(User.email == fields["email"], User.id != target.id))
        if duplicate:
            raise HTTPException(status_code=409, detail="Email is already in use")
    for key, value in fields.items():
        if value is not None:
            setattr(target, key, value)
    db.commit()
    db.refresh(target)
    return user_dict(target)


@app.delete(f"{PREFIX}/users/{{user_id}}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    ensure_manager(current_user)
    target = get_user_or_404(db, user_id)
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    target.is_active = False
    db.commit()
    return Response(status_code=204)


# Samples
@app.post(f"{PREFIX}/samples", status_code=201)
def create_sample(
    body: SampleCreateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    ensure_write(current_user)
    owner_id = body.owner_id or current_user.id
    if owner_id != current_user.id:
        ensure_manager(current_user)
    owner = get_user_or_404(db, owner_id)
    sample = Sample(
        id=make_id(db, Sample, "SMP"),
        name=body.name,
        type=body.type,
        owner_id=owner.id,
        collection_date=body.collection_date or date.today(),
        location=body.location,
        status="Stored",
        temperature=body.temperature,
        intake_note=body.intake_note,
        qr_token=secrets.token_urlsafe(16),
    )
    db.add(sample)
    db.flush()
    db.add(
        SampleMovement(
            sample_id=sample.id,
            from_location=None,
            to_location=sample.location,
            moved_by_id=current_user.id,
            note="Sample registered",
        )
    )
    db.commit()
    db.refresh(sample)
    return sample_dict(db, sample)


@app.get(f"{PREFIX}/samples")
def list_samples(
    q: str | None = Query(default=None, min_length=1),
    sample_type: str | None = Query(default=None, alias="type"),
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    statement = select(Sample).order_by(Sample.updated_at.desc())
    if q:
        term = f"%{q}%"
        statement = statement.where(or_(Sample.id.ilike(term), Sample.name.ilike(term)))
    if sample_type:
        statement = statement.where(Sample.type == sample_type)
    if status_filter:
        validate_choice(status_filter, SAMPLE_STATUSES, "status")
        statement = statement.where(Sample.status == status_filter)
    return paginate(db, statement, page, limit, lambda item: sample_dict(db, item))


@app.get(f"{PREFIX}/samples/{{sample_id}}/qr-code")
def sample_qr_code(
    sample_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, str]:
    sample = get_sample_or_404(db, sample_id)
    return {
        "sample_id": sample.id,
        "format": "text",
        "payload": f"helixlab://samples/{sample.id}?token={sample.qr_token}",
    }


@app.get(f"{PREFIX}/samples/{{sample_id}}/tracking")
def sample_tracking(
    sample_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    sample = get_sample_or_404(db, sample_id)
    movements = db.scalars(
        select(SampleMovement)
        .where(SampleMovement.sample_id == sample.id)
        .order_by(SampleMovement.moved_at.desc())
    ).all()
    return {"sample": sample_dict(db, sample), "movements": [movement_dict(db, item) for item in movements]}


@app.get(f"{PREFIX}/samples/{{sample_id}}")
def get_sample(
    sample_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    return sample_dict(db, get_sample_or_404(db, sample_id))


@app.put(f"{PREFIX}/samples/{{sample_id}}")
def update_sample(
    sample_id: str,
    body: SampleUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    sample = get_sample_or_404(db, sample_id)
    ensure_write(current_user, sample.owner_id)
    fields = body.model_dump(exclude_unset=True)
    if "owner_id" in fields and fields["owner_id"] is not None:
        ensure_manager(current_user)
        get_user_or_404(db, fields["owner_id"])
    if "location" in fields and fields["location"] != sample.location:
        db.add(
            SampleMovement(
                sample_id=sample.id,
                from_location=sample.location,
                to_location=fields["location"],
                moved_by_id=current_user.id,
                note="Sample location updated",
            )
        )
    for key, value in fields.items():
        if value is not None:
            setattr(sample, key, value)
    db.commit()
    db.refresh(sample)
    return sample_dict(db, sample)


@app.patch(f"{PREFIX}/samples/{{sample_id}}/status")
def update_sample_status(
    sample_id: str,
    body: StatusIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    sample = get_sample_or_404(db, sample_id)
    ensure_write(current_user, sample.owner_id)
    validate_choice(body.status, SAMPLE_STATUSES, "status")
    sample.status = body.status
    db.commit()
    db.refresh(sample)
    return sample_dict(db, sample)


@app.post(f"{PREFIX}/samples/{{sample_id}}/movements", status_code=201)
def move_sample(
    sample_id: str,
    body: MovementIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    sample = get_sample_or_404(db, sample_id)
    ensure_write(current_user, sample.owner_id)
    if body.status is not None:
        validate_choice(body.status, SAMPLE_STATUSES, "status")
        sample.status = body.status
    movement = SampleMovement(
        sample_id=sample.id,
        from_location=sample.location,
        to_location=body.to_location,
        note=body.note,
        moved_by_id=current_user.id,
    )
    sample.location = body.to_location
    db.add(movement)
    db.commit()
    db.refresh(movement)
    db.refresh(sample)
    return {"sample": sample_dict(db, sample), "movement": movement_dict(db, movement)}


# Experiments
@app.post(f"{PREFIX}/experiments", status_code=201)
def create_experiment(
    body: ExperimentCreateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    ensure_write(current_user)
    validate_choice(body.status, EXPERIMENT_STATUSES, "status")
    validate_choice(body.priority, PRIORITIES, "priority")
    owner_id = body.owner_id or current_user.id
    if owner_id != current_user.id:
        ensure_manager(current_user)
    get_user_or_404(db, owner_id)
    for sample_id in set(body.sample_ids):
        get_sample_or_404(db, sample_id)
    member_ids = set(body.member_ids) | {owner_id}
    for member_id in member_ids:
        get_user_or_404(db, member_id)
    experiment = Experiment(
        id=make_id(db, Experiment, "EXP"),
        title=body.title,
        owner_id=owner_id,
        status=body.status,
        priority=body.priority,
        objective=body.objective,
        protocol=body.protocol,
        method_notes=body.method_notes,
        start_date=body.start_date,
        due_date=body.due_date,
    )
    db.add(experiment)
    db.flush()
    for sample_id in set(body.sample_ids):
        db.add(ExperimentSample(experiment_id=experiment.id, sample_id=sample_id))
    for member_id in member_ids:
        db.add(ExperimentMember(experiment_id=experiment.id, user_id=member_id))
    db.commit()
    db.refresh(experiment)
    return experiment_dict(db, experiment)


@app.get(f"{PREFIX}/experiments")
def list_experiments(
    q: str | None = Query(default=None, min_length=1),
    status_filter: str | None = Query(default=None, alias="status"),
    owner_id: int | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    statement = select(Experiment).order_by(Experiment.updated_at.desc())
    if q:
        term = f"%{q}%"
        statement = statement.where(or_(Experiment.id.ilike(term), Experiment.title.ilike(term)))
    if status_filter:
        validate_choice(status_filter, EXPERIMENT_STATUSES, "status")
        statement = statement.where(Experiment.status == status_filter)
    if owner_id is not None:
        statement = statement.where(Experiment.owner_id == owner_id)
    return paginate(db, statement, page, limit, lambda item: experiment_dict(db, item))


@app.get(f"{PREFIX}/experiments/{{experiment_id}}")
def get_experiment(
    experiment_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    return experiment_dict(db, get_experiment_or_404(db, experiment_id))


@app.put(f"{PREFIX}/experiments/{{experiment_id}}")
def update_experiment(
    experiment_id: str,
    body: ExperimentUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    experiment = get_experiment_or_404(db, experiment_id)
    can_edit_experiment(db, current_user, experiment)
    fields = body.model_dump(exclude_unset=True)
    if "owner_id" in fields and fields["owner_id"] is not None:
        ensure_manager(current_user)
        get_user_or_404(db, fields["owner_id"])
    if "priority" in fields and fields["priority"] is not None:
        validate_choice(fields["priority"], PRIORITIES, "priority")
    for key, value in fields.items():
        if value is not None:
            setattr(experiment, key, value)
    db.commit()
    db.refresh(experiment)
    return experiment_dict(db, experiment)


@app.patch(f"{PREFIX}/experiments/{{experiment_id}}/status")
def update_experiment_status(
    experiment_id: str,
    body: StatusIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    experiment = get_experiment_or_404(db, experiment_id)
    can_edit_experiment(db, current_user, experiment)
    validate_choice(body.status, EXPERIMENT_STATUSES, "status")
    experiment.status = body.status
    db.commit()
    db.refresh(experiment)
    return experiment_dict(db, experiment)


@app.post(f"{PREFIX}/experiments/{{experiment_id}}/samples", status_code=201)
def add_experiment_sample(
    experiment_id: str,
    body: SampleLinkIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    experiment = get_experiment_or_404(db, experiment_id)
    can_edit_experiment(db, current_user, experiment)
    get_sample_or_404(db, body.sample_id)
    existing = db.scalar(
        select(ExperimentSample).where(
            ExperimentSample.experiment_id == experiment.id,
            ExperimentSample.sample_id == body.sample_id,
        )
    )
    if existing:
        raise HTTPException(status_code=409, detail="Sample is already linked to this experiment")
    db.add(ExperimentSample(experiment_id=experiment.id, sample_id=body.sample_id))
    db.commit()
    return experiment_dict(db, experiment)


@app.delete(f"{PREFIX}/experiments/{{experiment_id}}/samples/{{sample_id}}", status_code=204)
def remove_experiment_sample(
    experiment_id: str,
    sample_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    experiment = get_experiment_or_404(db, experiment_id)
    can_edit_experiment(db, current_user, experiment)
    link = db.scalar(
        select(ExperimentSample).where(
            ExperimentSample.experiment_id == experiment.id,
            ExperimentSample.sample_id == sample_id,
        )
    )
    if link is None:
        raise HTTPException(status_code=404, detail="Sample link not found")
    db.delete(link)
    db.commit()
    return Response(status_code=204)


@app.post(f"{PREFIX}/experiments/{{experiment_id}}/members", status_code=201)
def add_experiment_member(
    experiment_id: str,
    body: MemberLinkIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    experiment = get_experiment_or_404(db, experiment_id)
    can_edit_experiment(db, current_user, experiment)
    get_user_or_404(db, body.user_id)
    existing = db.scalar(
        select(ExperimentMember).where(
            ExperimentMember.experiment_id == experiment.id,
            ExperimentMember.user_id == body.user_id,
        )
    )
    if existing:
        raise HTTPException(status_code=409, detail="User is already a member of this experiment")
    db.add(ExperimentMember(experiment_id=experiment.id, user_id=body.user_id))
    db.commit()
    return experiment_dict(db, experiment)


@app.delete(f"{PREFIX}/experiments/{{experiment_id}}/members/{{user_id}}", status_code=204)
def remove_experiment_member(
    experiment_id: str,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    experiment = get_experiment_or_404(db, experiment_id)
    can_edit_experiment(db, current_user, experiment)
    if user_id == experiment.owner_id:
        raise HTTPException(status_code=400, detail="The experiment owner cannot be removed")
    link = db.scalar(
        select(ExperimentMember).where(
            ExperimentMember.experiment_id == experiment.id,
            ExperimentMember.user_id == user_id,
        )
    )
    if link is None:
        raise HTTPException(status_code=404, detail="Member link not found")
    db.delete(link)
    db.commit()
    return Response(status_code=204)


# Equipment and bookings
@app.get(f"{PREFIX}/equipment")
def list_equipment(
    q: str | None = Query(default=None, min_length=1),
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    statement = select(Equipment).order_by(Equipment.name)
    if q:
        statement = statement.where(Equipment.name.ilike(f"%{q}%"))
    if status_filter:
        validate_choice(status_filter, EQUIPMENT_STATUSES, "status")
        statement = statement.where(Equipment.status == status_filter)
    return paginate(db, statement, page, limit, equipment_dict)


@app.get(f"{PREFIX}/equipment/{{equipment_id}}")
def get_equipment(
    equipment_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    return equipment_dict(get_equipment_or_404(db, equipment_id))


@app.get(f"{PREFIX}/equipment/{{equipment_id}}/availability")
def equipment_availability(
    equipment_id: str,
    start_at: datetime,
    end_at: datetime,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    equipment = get_equipment_or_404(db, equipment_id)
    start = normalize_datetime(start_at)
    end = normalize_datetime(end_at)
    if end <= start:
        raise HTTPException(status_code=422, detail="end_at must be after start_at")
    conflicts = db.scalars(
        select(Booking).where(
            Booking.equipment_id == equipment.id,
            Booking.status == "Confirmed",
            Booking.start_at < end,
            Booking.end_at > start,
        )
    ).all()
    return {
        "equipment": equipment_dict(equipment),
        "start_at": start,
        "end_at": end,
        "available": len(conflicts) == 0 and equipment.status != "Maintenance",
        "conflicts": [booking_dict(db, item) for item in conflicts],
    }


def find_booking_conflict(
    db: Session,
    equipment_id: str,
    start_at: datetime,
    end_at: datetime,
    exclude_id: str | None = None,
) -> Booking | None:
    statement = select(Booking).where(
        Booking.equipment_id == equipment_id,
        Booking.status == "Confirmed",
        Booking.start_at < end_at,
        Booking.end_at > start_at,
    )
    if exclude_id:
        statement = statement.where(Booking.id != exclude_id)
    return db.scalar(statement)


@app.post(f"{PREFIX}/bookings", status_code=201)
def create_booking(
    body: BookingCreateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    ensure_write(current_user)
    equipment = get_equipment_or_404(db, body.equipment_id)
    if equipment.status == "Maintenance":
        raise HTTPException(status_code=409, detail="Equipment is under maintenance")
    researcher_id = body.researcher_id or current_user.id
    if researcher_id != current_user.id:
        ensure_manager(current_user)
    get_user_or_404(db, researcher_id)
    start = normalize_datetime(body.start_at)
    end = normalize_datetime(body.end_at)
    if end <= start:
        raise HTTPException(status_code=422, detail="end_at must be after start_at")
    conflict = find_booking_conflict(db, equipment.id, start, end)
    if conflict:
        raise HTTPException(
            status_code=409,
            detail={"message": "Booking conflict", "conflict_id": conflict.id},
        )
    booking = Booking(
        id=make_id(db, Booking, "BK"),
        equipment_id=equipment.id,
        researcher_id=researcher_id,
        purpose=body.purpose,
        start_at=start,
        end_at=end,
        status="Confirmed",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking_dict(db, booking)


@app.get(f"{PREFIX}/bookings")
def list_bookings(
    equipment_id: str | None = None,
    researcher_id: int | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    from_at: datetime | None = None,
    to_at: datetime | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    statement = select(Booking).order_by(Booking.start_at)
    if equipment_id:
        statement = statement.where(Booking.equipment_id == equipment_id)
    if researcher_id is not None:
        statement = statement.where(Booking.researcher_id == researcher_id)
    if status_filter:
        validate_choice(status_filter, BOOKING_STATUSES, "status")
        statement = statement.where(Booking.status == status_filter)
    if from_at:
        statement = statement.where(Booking.end_at >= normalize_datetime(from_at))
    if to_at:
        statement = statement.where(Booking.start_at <= normalize_datetime(to_at))
    return paginate(db, statement, page, limit, lambda item: booking_dict(db, item))


@app.get(f"{PREFIX}/bookings/{{booking_id}}")
def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    return booking_dict(db, get_booking_or_404(db, booking_id))


@app.put(f"{PREFIX}/bookings/{{booking_id}}")
def update_booking(
    booking_id: str,
    body: BookingUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    booking = get_booking_or_404(db, booking_id)
    if current_user.role != "Lab Manager" and booking.researcher_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own bookings")
    if current_user.role == "Viewer":
        raise HTTPException(status_code=403, detail="Viewer role is read-only")
    fields = body.model_dump(exclude_unset=True)
    equipment_id = fields.get("equipment_id", booking.equipment_id)
    equipment = get_equipment_or_404(db, equipment_id)
    start = normalize_datetime(fields.get("start_at", booking.start_at))
    end = normalize_datetime(fields.get("end_at", booking.end_at))
    new_status = fields.get("status", booking.status)
    validate_choice(new_status, BOOKING_STATUSES, "status")
    if end <= start:
        raise HTTPException(status_code=422, detail="end_at must be after start_at")
    if new_status == "Confirmed":
        if equipment.status == "Maintenance":
            raise HTTPException(status_code=409, detail="Equipment is under maintenance")
        conflict = find_booking_conflict(db, equipment.id, start, end, exclude_id=booking.id)
        if conflict:
            raise HTTPException(status_code=409, detail={"message": "Booking conflict", "conflict_id": conflict.id})
    booking.equipment_id = equipment.id
    booking.purpose = fields.get("purpose", booking.purpose)
    booking.start_at = start
    booking.end_at = end
    booking.status = new_status
    db.commit()
    db.refresh(booking)
    return booking_dict(db, booking)


@app.delete(f"{PREFIX}/bookings/{{booking_id}}", status_code=204)
def delete_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    booking = get_booking_or_404(db, booking_id)
    if current_user.role == "Viewer":
        raise HTTPException(status_code=403, detail="Viewer role is read-only")
    if current_user.role != "Lab Manager" and booking.researcher_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only cancel your own bookings")
    booking.status = "Cancelled"
    db.commit()
    return Response(status_code=204)


# Electronic lab notebook
@app.post(f"{PREFIX}/lab-notes", status_code=201)
def create_lab_note(
    body: LabNoteCreateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    experiment = get_experiment_or_404(db, body.experiment_id)
    can_edit_experiment(db, current_user, experiment)
    note = LabNote(
        id=make_id(db, LabNote, "NOTE"),
        title=body.title,
        experiment_id=experiment.id,
        author_id=current_user.id,
        content=body.content,
        state="Draft",
        current_version=1,
    )
    db.add(note)
    db.flush()
    db.add(
        LabNoteVersion(
            note_id=note.id,
            version_number=1,
            title=note.title,
            content=note.content,
            created_by_id=current_user.id,
        )
    )
    db.commit()
    db.refresh(note)
    return note_dict(db, note)


@app.get(f"{PREFIX}/lab-notes")
def list_lab_notes(
    q: str | None = Query(default=None, min_length=1),
    experiment_id: str | None = None,
    state: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    statement = select(LabNote).order_by(LabNote.updated_at.desc())
    if q:
        statement = statement.where(LabNote.title.ilike(f"%{q}%"))
    if experiment_id:
        statement = statement.where(LabNote.experiment_id == experiment_id)
    if state:
        validate_choice(state, NOTE_STATES, "state")
        statement = statement.where(LabNote.state == state)
    return paginate(db, statement, page, limit, lambda item: note_dict(db, item))


@app.get(f"{PREFIX}/lab-notes/{{note_id}}")
def get_lab_note(
    note_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    return note_dict(db, get_note_or_404(db, note_id))


@app.put(f"{PREFIX}/lab-notes/{{note_id}}")
def update_lab_note(
    note_id: str,
    body: LabNoteUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    note = get_note_or_404(db, note_id)
    experiment = get_experiment_or_404(db, note.experiment_id)
    can_edit_experiment(db, current_user, experiment)
    fields = body.model_dump(exclude_unset=True)
    title = fields.get("title", note.title)
    content = fields.get("content", note.content)
    if title != note.title or content != note.content:
        note.current_version += 1
        note.title = title
        note.content = content
        db.add(
            LabNoteVersion(
                note_id=note.id,
                version_number=note.current_version,
                title=note.title,
                content=note.content,
                created_by_id=current_user.id,
            )
        )
    db.commit()
    db.refresh(note)
    return note_dict(db, note)


@app.patch(f"{PREFIX}/lab-notes/{{note_id}}/status")
def update_lab_note_status(
    note_id: str,
    body: StatusIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    note = get_note_or_404(db, note_id)
    experiment = get_experiment_or_404(db, note.experiment_id)
    can_edit_experiment(db, current_user, experiment)
    validate_choice(body.status, NOTE_STATES, "state")
    note.state = body.status
    db.commit()
    db.refresh(note)
    return note_dict(db, note)


@app.get(f"{PREFIX}/lab-notes/{{note_id}}/versions")
def list_note_versions(
    note_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    note = get_note_or_404(db, note_id)
    versions = db.scalars(
        select(LabNoteVersion)
        .where(LabNoteVersion.note_id == note.id)
        .order_by(LabNoteVersion.version_number.desc())
    ).all()
    return {
        "note_id": note.id,
        "items": [
            {
                "id": version.id,
                "version_number": version.version_number,
                "title": version.title,
                "content": version.content,
                "created_by_id": version.created_by_id,
                "created_at": version.created_at,
            }
            for version in versions
        ],
    }


@app.post(f"{PREFIX}/lab-notes/{{note_id}}/versions/{{version_id}}/restore")
def restore_note_version(
    note_id: str,
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    note = get_note_or_404(db, note_id)
    experiment = get_experiment_or_404(db, note.experiment_id)
    can_edit_experiment(db, current_user, experiment)
    version = db.scalar(
        select(LabNoteVersion).where(
            LabNoteVersion.id == version_id,
            LabNoteVersion.note_id == note.id,
        )
    )
    if version is None:
        raise HTTPException(status_code=404, detail="Lab note version not found")
    note.current_version += 1
    note.title = version.title
    note.content = version.content
    db.add(
        LabNoteVersion(
            note_id=note.id,
            version_number=note.current_version,
            title=note.title,
            content=note.content,
            created_by_id=current_user.id,
        )
    )
    db.commit()
    db.refresh(note)
    return note_dict(db, note)
