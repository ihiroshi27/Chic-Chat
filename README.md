## Installation
- Install **NodeJS** and **MySQL Server**
- Config MySQL Server in **config.js**
- Create Database
  - `CREATE DATABASE chic_chat;`
- Create Table
  - `CREATE TABLE user (id int NOT NULL AUTO_INCREMENT PRIMARY KEY, username varchar(255) NOT NULL UNIQUE, password text NOT NULL, name varchar(255) NOT NULL, email varchar(255) NOT NULL UNIQUE, mobile varchar(10) NOT NULL UNIQUE, citizen_id varchar(13) NOT NULL UNIQUE, profile varchar(255) NOT NULL, mimetype varchar(128));`
  - `CREATE TABLE friend (user_id int NOT NULL, friend_id int NOT NULL, PRIMARY KEY (user_id, friend_id));`
  - `CREATE TABLE chat (user_id1 int NOT NULL, user_id2 INT NOT NULL, message TEXT NOT NULL, dateadded datetime default CURRENT_TIMESTAMP);`

- `npm install` at **root directory** and **view directory**

## Running
- `npm start` at **root directory** and **view directory**

**Back-end** will run on port **8080** and **Front-end** will run on port **3000**
