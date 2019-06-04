## Installation
- Install **NodeJS** and **MySQL Server**
- Create Database
  - `CREATE DATABASE chic_chat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
- Create Table
  - `CREATE TABLE user (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL UNIQUE, password TEXT NOT NULL, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, mobile VARCHAR(10) NOT NULL UNIQUE, citizen_id VARCHAR(13) NOT NULL UNIQUE, profile VARCHAR(255) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`
  - `CREATE TABLE login (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, attempt VARCHAR(255) NOT NULL, lat DOUBLE NOT NULL, lng DOUBLE NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES user(id));`
  - `CREATE TABLE friend (user_id INT NOT NULL, friend_id INT NOT NULL, blocked BOOLEAN DEFAULT false, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, friend_id), FOREIGN KEY (user_id) REFERENCES user(id), FOREIGN KEY (friend_id) REFERENCES user(id));`
  - `CREATE TABLE reset (token TEXT NOT NULL, user_id INT NOT NULL, email VARCHAR(255) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES user(id));`
  - `CREATE TABLE chat (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, user_id1 INT NOT NULL, user_id2 INT NOT NULL, message TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id1) REFERENCES user(id), FOREIGN KEY (user_id2) REFERENCES user(id));`
  - `CREATE TABLE notification (type ENUM('Request','Message') NOT NULL, user_id INT NOT NULL, friend_id INT NOT NULL, message TEXT, readed BOOLEAN DEFAULT FALSE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(type, user_id, friend_id), FOREIGN KEY (user_id) REFERENCES user(id), FOREIGN KEY (friend_id) REFERENCES user(id));`

- `npm install` at **root directory** and **view directory**

## Configuration
You need to configure a **MySQL, Nodemailer** and **reCAPTCHA v2**
- Back-end configuration will located in **config.js** at **root directory**
- Front-end configuration will located in **.env** at **view directory**

## Running
- `npm start` at **root directory** and **view directory**

**Back-end** will run on port **8080** and **Front-end** will run on port **3000**
