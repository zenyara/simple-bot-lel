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
exports._createTable = function(tbl) {
  /* ===== twitchusers table fields =======
user_id INTEGER PRIMARY KEY AUTOINCREMENT, 
user_name TEXT NOT NULL UNIQUE,
display_name TEXT NOT NULL UNIQUE, 
email TEXT NOT NULL DEFAULT (' '),
tagline TEXT NOT NULL DEFAULT (' '),
permission INTEGER NOT NULL DEFAULT 0, 
first_played TEXT,
last_played TEXT,
avatar INTEGER NOT NULL DEFAULT 0, 
gold INTEGER NOT NULL DEFAULT 4,
xp INTEGER NOT NULL DEFAULT 0,
active INTEGER NOT NULL DEFAULT 0, 
ban INTEGER NOT NULL DEFAULT 0,
ban_reason TEXT NOT NULL DEFAULT ('No reason given.')";
*/
  console.log(tbl);

  let sql = "";
  if (tbl == "twitchusers") {
    sql =
      "CREATE TABLE twitchusers (user_id INTEGER PRIMARY KEY AUTOINCREMENT, user_name TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL UNIQUE, email TEXT NOT NULL DEFAULT (' '),tagline TEXT NOT NULL DEFAULT (' '), permission INTEGER NOT NULL DEFAULT 0, first_played TEXT, last_played TEXT, avatar INTEGER NOT NULL DEFAULT 0, gold INTEGER NOT NULL DEFAULT 4, xp INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 0, ban INTEGER NOT NULL DEFAULT 0, ban_reason TEXT NOT NULL DEFAULT ('No reason given.'))";
  } else if (tbl == "notes") {
    sql =
      "CREATE TABLE notes (note_id INTEGER PRIMARY KEY AUTOINCREMENT, user_name TEXT, note TEXT, created TEXT NOT NULL)";
  }
  idb.db.run(sql, err => {
    if (err) {
      idb._setResponse(`Table '${tbl}' already exists.`);
    } else {
      idb._setResponse(`Table recreated.`);
    }
  });
};

//change a username to something else for testing
exports._quickChange = function() {
  let sql = `UPDATE twitchusers
    SET user_name = ?,
    display_name = ?
    WHERE user_name = ?
    `;
  idb.db.run(sql, ["spamattacker", "SpamAttacker", "meeklo"], function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) updated: ${this.changes}`);
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
  let sql = `SELECT 
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
  idb.db.each(sql, [], (err, row) => {
    if (err) {
      return 0;
    }
    let _response = `${row.id} ${row.uname} ${row.dname} ${row.email} ${row.tag} ${row.perm} ${row.fp} ${row.lp} ${row.avatar} ${row.gold}g ${row.xp} ${row.active} ${row.ban} - ${row.reason}`;
    idb._setResponse(_response);
  });
};

/*==================================================
  ==================================================
  
                Command Calls
                (from bot.js)

  ==================================================
  ==================================================*/

// Insert new data into notes table.. (!note [msg])
exports._newNote = function(un, dn, msg) {
  /*note_id, user_name, note, created */
  let d = new Date();
  let ds = d.toString();
  let _nowDate = ds.substr(0, 24);
  //let _uts = Math.floor(d / 1000); // UNIX Timestamp (now)
  let sql = "INSERT INTO notes(user_name,note,created) VALUES (?,?,?)";
  idb.db.run(sql, [un, msg, _nowDate], function(err) {
    if (err) {
      return console.error(err.message);
      idb._setResponse(`'Error creating note.'`);
    }
    // get the last insert id: rowid ${this.lastID}
    idb._setResponse(`${dn}, your new note (id:${this.lastID}) was added.`);
  });
};

// !notes (get list of note ids for user)
/*note_id, user_name, note, created */
exports._getNotesList = function(un, dn) {
  let sql = `SELECT 
            note_id id,
            created cr,
            note note
            FROM notes 
            WHERE user_name=?`;
  idb.db.all(sql, [un], (err, rows) => {
    if (err) {
      throw err;
    }
    let _ids = "";
    rows.forEach(row => {
      _ids += ` [${row.id} - ${row.note.substr(0, 9)}..]`;
    });
    if (rows == 0) {
      idb._setResponse(`${dn}, you have 0 notes.`);
    } else {
      idb._setResponse(`${dn}, your note ids: ${_ids}.`);
    }
  });
};

// !readnote [id]
/*note_id, user_name, note, created */
exports._readNote = function(un, dn, nid) {
  let sql = `SELECT
            note note,
            created cr 
            FROM notes 
            WHERE user_name=?
            AND note_id=?`;
  idb.db.get(sql, [un, nid], (err, row) => {
    if (err) {
      //return console.error(err.message);
      return 0;
    }
    if (row) {
      let _response = `'${dn}, [Note]: ${row.note}' - ${row.cr}`;
      idb._setResponse(_response);
    } else {
      idb._setResponse(`Note id:${nid} not found.`);
    }
  });
};

//!deletenote [id]
exports._deleteNote = function(un, dn, nid) {
  idb.db.run(
    `DELETE FROM notes WHERE note_id=? AND user_name=?`,
    [nid, un],
    function(err) {
      if (err) {
        idb._setResponse(err.message);
        //return console.error(err.message);
      }
      //console.log(`Row(s) deleted ${this.changes}`);
      if (this.changes > 0) {
        idb._setResponse(`${dn}, your note was deleted.`);
      } else {
        idb._setResponse(`${dn}, note id:${nid} doesn't exist.`);
      }
    }
  );
};

// !players (get list of players)
/*user_id, user_name, display_name, 
  email, tagline, permission, first_played, 
  last_played, avatar, gold, xp, active, 
  ban, ban_reason */

exports._getPlayersList = function(un, dn) {
  let sql = `SELECT 
            user_id id,
            display_name dname,
            first_played pfirst,
            last_played plast,
            gold gold,
            xp xp,
            permission perm,
            avatar avatar,
            ban ban,
            ban_reason reason

            FROM twitchusers`;
  idb.db.all(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    let _ps = "";
    rows.forEach(row => {
      _ps += ` [${row.dname} w/${row.xp}xp, ${row.gold}g]`;
    });
    if (rows == 0) {
      idb._setResponse(`${dn}, there are 0 players.`);
    } else {
      idb._setResponse(`${dn}, players: ${_ps}`);
    }
  });
};

// Delete target user !deleteuser [name]
exports._deleteUser = function(_user) {
  idb.db.run(`DELETE FROM twitchusers WHERE user_name=?`, _user, function(err) {
    if (err) {
      idb._setResponse(err.message);
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

// Insert new data into twitchusers table.. (!join or !play)
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
  idb.db.run(sql, [un, dn, perm, _nowDate, _nowDate, _uts], function(err) {
    if (err) {
      idb._setResponse(`'${dn}' already exists!`);
      return 0;
    }
    // get the last insert id: rowid ${this.lastID}
    idb._setResponse(`Player '${dn}' added.`);
  });
};

// !stats or !me OR !player [name]
exports._viewPlayerStats = function(_user) {
  let sql = `SELECT 
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
            WHERE user_name=? 
            ORDER BY user_name`;
  idb.db.get(sql, [_user], (err, row) => {
    if (err) {
      //return console.error(err.message);
      return 0;
    }
    if (row) {
      //let _response333 = `${row.id} ${row.uname} ${row.dname} ${row.email} ${row.tag} ${row.perm} ${row.fp} ${row.lp} ${row.avatar} ${row.gold}g ${row.xp} ${row.active} ${row.ban} - ${row.reason}`;
      let _response = `'${row.dname}' stats: First played: ${row.fp}, Last played: ${row.lp}, ${row.gold} Gold, XP: ${row.xp}`;
      if (row.ban == 1) {
        _response += `, SUSPENDED ${row.ban} - ${row.reason}`;
      } else if (row.ban == 2) {
        _response += `, BANNED ${row.ban} - ${row.reason}`;
      } else {
        _response += `, In good standing.`;
      }
      idb._setResponse(_response);
    } else {
      idb._setResponse(`${_user} not found.`);
    }
  });
};

// make this available to the bot.js file
exports.obj = { db: idb };
