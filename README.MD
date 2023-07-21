#Live-Chat 


## Description

Websocket portion controlling the chat between users watching a livestream. Utilizes websockets to have a continuous connection between users in chat. Created to gain a better knowledge of websockets and their use with a frontend technology.

## Installation

This project uses pnpm rather than npm. To install pnpm see https://github.com/pnpm/pnpm.

To run the application, follow these steps:

1. Install dependencies
```node.js
pnpm i
```

2. Compile the typescript to javascript
``` node.js
pnpm build
```

3. Run the software
```node.js
pnpm start
```
Note: The following should be in a .env file where secret is used to hash user passwords. Also note that secret should be the same secret used on the Live-backend portion of the app.

```
SECRET={}
```