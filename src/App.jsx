
import { useState, useEffect } from "react";
import Login from "./pages/login.jsx";
import "./App.css";

const API = "http://localhost:3000";
const DEMO_GROUPS_KEY = "taskflow-demo-groups";
const DEMO_MEMBERS_KEY = "taskflow-demo-members";

const readDemoGroups = () => {
  try {
    const raw = localStorage.getItem(DEMO_GROUPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeDemoGroups = (groups) => {
  localStorage.setItem(DEMO_GROUPS_KEY, JSON.stringify(groups));
};

const readDemoMembers = () => {
  try {
    const raw = localStorage.getItem(DEMO_MEMBERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeDemoMembers = (membersMap) => {
  localStorage.setItem(DEMO_MEMBERS_KEY, JSON.stringify(membersMap));
};

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [groupCode, setGroupCode] = useState("");
  const [currentGroup, setCurrentGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Thiết kế giao diện",
      status: "Đang làm",
      description: "Thiết kế giao diện cho hệ thống TaskFlow",
      assignee: "Chưa phân công",
      dueDate: "2026-10-20"
    },
    {
      id: 2,
      title: "Viết báo cáo",
      status: "Chưa làm",
      description: "Hoàn thành báo cáo đồ án của nhóm",
      assignee: "Chưa phân công",
      dueDate: "2026-10-25"
    },
    {
      id: 3,
      title: "Kiểm tra sản phẩm",
      status: "Hoàn thành",
      description: "Kiểm tra các chức năng trước khi bàn giao",
      assignee: "Chưa phân công",
      dueDate: "2026-10-25"
    }
  ]);

  const safePrompt = (message, fallback = "") => {
    try {
      if (typeof window !== "undefined" && typeof window.prompt === "function") {
        const value = window.prompt(message, fallback);
        return value === null ? fallback : value;
      }
    } catch (error) {
      console.warn("prompt() không hỗ trợ trong môi trường hiện tại:", error);
    }

    return fallback;
  };

  useEffect(() => {
    fetch(`${API}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Backend chưa sẵn sàng");
        return res.text();
      })
      .catch((err) => console.error(err.message));
  }, []);

  const loadMembers = async (groupId) => {
    try {
      const response = await fetch(
        `${API}/api/groups/${groupId}/members`
      );
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Không tải được thành viên.");
        return;
      }

      setMembers(
        data.map((user) =>
          user.full_name || user.email
        )
      );
      return;
    } catch (error) {
      console.error("LỖI BACKEND:", error);
    }

    const allMembers = readDemoMembers();
    const demoMembers = allMembers[groupId] || [];
    setMembers(demoMembers);
  };

  const createGroup = async () => {
    if (!currentUser?.id) {
      alert("Không tìm thấy tài khoản. Hãy đăng nhập lại!");
      return;
    }

    const groupNameInput = safePrompt("Nhập tên nhóm:", "Nhóm mới");
    const groupName = groupNameInput?.trim() || "Nhóm mới";

    try {
      const response = await fetch(`${API}/api/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: groupName.trim(),
          ownerId: currentUser.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend tạo nhóm lỗi:", data.message || response.statusText);
      } else {
        const group = {
          id: data.group.id,
          name: data.group.groupName,
          code: data.group.groupCode
        };

        setCurrentGroup(group);
        setGroupCode(group.code);
        await loadMembers(group.id);

        alert(
          `Tạo nhóm thành công!\nTên nhóm: ${group.name}\nMã mời: ${group.code}`
        );
        return;
      }
    } catch (error) {
      console.error("Không kết nối được Backend!", error);
    }

    const demoGroups = readDemoGroups();
    const groupCodeValue = `TF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const group = {
      id: Date.now(),
      name: groupName.trim(),
      code: groupCodeValue
    };

    writeDemoGroups([
      ...demoGroups,
      {
        id: group.id,
        group_name: group.name,
        group_code: group.code,
        owner_id: currentUser.id
      }
    ]);

    const membersMap = readDemoMembers();
    membersMap[group.id] = [currentUser.full_name || currentUser.email];
    writeDemoMembers(membersMap);

    setCurrentGroup(group);
    setGroupCode(group.code);
    setMembers(membersMap[group.id]);

    alert(`Tạo nhóm thành công!\nTên nhóm: ${group.name}\nMã mời: ${group.code}`);
  };

  const joinGroup = async () => {
    if (!currentUser?.id) {
      alert("Hãy đăng nhập lại trước khi tham gia nhóm!");
      return;
    }

    if (!groupCode.trim()) {
      alert("Nhập mã nhóm trước nhé!");
      return;
    }

    try {
      const response = await fetch(`${API}/api/groups/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          groupCode: groupCode.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend tham gia nhóm lỗi:", data.message || response.statusText);
      } else {
        const group = {
          id: data.group.id,
          name: data.group.group_name,
          code: data.group.group_code
        };

        setCurrentGroup(group);
        setGroupCode(group.code);
        await loadMembers(group.id);

        alert(`Đã tham gia nhóm ${group.name}!`);
        return;
      }
    } catch (error) {
      console.error("Không kết nối được Backend!", error);
    }

    const demoGroups = readDemoGroups();
    const existingGroup = demoGroups.find(
      (group) => group.group_code === groupCode.trim().toUpperCase()
    );

    if (!existingGroup) {
      alert("Mã nhóm không tồn tại trong demo mode.");
      return;
    }

    const membersMap = readDemoMembers();
    const groupMembers = membersMap[existingGroup.id] || [];
    const userName = currentUser.full_name || currentUser.email;

    if (!groupMembers.includes(userName)) {
      membersMap[existingGroup.id] = [...groupMembers, userName];
      writeDemoMembers(membersMap);
    }

    const group = {
      id: existingGroup.id,
      name: existingGroup.group_name,
      code: existingGroup.group_code
    };

    setCurrentGroup(group);
    setGroupCode(group.code);
    setMembers(membersMap[group.id]);

    alert(`Đã tham gia nhóm ${group.name}! (Demo mode)`);
  };

  const addTask = () => {
    if (!currentGroup) {
      alert("Hãy tạo nhóm hoặc tham gia nhóm trước!");
      return;
    }

    const titleInput = safePrompt("Nhập tên công việc:", "Công việc mới");
    const title = titleInput?.trim() || "Công việc mới";

    const description = safePrompt("Nhập mô tả công việc:", "") || "";
    const assignee =
      safePrompt(
        "Nhập tên người được giao:\n" +
        (members.length ? members.join(", ") : "Chưa có thành viên"),
        "Chưa phân công"
      ) || "Chưa phân công";
    const dueDate = safePrompt(
      "Nhập hạn hoàn thành (YYYY-MM-DD):",
      "2026-10-25"
    ) || "";

    setTasks((previous) => [
      ...previous,
      {
        id: Date.now(),
        title: title.trim(),
        status: "Chưa làm",
        description,
        assignee,
        dueDate
      }
    ]);
  };

  const updateTask = (taskId, status) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks((previous) =>
      previous.filter((task) => task.id !== taskId)
    );
    setSelectedTask(null);
  };

  if (showLogin) {
    return (
    <Login
      onLogin={(user) => {
        console.log("Tài khoản nhận được:", user);
        setCurrentUser(user);
        setShowLogin(false);
      }}
    />
  );
}

  const statuses = [
    { name: "Chưa làm", description: "Chưa được thực hiện" },
    { name: "Đang làm", description: "Đang thực hiện" },
    { name: "Hoàn thành", description: "Đã hoàn thành" }
  ];

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
              document.getElementById("dashboard")?.scrollIntoView();
            }}
          >
            ▦ Tổng quan
          </a>

          <a
            href="#tasks"
            className={activePage === "tasks" ? "active" : ""}
            onClick={() => setActivePage("tasks")}
          >
            ☷ Công việc
          </a>

          <a
            href="#members"
            className={activePage === "members" ? "active" : ""}
            onClick={() => setActivePage("members")}
          >
            ♙ Thành viên
          </a>
        </nav>

<div className="sidebar-bottom">
  {currentUser && (
    <>
      <p>Đang đăng nhập</p>
      <strong>{currentUser.full_name || currentUser.email}</strong>
      <button
        onClick={() => {
          setCurrentUser(null);
          setShowLogin(true);
        }}
      >
        Đăng xuất
      </button>
    </>
  )}
  <p>Quản lý công việc nhóm</p>
  <span>TaskFlow © 2026</span>
</div>
      </aside>

      <header className="header">
        <div className="header-info">
          <p className="breadcrumb">WORKSPACE / TỔNG QUAN</p>
          <h1>Không gian làm việc</h1>
          <p>
            Xin chào {currentUser?.full_name || currentUser?.email}.
            Quản lý công việc và theo dõi tiến độ nhóm.
          </p>
        </div>

        <div className="header-actions">
          <span className="group-badge">
            {currentGroup ? currentGroup.code : "Chưa tham gia nhóm"}
          </span>
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
          <button onClick={() => setSelectedTask(null)}>Đóng</button>
        </div>
      )}

      <main className="container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">▦</div>
            <p>Tổng công việc</p>
            <h2>{tasks.length}</h2>
            <span>Tất cả nhiệm vụ</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">◷</div>
            <p>Chưa làm</p>
            <h2>{tasks.filter((t) => t.status === "Chưa làm").length}</h2>
            <span>Đang chờ thực hiện</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">↗</div>
            <p>Đang làm</p>
            <h2>{tasks.filter((t) => t.status === "Đang làm").length}</h2>
            <span>Nhiệm vụ đang thực hiện</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <p>Hoàn thành</p>
            <h2>{tasks.filter((t) => t.status === "Hoàn thành").length}</h2>
            <span>Nhiệm vụ đã hoàn tất</span>
          </div>
        </div>

        <section className="top" id="members">
          <h2>Nhóm và thành viên</h2>

          <button onClick={createGroup}>+ Tạo nhóm mới</button>

          <input
            type="text"
            placeholder="Nhập mã mời của nhóm"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
          />

          <button onClick={joinGroup}>Tham gia nhóm</button>

          {currentGroup && (
            <div className="group-info">
              <p><strong>Nhóm:</strong> {currentGroup.name}</p>
              <p><strong>Mã mời:</strong> {currentGroup.code}</p>
              <p><strong>Thành viên ({members.length}):</strong></p>
              {members.length > 0 ? (
                <ul>
                  {members.map((member, index) => (
                    <li key={`${member}-${index}`}>{member}</li>
                  ))}
                </ul>
              ) : (
                <p>Chưa có thành viên.</p>
              )}
              <button onClick={() => loadMembers(currentGroup.id)}>
                Làm mới thành viên
              </button>
            </div>
          )}
        </section>

        <section id="tasks">
          <h2>Công việc của nhóm</h2>

          <div className="board">
            {statuses.map((status) => (
              <div className="column" key={status.name}>
                <h3>{status.name}</h3>

                {tasks
                  .filter((task) => task.status === status.name)
                  .map((task) => (
                    <div
                      className="task"
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                    >
                      <b>{task.title}</b>
                      <p>{status.description}</p>

                      {status.name === "Chưa làm" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTask(task.id, "Đang làm");
                          }}
                        >
                          Bắt đầu làm
                        </button>
                      )}

                      {status.name === "Đang làm" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTask(task.id, "Hoàn thành");
                          }}
                        >
                          Hoàn thành
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
export default App;
