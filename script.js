document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date-input');
    const priorityInput = document.getElementById('priority-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const editModal = document.getElementById('edit-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const editTaskInput = document.getElementById('edit-task-input');
    let currentEditTaskId = null;

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = (filter = 'all') => {
        taskList.innerHTML = '';
        let filteredTasks = tasks;

        if (filter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id;

            // --- التصحيح الرئيسي هنا ---
            // استخدام classList.add() لإضافة الـ classes بشكل آمن
            li.classList.add(`priority-${task.priority}`);

            if (task.completed) {
                li.classList.add('checked');
            }

            if (task.dueDate && !task.completed) {
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                if (dueDate < today) {
                    li.classList.add('overdue');
                }
            }
            // --- نهاية التصحيح ---

            const taskContent = document.createElement('span');
            taskContent.className = 'task-content';
            taskContent.textContent = task.text;

            const dueDateSpan = document.createElement('span');
            dueDateSpan.className = 'due-date';
            dueDateSpan.textContent = task.dueDate ? `تاريخ الاستحقاق: ${task.dueDate}` : '';

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '✏️';
            editBtn.onclick = () => openEditModal(task.id);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.onclick = () => deleteTask(task.id);

            li.appendChild(taskContent);
            li.appendChild(dueDateSpan);
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            li.appendChild(actionsDiv);

            li.onclick = (e) => {
                if (!e.target.closest('.actions')) {
                    toggleComplete(task.id);
                }
            };

            taskList.appendChild(li);
        });
    };

    const addTask = () => {
        const text = taskInput.value.trim();
        if (text === '') {
            alert('لا يمكن إضافة مهمة فارغة!');
            return;
        }
        const newTask = {
            id: Date.now(),
            text: text,
            priority: priorityInput.value,
            dueDate: dueDateInput.value,
            completed: false
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
        taskInput.value = '';
        dueDateInput.value = '';
    };

    const deleteTask = (id) => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
    };

    const toggleComplete = (id) => {
        const task = tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
        }
    };

    const openEditModal = (id) => {
        const task = tasks.find(task => task.id === id);
        if (task) {
            currentEditTaskId = id;
            editTaskInput.value = task.text;
            editModal.style.display = 'block';
        }
    };

    const closeEditModal = () => {
        editModal.style.display = 'none';
        currentEditTaskId = null;
    };

    const saveEditedTask = () => {
        const newText = editTaskInput.value.trim();
        if (newText && currentEditTaskId) {
            const task = tasks.find(task => task.id === currentEditTaskId);
            if (task) {
                task.text = newText;
                saveTasks();
                renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
                closeEditModal();
            }
        }
    };

    addTaskBtn.addEventListener('click', addTask);
    closeModalBtn.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveEditedTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            renderTasks(btn.dataset.filter);
        });
    });
    window.onclick = (event) => {
        if (event.target == editModal) closeEditModal();
    };

    renderTasks();
});
