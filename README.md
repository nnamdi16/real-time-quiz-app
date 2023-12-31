# Real-time Quiz Application
Welcome to Real-time quiz application!. The real-time quiz application is a backend service where users can join a quiz, answer questions, and see real-time results. The application is built using  NestJS for the backend framework, NATS for real-time event handling, and PostgreSQL for data storage.

## Table of Contents
* Features
* Getting Started
  * Prerequisites
  * Setting up NATS Server
  * Running the application
* Running Test
* Swagger Documentation
* Assumptions


## Features

* User Registration & Authentication
* Quiz Creation
* Real-time Quiz Participation
* Score Calculation & Leaderboard



### Validator Service
The Validator Service validates tokens generated by the Generator Service using the Luhn algorithm.

### User Interface
The User interface is used by the client to generate a token and validate token.


## Getting Started

### Prerequisite
- Node.js: Make sure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/en) preferably the LTS version .
- npm (Node Package Manager): This comes bundled with Node.js, so there's no need to install it separately
- [Visual Studio Code](https://code.visualstudio.com/) or any other suitable IDE that can run Node Js.
- NATS Server. For NATS server configuration and set review article
- Postgres db setup and configuration for further instruction on postgres setup - [postgres documentation](https://www.postgresql.org/)
- Web Browser: For testing and running the Swagger documentation, you'll need a modern web browser like Google Chrome, Mozilla Firefox, or Microsoft Edge.

### Setting Up NATS Server
- To set up NATS server requires installing NATS server from [NATS](https://docs.nats.io/using-nats/nats-tools/nats_cli)
- On the cli run the command below:
```bash
nats-server 
```

To subcribe to an event run the command below:
```bash
nats subscribe ">" -s 0.0.0.0:4222
```


To view the notification you need to run the index.html file in the src/views folder in a browser.


### Running the application
- Clone the [repository](https://github.com/nnamdi16/real-time-quiz-app.git)
- Install dependencies by running the following commands below:
```bash 
cd real-time-quiz-app
npm install
 ```
- There is a .env.example file in the folder. Create your own copy and name it .env so that the applicatiom can access the environment variables.
- To run the entire application, run the command below in the root directory of the project based on you operating system (OS)

```bash
npm run start:dev

```
NB: By default the backend runs on port 3000



## Running Test
#### Real-time Application
To run the test for the application, run the command below:

```bash
npm run test
```
For end to end test
```bash
npm run test:e2e
```

To generate test coverage report for the application, run the command below:


```bash
npm run test:cov
```

To view the report you need to run the report which is an index.html file in the coverage/Icov-report/index.html folder in a browser.



## Documentation
The REST endpoint for the real-time quiz application is documented using swagger.
The swagger documentation UI is seen below:
- [QUIZ APP - http://localhost:3000/api](http://localhost:3000/api)


## Assumptions
- 


