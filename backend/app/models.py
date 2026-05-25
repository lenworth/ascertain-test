import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PatientStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    CRITICAL = "critical"
    DISCHARGED = "discharged"


class Patient(Base):
    __tablename__ = "patients"
    __table_args__ = (
        Index("ix_patients_last_name_trgm", "last_name"),
        Index("ix_patients_first_name_trgm", "first_name"),
        Index("ix_patients_status", "status"),
        Index("ix_patients_last_visit", "last_visit"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(50))
    address: Mapped[str | None] = mapped_column(String(500))
    blood_type: Mapped[str | None] = mapped_column(String(10))
    allergies: Mapped[str | None] = mapped_column(Text)
    conditions: Mapped[str | None] = mapped_column(Text)
    status: Mapped[PatientStatus] = mapped_column(
        Enum(PatientStatus), default=PatientStatus.ACTIVE, nullable=False
    )
    last_visit: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    notes: Mapped[list["PatientNote"]] = relationship(
        "PatientNote", back_populates="patient", cascade="all, delete-orphan"
    )


class PatientNote(Base):
    __tablename__ = "patient_notes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    note_timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    patient: Mapped["Patient"] = relationship("Patient", back_populates="notes")
