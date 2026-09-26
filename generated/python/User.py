# This file is auto-generated. Do not edit directly.
from dataclasses import dataclass, field
from typing import Optional, List, Any, TypedDict
from datetime import datetime

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

class _UserRequired(TypedDict):
    """Required keys of a User row."""
    email: str

class UserRow(_UserRequired, total=False):
    """Row shape returned for User queries."""
    id: str
    name: str
    is_active: bool
    score: int
    created_at: datetime
    orders: List[Any]

