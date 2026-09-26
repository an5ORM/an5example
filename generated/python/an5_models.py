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

class OrderRow(TypedDict, total=False):
    """Row shape returned for Order queries."""
    id: str
    user_id: str
    total: int
    status: str
    created_at: datetime
    user: Any

"""Represents a registered user in the database."""
@dataclass
class User:
    email: str
    id: Optional[str] = None
    name: Optional[str] = None
    is_active: Optional[bool] = None
    score: Optional[int] = None
    created_at: Optional[datetime] = None
    orders: List[Any] = field(default_factory=list)

class UserRow(TypedDict, total=False):
    """Row shape returned for User queries."""
    id: str
    email: str
    name: str
    is_active: bool
    score: int
    created_at: datetime
    orders: List[Any]

