document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date-input');
    const priorityInput = document.getElementById('priority-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Modal elements
    const editModal = document.getElementById('edit-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const editTaskInput = document.getElementById('edit-task-input');
    let currentEditTaskId = null;

    // Load tasks from localStorage or initialize an empty array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Function to save tasks to localStorage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Function to render tasks to the screen
    const renderTasks = (filter = 'all') => {
        taskList.innerHTML = '';
        let filteredTasks = tasks;

        if (filter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        // Get today's date at the start of the day for accurate comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id;
            li.className = `priority-${task.priority}`;
            if (task.completed) {
                li.classList.add('checked');
            }

            // --- START: Overdue Task Check ---
            // Check if the task has a due date, is not completed, and is overdue
            if (task.dueDate && !task.completed) {
                const dueDate = new Date(task.dueDate);
                // The time of the due date is at the beginning of that day
                dueDate.setHours(0, 0, 0, 0);
                if (dueDate < today) {
                    li.classList.add('overdue'); // Add 'overdue' class if task is late
                }
            }
            // --- END: Overdue Task Check ---

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
            editBtn.innerHTML = '✏️'; // Edit icon
            editBtn.onclick = () => openEditModal(task.id);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '🗑️'; // Delete icon
            deleteBtn.onclick = () => deleteTask(task.id);

            li.appendChild(taskContent);
            li.appendChild(dueDateSpan);
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            li.appendChild(actionsDiv);

            // Event listener for toggling completion (on the li element itself)
            li.onclick = (e) => {
                // Ensure the click is not on an action button
                if (!e.target.closest('.actions')) {
                    toggleComplete(task.id);
                }
            };

            taskList.appendChild(li);
        });
    };

    // Function to add a new task
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
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter); // Re-render with current filter

        taskInput.value = '';
        dueDateInput.value = '';
    };

    // Function to delete a task
    const deleteTask = (id) => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
    };

    // Function to toggle the completion status of a task
    const toggleComplete = (id) => {
        const task = tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
        }
    };

    // --- Modal Functions ---
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

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);
    closeModalBtn.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveEditedTask);

    // Add event listener for Enter key in the input field
    taskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Event listeners for filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            renderTasks(btn.dataset.filter);
        });
    });

    // Close modal if user clicks outside of it
    window.onclick = (event) => {
        if (event.target == editModal) {
            closeEditModal();
        }
    };

    // Initial render of tasks on page load
    renderTasks();
});
