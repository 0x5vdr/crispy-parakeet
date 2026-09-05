from types import SimpleNamespace
from analytics import (
    calculate_average_losing_r,
    calculate_average_win_r,
    calculate_win_rate,
    calculate_losing_rate,
    calculate_average_win_r,
    calculate_average_losing_r,
    calculate_expectancy,
    calculate_profit_factor,
)

trades = [
    SimpleNamespace(result_r=3),
    SimpleNamespace(result_r=-1),
    SimpleNamespace(result_r=-1),
    SimpleNamespace(result_r=2),
    SimpleNamespace(result_r=-1),
]

print(calculate_win_rate(trades))
print(calculate_losing_rate(trades))
print(calculate_average_win_r(trades))
print(calculate_average_losing_r(trades))
print(calculate_expectancy(trades))
print(calculate_profit_factor(trades))