from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from datetime import datetime

class TradeBase(BaseModel):
    symbol: str
    direction: str
    entry_price: Decimal
    stop_price: Decimal
    exit_price: Decimal
    risk_amount: Decimal
    result_r: Decimal
    setup: str
    session: str
    trade_date: datetime
    notes: str | None = None

class TradeCreate(TradeBase):
    pass

class TradeResponse(TradeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class TradeUpdate(TradeBase):
        symbol: str | None = None
        direction: str | None = None
        entry_price: Decimal | None = None
        stop_price: Decimal | None = None
        exit_price: Decimal | None = None
        risk_amount: Decimal | None = None
        result_r: Decimal | None = None
        setup: str | None = None
        session: str | None = None
        trade_date: datetime | None = None
        notes: str | None = None