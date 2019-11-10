const tmi = require("tmi.js");
const mycoms = require("./mycoms.js");

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
let _projectName = "simple-bot-lel";
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
        _arg.push(_cid);
        _arg.push(_p2);
        //window[_cmd].apply(null, Array.prototype.slice.call(_arg, 0));
        eval(`${_fn}`).apply(null, Array.prototype.slice.call(_arg, 0)); // run function with included args
      }
      //eval(_fn + "("+_cid+")"); // run the function
      //eval(`${_fn}("${_displayname}", ${_cid})`); saving original
      // username, displayname, commandID

      ////// eval(`${_fn}("${_username}", "${_displayname}", ${_cid})`);

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

  START RETURNED CHAT STRING FUNCTIONS

      ============== ==============  */

/*========================================*/
// Pull-in the commands array from mycoms.js
let _command = new Array();
_command = mycoms.obj.cc;
let _commands = mycoms.obj.ccs;
/*========================================*/

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

function com_about() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[2]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(
    _chan,
    `${_dname} find out about ${_projectName} for Twitch, made with Glitch. - https://tinyurl.com/absimpoblel`
  );
}

function com_buy() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[2]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(
    _chan,
    `${_dname} bought something from the shop! - https://tinyurl.com/2simpoblel`
  );
}

function com_commands() {
  // username,displayname,commandID
  var _cid = arguments[2]; //command id
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  client.say(_chan, `${_commands} commands: https://tinyurl.com/0simpoblel`);
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

function com_say() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[2]; //command id
  var _msg = arguments[3]; // message (the rest of the string)
  var _cmd = _command[_cid][0]; //command name;
  var _fn = _command[_cid][2]; //fn name;
  if (_msg.length > 0) {
    client.say(_chan, `${_dname} says, ${_msg}`);
  }
}

function com_shop() {
  // username,displayname,commandID
  var _uname = arguments[0]; //username
  var _dname = arguments[1]; //displayname
  var _cid = arguments[2]; //command id
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
