import { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Xử lý đăng ký tài khoản
  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      alert("Vui lòng nhập đầy đủ họ tên, email và mật khẩu!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || data.message || "Đăng ký thất bại!");
        return;
      }

      alert("Đăng ký thành công!");
    } catch (error) {
      alert("Không kết nối được Backend!");
    }
  };

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert("Vui lòng nhập email và mật khẩu!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || data.message || "Đăng nhập thất bại!");
        return;
      }

      alert("Đăng nhập thành công!");
      onLogin();
    } catch (error) {
      alert("Không kết nối được Backend!");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>TaskFlow</h1>
        <p>Hệ thống quản lý công việc nhóm</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Đăng nhập</button>
        </form>

        <button onClick={handleRegister}>Đăng ký</button>
      </div>
    </div>
  );
}

export default Login;