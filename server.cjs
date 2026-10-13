const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "taskflow",
  port: 3306,
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ Kết nối MySQL thất bại:", err.message);
  } else {
    console.log("✅ Kết nối MySQL thành công!");
    connection.release();
  }
});

app.get("/", (req, res) => {
  res.send("TaskFlow Backend đang chạy!");
});
app.post("/api/register", (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Vui lòng nhập email và mật khẩu!"
    });
  }

  const sql = `
    INSERT INTO users (email, password, full_name)
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [email, password, full_name || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json({
        message: "Đăng ký thành công!",
        userId: result.insertId
      });
    }
  );
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Vui lòng nhập email và mật khẩu!"
    });
  }

  const sql = "SELECT id, email, full_name, password FROM users WHERE email = ? LIMIT 1";

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng!"
      });
    }

    res.json({
      message: "Đăng nhập thành công!",
      user: {
        id: results[0].id,
        email: results[0].email,
        full_name: results[0].full_name
      }
    });
  });
});

app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend chạy tại http://localhost:${PORT}`);
});