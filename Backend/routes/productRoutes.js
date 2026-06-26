const express = require("express");

const router = express.Router();

const db = require("../db");

console.log("productRoutes file running");
// test product route

router.get("/products",(req,res)=>{


console.log("Products API Called");


let sql = "SELECT * FROM products";


db.query(sql,(err,result)=>{


if(err){

console.log("Database Error:",err);

return res.status(500).json({
message:"Database Error"
});

}



res.json(result);


});


});



module.exports = router;