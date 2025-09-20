document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title');
    const dueDateInput = document.getElementById('due-date');
    const priorityInput = document.getElementById('priority');
    const taskListContainer = document.getElementById('task-list-container');
    const searchTaskInput = document.getElementById('search-task');
    const filterTasksSelect = document.getElementById('filter-tasks');
    const themeToggle = document.getElementById('theme-toggle');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));

    const updateProgress = () => {
        const completed = tasks.filter(t => t.completed).length;
        const progress = tasks.length ? (completed / tasks.length) * 100 : 0;
        document.getElementById('progress-fill').style.width = progress + '%';
    };

    const renderTasks = () => {
        taskListContainer.innerHTML = '';

        let filteredTasks = tasks.filter(task => {
            const searchMatch = task.title.toLowerCase().includes(searchTaskInput.value.toLowerCase());
            if (filterTasksSelect.value === 'completed') return task.completed && searchMatch;
            if (filterTasksSelect.value === 'pending') return !task.completed && searchMatch;
            return searchMatch;
        });

        if (filteredTasks.length === 0) {
            taskListContainer.innerHTML = '<p style="text-align:center;color:#777;">No tasks found.</p>';
            updateProgress();
            return;
        }

        filteredTasks.forEach((task, index) => {
            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;

            const dueDate = new Date(task.dueDate).toLocaleDateString();
            const color = task.priority === 'High' ? 'red' : task.priority === 'Low' ? 'green' : 'orange';

            taskItem.innerHTML = `
                <div class="task-details">
                    <p>${task.title} <span style="color:${color}">[${task.priority}]</span></p>
                    <span>Due: ${dueDate}</span>
                </div>
                <div class="task-actions">
                    <button class="edit-btn">✏️</button>
                    <button class="complete-btn">✔️</button>
                    <button class="delete-btn">🗑️</button>
                </div>
            `;

            taskItem.querySelector('.complete-btn').addEventListener('click', () => {
                tasks[index].completed = !tasks[index].completed;
                saveTasks(); renderTasks();
            });
            taskItem.querySelector('.delete-btn').addEventListener('click', () => {
                tasks.splice(index, 1);
                saveTasks(); renderTasks();
            });
            taskItem.querySelector('.edit-btn').addEventListener('click', () => {
                const newTitle = prompt('Edit task title:', task.title);
                const newDate = prompt('Edit due date (YYYY-MM-DD):', task.dueDate);
                const newPriority = prompt('Edit priority (High/Medium/Low):', task.priority);
                if (newTitle && newDate && newPriority) {
                    tasks[index] = { ...task, title: newTitle, dueDate: newDate, priority: newPriority };
                    saveTasks(); renderTasks();
                }
            });

            taskListContainer.appendChild(taskItem);
        });

        updateProgress();
    };

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskTitleInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;
        if (title && dueDate) {
            tasks.push({ title, dueDate, priority, completed: false });
            saveTasks();
            renderTasks();
            taskTitleInput.value = '';
            dueDateInput.value = '';
            priorityInput.value = 'Medium';
        }
    });

    searchTaskInput.addEventListener('input', renderTasks);
    filterTasksSelect.addEventListener('change', renderTasks);

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
    });

    // 🔔 Notifications
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    const checkReminders = () => {
        const now = new Date();
        tasks.forEach(task => {
            if (!task.completed) {
                const due = new Date(task.dueDate);
                const diffDays = Math.floor((due - now) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    new Notification("Reminder: Task Due Tomorrow", {
                        body: `${task.title} is due tomorrow!`,
                        icon: "https://cdn-icons-png.flaticon.com/512/2910/2910768.png"
                    });
                }
                if (diffDays === 0) {
                    new Notification("Reminder: Task Due Today", {
                        body: `${task.title} is due today!`,
                        icon: "https://cdn-icons-png.flaticon.com/512/2910/2910768.png"
                    });
                }
            }
        });
    };

    setInterval(checkReminders, 60 * 60 * 1000);

    renderTasks();
});
