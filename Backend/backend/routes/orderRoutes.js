
const express = require("express");
const router = express.Router();
const db = require("../db");

console.log("ORDER ROUTE FILE LOADED");

// PLACE ORDER
router.post("/orders", (req, res) => {
    const {
        user_id, customer_name, email, phone, address, location,
        payment_method, product_name, product_image,
        price, quantity, total
    } = req.body;

    if (!user_id || !customer_name || !email || !phone ||
        !address || !location || !product_name || !quantity) {
        return res.status(400).json({
            message: "Please provide all required details"
        });
    }

    const sql = `INSERT INTO orders
    (user_id, customer_name, email, phone, address, location,
     payment_method, product_name, product_image, price,
     quantity, total, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing')`;

    db.query(sql, [
        user_id, customer_name, email, phone, address, location,
        payment_method, product_name, product_image,
        price, quantity, total
    ], (err, result) => {
        if (err) {
            console.log("ORDER ERROR:", err);
            return res.status(500).json({ message: "Order Failed" });
        }

        res.status(201).json({
            message: "Order Placed Successfully",
            orderId: result.insertId
        });
    });
});

// ADMIN: GET ALL ORDERS
router.get("/orders/admin/all", (req, res) => {
    db.query(
        "SELECT * FROM orders ORDER BY id DESC",
        (err, result) => {
            if (err) {
                console.log("ADMIN ORDERS ERROR:", err);
                return res.status(500).json({
                    message: "Unable to load orders"
                });
            }
            res.json(result);
        }
    );
});

// ADMIN: GET ALL RETURN REQUESTS
router.get("/orders/admin/returns", (req, res) => {
    const sql = `
        SELECT * FROM orders
        WHERE return_status IN ('Requested', 'Approved', 'Rejected')
        ORDER BY return_requested_at DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log("RETURN REQUESTS ERROR:", err);
            return res.status(500).json({
                message: "Unable to load return requests"
            });
        }
        res.json(result);
    });
});

// CUSTOMER: GET ONLY THEIR ORDERS
router.get("/orders/:user_id", (req, res) => {
    const sql = `
        SELECT * FROM orders
        WHERE user_id = ?
        ORDER BY id DESC
    `;

    db.query(sql, [req.params.user_id], (err, result) => {
        if (err) {
            console.log("GET ORDERS ERROR:", err);
            return res.status(500).json({
                message: "Unable to load orders"
            });
        }
        res.json(result);
    });
});

// CUSTOMER: REQUEST PRODUCT RETURN BASED ON VALID REASON
router.post("/orders/return/:id", (req, res) => {
    const { user_id, reason } = req.body;
    const orderId = req.params.id;

    if (!user_id || !reason || !reason.trim()) {
        return res.status(400).json({
            message: "Customer ID and return reason are required"
        });
    }

    const sql = `
        UPDATE orders
        SET return_status = 'Requested',
            return_reason = ?,
            return_requested_at = NOW()
        WHERE id = ?
          AND user_id = ?
          AND status = 'Delivered'
          AND delivered_at IS NOT NULL
          AND delivered_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          AND return_status = 'Not Requested'
    `;

    db.query(sql, [reason.trim(), orderId, user_id], (err, result) => {
        if (err) {
            console.log("RETURN REQUEST ERROR:", err);
            return res.status(500).json({
                message: "Return request failed"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: "Return is not available. Check delivery date or existing return request."
            });
        }

        res.json({
            message: "Return request submitted successfully"
        });
    });
});

// ADMIN: APPROVE OR REJECT RETURN
// ADMIN: APPROVE OR REJECT RETURN

router.put("/orders/admin/return/:id", (req, res) => {

    const { id } = req.params;

    const receivedStatus = String(req.body?.status || "")
        .trim()
        .toLowerCase();

    let status;

    if (receivedStatus === "approved") {
        status = "Approved";
    } 
    else if (receivedStatus === "rejected") {
        status = "Rejected";
    } 
    else {
        console.log("INVALID RETURN STATUS:", req.body);

        return res.status(400).json({
            message: "Invalid return status"
        });
    }

    const sql = `
        UPDATE orders
        SET return_status = ?
        WHERE id = ?
        AND return_status = 'Requested'
    `;

    db.query(sql, [status, id], (err, result) => {

        if (err) {
            console.log("RETURN UPDATE ERROR:", err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Return request not found or already processed"
            });
        }

        res.json({
            message: `Return ${status} successfully`
        });

    });

});
// CUSTOMER: CONFIRM PARCEL RECEIVED
router.put("/orders/confirm-delivery/:id", (req, res) => {
    const { user_id } = req.body;
    const orderId = req.params.id;

    if (!user_id) {
        return res.status(400).json({
            message: "Customer ID Required"
        });
    }

    const sql = `
        UPDATE orders
        SET customer_confirmed = 1
        WHERE id = ?
          AND user_id = ?
          AND status = 'Shipped'
          AND customer_confirmed = 0
    `;

    db.query(sql, [orderId, user_id], (err, result) => {
        if (err) {
            console.log("CUSTOMER CONFIRM ERROR:", err);
            return res.status(500).json({
                message: "Confirmation Failed"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: "Order cannot be confirmed"
            });
        }

        res.json({
            message: "Delivery confirmation submitted successfully"
        });
    });
});

// ADMIN: UPDATE ORDER STATUS THROUGH SPECIFIC TIME 
router.put("/orders/admin/status/:id", (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!["Shipped", "Delivered"].includes(status)) {
        return res.status(400).json({
            message: "Invalid status"
        });
    }

    let sql;
    let params;

    if (status === "Shipped") {
        sql = `
            UPDATE orders
            SET status = 'Shipped'
            WHERE id = ? AND status = 'Processing'
        `;
        params = [orderId];
    } else {
        sql = `
            UPDATE orders
            SET status = 'Delivered',
                delivered_at = NOW()
            WHERE id = ?
              AND status = 'Shipped'
              AND customer_confirmed = 1
        `;
        params = [orderId];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.log("ADMIN STATUS ERROR:", err);
            return res.status(500).json({
                message: "Status update failed"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: status === "Delivered"
                    ? "Customer has not confirmed delivery yet"
                    : "Order cannot be shipped"
            });
        }

        res.json({
            message: "Order status updated successfully"
        });
    });
});

// CUSTOMER: CANCEL ONLY PROCESSING ORDER
router.put("/orders/cancel/:id", (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({
            message: "Customer ID Required"
        });
    }

    const sql = `
        UPDATE orders
        SET status = 'Cancelled'
        WHERE id = ?
          AND user_id = ?
          AND status = 'Processing'
    `;

    db.query(sql, [req.params.id, user_id], (err, result) => {
        if (err) {
            console.log("CANCEL ERROR:", err);
            return res.status(500).json({
                message: "Cancel Failed"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Order not found or cannot be cancelled"
            });
        }

        res.json({
            message: "Order Cancelled Successfully"
        });
    });
});

module.exports = router;
