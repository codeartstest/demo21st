import pytest

from app.calculator import Calculator


@pytest.fixture
def calculator():
    return Calculator()


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