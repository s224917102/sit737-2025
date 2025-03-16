const express = require("express");
const winston = require("winston");
const path = require("path");

const app = express();

// Winston Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Serve static files (HTML)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Functions
const add= (n1,n2) => {
  return n1 + n2;
}

const subtract= (n1,n2) => {
  return n1 - n2;
}

const multiply = (n1,n2) => {
  return n1 * n2;
}

// Routes
app.get("/add", (req, res) => handleOperation(req, res, add, "Addition"));
app.get("/subtract", (req, res) => handleOperation(req, res, subtract, "Subtraction"));
app.get("/multiply", (req, res) => handleOperation(req, res, multiply, "Multiplication"));

function handleOperation(req, res, operation, operationName) {
  try{
    const n1= parseFloat(req.query.n1);
    const n2=parseFloat(req.query.n2);

    if(isNaN(n1)) {
        logger.error("n1 is incorrectly defined");
        throw new Error("n1 incorrectly defined");
    }
    if(isNaN(n2)) {
        logger.error("n2 is incorrectly defined");
        throw new Error("n2 incorrectly defined");
    }
    
    if (n1 === NaN || n2 === NaN) {
        console.log()
        throw new Error("Parsing Error");
    }

    const result = operation(n1, n2);
    logger.info(`${operationName} of ${n1} and ${n2}: ${result}`);
    res.send(`Result: ${result}`);
  } catch (error) {
    res.status(500).send(error.toString());
  }
}

const	port = process.env.port || 3040
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
