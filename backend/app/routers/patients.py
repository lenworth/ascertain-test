from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, desc, func, literal, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Patient, PatientNote, PatientStatus
from app.schemas import (
    NoteCreate,
    NoteResponse,
    PaginatedPatients,
    PatientCreate,
    PatientListItem,
    PatientResponse,
    PatientStats,
    PatientSummary,
    PatientUpdate,
    SortField,
    SortOrder,
)
from app.services.summary import generate_patient_summary
from app.utils import calculate_age, patient_to_response

router = APIRouter(prefix="/patients", tags=["patients"])


def _get_patient_or_404(db: Session, patient_id: int) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found",
        )
    return patient


@router.get("/stats", response_model=PatientStats)
def get_patient_stats(db: Session = Depends(get_db)):
    """Single query returning counts per status."""
    rows = (
        db.query(Patient.status, func.count(Patient.id))
        .group_by(Patient.status)
        .all()
    )
    counts = {s.value: 0 for s in PatientStatus}
    total = 0
    for patient_status, count in rows:
        counts[patient_status.value] = count
        total += count
    return PatientStats(total=total, **counts)


@router.get("", response_model=PaginatedPatients)
def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, max_length=200),
    status_filter: PatientStatus | None = Query(None, alias="status"),
    sort_by: SortField = Query("name"),
    sort_order: SortOrder = Query("asc"),
    db: Session = Depends(get_db),
):
    # Use window function to get total count in the same query
    total_window = func.count(Patient.id).over().label("_total")
    query = db.query(Patient, total_window)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Patient.first_name.ilike(term),
                Patient.last_name.ilike(term),
                Patient.email.ilike(term),
                Patient.conditions.ilike(term),
            )
        )

    if status_filter:
        query = query.filter(Patient.status == status_filter)

    # Sort direction: age sort inverts because older DOB = higher age
    if sort_by == "age":
        order_col = Patient.date_of_birth
        direction = desc if sort_order == "asc" else asc
    else:
        order_col = {
            "name": Patient.last_name,
            "last_visit": Patient.last_visit,
            "status": Patient.status,
        }[sort_by]
        direction = asc if sort_order == "asc" else desc
    query = query.order_by(direction(order_col), Patient.first_name)

    offset = (page - 1) * page_size
    rows = query.offset(offset).limit(page_size).all()

    if rows:
        total = rows[0]._total
    else:
        total = (
            db.query(func.count(Patient.id))
            .filter(Patient.status == status_filter if status_filter else literal(True))
            .scalar()
            or 0
        ) if page > 1 else 0

    items = [
        PatientListItem(
            id=p.id,
            first_name=p.first_name,
            last_name=p.last_name,
            age=calculate_age(p.date_of_birth),
            last_visit=p.last_visit,
            status=p.status,
        )
        for p, _ in rows
    ]

    total_pages = max(1, (total + page_size - 1) // page_size)
    return PaginatedPatients(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = _get_patient_or_404(db, patient_id)
    return patient_to_response(patient)


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    patient = Patient(**payload.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient_to_response(patient)


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int, payload: PatientUpdate, db: Session = Depends(get_db)
):
    patient = _get_patient_or_404(db, patient_id)
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )
    for key, value in updates.items():
        setattr(patient, key, value)
    db.commit()
    db.refresh(patient)
    return patient_to_response(patient)


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = _get_patient_or_404(db, patient_id)
    db.delete(patient)
    db.commit()


@router.post(
    "/{patient_id}/notes",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_note(
    patient_id: int, payload: NoteCreate, db: Session = Depends(get_db)
):
    _get_patient_or_404(db, patient_id)
    note = PatientNote(
        patient_id=patient_id,
        content=payload.content,
        note_timestamp=payload.note_timestamp or datetime.utcnow(),
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/{patient_id}/notes", response_model=list[NoteResponse])
def list_notes(patient_id: int, db: Session = Depends(get_db)):
    _get_patient_or_404(db, patient_id)
    notes = (
        db.query(PatientNote)
        .filter(PatientNote.patient_id == patient_id)
        .order_by(PatientNote.note_timestamp.desc())
        .all()
    )
    return notes


@router.delete(
    "/{patient_id}/notes/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_note(patient_id: int, note_id: int, db: Session = Depends(get_db)):
    note = (
        db.query(PatientNote)
        .filter(
            PatientNote.id == note_id,
            PatientNote.patient_id == patient_id,
        )
        .first()
    )
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note {note_id} not found for patient {patient_id}",
        )
    db.delete(note)
    db.commit()


@router.get("/{patient_id}/summary", response_model=PatientSummary)
def get_patient_summary(patient_id: int, db: Session = Depends(get_db)):
    patient = _get_patient_or_404(db, patient_id)
    notes = (
        db.query(PatientNote)
        .filter(PatientNote.patient_id == patient_id)
        .order_by(PatientNote.note_timestamp.asc())
        .all()
    )
    return generate_patient_summary(patient, notes)
