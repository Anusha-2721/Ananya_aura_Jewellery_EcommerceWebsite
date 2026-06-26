const mysql = require("mysql2");


const db = mysql.createConnection({

host:"localhost",

user:"root",

password:"Anusha@123",

database:"ananya_aura"

});



db.connect((err)=>{


if(err){

console.log("Database connection failed");

}

else{

console.log("MySQL Connected Successfully");

}


});



module.exports = db;