import { pool } from "./pool";

export async function checkDatabaseHealth(): Promise<{ status: "healthy" }> {
    await pool.query("SELECT 1");
    return { status: "healthy" };
}