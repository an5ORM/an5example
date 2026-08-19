// This file is auto-generated. Do not edit directly.

import type { RelationDef } from "@an5/orm";

export const modelToTable: Record<string, string> = {
  Order: "[dbo].[orders]",
  order: "[dbo].[orders]",
  Orders: "[dbo].[orders]",
  orders: "[dbo].[orders]",
  User: "[dbo].[users]",
  user: "[dbo].[users]",
  Users: "[dbo].[users]",
  users: "[dbo].[users]",
};

export const modelDescriptions: Record<string, string | undefined> = {
  Order: "Represents a customer order in the system.",
  order: "Represents a customer order in the system.",
  Orders: "Represents a customer order in the system.",
  orders: "Represents a customer order in the system.",
  User: "Represents a registered user in the database.",
  user: "Represents a registered user in the database.",
  Users: "Represents a registered user in the database.",
  users: "Represents a registered user in the database.",
};

export const modelFields: Record<string, Record<string, { ts: string; sql: string; description?: string }>> = {
  Order: { id: { ts: "string", sql: "NVARCHAR(1000)", description: "Primary key for the Order table (auto-generated UUID)" }, userId: { ts: "string", sql: "NVARCHAR(1000)", description: "Foreign key linking to the User model who placed the order" }, total: { ts: "number", sql: "INT", description: "Total cost amount of the order" }, status: { ts: "string?", sql: "NVARCHAR(50)", description: "Order status: open, paid, shipped, cancelled" }, createdAt: { ts: "Date", sql: "DATETIME2", description: "The date and time when the order was created" } },
  order: { id: { ts: "string", sql: "NVARCHAR(1000)", description: "Primary key for the Order table (auto-generated UUID)" }, userId: { ts: "string", sql: "NVARCHAR(1000)", description: "Foreign key linking to the User model who placed the order" }, total: { ts: "number", sql: "INT", description: "Total cost amount of the order" }, status: { ts: "string?", sql: "NVARCHAR(50)", description: "Order status: open, paid, shipped, cancelled" }, createdAt: { ts: "Date", sql: "DATETIME2", description: "The date and time when the order was created" } },
  Orders: { id: { ts: "string", sql: "NVARCHAR(1000)", description: "Primary key for the Order table (auto-generated UUID)" }, userId: { ts: "string", sql: "NVARCHAR(1000)", description: "Foreign key linking to the User model who placed the order" }, total: { ts: "number", sql: "INT", description: "Total cost amount of the order" }, status: { ts: "string?", sql: "NVARCHAR(50)", description: "Order status: open, paid, shipped, cancelled" }, createdAt: { ts: "Date", sql: "DATETIME2", description: "The date and time when the order was created" } },
  orders: { id: { ts: "string", sql: "NVARCHAR(1000)", description: "Primary key for the Order table (auto-generated UUID)" }, userId: { ts: "string", sql: "NVARCHAR(1000)", description: "Foreign key linking to the User model who placed the order" }, total: { ts: "number", sql: "INT", description: "Total cost amount of the order" }, status: { ts: "string?", sql: "NVARCHAR(50)", description: "Order status: open, paid, shipped, cancelled" }, createdAt: { ts: "Date", sql: "DATETIME2", description: "The date and time when the order was created" } },
  User: { id: { ts: "string", sql: "NVARCHAR(1000)", description: "Primary key for the User table (auto-generated UUID)" }, email: { ts: "string", sql: "NVARCHAR(255)", description: "Unique email address used for login and notifications" }, name: { ts: "string?", sql: "NVARCHAR(255)", description: "Display name of the user" }, isActive: { ts: "boolean", sql: "BIT", description: "Whether the user account is active" }, score: { ts: "number", sql: "INT", description: "Accumulated score used in aggregation examples" }, createdAt: { ts: "Date", sql: "DATETIME2", description: "Timestamp when the user profile was created" } },
  user: { id: { ts: "string", sql: "NVARCHAR(1000)", description: "Primary key for the User table (auto-generated UUID)" }, email: { ts: "string", sql: "NVARCHAR(255)", description: "Unique email address used for login and notifications" }, name: { ts: "string?", sql: "NVARCHAR(255)", description: "Display name of the user" }, isActive: { ts: "boolean", sql: "BIT", description: "Whether the user account is active" }, score: { ts: "number", sql: "INT", description: "Accumulated score used in aggregation examples" }, createdAt: { ts: "Date", sql: "DATETIME2", description: "Timestamp when the user profile was created" } },
  Users: { id: { ts: "string", sql: "NVARCHAR(1000)", description: "Primary key for the User table (auto-generated UUID)" }, email: { ts: "string", sql: "NVARCHAR(255)", description: "Unique email address used for login and notifications" }, name: { ts: "string?", sql: "NVARCHAR(255)", description: "Display name of the user" }, isActive: { ts: "boolean", sql: "BIT", description: "Whether the user account is active" }, score: { ts: "number", sql: "INT", description: "Accumulated score used in aggregation examples" }, createdAt: { ts: "Date", sql: "DATETIME2", description: "Timestamp when the user profile was created" } },
  users: { id: { ts: "string", sql: "NVARCHAR(1000)", description: "Primary key for the User table (auto-generated UUID)" }, email: { ts: "string", sql: "NVARCHAR(255)", description: "Unique email address used for login and notifications" }, name: { ts: "string?", sql: "NVARCHAR(255)", description: "Display name of the user" }, isActive: { ts: "boolean", sql: "BIT", description: "Whether the user account is active" }, score: { ts: "number", sql: "INT", description: "Accumulated score used in aggregation examples" }, createdAt: { ts: "Date", sql: "DATETIME2", description: "Timestamp when the user profile was created" } },
};

export const relationMap: Record<string, Record<string, RelationDef>> = {
  Order:   {
    user: { modelName: "user", relationType: "one", foreignKey: "userId", localKey: "id" },
  },
  order:   {
    user: { modelName: "user", relationType: "one", foreignKey: "userId", localKey: "id" },
  },
  Orders:   {
    user: { modelName: "user", relationType: "one", foreignKey: "userId", localKey: "id" },
  },
  orders:   {
    user: { modelName: "user", relationType: "one", foreignKey: "userId", localKey: "id" },
  },
  User:   {
    orders: { modelName: "order", relationType: "many", foreignKey: "userId", localKey: "id" },
  },
  user:   {
    orders: { modelName: "order", relationType: "many", foreignKey: "userId", localKey: "id" },
  },
  Users:   {
    orders: { modelName: "order", relationType: "many", foreignKey: "userId", localKey: "id" },
  },
  users:   {
    orders: { modelName: "order", relationType: "many", foreignKey: "userId", localKey: "id" },
  },
};
