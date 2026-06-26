const express = require("express");

const router = express.Router();

const db = require("../db");
console.log("CART ROUTE FILE LOADED");



// ADD TO CART

router.post("/cart",(req,res)=>{


let {
user_id,
product_name,
price,
image,
quantity
} = req.body;



let sql =
"INSERT INTO cart(user_id,product_name,price,image,quantity) VALUES(?,?,?,?,?)";



db.query(
sql,
[
user_id,
product_name,
price,
image,
quantity
],

(err,result)=>{


if(err){

console.log(err);

return res.status(500).send("Cart add failed");

}


res.send("Added to Cart");


});


});






// GET CART ITEMS


router.get("/cart/:user_id",(req,res)=>{


let user_id = req.params.user_id;



let sql =
"SELECT * FROM cart WHERE user_id=?";



db.query(
sql,
[user_id],

(err,result)=>{


if(err){

console.log(err);

return res.status(500).send("Cart fetch failed");

}



res.json(result);



});


});







// DELETE CART ITEM


router.delete("/cart/:id",(req,res)=>{


let id = req.params.id;


let sql = "DELETE FROM cart WHERE id=?";


db.query(
sql,
[id],

(err,result)=>{


if(err){

console.log("DELETE ERROR:",err);

return res.status(500).send("Delete Failed");

}



if(result.affectedRows == 0){

return res.status(404).send("Item not found");

}



res.send("Removed Successfully");


});


});


module.exports = router;