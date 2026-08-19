# This file is auto-generated. Do not edit directly.

MODEL_TO_TABLE = {
    "order": "[dbo].[orders]",
    "user": "[dbo].[users]",
}

MODEL_DESCRIPTIONS = {
    "order": "Represents a customer order in the system.",
    "user": "Represents a registered user in the database.",
}

MODEL_FIELDS = {
    "order": [
        { "name": "id", "type": "string", "sql": "NVARCHAR(1000)", "isOptional": False, "hasDefault": True, "isId": True, "description": "Primary key for the Order table (auto-generated UUID)" },
        { "name": "userId", "type": "string", "sql": "NVARCHAR(1000)", "isOptional": False, "hasDefault": False, "isId": False, "description": "Foreign key linking to the User model who placed the order" },
        { "name": "total", "type": "number", "sql": "INT", "isOptional": False, "hasDefault": True, "isId": False, "description": "Total cost amount of the order" },
        { "name": "status", "type": "string?", "sql": "NVARCHAR(50)", "isOptional": True, "hasDefault": False, "isId": False, "description": "Order status: open, paid, shipped, cancelled" },
        { "name": "createdAt", "type": "Date", "sql": "DATETIME2", "isOptional": False, "hasDefault": True, "isId": False, "description": "The date and time when the order was created" }
    ],
    "user": [
        { "name": "id", "type": "string", "sql": "NVARCHAR(1000)", "isOptional": False, "hasDefault": True, "isId": True, "description": "Primary key for the User table (auto-generated UUID)" },
        { "name": "email", "type": "string", "sql": "NVARCHAR(255)", "isOptional": False, "hasDefault": False, "isId": False, "description": "Unique email address used for login and notifications" },
        { "name": "name", "type": "string?", "sql": "NVARCHAR(255)", "isOptional": True, "hasDefault": False, "isId": False, "description": "Display name of the user" },
        { "name": "isActive", "type": "boolean", "sql": "BIT", "isOptional": False, "hasDefault": True, "isId": False, "description": "Whether the user account is active" },
        { "name": "score", "type": "number", "sql": "INT", "isOptional": False, "hasDefault": True, "isId": False, "description": "Accumulated score used in aggregation examples" },
        { "name": "createdAt", "type": "Date", "sql": "DATETIME2", "isOptional": False, "hasDefault": True, "isId": False, "description": "Timestamp when the user profile was created" }
    ],
}

RELATION_MAP = {
    "order": {
        "user": {
            "modelName": "user",
            "relationType": "one",
            "foreignKey": "userId",
            "localKey": "id"
        },
    },
    "user": {
        "orders": {
            "modelName": "order",
            "relationType": "many",
            "foreignKey": "userId",
            "localKey": "id"
        },
    },
}
