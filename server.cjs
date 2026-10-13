
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "taskflow",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10
});

const initializeDatabase = () => {
  const adminConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    port: 3306
  });

  adminConnection.connect((err) => {
    if (err) {
      console.error("Lỗi kết nối MySQL:", err.message);
      return;
    }

    adminConnection.query("CREATE DATABASE IF NOT EXISTS taskflow", (dbErr) => {
      if (dbErr) {
        console.error("Lỗi tạo database taskflow:", dbErr.message);
        adminConnection.end();
        return;
      }

      adminConnection.end(() => {
        const createTables = [
          `
            CREATE TABLE IF NOT EXISTS users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              email VARCHAR(255) NOT NULL UNIQUE,
              password VARCHAR(255) NOT NULL,
              full_name VARCHAR(255) DEFAULT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `,
          `
            CREATE TABLE IF NOT EXISTS task_groups (
              id INT AUTO_INCREMENT PRIMARY KEY,
              group_name VARCHAR(150) NOT NULL,
              group_code VARCHAR(30) NOT NULL UNIQUE,
              owner_id INT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `,
          `
            CREATE TABLE IF NOT EXISTS group_members (
              id INT AUTO_INCREMENT PRIMARY KEY,
              group_id INT NOT NULL,
              user_id INT NOT NULL,
              role VARCHAR(20) DEFAULT 'member',
              joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE KEY unique_membership (group_id, user_id)
            )
          `
        ];

        createTables.forEach((sql) => {
          db.query(sql, (err) => {
            if (err) console.error("Lỗi tạo bảng:", err.message);
          });
        });
      });
    });
  });
};

initializeDatabase();

app.get("/", (req, res) => {
  res.send("TaskFlow Backend đang chạy!");
});

// ĐĂNG KÝ
app.post("/api/register", (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Vui lòng nhập email và mật khẩu!"
    });
  }

  db.query(
    `INSERT INTO users (email, password, full_name)
     VALUES (?, ?, ?)`,
    [email.trim(), password, full_name || null],
    (err, result) => {
      if (err) {
        return res.status(400).json({
          message: err.code === "ER_DUP_ENTRY"
            ? "Email đã được đăng ký!"
            : "Không thể đăng ký tài khoản."
        });
      }

      res.status(201).json({
        message: "Đăng ký thành công!",
        userId: result.insertId
      });
    }
  );
});

// ĐĂNG NHẬP
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Vui lòng nhập email và mật khẩu!"
    });
  }

  db.query(
    `SELECT id, email, full_name, password
     FROM users WHERE email = ? LIMIT 1`,
    [email.trim()],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Lỗi máy chủ." });
      }

      if (
        results.length === 0 ||
        results[0].password !== password
      ) {
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
    }
  );
});

// LẤY DANH SÁCH NGƯỜI DÙNG, KHÔNG TRẢ VỀ MẬT KHẨU
app.get("/api/users", (req, res) => {
  db.query(
    "SELECT id, email, full_name FROM users",
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Lỗi lấy người dùng." });
      }
      res.json(results);
    }
  );
});

// TẠO NHÓM
app.post("/api/groups", (req, res) => {
  const { groupName, ownerId } = req.body;

  if (!groupName || !String(groupName).trim() || !ownerId) {
    return res.status(400).json({
      message: "Vui lòng nhập tên nhóm và đăng nhập tài khoản."
    });
  }

  db.query(
    "SELECT id FROM users WHERE id = ?",
    [ownerId],
    (err, users) => {
      if (err) {
        return res.status(500).json({ message: "Lỗi kiểm tra tài khoản." });
      }

      if (users.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản." });
      }

      const groupCode = "TF-" + crypto.randomBytes(4).toString("hex").toUpperCase();

      db.query(
        `INSERT INTO task_groups (group_name, group_code, owner_id)
         VALUES (?, ?, ?)`,
        [String(groupName).trim(), groupCode, ownerId],
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: "Không thể tạo nhóm." });
          }

          db.query(
            `INSERT INTO group_members (group_id, user_id, role)
             VALUES (?, ?, 'owner')`,
            [result.insertId, ownerId],
            (memberErr) => {
              if (memberErr) {
                return res.status(500).json({
                  message: "Nhóm đã tạo nhưng chưa thêm được chủ nhóm."
                });
              }

              res.status(201).json({
                message: "Tạo nhóm thành công!",
                group: {
                  id: result.insertId,
                  groupName: String(groupName).trim(),
                  groupCode,
                  ownerId
                }
              });
            }
          );
        }
      );
    }
  );
});

// THAM GIA NHÓM BẰNG MÃ
app.post("/api/groups/join", (req, res) => {
  const { userId, groupCode } = req.body;

  if (!userId || !groupCode) {
    return res.status(400).json({
      message: "Vui lòng cung cấp tài khoản và mã nhóm."
    });
  }

  db.query(
    "SELECT id, group_name, group_code FROM task_groups WHERE group_code = ?",
    [String(groupCode).trim().toUpperCase()],
    (err, groups) => {
      if (err) {
        return res.status(500).json({ message: "Lỗi tìm nhóm." });
      }

      if (groups.length === 0) {
        return res.status(404).json({ message: "Mã nhóm không tồn tại." });
      }

      db.query(
        "SELECT id FROM users WHERE id = ?",
        [userId],
        (userErr, users) => {
          if (userErr) {
            return res.status(500).json({ message: "Lỗi kiểm tra tài khoản." });
          }

          if (users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản." });
          }

          const group = groups[0];

          db.query(
            `INSERT INTO group_members (group_id, user_id)
             VALUES (?, ?)`,
            [group.id, userId],
            (joinErr) => {
              if (joinErr) {
                if (joinErr.code === "ER_DUP_ENTRY") {
                  return res.status(409).json({
                    message: "Bạn đã là thành viên của nhóm này."
                  });
                }

                return res.status(500).json({ message: "Không thể tham gia nhóm." });
              }

              res.json({
                message: "Tham gia nhóm thành công!",
                group
              });
            }
          );
        }
      );
    }
  );
});

// XEM THÀNH VIÊN CỦA NHÓM
app.get("/api/groups/:groupId/members", (req, res) => {
  db.query(
    `SELECT u.id, u.full_name, u.email, gm.role, gm.joined_at
     FROM group_members gm
     JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = ?
     ORDER BY gm.joined_at ASC`,
    [req.params.groupId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Lỗi lấy thành viên." });
      }
      res.json(results);
    }
  );
});

app.listen(PORT, () => {
  console.log(`TaskFlow Backend chạy tại http://localhost:${PORT}`);
});
