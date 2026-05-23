from datetime import date

from dateutil.relativedelta import relativedelta


def calculate_age(dob: date, reference: date | None = None) -> int:
    ref = reference or date.today()
    return relativedelta(ref, dob).years


def patient_to_response(patient) -> dict:
    data = {
        "id": patient.id,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "date_of_birth": patient.date_of_birth,
        "email": patient.email,
        "phone": patient.phone,
        "address": patient.address,
        "blood_type": patient.blood_type,
        "allergies": patient.allergies,
        "conditions": patient.conditions,
        "status": patient.status,
        "last_visit": patient.last_visit,
        "created_at": patient.created_at,
        "updated_at": patient.updated_at,
        "age": calculate_age(patient.date_of_birth),
    }
    return data
