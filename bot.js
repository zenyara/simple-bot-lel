const tmi = require("tmi.js");

// Define configuration options
const opts = {
  identity: {
    username: process.env.TUSER,
    password: process.env.TOKEN
  },
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

let _chan = "";
let OP = "meeklo"; // used to check for main operator of the channel for special permissions

// Called every time a message comes in
function onMessageHandler(channel, user, msg, self) {
  _chan = channel;
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
  } // Ignore messages from the bot

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
  for (var i = 0; i < _commands; i++) {
    // search for our _needle in the commands array
    _hayStack = _command[i][0];
    if (_needle == _hayStack) {
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

  /*--------------------------------------------------
			PART TWO - Separate parts
	---------------------------------------------------*/

  // no command found. nothing to return
  if (!_isMatch && msg.substr(0, 1) == "!" && msg.length > 1) {
    // non-command text
    //console.log(`* Unknown command ${_needle} for ${_displayname}`);
    client.say(
      _chan,
      `bad cmd: '${_needle}' @${_displayname} https://tinyurl.com/1simpoblel`
    );
  }

  // return message back to user in channel
  // check for required op/mod permission

  if (_pLevel >= _perm) {
    if (_isMatch) {
      //eval(_fn + "("+_cid+")"); // run the function
      //eval(`${_fn}("${_displayname}", ${_cid})`); saving original
      // username, displayname, commandID
      eval(`${_fn}("${_username}", "${_displayname}", ${_cid})`);
      console.log(
        `* Executed ${_cmd} command for ${_displayname}[${_pLevel}] req:[${_perm}]`
      );
    }
  } else {
    // permission denied
    console.log(
      `${_displayname}[${_pLevel}] lacks the permission[${_perm}] for that command`
    );
    client.say(_chan, `${_displayname} lacks the permission to use ${_cmd}.`);
  }
}

/*   ==============  ==============    

        FILL OUR COMMANDS ARRAY

      ============== ==============  */

let _command = new Array();
// command=0 type=1 function=2 useage=3 hint=4 mod/op=5 (0,1,2)
// command type function useage 	hint
/* types include:
		1. simple: /say hi = hi
		2. advanced: /tell [client] [msg] = you tell soandso "hi"
		3. complex: /email [name@ww.com] [subject]|[msg]|[etc]|[etc]
*/

_command.push(["!1", "1", "com_1", "!1", "Choose path 1.", "0"]);
_command.push(["!2", "1", "com_2", "!2", "Choose path 2.", "0"]);
_command.push(["!3", "1", "com_3", "!3", "Choose path 3.", "0"]);
_command.push(["!4", "1", "com_4", "!4", "Choose path 4.", "0"]);

_command.push([
  "!buy",
  "2",
  "com_buy",
  "!buy [item name or id]",
  "Buy an item!",
  "0"
]);

_command.push([
  "!commands",
  "1",
  "com_commands",
  "!commands",
  "View all commands.",
  "0"
]);

_command.push(["!d20", "1", "com_d20", "!d20", "Roll a 20-sided die.", "0"]);

_command.push([
  "!deletenote",
  "2",
  "com_deletenote",
  "!deletenote [id]",
  "Delete a note.",
  "0"
]);

_command.push([
  "!deleteplayer",
  "2",
  "com_deleteplayer",
  "!deleteplayer [name or id or default(self)]",
  "Delete a player (self-only if NOT admin).",
  "0"
]);

_command.push(["!dice", "1", "com_dice", "!dice", "Roll a pair of dice.", "0"]);

_command.push([
  "!give",
  "2",
  "com_give",
  "!give [target] [item id]",
  "Give another player an item.",
  "2"
]);

_command.push([
  "!gold",
  "2",
  "com_gold",
  "!give [target] [amount]",
  "Give another player some gold.",
  "2"
]);

_command.push([
  "!help",
  "1",
  "com_help",
  "!help",
  "Help with commands and such.",
  "0"
]);

_command.push([
  "!join",
  "1",
  "com_play",
  "!join or !play",
  "Join the next available round.",
  "0"
]);

_command.push([
  "!makelist",
  "1",
  "com_makelist",
  "!makelist",
  "Create a list of commands to update commands page.",
  "2"
]);

_command.push([
  "!me",
  "1",
  "com_stats",
  "!me or !stats",
  "View your stats.",
  "0"
]);

_command.push([
  "!note",
  "2",
  "com_note",
  "!note [message]",
  "Create a note.",
  "0"
]);

_command.push(["!notes", "1", "com_notes", "!notes", "View notes list.", "0"]);

_command.push([
  "!play",
  "1",
  "com_play",
  "!join or !play",
  "Join the next available round.",
  "0"
]);

_command.push([
  "!player",
  "2",
  "com_player",
  "!player [name or id]",
  "View target player's stats.",
  "0"
]);

_command.push([
  "!players",
  "1",
  "com_players",
  "!players",
  "View the players list.",
  "0"
]);

_command.push([
  "!rank",
  "1",
  "com_rank",
  "!rank",
  "View your leaderboard rank.",
  "0"
]);

_command.push([
  "!readnote",
  "2",
  "com_readnote",
  "!readnote [id]",
  "Read a note.",
  "0"
]);

_command.push([
  "!shop",
  "2",
  "com_shop",
  "!shop [armor, pets, potions, weapons]",
  "View the shop!",
  "0"
]);

_command.push([
  "!stats",
  "1",
  "com_stats",
  "!me or !stats",
  "View your stats.",
  "0"
]);

_command.push([
  "!text",
  "2",
  "com_text",
  "!text",
  "Send OP a text message.",
  "0"
]);

_command.push([
  "!uptime",
  "1",
  "com_uptime",
  "!uptime",
  "Display this channel's uptime.",
  "0"
]);

_command.push([
  "!test",
  "1",
  "com_test",
  "!test [message here]",
  "Run a test.",
  "1"
]);

let _commands = _command.length;

/* use this to output the command list (for txt file)
for (var i = 0; i < _commands; i++) {
  console.log(_command[i][0] + ": " + _command[i][4] + " [Usage]: " + _command[i][3]);
}*/

/*   ==============  ==============    

  START RETURNED CHAT STRING FUNCTIONS

      ============== ==============  */

function com_1() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[2]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_dname} chooses path 1.`);
}

function com_2() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[2]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_dname} chooses path 2.`);
}

function com_3() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[2]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_dname} chooses path 3.`);
}

function com_4() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[2]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_dname} chooses path 4.`);
}

function com_buy() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[2]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_dname} bought something from the shop! - https://tinyurl.com/2simpoblel`);
}

function com_commands() {
  // username,displayname,commandID
  var _cid = arguments[2]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_commands} commands: https://tinyurl.com/1simpoblel`);
}

function com_d20() {
  var _dname = arguments[1];
  const sides = 20;
  const num = Math.floor(Math.random() * sides) + 1;
  client.say(_chan, `[ ${num} ] for ${_dname} on a D20.`);
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

function com_help() {
  client.say(_chan, `${_commands} commands: https://tinyurl.com/1simpoblel`);
}

function com_makelist() {
  //use this to output the command list (for txt file)
  for (var i = 0; i < _commands; i++) {
    console.log(
      _command[i][0] + ": " + _command[i][4] + " [Usage]: " + _command[i][3]
    );
  }
}

// command=0 type=1 function=2 useage=3 hint=4 mod/op=5 (0,1,2)
function com_uptime() {
  client.say(_chan, `Not sure what the uptime (command) is atm.`);
}

// "!test"
function com_test() {
  var _cid = arguments[2]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_cid}, ${_cmd}, ${_fn}`);
}

function com_text() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[2]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_dname} tried sending OP '${OP}' a text message.`);
}
