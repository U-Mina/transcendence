import mysql from "mysql2/promise";

const host = process.env.DB_HOST ?? process.env.DATABASE_HOST ?? "127.0.0.1";
const port = Number(process.env.DB_PORT ?? process.env.DATABASE_PORT ?? 3306);
const user = process.env.DB_USER ?? process.env.DATABASE_USER ?? "root";
const password = process.env.DB_PASSWORD ?? process.env.DATABASE_PASSWORD ?? "";
const database = process.env.DB_NAME ?? process.env.DATABASE_NAME ?? "transcendence";

export const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});