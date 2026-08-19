# This file is auto-generated. Do not edit directly.
from dataclasses import dataclass, field
from typing import Optional, List, Any
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

