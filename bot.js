// https://www.tutorialspoint.com/socket.io/socket.io_event_handling.htm
// init project
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

let gsock = {}; // globalize socket for Twitch use
gsock.oldId = 5000;
gsock.newId = 5000; // when this becomes > oldId it will trigger an updated command
gsock.cmd = "none"; // last sent command

//Whenever someone connects this gets executed
io.on("connection", function(socket) {
  console.log("A user connected");

  setInterval(function() {
    // check a changed variable to then send the updated command
    if (gsock.newId > gsock.oldId) {
      //socket.send(`GXU${gsock.newId}`);
      io.sockets.emit("broadcast", `${gsock.cmd}GXU`);
      gsock.oldId = gsock.newId;
    }
  }, 800);

  //Whenever someone disconnects this piece of code executed
  socket.on("disconnect", function() {
    console.log("A user disconnected");
  });
});

// listen for requests :)
const listener = http.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

/*==================================================
  ==================================================
                (ABOVE)
            UE4 HOOK CODE
            
            
            
            
            
            
            TWITCH SOCKET CODE
              (BELOW)

  ==================================================
  ==================================================*/

const tmi = require("tmi.js");
const mycoms = require("./mycoms.js");
const mydb = require("./mydb.js");
const mypics = require("./mypics.js");

// Define configuration options
const opts = {
  identity: {
    //Twitch bot username (requires creating another Twitch user, designate this for your "bot")
    username: process.env.TUSER,
    //Twitch bot oauth token
    password: process.env.TOKEN
  },
  //Twitch channel (The target Twitch channel(s) where bot will enter and do it's work)
  channels: [process.env.TCHAN]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

let _projectName = "simple-bot-lel";
let _chan = process.env.TCHAN;
let OP = process.env.TCHAN; // set to main operator of the channel (for special permissions)

// server response timeout function (waiting for db call)
function _doResponse() {
  client.say(_chan, `${_dbVars._response}`);
}

/* store and update all players here (to minimize db calls)
    user_id, user_name, display_name, email, tagline, permission,
    first_played, last_played, avatar, gold, xp, active, 
    ban, ban_reason
*/
let player = new Array();
/*==================================================
  ==================================================

              CHAT HANDLER CODE


  ==================================================
  ==================================================*/

// Called every time a message comes in
function onMessageHandler(channel, user, message, self) {
  // is the user a moderator?
  var _isMod = user["mod"]; // true/false
  var _isOp = user["username"] == OP ? true : false;
  _isMod = _isOp ? true : false; // set Op's Mod Status to true
  var _pLevel = 0; // set their permissions level
  if (_isMod) {
    _pLevel++;
  }
  if (_isOp) {
    _pLevel++;
  }

  var _username = user["username"];
  var _displayname = user["display-name"];

  if (self) {
    return;
  }
  // remove illegal chars from msg string
  // allowed characters (all else banned)
  // remove any < or >
  let messageRemoveSigns = message.replace(/<|>|;|\\/gi, "");
  // remove any other unwanted chars
  let msg = messageRemoveSigns.replace(
    /[^ a-z0-9!@#$*_+-=~,./?{}\[\]\|]/gi,
    ""
  );
  //console.log(msg);
  /*--------------------------------------------------
			PART ONE - Finding the needle.
	---------------------------------------------------*/
  var _nLoc = msg.indexOf(" "); // location of the first space
  //var _needle	= (_nLoc > 0)? msg.substr(0,_nLoc) : msg;
  if (_nLoc > 0) {
    var _needle = msg.substr(0, _nLoc); // from 0 to first space (not including space)
  } else {
    var _needle = msg;
  }
  var _hayStack = "";
  var _isMatch = false;
  var _perm = 0;
  var _arg = new Array();
  for (var i = 0; i < _commands; i++) {
    // search for our _needle in the commands array
    _hayStack = _command[i][0];
    if (_needle.toLowerCase() == _hayStack) {
      // command=0 type=1 function=2 useage=3 hint=4 id=5 on/off=6 xyz=7,8,9 name=10 focus=11
      _isMatch = true; // We have a match! A !command is being used.
      var _cid = i; // get command id
      var _cmd = _command[i][0]; // command name
      var _type = _command[i][1]; // get command type
      var _fn = _command[i][2]; // get command function
      var _usage = _command[i][3]; // get command usage (description)
      var _hint = _command[i][4]; // get command hint (how to use this command)
      _perm = _command[i][5]; // get command permission (who can use this command?)
      break;
    }
  }

  // no command found. nothing to return
  if (!_isMatch && msg.substr(0, 1) == "!" && msg.length > 1) {
    // non-command text
    //console.log(`* Unknown command ${_needle} for ${_displayname}`);
    client.say(
      _chan,
      `bad cmd: '${_needle}' @${_displayname} - https://tinyurl.com/0simpoblel`
    );
  }

  // return message back to user in channel
  // check for required op/mod permission

  if (_pLevel >= _perm) {
    if (_isMatch) {
      /*--------------------------------------------------
          PART TWO - Separate parts
      ---------------------------------------------------*/
      if (_type == 1) {
        // special case (example: /shout omg guys!) - 1 sentence
        var _splitArg = msg.split(" ");
        var _p1 = _splitArg[0]; //command
        var _p2Spot = msg.indexOf(_p1); // spot for the rest
        var _p2 = msg.substr(_p2Spot + 1 + _p1.length, 999); // the rest
        _arg.push(_username);
        _arg.push(_displayname);
        _arg.push(_pLevel);
        _arg.push(_cid);
        _arg.push(_p2);
        eval(`${_fn}`).apply(null, Array.prototype.slice.call(_arg, 0)); // run function with included args
      }

      if (_type == 2) {
        // special case (example: /t soandso hello there) -  target + data/msg
        var _splitArg = msg.split(" ");
        var _p1 = _splitArg[0]; //command
        var _p2 = _splitArg[1]; // target arg

        if (typeof _p2 === "undefined") {
          //console.log(`Target var not given.`);
        } else {
          var _p3Spot = msg.indexOf(_p2); // spot for the rest
          var _p3 = msg.substr(_p3Spot + 1 + _p2.length, 999); // the rest
          _arg.push(_username);
          _arg.push(_displayname);
          _arg.push(_pLevel);
          _arg.push(_cid);
          _arg.push(_p2);
          _arg.push(_p3);
          eval(`${_fn}`).apply(null, Array.prototype.slice.call(_arg, 0)); // run function with included args
        }
      }
      //eval(_fn + "("+_cid+")"); // run the function
      //eval(`${_fn}("${_username}", "${_displayname}", ${_cid})`);
      /*console.log(
        `* Executed ${_cmd} command for ${_displayname}[${_pLevel}] req:[${_perm}]`
      );*/
    }
  } else {
    // permission denied
    console.log(
      `${_displayname}[${_pLevel}] lacks the permission[${_perm}] for that command`
    );
    client.say(_chan, `${_displayname} lacks the permission to use ${_cmd}.`);
  }
}

/*==================================================
  ==================================================
  
            BRING-IN COMMANDS ARRAY
                (from mycoms.js)
        This places all commands into an array
        to organize and detail every command.

  ==================================================
  ==================================================*/

let _command = new Array();
_command = mycoms.obj.cc;
let _commands = mycoms.obj.ccs;

/*==================================================
  ==================================================
  
            BRING-IN MYDB VARS
                (from mydb.js)
        We have to call certain variables from 
        this file to return a response.

  ==================================================
  ==================================================*/
let _dbVars = mydb.obj.db;
//console.log("FIRST: " + mydb._getResponse());
/*==================================================
  ==================================================
  
  
              DEFINE COMMAND FUNCTIONS
       (These correspond to the commands array)
            

  ==================================================
  ==================================================*/

function com_1() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _perm = arguments[2]; //permission level
  var _cid = arguments[3]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_dname} chooses path 1.`);
}

function com_2() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[3]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_dname} chooses path 2.`);
}

function com_3() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[3]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_dname} chooses path 3.`);
}

function com_4() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[3]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_dname} chooses path 4.`);
}

function com_about() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[3]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(
    _chan,
    `${_dname} find out about ${_projectName} for Twitch, made with Glitch. - https://tinyurl.com/absimpoblel`
  );
}

function com_buy() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[3]; //command id
  var _item = arguments[4]; // item id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;

  if (
    isNaN(_item) ||
    _item.length != 4 ||
    _item.includes(".") ||
    _item.includes("-")
  ) {
    client.say(
      _chan,
      `${_dname} that's an invalid item id! - https://tinyurl.com/2simpoblel`
    );
  } else {
    client.say(
      _chan,
      `${_dname} bought item ${_item} 'Werewolf Overcoat' for 480g from the shop! - https://tinyurl.com/2simpoblel`
    );
  }
}

function com_commands() {
  // username,displayname,commandID
  var _cid = arguments[3]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_commands} commands: https://tinyurl.com/0simpoblel`);
}

// !createnote [msg]
function com_createnote() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _perm = arguments[2]; //permission level
  var _cid = arguments[3]; //command id
  var _msg = arguments[4]; // new msg
  mydb._open();
  mydb._newNote(_uname, _dname, _msg);
  mydb._close();
  // get response after x milliseconds
  let wait = setTimeout(_doResponse, _dbVars._timeout);
}

// "!createtable"
function com_createtable() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _perm = arguments[2]; //permission level
  var _cid = arguments[3]; //cmd id
  var _table = arguments[4]; //table name
  if (_perm > 1 && _uname == process.env.TCHAN) {
    mydb._open();
    mydb._createTable(_table);
    mydb._close();
    // get response after x milliseconds
    let wait = setTimeout(_doResponse, _dbVars._timeout);
  }
}

function com_d20() {
  var _dname = arguments[1];
  const sides = 20;
  const num = Math.floor(Math.random() * sides) + 1;
  client.say(_chan, `[ ${num} ] for ${_dname} on a D20.`);
}

// "!deletenote"
function com_deletenote() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _perm = arguments[2]; //permission level
  var _cid = arguments[3]; //cmd id
  var _nid = arguments[4].toLowerCase(); //target note to delete
  mydb._open();
  mydb._deleteNote(_uname, _dname, _nid);
  mydb._close();
  // get response after x milliseconds
  let wait = setTimeout(_doResponse, _dbVars._timeout);
}

// "!deleteplayer"
function com_deleteplayer() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _perm = arguments[2]; //permission level
  var _cid = arguments[3]; //cmd id
  var _target = arguments[4].toLowerCase(); //target name to delete
  if (_target == _uname || _perm > 0) {
    mydb._open();
    mydb._deleteUser(_target);
    mydb._close();
    // get response after x milliseconds
    let wait = setTimeout(_doResponse, _dbVars._timeout);
  }
}

function com_dice() {
  var _dname = arguments[1];
  const sides = 6;
  const d1 = Math.floor(Math.random() * sides) + 1;
  const d2 = Math.floor(Math.random() * sides) + 1;
  const outcome = d1 + d2;
  client.say(
    _chan,
    `[ ${outcome} ] for ${_dname} with a ( ${d1} )+( ${d2} ) dice roll.`
  );
}

// "!droptable"
function com_droptable() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _perm = arguments[2]; //permission level
  var _cid = arguments[3]; //cmd id
  var _table = arguments[4]; // table to drop
  if (_perm > 1 && _uname == process.env.TCHAN) {
    mydb._open();
    mydb._dropTable(_table);
    mydb._close();
    // get response after x milliseconds
    let wait = setTimeout(_doResponse, _dbVars._timeout);
  }
}

function com_gold() {
  // username,displayname,commandID,target,amount
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[3]; //command id
  var _target = arguments[4]; //target name
  var _amount = arguments[5]; //gold amount
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;

  if (
    _amount <= 0 ||
    _amount > 27000 ||
    isNaN(_amount) ||
    _amount.includes(".")
  ) {
    client.say(_chan, `${_dname} gives ${_target} 1 gold.`);
  } else {
    client.say(_chan, `${_dname} gives ${_target} ${_amount} gold.`);
  }
}

function com_help() {
  client.say(_chan, `${_commands} commands: https://tinyurl.com/0simpoblel`);
}

function com_makelist() {
  //use this to output the command list (for txt file)
  let _cl = `**${_commands} commands (updated regularly)**\r\r`;
  for (var i = 0; i < _commands; i++) {
    _cl += "- `" + _command[i][3] + "`  " + _command[i][4] + "\r\r";
  }
  console.log(_cl);
}

// "!note [id]"
function com_note() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _nid = arguments[4]; //target note to read
  mydb._open();
  mydb._readNote(_uname, _dname, _nid);
  mydb._close();
  // get response after x milliseconds
  let wait = setTimeout(_doResponse, _dbVars._timeout);
}

// !notes
function com_notes() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  mydb._open();
  mydb._getNotesList(_uname, _dname);
  mydb._close();
  // get response after x milliseconds
  let wait = setTimeout(_doResponse, _dbVars._timeout);
}

// "!play or !join"
function com_play() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _perm = arguments[2]; //permission level
  var _cid = arguments[3]; //command id
  mydb._open();
  mydb._newPlayer(_uname, _dname, _perm);
  mydb._close();
  // get response after x milliseconds
  let wait = setTimeout(_doResponse, _dbVars._timeout);
}

// !players
function com_players() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  mydb._open();
  mydb._getPlayersList(_uname, _dname);
  mydb._close();
  // get response after x milliseconds
  let wait = setTimeout(_doResponse, _dbVars._timeout);
}

// "!pullblock"
function com_pullblock() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _perm = arguments[2]; //permission level
  var _cid = arguments[3]; //command id
  var _cmd = _command[_cid][0]; //command name;
  if (_perm > 0) {
    //mydb._open();
    game._pullBlock();
    //mydb._close();
    // get response after x milliseconds
    //let wait = setTimeout(_doResponse, _dbVars._timeout);
    gsock.newId++;
    gsock.cmd = _cmd;
  } else {
    client.say(
      _chan,
      `${_dname}, you do not have permission to use the !pullblock command.`
    );
  }
}

// "!reset"
function com_reset() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _perm = arguments[2]; //permission level
  var _cid = arguments[3]; //command id
  var _cmd = _command[_cid][0]; //command name;
  if (_perm > 0) {
    //mydb._open();
    game._reset();
    //mydb._close();
    // get response after x milliseconds
    //let wait = setTimeout(_doResponse, _dbVars._timeout);
    gsock.newId++;
    gsock.cmd = _cmd;
  } else {
    client.say(
      _chan,
      `${_dname}, you do not have permission to use the !reset command.`
    );
  }
}

function com_say() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[3]; //command id
  var _msg = arguments[4]; // message (the rest of the string)
  if (_msg.length > 0) {
    client.say(_chan, `${_dname} says, ${_msg}`);
  }
}

function com_shop() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[3]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(
    _chan,
    `${_dname} head on over to the shop! - https://tinyurl.com/2simpoblel`
  );
}

// command=0 type=1 function=2 useage=3 hint=4 mod/op=5 (0,1,2)
function com_uptime() {
  client.say(_chan, `Not sure what the uptime (command) is atm.`);
}

// "!start"
function com_start() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _perm = arguments[2]; //permission level
  var _cid = arguments[3]; //command id
  var _cmd = _command[_cid][0]; //command name;
  if (_perm > 0) {
    //mydb._open();
    game._start();
    //mydb._close();
    // get response after x milliseconds
    //let wait = setTimeout(_doResponse, _dbVars._timeout);
    gsock.newId++;
    gsock.cmd = _cmd;
  } else {
    client.say(
      _chan,
      `${_dname}, you do not have permission to use the !start command.`
    );
  }
}

// "!stats or !me"
function com_stats() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _perm = arguments[2]; //permission level
  var _cid = arguments[3]; //cmd id
  var _cmd = _command[_cid][0]; //command name;
  var _target = arguments[4]; // target
  let _st = _target.length < 3 ? _uname : _target;
  mydb._open();
  mydb._viewPlayerStats(_st);
  mydb._close();
  // get response after x milliseconds
  let wait = setTimeout(_doResponse, _dbVars._timeout);
}

// "!test"
function com_test() {
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _perm = arguments[2]; //permission level
  var _cid = arguments[3]; //command id
  var _cmd = _command[_cid][0]; //command name;
  if (_perm > 0) {
    mydb._open();
    mydb._test();
    mydb._close();
    // get response after x milliseconds
    let wait = setTimeout(_doResponse, _dbVars._timeout);
    gsock.newId++;
    gsock.cmd = _cmd;
  } else {
    client.say(
      _chan,
      `${_dname}, you do not have permission to use the !test command.`
    );
  }
}

function com_text() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[3]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_dname} tried sending OP '${OP}' a text message.`);
}
//mydb._open;mydb._dropTable();mydb._close();

/*==================================================
  ==================================================
  
  
              DEFINE  G A M E  FUNCTIONS
                  (Puzzle Drop)
            

  ==================================================
  ==================================================*/
let game = {};

game._image = mypics.pic.pp;
game._images = mypics.pic.pps;

game._getRandomImage = function() {
  return game._image[Math.floor(Math.random() * game._images)];
};

game._picture = "";
game._newBlock = new Array();
game._block = new Array();
game._blocks = game._block.length;

game._start = function() {
  game._picture = game._getRandomImage();
  game._block = game._newBlock;
  game._blocks = game._newBlock.length;
  console.log(
    `Game has been freshly started with picture '${game._picture}' of (${game._images}).`
  );
};

game._reset = function() {
  game._picture = game._getRandomImage();
  game._block = game._newBlock;
  game._blocks = game._newBlock.length;
  console.log(
    `Game has been reset with picture '${game._picture}' of (${game._images}).`
  );
};

game._pullBlock = function() {
  /* Go through the array of blocks and pull one (remove target block from array as well)
   */
  console.log(`Pulling a random block.`);
};
