import pytest

from app.calculator import Calculator
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def calculator():
    return Calculator()


@pytest.fixture
def client():
    return TestClient(app)


def test_add(calculator):
    assert calculator.add(2, 3) == 5
    assert calculator.add(-1, 1) == 0
    assert calculator.add(0, 0) == 0


def test_subtract(calculator):
    assert calculator.subtract(5, 3) == 2
    assert calculator.subtract(0, 5) == -5
    assert calculator.subtract(-1, -1) == 0


def test_multiply(calculator):
    assert calculator.multiply(2, 3) == 6
    assert calculator.multiply(-1, 5) == -5
    assert calculator.multiply(0, 100) == 0


def test_divide(calculator):
    assert calculator.divide(6, 3) == 2
    assert calculator.divide(-10, 2) == -5
    assert calculator.divide(7, 2) == 3.5


def test_divide_by_zero(calculator):
    with pytest.raises(ValueError, match="Division by zero is not allowed"):
        calculator.divide(5, 0)


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_list_operations(client):
    response = client.get("/api/operations")
    assert response.status_code == 200
    data = response.json()
    assert "operations" in data
    assert set(data["operations"]) == {"add", "subtract", "multiply", "divide"}


def test_calculate_endpoint_add(client):
    response = client.post("/api/calculate", json={"operation": "add", "a": 2, "b": 3})
    assert response.status_code == 200
    assert response.json() == {"result": 5}


def test_calculate_endpoint_divide_by_zero(client):
    response = client.post("/api/calculate", json={"operation": "divide", "a": 5, "b": 0})
    assert response.status_code == 400
    assert "Division by zero" in response.json()["detail"]


def test_calculate_endpoint_invalid_operation(client):
    response = client.post("/api/calculate", json={"operation": "modulo", "a": 5, "b": 3})
    assert response.status_code == 400
    assert "Invalid operation" in response.json()["detail"]


def test_cors_headers(client):
    response = client.options(
        "/api/calculate",
        headers={
            "Origin": "http://localhost:80",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )
    assert response.status_code == 200
    allow_origin = response.headers.get("access-control-allow-origin")
    assert allow_origin in ("*", "http://localhost:80")