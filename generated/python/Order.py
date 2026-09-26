# This file is auto-generated. Do not edit directly.
from dataclasses import dataclass, field
from typing import Optional, List, Any, TypedDict
from datetime import datetime

"""Represents a customer order in the system."""
@dataclass
class Order:
    user_id: str
    id: Optional[str] = None
    total: Optional[int] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[Any] = None

class _OrderRequired(TypedDict):
    """Required keys of a Order row."""
    user_id: str

class OrderRow(_OrderRequired, total=False):
    """Row shape returned for Order queries."""
    id: str
    total: int
    status: str
    created_at: datetime
    user: Any

