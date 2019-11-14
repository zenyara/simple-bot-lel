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
  "!about",
  "1",
  "com_about",
  "!about",
  "About this project.",
  "0"
]);

_command.push(["!buy", "1", "com_buy", "!buy [item id]", "Buy an item!", "0"]);

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
  "1",
  "com_deletenote",
  "!deletenote [id]",
  "Delete a note.",
  "0"
]);

_command.push([
  "!deleteplayer",
  "2",
  "com_deleteplayer",
  "!deleteplayer or !deleteuser [name]",
  "Delete a player (self-only if NOT mod/op).",
  "0"
]);

_command.push([
  "!deleteuser",
  "2",
  "com_deleteplayer",
  "!deleteuser or !deleteplayer [name]",
  "Delete a player (self-only if NOT mod/op).",
  "0"
]);

_command.push(["!dice", "1", "com_dice", "!dice", "Roll a pair of dice.", "0"]);

_command.push([
  "!give",
  "2",
  "com_give",
  "!give [target] [item id]",
  "Give another player an item.",
  "1"
]);

_command.push([
  "!gold",
  "2",
  "com_gold",
  "!gold [target] [amount]",
  "Give another player some gold.",
  "1"
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
  "!say",
  "1",
  "com_say",
  "!say [message]",
  "Say something.",
  "0"
]);

_command.push([
  "!shop",
  "1",
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

exports.obj = { cc: _command, ccs: _commands };
