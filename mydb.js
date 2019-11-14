// create the exported object for functions and variables
let idb = {};

// init sqlite db
idb.fs = require("fs");
idb.dbFile = "./.data/sqlite.db";
idb.exists = idb.fs.existsSync(idb.dbFile);
idb.sqlite3 = require("sqlite3").verbose();

idb._response = "Starting db..";
idb._setResponse = function(nr) {
  idb._response = nr;
  //console.log(`Response updated: ${nr}`);
};
idb._getResponse = function() {
  return idb._response;
};
// Opening new database connection..
exports._open = function() {
  idb.db = new idb.sqlite3.Database(idb.dbFile, err => {
    if (err) {
      console.log("Could not connect to the database.", err);
    } else {
      console.log("Connected to database.");
    }
  });
};

// Closing the database connection..
exports._close = function() {
  idb.db.close(err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Closed the database connection.");
  });
};

// Create the twitchusers table
exports._createTable = function() {
  /* ===== twitchusers table fields =======
user_id INTEGER PRIMARY KEY AUTOINCREMENT, 
user_name TEXT NOT NULL UNIQUE,
display_name TEXT NOT NULL UNIQUE, 
email TEXT NOT NULL,
tagline TEXT NOT NULL,
permission INTEGER NOT NULL DEFAULT 0, 
first_played TEXT,
last_played TEXT,
avatar INTEGER NOT NULL DEFAULT 0, 
gold INTEGER NOT NULL DEFAULT 4,
xp INTEGER NOT NULL DEFAULT 0,
active INTEGER NOT NULL DEFAULT 0, 
ban INTEGER NOT NULL DEFAULT 0,
ban_reason TEXT NOT NULL DEFAULT ('No reason given.') )";
*/
  idb.sql =
    "CREATE TABLE IF NOT EXISTS twitchusers (user_id INTEGER PRIMARY KEY AUTOINCREMENT, user_name TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL UNIQUE, email TEXT NOT NULL,tagline TEXT NOT NULL, permission INTEGER NOT NULL DEFAULT 0, first_played TEXT, last_played TEXT, avatar INTEGER NOT NULL DEFAULT 0, gold INTEGER NOT NULL DEFAULT 4, xp INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 0, ban INTEGER NOT NULL DEFAULT 0, ban_reason TEXT NOT NULL DEFAULT ('No reason given.'))";
  idb.db.run(idb.sql, err => {
    if (err) {
      console.log(err.message, err);
    }
  });
};

// Drop the twitchusers table
exports._dropTable = function() {
  idb.sql = "DROP TABLE IF EXISTS twitchusers";
  idb.db.run(idb.sql, err => {
    if (err) {
      console.log(err.message, err);
    }
  });
};

// Insert new data into twitchusers table..
exports._newPlayer = function() {
  // Insert new data (test)

  idb._un = "meeklo";
  idb._dn = "Meeklo";
  idb._em = "tester34@gmail.com";
  idb._tl = "Tagline here.";
  let d = new Date();
  let dfp =
    d.getDay() +
    " " +
    d.getMonth() +
    " " +
    d.getDate() +
    " " +
    d.getFullYear() +
    "@" +
    d.getHours() +
    ":" +
    d.getMinutes();

  //idb._fp = "Tue Nov 12 2019 @ 2:03 AM";
  idb._fp = dfp;
  idb._at = Math.floor(d / 1000);

  idb.sql =
    "INSERT INTO twitchusers(user_name,display_name,email,tagline,first_played,last_played,active) VALUES (?,?,?,?,?,?,?)";
  // output the insert statement
  console.log(idb.sql);

  idb.db.run(
    idb.sql,
    [idb._un, idb._dn, idb._em, idb._tl, idb._fp, idb._fp, idb._at],
    function(err) {
      if (err) {
        return console.log(err.message);
      }
      // get the last insert id
      console.log(`A row has been inserted with rowid ${this.lastID}.`);
    }
  );
};

// Delete all rows in twitchusers
exports._deleteRows = function() {
  idb.db.run(`DELETE FROM twitchusers`, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) deleted ${this.changes}`);
  });
};

// Getting data from db..
/*user_id, user_name, display_name, 
  email, tagline, permission, first_played, 
  last_played, avatar, gold, xp, active, 
  ban, ban_reason */

exports._test = function() {
  idb.sql = `SELECT 
            user_id id,
            user_name uname,
            display_name dname,
            email email,
            tagline tag,
            permission perm,
            first_played fp,
            last_played lp,
            avatar avatar,
            gold gold,
            xp xp,
            active active,
            ban ban,
            ban_reason reason

            FROM twitchusers
            ORDER BY user_name`;
  idb.db.each(idb.sql, [], (err, row) => {
    if (err) {
      throw err;
    }
    console.log(
      `${row.id} ${row.uname} ${row.dname} ${row.email} ${row.tag} ${row.perm} ${row.fp} ${row.lp} ${row.avatar} ${row.gold}g ${row.xp} ${row.active} ${row.ban} - ${row.reason}`
    );
  });
};

/*==================================================
  ==================================================
  
                Command Calls
                (from bot.js)
        

  ==================================================
  ==================================================*/

// Delete target user
exports._deleteUser = function(_user) {
  idb.db.run(`DELETE FROM twitchusers WHERE user_name=?`, _user, function(err) {
    if (err) {
      idb._setResponse(err.message);
      //return console.error(err.message);
    }
    //console.log(`Row(s) deleted ${this.changes}`);
    if (this.changes > 0) {
      idb._setResponse(
        `'${_user}' deleted from the database! Type !play or !join to start again.`
      );
    } else {
      idb._setResponse(`'${_user}' not found.`);
    }
  });
};

exports._math = function(a, b) {
  let sum = a + b;
  return sum;
};

// mydb._open, _close, _createTable, _dropTable, _insert, _test
// mydb._open(); mydb._test(); mydb._close();
// make this available to the bot.js file
exports.obj = { db: idb };
