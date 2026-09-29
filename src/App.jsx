import { useState } from "react";
import Login from "./pages/login";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  
  const [members, setMembers] = useState([]);
  const [memberInput, setMemberInput] = useState("");
  const [groupCode, setgroupCode] = useState("TASKFLOW01");
  const [tasks, setTasks] = useState([
    { id: 1, 
      title: "Thiết kế giao diện", 
      status: "Đang làm",
      description: " Thiết kế giao diện cho hệ thống TaskFlow"
    },
    { id: 2, 
      title: "Viết báo cáo", 
      status: "Chưa làm",
      description: "Hoàn thành báo cáo đồ án của nhóm",
      assignee: "Chưa phân công",
      dueDate: "2026-09-15"
     },
    { id: 3, 
      title: "Kiểm tra sản phẩm", 
      status: "Hoàn thành",
      description: "Kiểm tra các chức năng trước khi bàn giao"
    },
  ]);
  const [selectedTask, setSelectedTask] = useState(null);

  if (showLogin) {
    return <Login onLogin={() => setShowLogin(false)} />;
  }

  const addTask = () => {
    const title = prompt("Nhập tên công việc:");

    if (title) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          title: title,
          status: "Chưa làm",
        },
      ]);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>TaskFlow</h1>
        <p>Hệ thống quản lý công việc nhóm</p>
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
        <div className="top">
          <input 
          type="text"
          placeholder="Nhập tên thành viên"
          value={membersInput}
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

        <div className="board">
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