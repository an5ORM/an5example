# This file is auto-generated. Do not edit directly.
"""
AN5 ORM typed filter/args dataclasses for type-safe queries.

Usage example::

    db.user.find_many(where=UserWhereInput(name=StringFilter(contains="John")),
                      order_by=UserOrderByInput(created_at="desc"),
                      take=10)
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional, Any
from datetime import datetime

# ─── Base filter types ────────────────────────────────────────────────────────

@dataclass
class StringFilter:
    """Type-safe filter for string fields."""
    equals: Optional[str] = None
    not_: Optional[str] = None
    contains: Optional[str] = None
    starts_with: Optional[str] = None
    ends_with: Optional[str] = None
    in_: Optional[List[str]] = None
    not_in: Optional[List[str]] = None
    gt: Optional[str] = None
    gte: Optional[str] = None
    lt: Optional[str] = None
    lte: Optional[str] = None

@dataclass
class IntFilter:
    """Type-safe filter for integer fields."""
    equals: Optional[int] = None
    not_: Optional[int] = None
    in_: Optional[List[int]] = None
    not_in: Optional[List[int]] = None
    gt: Optional[int] = None
    gte: Optional[int] = None
    lt: Optional[int] = None
    lte: Optional[int] = None

@dataclass
class NumberFilter:
    """Type-safe filter for float/decimal fields."""
    equals: Optional[float] = None
    not_: Optional[float] = None
    in_: Optional[List[float]] = None
    not_in: Optional[List[float]] = None
    gt: Optional[float] = None
    gte: Optional[float] = None
    lt: Optional[float] = None
    lte: Optional[float] = None

@dataclass
class BoolFilter:
    """Type-safe filter for boolean fields."""
    equals: Optional[bool] = None

@dataclass
class DateTimeFilter:
    """Type-safe filter for datetime fields."""
    equals: Optional[datetime] = None
    not_: Optional[datetime] = None
    in_: Optional[List[datetime]] = None
    not_in: Optional[List[datetime]] = None
    gt: Optional[datetime] = None
    gte: Optional[datetime] = None
    lt: Optional[datetime] = None
    lte: Optional[datetime] = None

# ─── Order ORM Types ────────────────────────────────────────────────────────

@dataclass
class OrderWhereInput:
    """Type-safe WHERE filter for Order queries."""
    AND: Optional[List['OrderWhereInput']] = None
    OR: Optional[List['OrderWhereInput']] = None
    NOT: Optional['OrderWhereInput'] = None
    id: Optional[StringFilter] = None
    user_id: Optional[StringFilter] = None
    total: Optional[IntFilter] = None
    status: Optional[StringFilter] = None
    created_at: Optional[DateTimeFilter] = None

@dataclass
class OrderOrderByInput:
    """Type-safe ORDER BY for Order queries. Value: 'asc' or 'desc'."""
    id: Optional[str] = None
    user_id: Optional[str] = None
    total: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[str] = None

@dataclass
class OrderCreateInput:
    """Typed data for creating a new Order record."""
    user_id: str
    total: Optional[int] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None

@dataclass
class OrderUpdateInput:
    """Typed data for updating an existing Order record."""
    user_id: Optional[str] = None
    total: Optional[int] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None

@dataclass
class OrderFindManyArgs:
    """ORM-style args for Order.find_many()."""
    where: Optional[OrderWhereInput] = None
    order_by: Optional[OrderOrderByInput] = None
    take: Optional[int] = None
    skip: int = 0
    select: Optional[List[str]] = None

@dataclass
class OrderFindFirstArgs:
    """ORM-style args for Order.find_first()."""
    where: Optional[OrderWhereInput] = None
    order_by: Optional[OrderOrderByInput] = None
    select: Optional[List[str]] = None

# ─── User ORM Types ────────────────────────────────────────────────────────

@dataclass
class UserWhereInput:
    """Type-safe WHERE filter for User queries."""
    AND: Optional[List['UserWhereInput']] = None
    OR: Optional[List['UserWhereInput']] = None
    NOT: Optional['UserWhereInput'] = None
    id: Optional[StringFilter] = None
    email: Optional[StringFilter] = None
    name: Optional[StringFilter] = None
    is_active: Optional[BoolFilter] = None
    score: Optional[IntFilter] = None
    created_at: Optional[DateTimeFilter] = None

@dataclass
class UserOrderByInput:
    """Type-safe ORDER BY for User queries. Value: 'asc' or 'desc'."""
    id: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    is_active: Optional[str] = None
    score: Optional[str] = None
    created_at: Optional[str] = None

@dataclass
class UserCreateInput:
    """Typed data for creating a new User record."""
    email: str
    name: Optional[str] = None
    is_active: Optional[bool] = None
    score: Optional[int] = None
    created_at: Optional[datetime] = None

@dataclass
class UserUpdateInput:
    """Typed data for updating an existing User record."""
    email: Optional[str] = None
    name: Optional[str] = None
    is_active: Optional[bool] = None
    score: Optional[int] = None
    created_at: Optional[datetime] = None

@dataclass
class UserFindManyArgs:
    """ORM-style args for User.find_many()."""
    where: Optional[UserWhereInput] = None
    order_by: Optional[UserOrderByInput] = None
    take: Optional[int] = None
    skip: int = 0
    select: Optional[List[str]] = None

@dataclass
class UserFindFirstArgs:
    """ORM-style args for User.find_first()."""
    where: Optional[UserWhereInput] = None
    order_by: Optional[UserOrderByInput] = None
    select: Optional[List[str]] = None

