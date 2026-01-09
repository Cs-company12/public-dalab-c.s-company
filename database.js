const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function setupDatabase() {
    const db = await open({
        filename: "../cs-company-admin/database.sqlite", // Connect to the admin database
        driver: sqlite3.Database
    });

    // The tables are already created by the admin panel, so we just connect.

    return db;
}

module.exports = { setupDatabase };
