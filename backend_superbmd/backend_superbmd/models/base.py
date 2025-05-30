from datetime import datetime
from sqlalchemy import Column, DateTime, Integer
from .meta import Base

class BaseModel(Base):
    """Base model class for all models."""
    
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary."""
        return {column.name: getattr(self, column.name) 
                for column in self.__table__.columns}