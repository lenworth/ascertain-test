from datetime import date, datetime, timedelta
import random

from sqlalchemy.orm import Session

from app.models import Patient, PatientNote, PatientStatus

FIRST_NAMES = [
    "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
    "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen",
]
LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin",
]
BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
CONDITIONS = [
    "Hypertension", "Type 2 Diabetes", "Asthma", "Arthritis", "COPD",
    "Hyperlipidemia", "Anxiety", "GERD", "Hypothyroidism", None,
]
ALLERGIES = [
    "Penicillin", "Peanuts", "Latex", "Shellfish", "Sulfa drugs", None,
]
NOTE_TEMPLATES = [
    "Patient reports improved energy levels since last visit.",
    "Blood pressure readings within target range. Continue current medication.",
    "Discussed lifestyle modifications including diet and exercise.",
    "Follow-up labs ordered; results pending.",
    "Patient compliant with medication regimen. No adverse effects reported.",
    "Mild seasonal allergy symptoms; recommended OTC antihistamine.",
    "Annual wellness exam completed. Vaccinations up to date.",
    "Referred to specialist for further evaluation.",
    "Pain management plan reviewed and adjusted.",
    "Patient educated on warning signs requiring immediate care.",
]


def seed_database(db: Session, min_patients: int = 20) -> None:
    if db.query(Patient).count() >= min_patients:
        return

    random.seed(42)
    today = date.today()

    for i in range(min_patients):
        dob = today - timedelta(days=random.randint(18 * 365, 85 * 365))
        last_visit = today - timedelta(days=random.randint(1, 365))
        patient = Patient(
            first_name=FIRST_NAMES[i % len(FIRST_NAMES)],
            last_name=LAST_NAMES[i % len(LAST_NAMES)],
            date_of_birth=dob,
            email=f"patient{i + 1}@example.com",
            phone=f"555-{1000 + i:04d}",
            address=f"{100 + i} Main Street, Springfield, IL 62701",
            blood_type=random.choice(BLOOD_TYPES),
            allergies=random.choice(ALLERGIES),
            conditions=random.choice(CONDITIONS),
            status=random.choice(list(PatientStatus)),
            last_visit=last_visit,
        )
        db.add(patient)
        db.flush()

        num_notes = random.randint(1, 4)
        for j in range(num_notes):
            note_time = datetime.utcnow() - timedelta(days=random.randint(1, 180))
            db.add(
                PatientNote(
                    patient_id=patient.id,
                    content=random.choice(NOTE_TEMPLATES),
                    note_timestamp=note_time,
                )
            )

    db.commit()
