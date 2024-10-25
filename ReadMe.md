## Folder Structure

```
root
│
├── client (React frontend)
│ ├── package.json
│ └── node_modules
│
├── server (Node.js backend)
│ ├── package.json
│ └── node_modules
│
└── package.json (root)
```

## How to Run This Application (At the ROOT of the FOLDER)

Follow these steps:

1. Install dependencies for the client and server:

```
   npm run install:client
   npm run install:server
```

2. setup .env, it should be look like:

```
   PORT=3001
   SECRET_KEY=yoursupersecretkey
   TOKEN_PRIVATE_KEY_PATH=ssl/jwt.key
   TOKEN_PUBLIC_KEY_PATH=ssl/jwt.cert
```

3. Start the application:

```
   npm run start
```

Once running, both the client and server will be available:

Visit http://localhost:3000 to see the React app.\
Visit http://localhost:3001/testing to view the server app.\

Your task: Secure the application and make sure the JWT token is working as intended for both Frontend and backend.

## Security Enhancements

Original Setup:
- Used hardcoded secret and **HS256** algorithm for JWT signing
- No expiration set for JWT tokens
- HTTP with default CORS configuration

Updated Setup:
- **RSA encryption** using OpenSSL
- **RS256** algorithm for JWT signing
- Added JWT token expiration (`expireIn` property)
- Upgraded to **HTTPS**
- Configured CORS with stricter constraints
- Enhanced error handling and middleware for token verification

Please refer to the documentation here
[Click here for the project explanation](https://docs.google.com/document/d/1O0_NXUNg1DCVsgmcZxPbaTT08gDkOI6q_6iVAACAjq4/edit?usp=sharing)

If you have any questions, please slack me or email me at pak@pursuit.org
