# Simple message generator

This program for genrating and consuming messages via redis connectopn

## Requirements
 * Node 6.2.0
 * npm

## Instalation

In order to install all dependencies simply execute next command in project dir
```
npm install
```

## Running 

Program can work in several modes:

### 1. Generator 

To run program as generator just execute
```
npm start
```

### 2. Consumer

To run program as consumer execute
```
npm start
```
in another shell tab while generator is running

### 3. Read all errors
To see all failed messages type in your console
```
npm start getErrors
```
#Testing

In order to run unit tests just execute
```
npm test
```
