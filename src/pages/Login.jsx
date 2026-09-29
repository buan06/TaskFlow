import { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    alert("Đăng nhập thành công!");
    onLogin();
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>TaskFlow</h1>
        <p>Hệ thống quản lý công việc nhóm</p>

        <form onSubmit={handleLogin}>
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

        <p className="register-text">
          Chưa có tài khoản? <b>Đăng ký</b>
        </p>
      </div>
    </div>
  );
}

export default Login;