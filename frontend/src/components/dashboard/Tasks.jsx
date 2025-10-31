import React from "react";
import "./Tasks.css";

const Tasks = ({ tasks, newTask, setNewTask, addTask, completeTask, deleteTask, getCurrentDate }) => {
  return (
    <section className="panel card tasks-panel">
      <div className="tasks-list">
        <div className="task-input-container">
          <h3 className="tasks-title">Today's Tasks</h3>
          <p className="tasks-date">{getCurrentDate()}</p>
          <div className="task-input-row">
            <input
              type="text"
              className="task-input"
              placeholder="Add a new task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <button className="add-task-btn" onClick={addTask}>
              <div className="add-icon">+</div>
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-tasks">
            <p>No tasks yet. Add one above!</p>
          </div>
        ) : (
          <div className="tasks-container">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-item ${task.completed ? "completed" : ""}`}
              >
                <label className="task-content">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => completeTask(task.id)}
                  />
                  <span className="task-text">{task.text}</span>
                </label>

                <div className="task-actions">
                  <button
                    className="delete-task"
                    onClick={() => deleteTask(task.id)}
                    title="Delete"
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Tasks;