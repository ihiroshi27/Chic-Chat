## Installation
- Install **NodeJS** and **MySQL Server**
- Create Database
  - `CREATE DATABASE chic_chat;`
- Create Table
  - `CREATE TABLE user (id int NOT NULL AUTO_INCREMENT PRIMARY KEY, username varchar(255) NOT NULL UNIQUE, password text NOT NULL, name varchar(255) NOT NULL, email varchar(255) NOT NULL UNIQUE, mobile varchar(10) NOT NULL UNIQUE, citizen_id varchar(13) NOT NULL UNIQUE, profile varchar(255) NOT NULL, mimetype varchar(128));`
  - `CREATE TABLE friend (user_id int NOT NULL, friend_id int NOT NULL, PRIMARY KEY (user_id, friend_id));`
  - `CREATE TABLE chat (user_id1 int NOT NULL, user_id2 INT NOT NULL, message TEXT NOT NULL, dateadded datetime default CURRENT_TIMESTAMP);`
  - `CREATE TABLE reset (user_id int NOT NULL, email varchar(255) NOT NULL, token text NOT NULL, dateadded datetime default CURRENT_TIMESTAMP);`
  - `CREATE TABLE login (user_id int NOT NULL, attempt varchar(255) NOT NULL, lat double NOT NULL, lng double NOT NULL, dateadded datetime default CURRENT_TIMESTAMP)`

- `npm install` at **root directory** and **view directory**

## Configuration
You need to configure a **MySQL, Nodemailer** and **reCAPTCHA v2**
- Back-end configuration will located in **config.js** at **root directory**
- Front-end configuration will located in **.env** at **view directory**

## Running
- `npm start` at **root directory** and **view directory**

**Back-end** will run on port **8080** and **Front-end** will run on port **3000**
