// create the exported object for functions and variables
let idb = {};
// init sqlite db
idb.fs = require("fs");
idb.dbFile = "./.data/sqlite.db";
idb.exists = idb.fs.existsSync(idb.dbFile);
idb.sqlite3 = require("sqlite3").verbose();

idb._timeout = 180;
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
      //console.log("Connected to database.");
    }
  });
};

// Closing the database connection..
exports._close = function() {
  idb.db.close(err => {
    if (err) {
      return console.error(err.message);
    }
    //console.log("Closed the database connection.");
  });
};

// Create the twitchusers table
exports._createTable = function() {
  /* ===== twitchusers table fields =======
user_id INTEGER PRIMARY KEY AUTOINCREMENT, 
user_name TEXT NOT NULL UNIQUE,
display_name TEXT NOT NULL UNIQUE, 
email TEXT,
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
  let sql =
    "CREATE TABLE twitchusers (user_id INTEGER PRIMARY KEY AUTOINCREMENT, user_name TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL UNIQUE, email TEXT,tagline TEXT NOT NULL, permission INTEGER NOT NULL DEFAULT 0, first_played TEXT, last_played TEXT, avatar INTEGER NOT NULL DEFAULT 0, gold INTEGER NOT NULL DEFAULT 4, xp INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 0, ban INTEGER NOT NULL DEFAULT 0, ban_reason TEXT NOT NULL DEFAULT ('No reason given.'))";
  idb.db.run(sql, err => {
    if (err) {
      idb._setResponse(`Table 'twitchusers' already exists.`);
    } else {
      idb._setResponse(`Table recreated.`);
    }
  });
};

// Drop the twitchusers table
exports._dropTable = function(tbl) {
  //let check = `SELECT count(name) FROM sqlite_master WHERE type='table' AND name='${tbl}'`;
  let sql = `DROP TABLE ${tbl}`;
  idb.db.run(sql, function(err) {
    // the error lets us know if the table doesn't exist
    if (err) {
      idb._setResponse(`Table '${tbl}' does not exist.`);
    } else {
      idb._setResponse(`Table '${tbl}' removed.`);
    }
  });
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

// Insert new data into twitchusers table..
exports._newPlayer = function(un, dn, perm) {
  /*  user_id, *user_name, *display_name, email, tagline, *permission,
    *first_played, *last_played, avatar, gold, xp, *active, 
    ban, ban_reason  */
  let d = new Date();
  let ds = d.toString();
  let _nowDate = ds.substr(0, 24);
  let _uts = Math.floor(d / 1000); // UNIX Timestamp (now)
  let sql =
    "INSERT INTO twitchusers(user_name,display_name,permission,first_played,last_played,active) VALUES (?,?,?,?,?,?)";
  // output the insert statement
  console.log(`${un} - ${dn} - ${perm} - ${_nowDate} - ${_uts}`);
  idb.db.run(sql, [un, dn, perm, _nowDate, _nowDate, _uts], function(err) {
    if (err) {
      idb._setResponse(`${err.message}`);
      return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}.`);
    idb._setResponse(`Player '${dn}' added. id: ${this.lastID}`);
  });
};

// make this available to the bot.js file
exports.obj = { db: idb };
