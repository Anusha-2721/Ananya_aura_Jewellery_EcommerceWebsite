
const express = require("express");
const router = express.Router();
const db = require("../db");

console.log("productRoutes file running");

// GET - Display all products
router.get("/products", (req, res) => {
    const sql = "SELECT * FROM products";

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database Error" });
        }
        res.json(result);
    });
});

// POST - Add new product
router.post("/products", (req, res) => {
    const { name, price, image, category } = req.body;

    if (!name || price === undefined || price === "") {
        return res.status(400).json({
            message: "Product name and price are required"
        });
    }

    const sql = "INSERT INTO products (name, price, image, category) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, Number(price), image || null, category || null], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Product Add Failed" });
        }

        res.status(201).json({
            message: "Product Added Successfully",
            id: result.insertId
        });
    });
});

// PUT - Update product
router.put("/products/:id", (req, res) => {
    const { name, price, image, category } = req.body;
    const id = req.params.id;

    const sql = "UPDATE products SET name=?, price=?, image=?, category=? WHERE id=?";

    db.query(sql, [name, Number(price), image || null, category || null, id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Product Update Failed" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product Not Found" });
        }

        res.json({ message: "Product Updated Successfully" });
    });
});

// DELETE - Delete product
router.delete("/products/:id", (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM products WHERE id=?", [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Product Delete Failed" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product Not Found" });
        }

        res.json({ message: "Product Deleted Successfully" });
    });
});

module.exports = router;
