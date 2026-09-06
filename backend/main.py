from fastapi import FastAPI, Depends, HTTPException
from models import Trade
from database import get_db
from schemas import TradeResponse, TradeCreate, TradeUpdate
import analytics

app = FastAPI()
@app.get("/trades", response_model=list[TradeResponse])
def get_trades(db = Depends(get_db)):
    return db.query(Trade).all()

@app.post("/trades", response_model=TradeResponse)
def create_trade(trade: TradeCreate, db = Depends(get_db)):
    new_trade = Trade(**trade.model_dump())
    db.add(new_trade)
    db.commit()
    db.refresh(new_trade)
    return new_trade

@app.get("/trades/analytics")
def get_analytics(db = Depends(get_db)):
    trades = db.query(Trade).all()
    return {
        "win_rate": analytics.calculate_win_rate(trades),
        "losing_rate": analytics.calculate_losing_rate(trades),
        "average_win_r": analytics.calculate_average_win_r(trades),
        "average_losing_r": analytics.calculate_average_losing_r(trades),
        "expectancy": analytics.calculate_expectancy(trades),
        "profit_factor": analytics.calculate_profit_factor(trades),
        "max_drawdown": analytics.calculate_max_drawdown(trades),
    }

@app.get("/trades/{trade_id}", response_model=TradeResponse)
def get_trade(trade_id: int, db = Depends(get_db)):
    trade = db.query(Trade).filter(Trade.id == trade_id).first()
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade

@app.patch("/trades/{trade_id}", response_model=TradeResponse)
def update_trade(trade_id: int, trade: TradeUpdate, db = Depends(get_db)):
    existing_trade = db.query(Trade).filter(Trade.id == trade_id).first()
    if existing_trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
        print(trade.model_dump(exclude_unset=True))
    for key, value in trade.model_dump(exclude_unset=True).items():
        setattr(existing_trade, key, value)
    db.commit()
    db.refresh(existing_trade)
    return existing_trade

@app.delete("/trades/{trade_id}", response_model=TradeResponse)
def delete_trade(trade_id: int, db = Depends(get_db)):
    trade = db.query(Trade).filter(Trade.id == trade_id).first()
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    db.delete(trade)
    db.commit()
    return trade

@app.get("/")   
def read_root():
    return {"message": "Trading Journal API"}
