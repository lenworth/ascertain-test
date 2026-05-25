from app.models import Patient, PatientNote
from app.utils import calculate_age


def generate_patient_summary(patient: Patient, notes: list[PatientNote]) -> dict:
    """Template-based summary synthesis from patient profile and clinical notes.

    Expects notes pre-sorted by note_timestamp ASC from the database.
    """
    name = f"{patient.first_name} {patient.last_name}"
    age = calculate_age(patient.date_of_birth)
    blood = patient.blood_type or "Unknown"
    conditions = patient.conditions or "None documented"
    allergies = patient.allergies or "None documented"

    key_points: list[str] = []

    if patient.conditions:
        key_points.append(f"Active conditions: {patient.conditions}")
    if patient.allergies:
        key_points.append(f"Known allergies: {patient.allergies}")
    key_points.append(f"Current status: {patient.status.value}")

    if notes:
        recent_notes = notes[-10:]
        narrative_parts = [
            f"{name} is a {age}-year-old patient with blood type {blood}.",
            f"Clinical conditions on file include {conditions}.",
            f"Allergy profile: {allergies}.",
            "",
            "Clinical note timeline:",
        ]
        for note in recent_notes:
            ts = note.note_timestamp.strftime("%Y-%m-%d %H:%M")
            narrative_parts.append(f"  \u2022 [{ts}] {note.content}")
        if len(notes) > 10:
            narrative_parts.append(
                f"  \u2026 and {len(notes) - 10} earlier note(s) on record."
            )
        most_recent = notes[-1]
        narrative_parts.extend(
            [
                "",
                f"Most recent documentation ({most_recent.note_timestamp.strftime('%B %d, %Y')}): "
                f"{most_recent.content}",
            ]
        )
        narrative = "\n".join(narrative_parts)
    else:
        narrative = (
            f"{name} is a {age}-year-old patient with blood type {blood}. "
            f"Conditions: {conditions}. Allergies: {allergies}. "
            "No clinical notes have been recorded yet."
        )

    if patient.last_visit:
        key_points.append(f"Last visit: {patient.last_visit.isoformat()}")

    return {
        "patient_id": patient.id,
        "name": name,
        "age": age,
        "blood_type": patient.blood_type,
        "conditions": patient.conditions,
        "allergies": patient.allergies,
        "status": patient.status,
        "narrative": narrative,
        "key_points": key_points,
    }
