const express = require('express'); // Importing express
const app = express(); // Creating an express app
const dotenv = require("dotenv");
// const path = require("path");
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes')

const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 4000;
const database = require("./db/database");
const cors = require("cors");
dotenv.config();//load dotenv config
database.connect();//

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


app.use(
  cors({
    // origin:[ "http://localhost:3000", "https://taskmanage.vercel.app"],//"*",  //FOR FRONTEND..//  methods: ["GET", "POST", "PUT", "DELETE"],..VVI..to entertain frontend req.[[http://localhost:3000]] -->:["http://localhost:3000","https://mystudynotion.vercel.app","https://study1-jlkmw7ckr-mohit1721s-projects.vercel.app"], --------------------------["https://mystudynotion.vercel.app"]  
    origin: process.env.NODE_ENV === 'production' ? "https://task-mange-app.vercel.app" : "http://localhost:3000", // Conditional origin based on environment

    methods: ['GET', 'POST','PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow Authorization header
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); 
  console.log(req.headers); // Check what headers are being passed

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});
//4. routes mount..
app.use("/api/v1/auth/", authRoutes);
app.use("/api/v1/", taskRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

