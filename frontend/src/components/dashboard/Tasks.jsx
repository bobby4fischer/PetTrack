import React from "react";
import { Trash2, Target } from "lucide-react";
import "./Tasks.css";

const Tasks = ({ tasks, newTask, setNewTask, addTask, completeTask, deleteTask, getCurrentDate, activeTaskId, setActiveTaskId, isAddDisabled, disableInteractions, onFocusTask, disableFocus }) => {
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
              onChange={(e) => !isAddDisabled && setNewTask(e.target.value)}
              onKeyDown={(e) => !isAddDisabled && e.key === "Enter" && addTask()}
              disabled={isAddDisabled}
            />
            <button className="add-task-btn" onClick={addTask} disabled={isAddDisabled} title={isAddDisabled ? 'Free time: adding tasks disabled' : 'Add task'}>
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
                    checked={task.completed}
                    onChange={() => { if (!disableInteractions) completeTask(task.id) }}
                    disabled={disableInteractions}
                  />
                  <span className="task-text">{task.text}</span>
                </label>

                <div className="task-actions">
                  <button
                    className={`focus-task ${activeTaskId === task.id ? 'active' : ''}`}
                    onClick={() => { if (!disableInteractions && !disableFocus) onFocusTask(task.id) }}
                    title={disableInteractions ? 'Free time: focus disabled' : disableFocus ? 'Pause timer to change focus' : 'Focus on this task'}
                    disabled={disableInteractions || disableFocus}
                  >
                    <Target size={16} />
                    <span>Focus</span>
                  </button>
                  <button
                    className="delete-task"
                    onClick={() => deleteTask(task.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
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