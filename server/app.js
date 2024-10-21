
///lib///
const express = require("express");
const jwt = require("jsonwebtoken");
const logger = require("morgan");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
//const
require("dotenv").config();
const rootPath = __dirname;
const jwt_exprie_time = "1d";
const PORT = process.env.PORT;
const privateKeyPath = process.env.TOKEN_PRIVATE_KEY_PATH;
const publicKeyPath = process.env.TOKEN_PUBLIC_KEY_PATH;
const app = express();
//config///////
// CORS configuration
const corsOptions = {
	origin: ['https://localhost', 'https://hygpo.com'],
	optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
//temp users
const users = [{ id: 1, username: "admin", password: "password" }];

// Serve static files from the React app
app.use(express.static('public/build'));

//routes
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    //use asymmetric encryption if private key available 
    try {
      const privateKey = fs.readFileSync(`${rootPath}/${privateKeyPath}`);
      const token = jwt.sign(
        { id: user.id, username: user.username }, 
        privateKey, 
        { expiresIn: jwt_exprie_time, algorithm: 'RS256' }
      );
      res.json({ token });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Internal error." });
    }
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Welcome to the protected route!", decoded: req.decoded });
});

app.get("/testing", (req, res) => {
  res.send("App is working!");
});

// Handle any requests that don't match the above
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public/build' });
});

//https server
const options = {
  key: fs.readFileSync(`${rootPath}/ssl/server.key`),
  cert: fs.readFileSync(`${rootPath}/ssl/server.cert`)
};
https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS Server is running on port ${PORT}`);
});

//middleware///////////////////////////////////
function verifyToken(req, res, next){
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log("Unauthorized without token.")
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const publicKey = fs.readFileSync(`${rootPath}/${publicKeyPath}`);
    //Verify token with public key
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    req.decoded = decoded;
    next();
  } catch (err) {
    if(err.code === "ENOENT") {
      console.error("token public key file not founud.");
      return res.status(500).json({ message: "Internal error." });
    }
    
    console.log(err.name);
    switch (err.name) {
      case "TokenExpiredError":
        return res.status(401).json({ message: "Token has expired." });
      default:
        return res.status(403).json({ message: "Forbidden" });
    }
  }
}
