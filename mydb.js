// create the exported object for functions and variables
let idb = {};

// init sqlite db
idb.fs = require("fs");
idb.dbFile = "./.data/sqlite.db";
idb.exists = idb.fs.existsSync(idb.dbFile);
idb.sqlite3 = require("sqlite3").verbose();

// Opening new database connection..
idb.db = new idb.sqlite3.Database(idb.dbFile, err => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the in-memory SQlite database.");
});

// Creating a Table..

idb.sql = `
CREATE TABLE IF NOT EXISTS twitchusers (
user_id INTEGER PRIMARY KEY AUTOINCREMENT,
user_name TEXT NOT NULL UNIQUE,
display_name TEXT NOT NULL UNIQUE,
email TEXT NOT NULL,
tagline TEXT NOT NULL,
permission INTEGER NOT NULL DEFAULT 0,
first_played TEXT NOT NULL,
last_played TEXT NOT NULL,
avatar INTEGER NOT NULL DEFAULT 0,
gold INTEGER NOT NULL DEFAULT 4,
xp INTEGER NOT NULL DEFAULT 0,
active INTEGER NOT NULL DEFAULT 0,
ban INTEGER NOT NULL DEFAULT 0,
ban_reason TEXT NOT NULL DEFAULT ("No reason given.")
)`;

idb.db.run(idb.sql);
console.log("'twitchusers' table created.");

// Getting data from db..
/*
idb.db.serialize(() => {
  idb.db.each(`SELECT dream as name 
           FROM Dreams`, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    console.log(row.name + "\t");
  });
});
*/

// Closing the db connection..
idb.db.close(err => {
  if (err) {
    console.error(err.message);
  }
  console.log("Close the database connection.");
});

// make this available to the bot.js file
exports.mydb = idb;

// exports.obj = { cc: _command, ccs: _commands };
//test function to make sure it works
exports.myfunction = function() {
  console.log("My DB access works!");
};
