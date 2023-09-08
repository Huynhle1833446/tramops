const express = require('express');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 3000;
var app = express();
app.use(express.json());
app.use(cors())
const bodyParser = require("body-parser");
const routes = require ("./routes/index.js");
const auth = require("./middleware/auth.js");


app.use(auth)

app.use("/api", routes);

app.listen(port, () => {
     console.log(`Server running on port ${port}`);
});
