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
    embedding: Optional[List[float]] = None
    created_at: Optional[datetime] = None
    orders: List[Any] = field(default_factory=list)

class _UserRequired(TypedDict):
    """Required keys of a User row."""
    id: str
    email: str
    name: Optional[str]
    is_active: bool
    score: int
    embedding: Optional[List[float]]
    created_at: datetime

class UserRow(_UserRequired, total=False):
    """Row shape returned for User queries."""
    orders: List[Any]

