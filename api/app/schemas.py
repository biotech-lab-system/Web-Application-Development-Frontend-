from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_.-]+$")
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    display_name: str | None = Field(default=None, min_length=2, max_length=120)
    role: str | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        if "@" not in value or value.startswith("@") or value.endswith("@"):
            raise ValueError("email must be valid")
        return value.lower()


class LoginIn(BaseModel):
    username: str | None = Field(default=None, min_length=1, max_length=255)
    email: str | None = Field(default=None, min_length=3, max_length=255)
    identifier: str | None = Field(default=None, min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=128)

    @model_validator(mode="after")
    def require_identifier(self) -> "LoginIn":
        if not (self.username or self.email or self.identifier):
            raise ValueError("username, email, or identifier is required")
        return self


class ChangePasswordIn(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)


class UserUpdateIn(BaseModel):
    display_name: str | None = Field(default=None, min_length=2, max_length=120)
    email: str | None = Field(default=None, min_length=5, max_length=255)
    role: str | None = None
    is_active: bool | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is not None:
            if "@" not in value or value.startswith("@") or value.endswith("@"):
                raise ValueError("email must be valid")
            return value.lower()
        return value


class SampleCreateIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    type: str = Field(min_length=1, max_length=80)
    owner_id: int | None = None
    collection_date: date | None = None
    location: str = Field(min_length=1, max_length=120)
    temperature: str = Field(default="-20°C", max_length=40)
    intake_note: str | None = None


class SampleUpdateIn(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    type: str | None = Field(default=None, min_length=1, max_length=80)
    owner_id: int | None = None
    collection_date: date | None = None
    location: str | None = Field(default=None, min_length=1, max_length=120)
    temperature: str | None = Field(default=None, max_length=40)
    intake_note: str | None = None


class StatusIn(BaseModel):
    status: str = Field(min_length=1, max_length=32)


class MovementIn(BaseModel):
    to_location: str = Field(min_length=1, max_length=120)
    note: str | None = None
    status: str | None = None


class ExperimentCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    owner_id: int | None = None
    status: str = "Draft"
    priority: str = "Medium"
    objective: str | None = None
    protocol: str | None = Field(default=None, max_length=180)
    method_notes: str | None = None
    start_date: date | None = None
    due_date: date | None = None
    sample_ids: list[str] = Field(default_factory=list)
    member_ids: list[int] = Field(default_factory=list)


class ExperimentUpdateIn(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=180)
    owner_id: int | None = None
    priority: str | None = None
    objective: str | None = None
    protocol: str | None = Field(default=None, max_length=180)
    method_notes: str | None = None
    start_date: date | None = None
    due_date: date | None = None


class SampleLinkIn(BaseModel):
    sample_id: str = Field(min_length=1, max_length=32)


class MemberLinkIn(BaseModel):
    user_id: int


class BookingCreateIn(BaseModel):
    equipment_id: str = Field(min_length=1, max_length=32)
    researcher_id: int | None = None
    purpose: str = Field(min_length=1, max_length=240)
    start_at: datetime
    end_at: datetime


class BookingUpdateIn(BaseModel):
    equipment_id: str | None = Field(default=None, min_length=1, max_length=32)
    purpose: str | None = Field(default=None, min_length=1, max_length=240)
    start_at: datetime | None = None
    end_at: datetime | None = None
    status: str | None = None


class LabNoteCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    experiment_id: str = Field(min_length=1, max_length=32)
    content: str = Field(min_length=1)


class LabNoteUpdateIn(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=180)
    content: str | None = Field(default=None, min_length=1)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    display_name: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AIConversationCreateIn(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=180)
    experiment_id: str | None = Field(default=None, max_length=32)


class AIConversationUpdateIn(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=180)
    experiment_id: str | None = Field(default=None, max_length=32)


class ReportCreateIn(BaseModel):
    report_type: Literal["experiment_summary", "sample_inventory", "quality_control"]
    format: Literal["pdf", "xlsx"]
    language: Literal["th", "en"] = "en"
    title: str | None = Field(default=None, min_length=1, max_length=180)
    experiment_id: str | None = Field(default=None, max_length=32)
    sample_ids: list[str] = Field(default_factory=list, max_length=100)
    date_from: date | None = None
    date_to: date | None = None
    include_ai: bool = True

    @model_validator(mode="after")
    def validate_report_scope(self) -> "ReportCreateIn":
        if self.report_type == "experiment_summary" and not self.experiment_id:
            raise ValueError("experiment_id is required for experiment_summary")
        if self.date_from and self.date_to and self.date_from > self.date_to:
            raise ValueError("date_from must be before or equal to date_to")
        return self
