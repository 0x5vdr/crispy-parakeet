from database import Base, engine
from sqlalchemy import Column, Integer, String, Numeric, DateTime, Text

class Trade(Base):
    __tablename__ = 'trades'
    id = Column(Integer, primary_key=True, index=True)
    symbol=Column(String, index=True)
    direction=Column(String, index=True)
    entry_price=Column(Numeric)
    stop_price=Column(Numeric)
    exit_price=Column(Numeric)
    risk_amount=Column(Numeric)
    result_r=Column(Numeric)
    setup=Column(String, index=True)
    session=Column(String, index=True)
    trade_date=Column(DateTime, index=True)
    notes=Column(Text)
Base.metadata.create_all(bind=engine)
