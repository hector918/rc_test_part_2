
///lib///
const express = require("express");
const jwt = require("jsonwebtoken");
const logger = require("morgan");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
require("dotenv").config();
//const
const rootPath = __dirname;
const secretKey = process.env.SECRET_KEY;
const jwt_exprie_time = "1h";
const PORT = process.env.PORT;
const app = express();
//config///////
// CORS configuration
const corsOptions = {
	origin: ['https://localhost:3000', 'https://hygpo.com'],
	optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
//temp users
const users = [{ id: 1, username: "admin", password: "password" }];

// Serve static files from the React app
app.use(express.static('public/build'));

// Handle any requests that don't match the above
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public/build' });
});

//routes
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  console.log(user, username, password);
  if (user) {
    const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: jwt_exprie_time });
    res.json({ token });
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
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, secretKey);
  
    if (decoded.exp === undefined || decoded.iat === undefined){
      return res.status(401).json({ message: "Forbidden" });
    }
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTimestamp) {
      return res.status(401).json({ message: "Token has expired" });
    }
    
    req.decoded = decoded;
    next();
  } catch (err) {
    switch (err.name) {
      case "TokenExpiredError":
        return res.status(401).json({ message: "Token has expired" });
      default:
        return res.status(403).json({ message: "Forbidden" });
    }
  }
}