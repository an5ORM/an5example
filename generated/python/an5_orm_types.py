# This file is auto-generated. Do not edit directly.
"""
AN5 ORM typed filter/args dataclasses.

The Python adapter accepts both these dataclasses (`UserWhereInput`, `StringFilter`,
`UserOrderByInput`, `UserFindManyArgs`, etc.) and plain dicts with either schema
field names (`createdAt`) or snake_case aliases (`created_at`):

    db.user.find_many(where=UserWhereInput(name=StringFilter(contains="John")),
                      order_by=UserOrderByInput(created_at="desc"),
                      take=10)

    db.user.find_many(where={"name": {"contains": "John"}},
                      order_by={"created_at": "desc"},
                      take=10)
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Union, ClassVar
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
    mode: Optional[str] = None

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
    not_: Optional[bool] = None

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
    NOT: Optional[Union['OrderWhereInput', List['OrderWhereInput']]] = None
    id: Optional[Union[str, StringFilter]] = None
    user_id: Optional[Union[str, StringFilter]] = None
    total: Optional[Union[int, IntFilter]] = None
    status: Optional[Union[str, StringFilter]] = None
    created_at: Optional[Union[datetime, str, DateTimeFilter]] = None
    user: Optional[Dict[str, Any]] = None

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
class OrderInclude:
    """Type-safe eager relation loading and relation counts for Order queries."""
    _an5_include: ClassVar[bool] = True
    user: Optional[Union[bool, 'UserFindManyArgs', 'UserInclude', Dict[str, Any]]] = None
    _count: Optional[Union[bool, Dict[str, Any]]] = None

@dataclass
class OrderFindManyArgs:
    """ORM-style args for Order.find_many()."""
    where: Optional[OrderWhereInput] = None
    order_by: Optional[OrderOrderByInput] = None
    take: Optional[int] = None
    skip: int = 0
    select: Optional[Union[List[str], Dict[str, Any]]] = None
    include: Optional[Union['OrderInclude', Dict[str, Any]]] = None

@dataclass
class OrderFindFirstArgs:
    """ORM-style args for Order.find_first()."""
    where: Optional[OrderWhereInput] = None
    order_by: Optional[OrderOrderByInput] = None
    select: Optional[Union[List[str], Dict[str, Any]]] = None
    include: Optional[Union['OrderInclude', Dict[str, Any]]] = None

@dataclass
class OrderFindUniqueArgs:
    """ORM-style args for Order.find_unique()."""
    where: Optional[OrderWhereInput] = None
    select: Optional[Union[List[str], Dict[str, Any]]] = None
    include: Optional[Union['OrderInclude', Dict[str, Any]]] = None

@dataclass
class OrderAggregateHavingInput:
    """Type-safe HAVING filter for Order.group_by() queries."""
    AND: Optional[Union['OrderAggregateHavingInput', List['OrderAggregateHavingInput']]] = None
    OR: Optional[List['OrderAggregateHavingInput']] = None
    NOT: Optional[Union['OrderAggregateHavingInput', List['OrderAggregateHavingInput']]] = None
    id: Optional[Union[str, StringFilter]] = None
    user_id: Optional[Union[str, StringFilter]] = None
    total: Optional[Union[int, IntFilter]] = None
    status: Optional[Union[str, StringFilter]] = None
    created_at: Optional[Union[datetime, str, DateTimeFilter]] = None
    _count: Optional[Dict[str, Union[int, IntFilter, NumberFilter, Dict[str, Any]]]] = None
    _sum: Optional[Dict[str, Union[int, float, IntFilter, NumberFilter, Dict[str, Any]]]] = None
    _avg: Optional[Dict[str, Union[int, float, IntFilter, NumberFilter, Dict[str, Any]]]] = None
    _min: Optional[Dict[str, Any]] = None
    _max: Optional[Dict[str, Any]] = None

@dataclass
class OrderGroupByArgs:
    """ORM-style args for Order.group_by()."""
    by: Union[str, List[str]]
    where: Optional[OrderWhereInput] = None
    having: Optional[OrderAggregateHavingInput] = None
    order_by: Optional[Union[OrderOrderByInput, List[OrderOrderByInput]]] = None
    skip: int = 0
    take: Optional[int] = None
    _count: Optional[Union[bool, str, List[str], Dict[str, bool]]] = None
    _sum: Optional[Union[str, List[str], Dict[str, bool]]] = None
    _avg: Optional[Union[str, List[str], Dict[str, bool]]] = None
    _min: Optional[Union[str, List[str], Dict[str, bool]]] = None
    _max: Optional[Union[str, List[str], Dict[str, bool]]] = None

# ─── User ORM Types ────────────────────────────────────────────────────────

@dataclass
class UserWhereInput:
    """Type-safe WHERE filter for User queries."""
    AND: Optional[List['UserWhereInput']] = None
    OR: Optional[List['UserWhereInput']] = None
    NOT: Optional[Union['UserWhereInput', List['UserWhereInput']]] = None
    id: Optional[Union[str, StringFilter]] = None
    email: Optional[Union[str, StringFilter]] = None
    name: Optional[Union[str, StringFilter]] = None
    is_active: Optional[Union[bool, BoolFilter]] = None
    score: Optional[Union[int, IntFilter]] = None
    embedding: Optional[Union[str, StringFilter]] = None
    created_at: Optional[Union[datetime, str, DateTimeFilter]] = None
    orders: Optional[Dict[str, Any]] = None

@dataclass
class UserOrderByInput:
    """Type-safe ORDER BY for User queries. Value: 'asc' or 'desc'."""
    id: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    is_active: Optional[str] = None
    score: Optional[str] = None
    embedding: Optional[str] = None
    created_at: Optional[str] = None

@dataclass
class UserCreateInput:
    """Typed data for creating a new User record."""
    email: str
    name: Optional[str] = None
    is_active: Optional[bool] = None
    score: Optional[int] = None
    embedding: Optional[List[float]] = None
    created_at: Optional[datetime] = None

@dataclass
class UserUpdateInput:
    """Typed data for updating an existing User record."""
    email: Optional[str] = None
    name: Optional[str] = None
    is_active: Optional[bool] = None
    score: Optional[int] = None
    embedding: Optional[List[float]] = None
    created_at: Optional[datetime] = None

@dataclass
class UserInclude:
    """Type-safe eager relation loading and relation counts for User queries."""
    _an5_include: ClassVar[bool] = True
    orders: Optional[Union[bool, 'OrderFindManyArgs', 'OrderInclude', Dict[str, Any]]] = None
    _count: Optional[Union[bool, Dict[str, Any]]] = None

@dataclass
class UserFindManyArgs:
    """ORM-style args for User.find_many()."""
    where: Optional[UserWhereInput] = None
    order_by: Optional[UserOrderByInput] = None
    take: Optional[int] = None
    skip: int = 0
    select: Optional[Union[List[str], Dict[str, Any]]] = None
    include: Optional[Union['UserInclude', Dict[str, Any]]] = None

@dataclass
class UserFindFirstArgs:
    """ORM-style args for User.find_first()."""
    where: Optional[UserWhereInput] = None
    order_by: Optional[UserOrderByInput] = None
    select: Optional[Union[List[str], Dict[str, Any]]] = None
    include: Optional[Union['UserInclude', Dict[str, Any]]] = None

@dataclass
class UserFindUniqueArgs:
    """ORM-style args for User.find_unique()."""
    where: Optional[UserWhereInput] = None
    select: Optional[Union[List[str], Dict[str, Any]]] = None
    include: Optional[Union['UserInclude', Dict[str, Any]]] = None

@dataclass
class UserAggregateHavingInput:
    """Type-safe HAVING filter for User.group_by() queries."""
    AND: Optional[Union['UserAggregateHavingInput', List['UserAggregateHavingInput']]] = None
    OR: Optional[List['UserAggregateHavingInput']] = None
    NOT: Optional[Union['UserAggregateHavingInput', List['UserAggregateHavingInput']]] = None
    id: Optional[Union[str, StringFilter]] = None
    email: Optional[Union[str, StringFilter]] = None
    name: Optional[Union[str, StringFilter]] = None
    is_active: Optional[Union[bool, BoolFilter]] = None
    score: Optional[Union[int, IntFilter]] = None
    embedding: Optional[Union[str, StringFilter]] = None
    created_at: Optional[Union[datetime, str, DateTimeFilter]] = None
    _count: Optional[Dict[str, Union[int, IntFilter, NumberFilter, Dict[str, Any]]]] = None
    _sum: Optional[Dict[str, Union[int, float, IntFilter, NumberFilter, Dict[str, Any]]]] = None
    _avg: Optional[Dict[str, Union[int, float, IntFilter, NumberFilter, Dict[str, Any]]]] = None
    _min: Optional[Dict[str, Any]] = None
    _max: Optional[Dict[str, Any]] = None

@dataclass
class UserGroupByArgs:
    """ORM-style args for User.group_by()."""
    by: Union[str, List[str]]
    where: Optional[UserWhereInput] = None
    having: Optional[UserAggregateHavingInput] = None
    order_by: Optional[Union[UserOrderByInput, List[UserOrderByInput]]] = None
    skip: int = 0
    take: Optional[int] = None
    _count: Optional[Union[bool, str, List[str], Dict[str, bool]]] = None
    _sum: Optional[Union[str, List[str], Dict[str, bool]]] = None
    _avg: Optional[Union[str, List[str], Dict[str, bool]]] = None
    _min: Optional[Union[str, List[str], Dict[str, bool]]] = None
    _max: Optional[Union[str, List[str], Dict[str, bool]]] = None

