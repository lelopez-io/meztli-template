import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"

import { env } from "./config"
import * as post from "./schema/post"

export const schema = { ...post }

export { mySqlTable as tableCreator } from "./schema/_table"

export * from "drizzle-orm/expressions"

const connection = await mysql.createConnection({
    host: env.DB_HOST,
    database: env.DB_NAME,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
})

export const db = drizzle(connection, { schema, mode: "default" })
