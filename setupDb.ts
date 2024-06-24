import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

const createContactsTable = `
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    phoneNumber VARCHAR(15),
    email VARCHAR(255),
    linkedId INT REFERENCES contacts(id),
    linkPrecedence VARCHAR(10) CHECK (linkPrecedence IN ('primary', 'secondary')),
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW(),
    deletedAt TIMESTAMPTZ
);
`;

const run = async () => {
  try {
    const client = await pool.connect();
    await client.query(createContactsTable);
    console.log("Table created successfully");
    client.release();
  } catch (err) {
    console.error('Error creating table', err);
  } finally {
    await pool.end();
  }
};

run();
