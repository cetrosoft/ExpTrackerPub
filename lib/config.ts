<<<<<<< HEAD
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
=======
// Configuration for the application
// This file handles environment variables with sensible defaults

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api", // Defaults to local API
  },
  database: {
    type: process.env.DB_TYPE || "memory", // Defaults to memory/IndexedDB
    // Database configs are ready when you need them
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
      database: process.env.MONGODB_DB || "expense_tracker",
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-key-for-development-only",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  },
}
