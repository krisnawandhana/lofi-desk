import { memo, useEffect, useState, type FormEvent } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { useTaskStore } from '../stores/task-store'

export const TaskPanel = memo(function TaskPanel() {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [estimatedSessions, setEstimatedSessions] = useState(1)
  const { tasks, activeTaskId, addTask, setActiveTask, toggleTask, deleteTask } = useTaskStore()

  const completedTasks = tasks.filter((task) => task.status === 'done').length
  const totalPomodoros = tasks.reduce((total, task) => total + task.estimatedPomodoro, 0)
  const completedPomodoros = tasks.reduce((total, task) => total + task.completedPomodoro, 0)
  const dailyProgress = totalPomodoros > 0
    ? Math.min(100, (completedPomodoros / totalPomodoros) * 100)
    : 0

  useEffect(() => {
    const closeForm = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsAddingTask(false)
    }
    window.addEventListener('keydown', closeForm)
    return () => window.removeEventListener('keydown', closeForm)
  }, [])

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newTaskTitle.trim()) return
    addTask(newTaskTitle, estimatedSessions)
    setNewTaskTitle('')
    setEstimatedSessions(1)
    setIsAddingTask(false)
  }

  return (
    <aside className="task-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Today</p>
          <h2>Focus list</h2>
        </div>
        <button className="icon-button soft" type="button" aria-label="Add task" onClick={() => setIsAddingTask(true)}><Plus /></button>
      </div>

      <div className="progress-summary">
        <div className="progress-copy"><span>Daily progress</span><strong>{completedPomodoros} of {totalPomodoros}</strong></div>
        <div className="progress-track"><span style={{ width: `${dailyProgress}%` }} /></div>
        <p>{completedPomodoros * 25} focused minutes</p>
      </div>

      <div className="task-list">
        {tasks.map((task) => (
          <article className={`task-item${task.id === activeTaskId ? ' active' : ''}${task.status === 'done' ? ' done' : ''}`} key={task.id}>
            <button className="task-check" type="button" aria-label={`Complete ${task.title}`} onClick={() => toggleTask(task.id)}>
              {task.status === 'done' ? <Check /> : task.id === activeTaskId && <span />}
            </button>
            <button className="task-copy" type="button" onClick={() => task.status !== 'done' && setActiveTask(task.id)}>
              <h3>{task.title}</h3>
              <p>{task.completedPomodoro} / {task.estimatedPomodoro} sessions</p>
            </button>
            <button className="task-menu danger" type="button" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)}><Trash2 /></button>
          </article>
        ))}
      </div>

      {isAddingTask ? (
        <form className="add-task-form" onSubmit={handleAddTask}>
          <input autoFocus value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} placeholder="What do you want to focus on?" aria-label="Task title" />
          <label className="task-session-field">
            <span>Target sessions</span>
            <input
              type="number"
              min="1"
              max="12"
              value={estimatedSessions}
              onChange={(event) => setEstimatedSessions(Math.min(12, Math.max(1, Number(event.target.value) || 1)))}
              aria-label="Target focus sessions"
            />
          </label>
          <div>
            <button type="button" onClick={() => setIsAddingTask(false)}>Cancel</button>
            <button className="save-task" type="submit">Add task</button>
          </div>
        </form>
      ) : (
        <button className="add-task" type="button" onClick={() => setIsAddingTask(true)}><Plus /> Add a task</button>
      )}

      <div className="completed-row">
        <span className="completed-icon"><Check /></span>
        <span><strong>{completedTasks} {completedTasks === 1 ? 'task' : 'tasks'} completed</strong><small>Nice work today</small></span>
      </div>
    </aside>
  )
})
