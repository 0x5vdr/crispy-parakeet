from types import SimpleNamespace
from analytics import calculate_losing_rate, calculate_win_rate, calculate_average_r, calculate_average_win_r, calculate_average_losing_r, calculate_expectancy, calculate_profit_factor, calculate_max_drawdown
from decimal import Decimal

def test_calculate_win_rate():
    trades = [
        SimpleNamespace(result_r=3),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=2),
        SimpleNamespace(result_r=-1),
    ]

    result = calculate_win_rate(trades)
    assert result == Decimal("40.0")
def test_calculate_losing_rate():
    trades = [
        SimpleNamespace(result_r=3),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=2),
        SimpleNamespace(result_r=-1),
    ]
    assert calculate_losing_rate(trades) == Decimal("60.0")

def test_calculate_average_r():
    trades = [
        SimpleNamespace(result_r=3),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=2),
        SimpleNamespace(result_r=-1),
    ]

    assert calculate_average_r(trades) == Decimal("0.4")

def test_calculate_average_win_r():
    trades = [
        SimpleNamespace(result_r=3),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=2),
        SimpleNamespace(result_r=-1),
    ]

    assert calculate_average_win_r(trades) == Decimal("2.5")

def test_calculate_average_losing_r():
    trades = [
        SimpleNamespace(result_r=3),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=2),
        SimpleNamespace(result_r=-1),
    ]

    assert calculate_average_losing_r(trades) == Decimal("-1.0")

def test_calculate_expectancy():
    trades = [
       SimpleNamespace(result_r=3),
       SimpleNamespace(result_r=-1),
       SimpleNamespace(result_r=-1),
       SimpleNamespace(result_r=2),
       SimpleNamespace(result_r=-1),
    ]

    assert calculate_expectancy(trades) == Decimal("0.40")

def test_calculate_profit_factor():
    trades = [
        SimpleNamespace(result_r=3),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=2),
        SimpleNamespace(result_r=-1),
    ]

    assert calculate_profit_factor(trades) == 5 / 3

def test_calculate_max_drawdown():
    trades = [
        SimpleNamespace(result_r=3),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=-1),
        SimpleNamespace(result_r=2),
        SimpleNamespace(result_r=-1),
    ]

    assert calculate_max_drawdown(trades) == 2


   