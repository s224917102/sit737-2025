### Calculator Microservice  

## Overview  
A simple calculator microservice using Node.js and Express that performs basic arithmetic operations.  

## Features  
* Supports addition, subtraction, multiplication, and division  
* Handles errors like invalid inputs and division by zero  
* Logs operations and errors using Winston  

# Instruction to run the project:
* go to prac4p folder
* run the server - command line to run (node calculator.js)
* use url :- localhost:3000 

## 2. Use the following API endpoints:
* http://localhost:3040
   * http://localhost:3040/add?n1=5&n2=3  
   * http://localhost:3040/subtract?n1=8&n2=2  
   * http://localhost:3040/multiply?n1=4&n2=6  
   * http://localhost:3040/divide?n1=10&n2=2  
   

## Logging  
* Errors are logged in `logs/error.log`  
* All operations are logged in `logs/combined.log` 
* Or use commands to see logs `tail -f logs/error.log` or `tail -f logs/error.log`