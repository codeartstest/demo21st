from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.calculator import Calculator

app = FastAPI(title="Calculator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
calculator = Calculator()

VALID_OPERATIONS = {"add", "subtract", "multiply", "divide"}


class CalculateRequest(BaseModel):
    operation: str
    a: float
    b: float


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/operations")
def list_operations():
    return {"operations": sorted(VALID_OPERATIONS)}


@app.post("/api/calculate")
def calculate(request: CalculateRequest):
    if request.operation not in VALID_OPERATIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid operation: {request.operation}. "
            f"Valid operations are: {sorted(VALID_OPERATIONS)}",
        )
    try:
        if request.operation == "add":
            result = calculator.add(request.a, request.b)
        elif request.operation == "subtract":
            result = calculator.subtract(request.a, request.b)
        elif request.operation == "multiply":
            result = calculator.multiply(request.a, request.b)
        else:
            result = calculator.divide(request.a, request.b)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"result": result}