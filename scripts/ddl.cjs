/**
 * Per-dialect schema DDL for the live integration harness.
 * Mirrors ./schema/*.an5 (users / orders) with the SQL types each database
 * expects. The TypeScript adapter supplies @default() values (uuid, now, true)
 * at runtime, so DDL columns only need NOT NULL where the schema requires it.
 */
const DDL = {
  postgres: [
    `DROP TABLE IF EXISTS orders`,
    `DROP TABLE IF EXISTS users`,
    `CREATE TABLE users (
       id        TEXT PRIMARY KEY,
       email     TEXT NOT NULL UNIQUE,
       name      TEXT NULL,
       "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
       score     INTEGER NOT NULL DEFAULT 0,
       "createdAt" TIMESTAMPTZ NOT NULL
     )`,
    `CREATE TABLE orders (
       id        TEXT PRIMARY KEY,
       "userId"  TEXT NOT NULL,
       total     INTEGER NOT NULL DEFAULT 0,
       status    TEXT NULL,
       "createdAt" TIMESTAMPTZ NOT NULL,
       CONSTRAINT fk_orders_user FOREIGN KEY ("userId") REFERENCES users(id)
     )`,
  ],
  mysql: [
    `DROP TABLE IF EXISTS orders`,
    `DROP TABLE IF EXISTS users`,
    `CREATE TABLE users (
       id        VARCHAR(1000) PRIMARY KEY,
       email     VARCHAR(255) NOT NULL UNIQUE,
       name      VARCHAR(255) NULL,
       \`isActive\` BOOLEAN NOT NULL DEFAULT TRUE,
       score     INT NOT NULL DEFAULT 0,
       \`createdAt\` DATETIME(6) NOT NULL
     )`,
    `CREATE TABLE orders (
       id        VARCHAR(1000) PRIMARY KEY,
       \`userId\` VARCHAR(1000) NOT NULL,
       total     INT NOT NULL DEFAULT 0,
       status    VARCHAR(50) NULL,
       \`createdAt\` DATETIME(6) NOT NULL,
       CONSTRAINT fk_orders_user FOREIGN KEY (\`userId\`) REFERENCES users(id)
     )`,
  ],
  mssql: [
    `IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders`,
    `IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users`,
    `CREATE TABLE dbo.users (
       id        NVARCHAR(1000) PRIMARY KEY,
       email     NVARCHAR(255) NOT NULL UNIQUE,
       name      NVARCHAR(255) NULL,
       isActive  BIT NOT NULL DEFAULT 1,
       score     INT NOT NULL DEFAULT 0,
       createdAt DATETIME2 NOT NULL
     )`,
    `CREATE TABLE dbo.orders (
       id        NVARCHAR(1000) PRIMARY KEY,
       userId    NVARCHAR(1000) NOT NULL,
       total     INT NOT NULL DEFAULT 0,
       status    NVARCHAR(50) NULL,
       createdAt DATETIME2 NOT NULL,
       CONSTRAINT fk_orders_user FOREIGN KEY (userId) REFERENCES dbo.users(id)
     )`,
  ],
  sqlite: [
    `DROP TABLE IF EXISTS orders`,
    `DROP TABLE IF EXISTS users`,
    `CREATE TABLE users (
       id        TEXT PRIMARY KEY,
       email     TEXT NOT NULL UNIQUE,
       name      TEXT NULL,
       isActive  INTEGER NOT NULL DEFAULT 1,
       score     INTEGER NOT NULL DEFAULT 0,
       createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
     )`,
    `CREATE TABLE orders (
       id        TEXT PRIMARY KEY,
       userId    TEXT NOT NULL,
       total     INTEGER NOT NULL DEFAULT 0,
       status    TEXT NULL,
       createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
       FOREIGN KEY (userId) REFERENCES users(id)
     )`,
  ],
};

/** Table name mapping per dialect — mirrors how metadata resolves models. */
const TABLE_NAMES = {
  postgres: { users: 'users', orders: 'orders' },
  mysql: { users: 'users', orders: 'orders' },
  mssql: { users: 'dbo.users', orders: 'dbo.orders' },
  sqlite: { users: 'users', orders: 'orders' },
};

module.exports = { DDL, TABLE_NAMES };