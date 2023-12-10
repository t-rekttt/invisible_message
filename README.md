# Invisible Message
 

 
 ## What is this?
This is a tool (userscript) for encoding/decoding Facebook Messenger messages to invisible characters

(Thanks to zws for the zero width characters table: https://github.com/zws-im/tools)

## How does it work?
The tool will be hooking into your Facebook messenger's React component to support 2 main features:
- Encode your message into invisible messages (on demand)
- Decode invisible messages sent by you and others to the normal/readable format

## Features
- No manual interaction required (no manual scripting/injection into dev console, blah blah,...just install once and use forever)
- Easy to use
- Sent messages remain fully invisible when you turn off the tool, fully invisible on mobile devices
- v0.8: Now with inline hidden messages
- v0.10: Now you can put hidden text between other visible texts. Syntax changed to: `> text <`

## How to use
- Install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- Install my userscript from <!--[here](https://github.com/t-rekttt/invisible_message/raw/hidden-between-text/invisibleMessage.user.js)-->
- Turn off your Facebook/Messenger tab and open it back again (to reflect the changes)
- When you need to encode a message, add ">" at the beginning of the message. Example: *>Hello*
