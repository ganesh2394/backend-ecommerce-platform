const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const connectDB = require("./config/db");

require("dotenv/config");
const api = process.env.API_URL;
const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");
const cartRouter = require("./routes/cartRoutes");
const orderRouter = require("./routes/orderRoutes");

// Database connection
connectDB();

// Middlewares
app.use(bodyParser.json());
app.use(morgan("tiny"));

// Routers
app.use(`${api}/products`, productRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/carts`, cartRouter);
app.use(`${api}/orders`, orderRouter);

app.listen(3000, () => {
  console.log(api);
  console.log("server is running.");
});
