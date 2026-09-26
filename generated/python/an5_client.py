# This file is auto-generated. Do not edit directly.
import os
from typing import Dict, List, Optional, Any, Callable, TYPE_CHECKING

from an5_adapter import An5Adapter, AdapterTableClient, create_an5_adapter, set_adapter_metadata

try:
    from .an5_metadata import MODEL_TO_TABLE, MODEL_FIELDS
except ImportError:
    from an5_metadata import MODEL_TO_TABLE, MODEL_FIELDS

if TYPE_CHECKING:
    try:
        from .Order import OrderRow
    except ImportError:
        from .an5_models import OrderRow  # fallback aggregator
    try:
        from .User import UserRow
    except ImportError:
        from .an5_models import UserRow  # fallback aggregator

class An5Client:
    """AN5 Python ORM Client - type-safe database access.

    Usage:
        db = An5Client()
        users = db.user.find_many(where={"name": {"contains": "John"}}, order_by={"created_at": "asc"}, take=10)
        user  = db.user.find_first(where={"id": "abc"})
        new   = db.user.create(data={"name": "Alice", "email": "alice@example.com"})
    """
    def __init__(self, connection_string: Optional[str] = None):
        conn_str = (connection_string or 
                    os.getenv("DATABASE_URL") or 
                    "Server=localhost;Database=master;Trusted_Connection=True;TrustServerCertificate=True;")
        set_adapter_metadata({"model_to_table": MODEL_TO_TABLE, "model_fields": MODEL_FIELDS})
        self.adapter: An5Adapter = create_an5_adapter(conn_str)

        client = AdapterTableClient(self.adapter, "Order")
        self.Order: AdapterTableClient["OrderRow"] = client
        self.Orders: AdapterTableClient["OrderRow"] = client
        self.order: AdapterTableClient["OrderRow"] = client
        self.orders: AdapterTableClient["OrderRow"] = client
        client = AdapterTableClient(self.adapter, "User")
        self.User: AdapterTableClient["UserRow"] = client
        self.Users: AdapterTableClient["UserRow"] = client
        self.user: AdapterTableClient["UserRow"] = client
        self.users: AdapterTableClient["UserRow"] = client

    def __getattr__(self, name: str) -> AdapterTableClient[Any]:
        return self.adapter.table(name)

    def query_raw(self, sql: str, *params) -> List[Dict]:
        return self.adapter.query_raw(sql, *params)

    def execute_raw(self, sql: str, *params) -> int:
        return self.adapter.execute_raw(sql, *params)

    def transaction(self, fn: Callable) -> Any:
        return self.adapter.transaction(fn)
