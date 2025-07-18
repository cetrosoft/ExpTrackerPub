// Load environment variables
import dotenv from "dotenv"
dotenv.config()

// Database configuration
const databaseConfigs = {
  postgres: {
    host: process.env.PG_HOST || "localhost",
    port: Number.parseInt(process.env.PG_PORT || "5432"),
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "",
    database: process.env.PG_DATABASE || "expense_tracker",
  },
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "expense_tracker",
  },
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
    dbName: process.env.MONGODB_DB || "expense_tracker",
  },
}

// Determine which database to use
const dbType = process.env.DB_TYPE || "postgres"

export const config = {
  database: {
    type: dbType,
    config: databaseConfigs[dbType as keyof typeof databaseConfigs],
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
}
