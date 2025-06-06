import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "./db";
 
export async function insertOne(table: string, ...values: any[]): Promise<RowDataPacket[]> {
  const sqlQuery = `INSERT INTO ${table}  VALUES (${values.map(() => "?").join(", ")})`;
  const [result] = await db.query<RowDataPacket[]>(sqlQuery, values);
  return result;    
}

export async function insertOneWithColumns(table: string, columns: string[], ...values: any[]): Promise<RowDataPacket[]> {
  const sqlQuery = `INSERT INTO ${table} (${columns.map((column) => `${column}`).join(", ")}) VALUES (${values.map(() => "?").join(", ")})`;
  const [result] = await db.query<RowDataPacket[]>(sqlQuery, values);
  return result;    
} 

export async function queryOne(table: string, filters: string[], ...values: any[]): Promise<RowDataPacket[]> {
  const whereClause = "WHERE " + filters.map((value) => `${value} = ?`).join(" AND ");
  const sqlQuery = `SELECT * FROM ${table} ${whereClause}`;
  const [rows] = await db.query<RowDataPacket[]>(sqlQuery, values);
  return rows;        
}

export async function queryOneWithColumns(table: string, columns: string[], filters: string[], ...values: any[]): Promise<RowDataPacket[]> {
  const whereClause = "WHERE " + filters.map((value) => `${value} = ?`).join(" AND ");
  const sqlQuery = `SELECT ${columns.map((column) => `${column}`).join(", ")} FROM ${table} ${whereClause}`;
  const [rows] = await db.query<RowDataPacket[]>(sqlQuery, values);
  return rows;        
}

export async function deleteOne(table: string, filters: string[], ...values: any[]): Promise<ResultSetHeader> {
  const whereClause = "WHERE " + filters.map((value) => `${value} = ?`).join(" AND ");
  const sqlQuery = `DELETE FROM ${table} ${whereClause}`;
  const [result] = await db.query<ResultSetHeader>(sqlQuery, values);
  return result;    
}

export async function updateOne(table: string, fields: string[], filters: Record<string, any>[], ...values: any[]) {
  const setClause = "SET " + fields.map((value) => `${value} = ?`).join(", ");
  const whereClause = "WHERE " + filters.map((value) => `${Object.keys(value)[0]} = ?`).join(" AND ");
  const whereValues = filters.map((value) => Object.values(value)[0]);
  const valuesWithWhere = [...values, ...whereValues];
  const sqlQuery = `UPDATE ${table} ${setClause} ${whereClause}`;
  const [result] = await db.query<ResultSetHeader>(sqlQuery, valuesWithWhere);
  return result;
}

export async function getAllWithColunms(table: string, columns: string[]): Promise<RowDataPacket[]> {
  const sqlQuery = `SELECT ${columns.map((column) => `${column}`).join(", ")} FROM ${table}`;
  const [rows] = await db.query<RowDataPacket[]>(sqlQuery);
  return rows;;        
}

/* export async function deleteFromManyTables(
  tables: string[],
  filters: string[],
  ...values: any[]
) {
  const whereClause = "WHERE " + filters.map((value) => `${value} = ?`).join(" AND ");
  const sqlQueries = tables.map((table) => `DELETE FROM ${table} ${whereClause}`);
  
  for (const sqlQuery of sqlQueries) {
    await db.query<ResultSetHeader>(sqlQuery, values);
  }
} */