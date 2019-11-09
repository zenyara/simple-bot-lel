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

// Called every time a message comes in
function onMessageHandler(channel, user, msg, self) {
  _chan = channel;
  // is the user a moderator?
  var _isMod = user["mod"] == false ? 0 : 1;

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
      break;
    }
  }
  // checking our variables
  console.log(
    `${msg}, ${_isMatch}, ${_cid}, ${_type}, ${_cmd}, ${_fn}, ${_usage}, ${_hint}`
  );

  /*--------------------------------------------------
			PART TWO - Separate parts
	---------------------------------------------------*/
  
  // no command found. nothing to return
  if (!_isMatch) {
    // non-command text
    console.log(`* Unknown command ${_needle}`);
  }

  // return message back to user in channel
  if (_isMatch) {
    //eval(_fn + "("+_cid+")"); // run the function
    eval(`${_fn}(${_cid})`);
    console.log(`* Executed ${_cmd} command`);
  }
}

/*   ==============  ==============    

        FILL OUR COMMANDS ARRAY

      ============== ==============  */

let _command = new Array();
// command=0 type=1 function=2 useage=3 hint=4
// command type function useage 	hint
/* types include:
		1. simple: /say hi = hi
		2. advanced: /tell [client] [msg] = you tell soandso "hi"
		3. complex: /email [name@ww.com] [subject]|[msg]|[etc]|[etc]
*/

/*
_command.push(["!1", "1", "com_1", "!1", "Choose path 1."]);
_command.push(["!2", "1", "com_2", "!2", "Choose path 2."]);
_command.push(["!3", "1", "com_3", "!3", "Choose path 3."]);
_command.push(["!4", "1", "com_4", "!4", "Choose path 4."]);

_command.push(["!buy", "2", "com_buy", "!buy [item name or id]", "Buy an item!"]);

_command.push(["!d20", "1", "com_d20", "!d20", "Roll a 20-sided die."]);

_command.push(["!deletenote", "2", "com_deletenote", "!deletenote [id]", "Delete a note."]);

_command.push(["!deleteplayer", "2", "com_deleteplayer", "!deleteplayer [name or id or default(self)]", "Delete a player (self-only if NOT admin)."]);

_command.push(["!dice", "1", "com_dice", "!dice", "Roll a pair of dice."]);

_command.push(["!join", "1", "com_play", "!join or !play", "Join the next available round."]);

_command.push(["!give", "2", "com_give", "!give [target] [item id]", "Give another player an item."]);

_command.push(["!gold", "2", "com_gold", "!give [target] [amount]", "Give another player some gold."]);

_command.push(["!me", "1", "com_stats", "!me or !stats", "View your stats."]);

_command.push(["!note", "2", "com_note", "!note [message]", "Create a note."]);

_command.push(["!notes", "1", "com_notes", "!notes", "View notes list."]);

_command.push(["!play", "1", "com_play", "!join or !play", "Join the next available round."]);

_command.push(["!player", "2", "com_player", "!player [name or id]", "View target player's stats."]);

_command.push(["!players", "1", "com_players", "!players", "View the players list."]);

_command.push(["!rank", "1", "com_rank", "!rank", "View your leaderboard rank."]);

_command.push(["!readnote", "2", "com_readnote", "!readnote [id]", "Read a note."]);

_command.push(["!shop", "2", "com_shop", "!shop [armor, pets, potions, weapons]", "View the shop!"]);

_command.push(["!stats", "1", "com_stats", "!me or !stats", "View your stats."]);

_command.push(["!text", "2", "com_text", "!text", "Send OP a text message."]);

_command.push(["!uptime, "1", "com_uptime", "!uptime, "Display this channel's uptime."]);

*/

_command.push([
  "!test",
  "1",
  "com_test",
  "!test [message here]",
  "Run a test."
]);

let _commands = _command.length;

/*   ==============  ==============    

  START RETURNED CHAT STRING FUNCTIONS

      ============== ==============  */

// !d20 command is issued
function com_d20() {
  //var _chan = arguments[0];
  const sides = 20;
  const num = Math.floor(Math.random() * sides) + 1;
  client.say(
    _chan,
    `You rolled a ${num}. Link: https://glitch.com/~twitch-chatbot`
  );
}

// "!uptime"
function com_uptime() {
  client.say(_chan, `Not sure what the uptime (command) is atm.`);
}

// "!test"
function com_test() {
  var _cid = arguments[0]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_cid}, ${_cmd}, ${_fn}`);
}
