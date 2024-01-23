const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;

// databases connections
const ConnectDB = require("./DataBase/ConnectDb");
ConnectDB();

// middleware
app.use(express.json());

const userrouter = require("./Routes/UserRoutes");
app.use("/api", userrouter);



app.listen(PORT, () => {
  console.log(` Server listening on ${PORT}`);
});
