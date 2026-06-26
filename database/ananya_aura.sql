CREATE DATABASE ananya_aura;

USE ananya_aura;


CREATE TABLE users(
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(100),
phone VARCHAR(20),
dob VARCHAR(20),
email VARCHAR(100),
password VARCHAR(100)
);


CREATE TABLE products(
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100),
price INT,
image VARCHAR(255),
category VARCHAR(50)
);
INSERT INTO products(name,price,image,category)
VALUES

('Diamond Ring',8000,'images/ring.jpg','women'),

('Necklace',8000,'images/necklace.jpg','women'),

('Bangles',800,'images/bangles.jpg','women'),
('Earrings',500,'images/bangles.jpg','women'),
('Anklets',300,'images/bangles.jpg','women'),
('Chain',8000,'images/bangles.jpg','women'),
('Bracelet',6000,'images/bangles.jpg','women'),
('Rings',3900,'images/bangles.jpg','women'),
('watch',2500,'images/bangles.jpg','women'),

('Watch',6000,'images/watch.jpg','men'),

('NeckChain',5000,'images/bangles.jpg','women'),
('Longchain',4000,'images/bangles.jpg','women'),



CREATE TABLE cart(
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
product_name VARCHAR(100),
price INT,
image VARCHAR(255),
quantity INT
);


CREATE TABLE orders(
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
total INT,
status VARCHAR(50),
order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
product_name VARCHAR(100),
price INT,
quantity INT
);