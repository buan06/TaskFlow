import { useState } from "react";
import { useEffect } from "react";
import Login from "./pages/login.jsx";
import "./App.css";

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  
  const [members, setMembers] = useState([]);
  const [memberInput, setMemberInput] = useState("");
  const [groupCode, setgroupCode] = useState("TASKFLOW01");
  const [tasks, setTasks] = useState([
   {
      id: 1,
      title: "Thiết kế giao diện",
      status: "Đang làm",
      description: "Thiết kế giao diện cho hệ thống TaskFlow",
      assignee: "Chưa phân công",
      dueDate: "2026-10-20"
    },
    { id: 2, 
      title: "Viết báo cáo", 
      status: "Chưa làm",
      description: "Hoàn thành báo cáo đồ án của nhóm",
      assignee: "Chưa phân công",
      dueDate: "2026-09-15"
     },
    {
      id: 3,
      title: "Kiểm tra sản phẩm",
      status: "Hoàn thành",
      description: "Kiểm tra các chức năng trước khi bàn giao",
      assignee: "Chưa phân công",
      dueDate: "2026-10-25"
   },
  ]);
  const [selectedTask, setSelectedTask] = useState(null);
  useEffect(() => {
  fetch("http://localhost:3000/api/users")
    .then((res) => res.json())
    .then((data) => {
      console.log("Users từ MySQL:", data);
    })
    .catch((err) => {
      console.error("Lỗi kết nối Backend:", err);
    });
}, []);

  if (showLogin) {
    return <Login onLogin={() => setShowLogin(false)} />;
  }

  
const addTask = () => {
  const title = prompt("Nhập tên công việc:");
  if (!title || !title.trim()) return;

  const description = prompt("Nhập mô tả công việc:") || "";
  const assignee = prompt(
    "Nhập tên người được giao:\n" +
    (members.length > 0
      ? "Thành viên hiện có: " + members.join(", ")
      : "Chưa có thành viên nào")
  ) || "Chưa phân công";

  const dueDate = prompt(
    "Nhập hạn hoàn thành (YYYY-MM-DD):",
    "2026-10-25"
  ) || "";

  const newTask = {
    id: Date.now(),
    title: title.trim(),
    status: "Chưa làm",
    description,
    assignee,
    dueDate,
  };

  setTasks([...tasks, newTask]);
};

  return (
    <div className="app" id="dashboard">
      
<aside className="sidebar">
  <div className="sidebar-logo">
    <span>✦</span> TaskFlow
  </div>

  <p className="sidebar-label">WORKSPACE</p>

  
<nav className="sidebar-menu">
  <a
    href="#dashboard"
    className={activePage === "dashboard" ? "active" : ""}
    onClick={(e) => {
      e.preventDefault();
      setActivePage("dashboard");
    }}
  >
    ▦ Tổng quan
  </a>

  <a href="#tasks">
    ☷ Công việc
  </a>

  <a href="#members">
    ♙ Thành viên
  </a>
</nav>

  <div className="sidebar-bottom">
    <p>Quản lý công việc nhóm</p>
    <span>TaskFlow © 2026</span>
  </div>
</aside>

     
<header className="header">
  <div className="header-info">
    <p className="breadcrumb">WORKSPACE / TỔNG QUAN</p>
    <h1>Không gian làm việc</h1>
    <p>Quản lý công việc và theo dõi tiến độ nhóm của bạn.</p>
  </div>

  <div className="header-actions">
    <span className="group-badge">✦ TASKFLOW01</span>
    <button onClick={addTask}>+ Thêm công việc</button>
  </div>
</header>

      {selectedTask && (
  <div className="task-details">
    <h2>{selectedTask.title}</h2>
    <p>Trạng thái: {selectedTask.status}</p>
    <p>Mô tả: {selectedTask.description}</p>
    <p>Người được giao: {selectedTask.assignee}</p>
    <p>Hạn hoàn thành: {selectedTask.dueDate}</p>

    <button onClick={() => setSelectedTask(null)}>
      Đóng
    </button>
  </div>
)}

      <main className="container">
        
<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-icon purple">▦</div>
    <p>Tổng công việc</p>
    <h2>{tasks.length}</h2>
    <span>Tất cả nhiệm vụ trong nhóm</span>
  </div>

  <div className="stat-card">
    <div className="stat-icon orange">◷</div>
    <p>Chưa làm</p>
    <h2>{tasks.filter((task) => task.status === "Chưa làm").length}</h2>
    <span>Đang chờ thực hiện</span>
  </div>

  <div className="stat-card">
    <div className="stat-icon blue">↗</div>
    <p>Đang làm</p>
    <h2>{tasks.filter((task) => task.status === "Đang làm").length}</h2>
    <span>Nhiệm vụ đang thực hiện</span>
  </div>

  <div className="stat-card">
    <div className="stat-icon green">✓</div>
    <p>Hoàn thành</p>
    <h2>{tasks.filter((task) => task.status === "Hoàn thành").length}</h2>
    <span>Nhiệm vụ đã hoàn tất</span>
  </div>
</div>

       <div className="top" id="members">
          <input 
          type="text"
          placeholder="Nhập tên thành viên"
          value={memberInput}
          onChange={(e) => setMemberInput(e.target.value)}
          /> 
          {members.length > 0 && (
            <p>Thành viên: {members.join(", ")}</p>
          )}
          <button onClick={() => {
            if (memberInput.trim() !== "") {
              setMembers([...members, memberInput.trim()]);
              setMemberInput("");
            }
            }}>
              Thêm thành viên
            </button>
        
          <input
            type="text"
            placeholder="Nhập mã nhóm"
            value={groupCode}
            onChange={(e) => setgroupCode(e.target.value)}
          />
          <p>Mã nhóm: {groupCode}</p>
          <button onClick={() => {
  const code = prompt("Nhập mã nhóm:");
  if (code === groupCode) {
    alert("Tham gia nhóm thành công!");
  } else {
    alert("Mã nhóm không đúng!");
  }
}}>
  Tham gia nhóm
</button>
          <h2>Công việc của nhóm</h2>
          <button onClick={addTask}>+ Thêm công việc</button>
        </div>

          <div className="board" id="tasks">
          <div className="column">
            <h3>Chưa làm</h3>

            {tasks
              .filter((task) => task.status === "Chưa làm")
              .map((task) => (
                <div 
                  className="task" 
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                >
  <b>{task.title}</b>
  <p>Chưa được thực hiện</p>

  <button
    onClick={() =>
      setTasks(
        tasks.map((t) =>
          t.id === task.id
            ? { ...t, status: "Đang làm" }
            : t
        )
      )
    }
  >
    Bắt đầu làm
  </button>
  <button
  onClick={() =>
    setTasks(tasks.filter((t) => t.id !== task.id))
  }
>
  Xóa
</button>
</div>
              ))}
          </div>

          <div className="column">
            <h3>Đang làm</h3>

            {tasks
              .filter((task) => task.status === "Đang làm")
              .map((task) => (
                <div 
                  className="task" 
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                >
  <b>{task.title}</b>
  <p>Đang thực hiện</p>

  <button
    onClick={() =>
      setTasks(
        tasks.map((t) =>
          t.id === task.id
            ? { ...t, status: "Hoàn thành" }
            : t
        )
      )
    }
  >
    Hoàn thành
  </button>
  <button
  onClick={() =>
    setTasks(tasks.filter((t) => t.id !== task.id))
  }
>
  Xóa
</button>
</div>
              ))}
          </div>

          <div className="column">
            <h3>Hoàn thành</h3>

            {tasks
              .filter((task) => task.status === "Hoàn thành")
              .map((task) => (
                <div 
                className="task" 
                key={task.id}
                onClick={() => setSelectedTask(task)}
                >
  <b>{task.title}</b>
  <p>Đã hoàn thành</p>

  <button
    onClick={() =>
      setTasks(tasks.filter((t) => t.id !== task.id))
    }
  >
    Xóa
  </button>
</div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;