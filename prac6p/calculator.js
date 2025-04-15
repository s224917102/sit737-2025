const express = require('express');
const winston = require('winston');

const app = express();

// Create a logger instance with winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'calculator-microservice' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Serve static files (HTML)
app.use(express.static(__dirname + '/public'));

// Circuit Breaker
let circuitBreakerStatus = 'CLOSED';  // The initial state of the circuit breaker
let failureCount = 0;
const failureThreshold = 3;  // Threshold for failing the circuit breaker

// Function to reset the circuit breaker
function resetCircuitBreaker() {
  circuitBreakerStatus = 'CLOSED';
  failureCount = 0;
}

// Circuit Breaker Wrapper
async function circuitBreakerWrapper(func, ...args) {
  if (circuitBreakerStatus === 'OPEN') {
    logger.warn('Circuit Breaker is OPEN. Operation aborted.');
    throw new Error('Circuit Breaker is open. Operation aborted.');
  }

  try {
    const result = await func(...args);  // Await the result of the async operation
    failureCount = 0; // Reset failure count if successful
    return result;
  } catch (error) {
    failureCount++;
    if (failureCount >= failureThreshold) {
      circuitBreakerStatus = 'OPEN';  // Open the circuit breaker after threshold
      logger.error(`Circuit Breaker OPEN due to ${failureThreshold} failures`);
    }
    throw error;
  }
}

// Retry Logic
async function retryWrapper(func, retries = 3, delay = 1000, ...args) {
  let attempts = 0;

  const execute = async () => {
    attempts++;
    try {
      return await func(...args);  // Await the result of the function
    } catch (error) {
      if (attempts < retries) {
        await new Promise(resolve => setTimeout(resolve, delay));  // Retry after delay
        return await execute();  // Retry the operation
      } else {
        throw error;  // All retries failed, throw error
      }
    }
  };

  return execute();
}

// Functions
const add = (n1, n2) => n1 + n2;
const subtract = (n1, n2) => n1 - n2;
const multiply = (n1, n2) => n1 * n2;
const divide = async (n1, n2) => {
  if (n2 === 0) {
    throw new Error('Division by zero is not allowed');  // Handle division by zero immediately
  }

  // Use the retry logic and circuit breaker for divide operation
  return await retryWrapper(async () => {
    return await circuitBreakerWrapper(async () => {
      return n1 / n2;  // Perform division
    }, n1, n2);
  }, 3, 1000, n1, n2);
};

const exponentiate = (n1, n2) => Math.pow(n1, n2);

// Square Root operation without using fallbackWrapper
const squareRoot = (n1) => {
  if (n1 < 0) {
    throw new Error('Cannot calculate square root of a negative number');
  }
  return Math.sqrt(n1);  // Simply return the square root of n1
};

const modulo = (n1, n2) => {
  if (n2 === 0) {
    throw new Error('Modulo by zero is not allowed');
  }
  return n1 % n2;
};


// Routes
app.get('/add', (req, res) => handleOperation(req, res, add, 'Addition'));
app.get('/subtract', (req, res) => handleOperation(req, res, subtract, 'Subtraction'));
app.get('/multiply', (req, res) => handleOperation(req, res, multiply, 'Multiplication'));
app.get('/divide', (req, res) => handleOperation(req, res, divide, 'Division'));
app.get('/exponentiate', (req, res) => handleOperation(req, res, exponentiate, 'Exponentiation'));
app.get('/squareRoot', (req, res) => squareRootOperation(req, res, squareRoot, 'Square Root'));
app.get('/modulo', (req, res) => handleOperation(req, res, modulo, 'Modulo'));

// Generalized function to handle all operations
async function squareRootOperation(req, res, operation, operationName) {
  try {
    const n1 = parseFloat(req.query.n1);

    // Log the incoming parameters
    console.log(`Received request for square root with n1: ${n1}`);  // Log n1

    // Validate inputs
    if (isNaN(n1)) {
      console.error(`${operationName} failed: n1 is not a valid number`);
      return res.status(400).send('Error: n1 is not a valid number');
    }

    // Execute the operation (for square root, no need for n2)
    const result = await operation(n1);  // Only pass n1 for square root

    console.log(`${operationName} of ${n1}: ${result}`);  // Log result
    res.send(`Result: ${result}`);  // Send back the result
  } catch (error) {
    // Log and handle error
    console.error(`${operationName} failed: ${error.message}`);
    res.status(500).send('An unexpected error occurred.');
  }
}

// Generalized Error Handling for Operations
async function handleOperation(req, res, operation, operationName) {
  try {
    const n1 = parseFloat(req.query.n1);
    const n2 = parseFloat(req.query.n2);

    // Validate inputs
    if (isNaN(n1)) {
      logger.error(`${operationName} failed: n1 is not a valid number`);
      return res.status(400).send('Error: n1 is not a valid number');
    }
    if (isNaN(n2) && operationName !== 'Square Root') {
      logger.error(`${operationName} failed: n2 is not a valid number`);
      return res.status(400).send('Error: n2 is not a valid number');
    }

    // Execute the operation (await for async operations like divide)
    const result = await operation(n1, n2);

    // Log the successful operation
    logger.info(`${operationName} of ${n1} and ${n2}: ${result}`);
    res.send(`${result}`);
  } catch (error) {
    // Enhanced Error Handling and Debugging
    logger.error(`${operationName} failed: ${error.message}`, {
      operationName,
      n1: req.query.n1,
      n2: req.query.n2,
      stack: error.stack,
    });
    
    // Handle specific error messages and fallback for others
    if (error.message.includes('negative number') || error.message.includes('zero')) {
      return res.status(400).send(`Error: ${error.message}`);
    }
    // If error is from retry or circuit breaker, provide more context
    if (error.message.includes('Circuit Breaker is open')) {
      return res.status(503).send('Service unavailable. Please try again later.');
    }
    
    // Generic error message for unexpected errors
    res.status(500).send('An unexpected error occurred.');
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});