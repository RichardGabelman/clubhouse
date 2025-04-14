const { Client } = require("pg");
const { argv } = require("node:process");

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username VARCHAR (255) NOT NULL,
  password VARCHAR (255) NOT NULL,
  membership BOOL,
  admin BOOL
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  author_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR (255),
  message VARCHAR (255),
  time TIMESTAMP
);
`;

async function main() {
  const client = new Client({
    connectionString: argv[2],
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("Done!");
}

main();
