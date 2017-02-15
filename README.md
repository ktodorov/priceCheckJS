# priceCheckJS

[![License MIT](https://img.shields.io/npm/l/express.svg)](http://opensource.org/licenses/MIT)

## Description
This is application for following online products prices ups and downs in real time. It supports authentication for different users where every user has own entered products, which he can view, edit and delete.
Every user needs to be logged in order to access any information. When logged, his authentication token is stored using cookies.

All the user needs to do in order to create a new product for following is to enter its url in the 'Create product' page, 
the application then analyzes the URL and if the given website is available, it parses the html and displays current price, 
name and gives user ability to add his own description. If the user choose to save the product, the product entity is posted to the server and stored in the database. 
From then, the product price is refreshed automatically every 60 minutes or manually by the user from the grid.

## Used technologies 

* Node.js and JavaScript for the server side 
* Client side is written in JavaScript
* EJS template files and CSS are used for the web interface
* MongoDB for database
* Mongoose Node.js library for connecting

## Currently supported websites

* Ebay.co.uk / Ebay.com
* Emag.bg
* Technopolis.bg
* Technomarket.bg

_More websites will be added when all functionalities are completed_

## Main reasons for this project

This app is created for 'Javascript Advanced' university course, read in the Faculty of Mathematics and Informatics in Sofia University "St. Kliment Ohridski" during 2016/2017 winter semester.