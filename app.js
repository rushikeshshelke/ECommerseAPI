require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");

const RouteNotFound = require("./src/middlewares/RouteNotFound");
const ErrorHandler = require("./src/middlewares/ErrorHandler");
const EstablishConnection = require("./src/utils/EstablishConnection");
const AuthRouter = require("./src/routes/Auth");
const UserRouter = require("./src/routes/User");
const ProductRouter = require("./src/routes/Product");
const ReviewRouter = require("./src/routes/Review");
const OrderRouter = require("./src/routes/Order");

// Security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimitter = require("express-rate-limit");

// Swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load("./docs/swagger.yaml");

const app = express();

app.use(morgan("tiny"));
app.use(express.json());

app.use(helmet());
app.use(cors());
app.use(xss());

app.use(express.static("./public"));
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send(
    "<h1>Ecommerse API Documentation<h1><a href='/api/v1/docs'>Click Here</a>"
  );
});
app.use("/api/v1/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use(
  rateLimitter({
    windowMs: 15 * 60 * 100, //15 mins
    max: 100,
  })
);

// routes
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/products", ProductRouter);
app.use("/api/v1/reviews", ReviewRouter);
app.use("/api/v1/orders", OrderRouter);

// middlewares
app.use(RouteNotFound);
app.use(ErrorHandler);

const port = process.env.PORT || 5000;

const startApp = async () => {
  try {
    await EstablishConnection(process.env.MONGODB_URI);
    app.listen(port, () =>
      console.log(`Ecommerse server is up and running on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

startApp();
