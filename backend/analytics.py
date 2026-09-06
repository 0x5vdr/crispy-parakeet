from decimal import Decimal
from sqlalchemy import null

def calculate_win_rate(trades):
    if not trades:
        return 0.0
    winning_trades = [trade for trade in trades if trade.result_r> 0]
    win_rate = len(winning_trades) / len(trades)
    return Decimal(str(win_rate)) * 100

def calculate_losing_rate(trades):
    if not trades:
        return 0.0
    losing_trades = [trade for trade in trades if trade.result_r < 0]
    losing_rate = len(losing_trades) / len(trades)
    return Decimal(str(losing_rate)) * 100

def calculate_average_r(trades):
    if not trades:
        return 0.0
    total_r = sum(trade.result_r for trade in trades)
    average_r = total_r / len(trades)
    return Decimal(str(average_r))

def calculate_average_win_r(trades):
    winning_trades = [trade for trade in trades if trade.result_r > 0]
    if not winning_trades:
        return 0.0
    total_r_win = sum(trade.result_r for trade in winning_trades)
    average_r_win = total_r_win / len(winning_trades)
    return Decimal(str(average_r_win))

def calculate_average_losing_r(trades):
    losing_trades = [trade for trade in trades if trade.result_r < 0]
    if not losing_trades:
        return Decimal('0')
    total_r_loss = sum(trade.result_r for trade in losing_trades)
    average_r_loss = total_r_loss / len(losing_trades)
    return Decimal(str(average_r_loss))

def calculate_expectancy(trades):
    if not trades:
        return 0.0
    win_rate = calculate_win_rate(trades) / 100
    losing_rate = calculate_losing_rate(trades) / 100
    avg_r_win = calculate_average_win_r(trades)
    avg_r_loss = calculate_average_losing_r(trades)
    expectancy = win_rate * avg_r_win + losing_rate * avg_r_loss
    return expectancy

def calculate_profit_factor(trades):
    if not trades:
        return 0.0
    total_winning_r = sum(trade.result_r for trade in trades if trade.result_r > 0)
    total_losing_r = sum(trade.result_r for trade in trades if trade.result_r < 0)
    if total_losing_r == 0:
        return None
    return total_winning_r / abs(total_losing_r)

def calculate_max_drawdown(trades):
    if not trades:
        return 0.0
    cumulative_r = 0
    peak = 0
    max_drawdown = 0
    for trade in trades:
        cumulative_r += trade.result_r
        if cumulative_r > peak:
            peak = cumulative_r
        drawdown = peak - cumulative_r
        if drawdown > max_drawdown:
            max_drawdown = drawdown
    return max_drawdown