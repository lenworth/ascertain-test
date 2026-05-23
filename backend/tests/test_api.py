def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_and_get_patient(client):
    payload = {
        "first_name": "Jane",
        "last_name": "Doe",
        "date_of_birth": "1990-05-15",
        "email": "jane@example.com",
        "status": "active",
    }
    create = client.post("/patients", json=payload)
    assert create.status_code == 201
    patient_id = create.json()["id"]

    get = client.get(f"/patients/{patient_id}")
    assert get.status_code == 200
    assert get.json()["first_name"] == "Jane"


def test_list_patients_pagination(client):
    for i in range(5):
        client.post(
            "/patients",
            json={
                "first_name": f"Patient{i}",
                "last_name": "Test",
                "date_of_birth": "1985-01-01",
                "status": "active",
            },
        )
    response = client.get("/patients?page=1&page_size=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["total"] == 5
