from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models import PatientStatus


class PatientBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: date
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=50)
    address: str | None = Field(None, max_length=500)
    blood_type: str | None = Field(None, max_length=10)
    allergies: str | None = None
    conditions: str | None = None
    status: PatientStatus = PatientStatus.ACTIVE
    last_visit: date | None = None

    @field_validator("date_of_birth")
    @classmethod
    def dob_not_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return v


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, min_length=1, max_length=100)
    date_of_birth: date | None = None
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=50)
    address: str | None = Field(None, max_length=500)
    blood_type: str | None = Field(None, max_length=10)
    allergies: str | None = None
    conditions: str | None = None
    status: PatientStatus | None = None
    last_visit: date | None = None

    @field_validator("date_of_birth")
    @classmethod
    def dob_not_future(cls, v: date | None) -> date | None:
        if v is not None and v > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return v


class PatientResponse(PatientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    age: int
    created_at: datetime
    updated_at: datetime


class PatientListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    age: int
    last_visit: date | None
    status: PatientStatus


class PaginatedPatients(BaseModel):
    items: list[PatientListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class NoteCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=10000)
    note_timestamp: datetime | None = None


class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    content: str
    note_timestamp: datetime
    created_at: datetime


class PatientSummary(BaseModel):
    patient_id: int
    name: str
    age: int
    blood_type: str | None
    conditions: str | None
    allergies: str | None
    status: PatientStatus
    narrative: str
    key_points: list[str]


class ErrorResponse(BaseModel):
    detail: str | list[dict]


SortField = Literal["name", "age", "last_visit", "status"]
SortOrder = Literal["asc", "desc"]
