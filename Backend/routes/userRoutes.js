const express = require("express");
const router = express.Router();
const db = require("../db");


// Register API

router.post("/register", (req,res)=>{

console.log("Register API Called");


let {username, phone, dob, email, password} = req.body;


let sql =
"INSERT INTO users(username,phone,dob,email,password) VALUES(?,?,?,?,?)";


db.query(
sql,
[username, phone, dob, email, password],

(err,result)=>{

if(err){

console.log(err);

return res.status(500).json({
message:"Register failed"
});

}


res.json({
message:"User Registered Successfully"
});


}

);

});





// Login API

router.post("/login",(req,res)=>{


console.log("🔥 LOGIN ROUTE HIT");


let {email,password} = req.body;


let sql =
"SELECT * FROM users WHERE email=? AND password=?";


db.query(
sql,
[email,password],

(err,result)=>{


if(err){

console.log(err);

return res.status(500).json({
message:"Login Failed"
});

}



if(result.length == 0){

return res.status(401).json({
message:"Invalid Email or Password"
});

}



res.json({

message:"Login success",

user:result[0]

});


}

);


});
// Delete cart item

router.delete("/cart/:id",(req,res)=>{


let id = req.params.id;


let sql = 
"DELETE FROM cart WHERE id=?";


db.query(
sql,
[id],

(err,result)=>{


if(err){

console.log(err);

return res.status(500).send("Delete Failed");

}


res.send("Removed");


}

);


});
// GET PROFILE

router.get("/profile/:id",(req,res)=>{


let id = req.params.id;


let sql =
"SELECT id,username,phone,dob,email FROM users WHERE id=?";



db.query(
sql,
[id],

(err,result)=>{


if(err){

console.log(err);

return res.status(500).send("Profile Error");

}


if(result.length==0){

return res.status(404).send("User Not Found");

}


res.json(result[0]);


});


});

module.exports = router;