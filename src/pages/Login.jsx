import { useState } from "react";

const DEMO_USERS_KEY = "taskflow-demo-users";

const getDemoUsers = () => {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveDemoUsers = (users) => {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
};

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

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
      return;
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
    }

    const users = getDemoUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const exists = users.some(
      (user) => user.email.toLowerCase() === normalizedEmail
    );

    if (exists) {
      alert("Email đã được đăng ký!");
      return;
    }

    const newUser = {
      id: Date.now(),
      email: normalizedEmail,
      password,
      full_name: fullName.trim(),
    };

    saveDemoUsers([...users, newUser]);
    alert("Đăng ký thành công! (Demo mode)");
  };

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
      onLogin(data.user);
      return;
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
    }

    const users = getDemoUsers();
    const matchedUser = users.find(
      (user) =>
        user.email.toLowerCase() === email.trim().toLowerCase() &&
        user.password === password
    );

    if (!matchedUser) {
      alert("Email hoặc mật khẩu không đúng!");
      return;
    }

    alert("Đăng nhập thành công! (Demo mode)");
    onLogin({
      id: matchedUser.id,
      email: matchedUser.email,
      full_name: matchedUser.full_name,
    });
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