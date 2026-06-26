const express = require("express");
const router = express.Router();
const db = require("../db");

console.log("ORDER ROUTE FILE LOADED");

// PLACE ORDER
router.post("/orders", (req, res) => {

  const {
    user_id,
    product_name,
    price,
    quantity,
    total
  } = req.body;

  const status = "Processing";

  const sql =
    "INSERT INTO orders (user_id, product_name, price, quantity, total, status) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(sql,
    [user_id, product_name, price, quantity, total, status],
    (err, result) => {

      if (err) {
        console.log("ORDER ERROR:", err);
        return res.status(500).json({ message: "Order Failed", error: err });
      }

      return res.json({ message: "Order Placed Successfully" });
    }
  );
});


// GET ORDERS
router.get("/orders/:user_id", (req, res) => {

  const sql = "SELECT * FROM orders WHERE user_id=?";

  db.query(sql, [req.params.user_id], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error" });
    }

    res.json(result);
  });
});
// CANCEL ORDER

// CANCEL ORDER

router.put("/orders/cancel/:id",(req,res)=>{


let id = req.params.id;


let sql =
"UPDATE orders SET status='Cancelled' WHERE id=?";



db.query(
sql,
[id],

(err,result)=>{


if(err){

console.log("CANCEL ERROR:",err);

return res.status(500).send("Cancel Failed");

}



if(result.affectedRows == 0){

return res.status(404).send("Order Not Found");

}



res.send("Order Cancelled Successfully");


});


});
module.exports = router;