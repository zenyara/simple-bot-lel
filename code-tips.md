Shorthand 'If' Statement:

- `var _isMod = user["mod"] == false ? 0 : 1;`

Remove unwanted chat strings:

- `if(msg.includes("www.") || msg.includes(".com"))`

Check for "undefined":

- `if(myVar === undefined){return "Undefined value!"}`

Run a dynamic function (using 'eval'):

- `eval(\_fn + "("+\_cid+")"); OR eval(`${_fn}(${\_cid})`);`

Regex pattern to disallow any chars NOT included between the braces (case-insensitive):

- `let messageRemoveSigns = message.replace(/<|>|;|\\/gi, "");`

  `let msg = messageRemoveSigns.replace( /[^ a-z0-9!@#$*_+-=~,./?{}\[\]\|]/gi, "" );`

  `console.log(msg);`
