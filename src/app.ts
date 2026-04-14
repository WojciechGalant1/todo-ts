interface Task {
    id: number;
    text: string;
    completed: boolean;
}

type SortOption = "az" | "za" | "oldest" | "newest";
type FilterOption = "allTasks" | "completedTasks" | "unfinishedTasks";

const taskForm = document.querySelector('form') as HTMLFormElement;
const taskInpt = document.getElementById('taskInpt') as HTMLInputElement;
const taskList = document.getElementById('taskList') as HTMLUListElement;
const emptyMessage = document.getElementById('emptyMessage') as HTMLElement;
const addBtn = document.getElementById('addBtn') as HTMLButtonElement;

const buttons = document.querySelectorAll('.btn-group .button') as NodeListOf<HTMLButtonElement>;

const sortButton = document.getElementById('sortButton') as HTMLButtonElement;
const sortDropdown = sortButton.closest('.sort-dropdown') as HTMLElement;
const sortDropdownItems = document.querySelectorAll('.dropdown-item') as NodeListOf<HTMLElement>;

const optionsLink = document.querySelector('.nav-links a[href="#"]') as HTMLAnchorElement;
const modal = document.getElementById('optionsModal') as HTMLElement;
const closeModalBtn = modal.querySelector('.close-button') as HTMLButtonElement;
const themeSwitch = document.getElementById('themeSwitch') as HTMLInputElement;

let allTasks: Task[] = [];
let currentSort: SortOption = "newest";
let currentFilter: FilterOption = "allTasks";

// Functions
const sortTasks = (tasks: Task[]): Task[] => {
    const sortedTasks = [...tasks];
    switch (currentSort) {
        case "az":
            sortedTasks.sort((a, b) => a.text.localeCompare(b.text));
            break;
        case "za":
            sortedTasks.sort((a, b) => b.text.localeCompare(a.text));
            break;
        case 'oldest':
            sortedTasks.sort((a, b) => a.id - b.id);
            break;
        case "newest":
        default:
            sortedTasks.sort((a, b) => b.id - a.id);
            break;
    }
    return sortedTasks;
}

const filterTasks = (filterId: FilterOption = currentFilter): Task[] => {
    currentFilter = filterId;

    let filteredTasks: Task[] = [];

    switch (filterId) {
        case 'completedTasks':
            filteredTasks = allTasks.filter(task => task.completed);
            break;
        case 'unfinishedTasks':
            filteredTasks = allTasks.filter(task => !task.completed);
            break;
        default:
            filteredTasks = allTasks;
    }

    return sortTasks(filteredTasks);
}

const updateListItem = (tasksToRender: Task[]): void => {
    taskList.innerHTML = '';

    if (tasksToRender.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';
    tasksToRender.forEach((task) => {
        const taskItem = createListItem(task);
        taskList.append(taskItem);
    });
}

const refreshTaskList = (): void => {
    updateListItem(filterTasks());
}

const addTask = (): void => {
    const taskText = taskInpt.value.trim();
    if (taskText.length > 0) {
        const taskObject: Task = {
            id: Date.now(),
            text: taskText,
            completed: false,
        }
        allTasks.push(taskObject);
        saveTasks();
        refreshTaskList();
        taskInpt.value = "";
        updateButtonState();
    }
}

const formatDate = (task: Task): string => {
    const date = new Date(task.id);
    return date.toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(',', ' •');
};

const createListItem = (task: Task): HTMLLIElement => {
    const taskId = "task-" + task.id;
    const formattedDate = formatDate(task);

    const listItemElement = document.createElement('li');
    listItemElement.className = "task";
    listItemElement.innerHTML = `
                    <input type="checkbox" id="${taskId}">
                    <label class="checkboxCustom" for="${taskId}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"
                            stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </label>
                    <label for="${taskId}" class="task-text">
                        ${task.text} <span class="task-date">(${formattedDate})</span>
                    </label>

                    <button class="delete-button">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="15" height="15"
                            stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
    `;

    const deleteBtn = listItemElement.querySelector(".delete-button") as HTMLButtonElement;
    deleteBtn.addEventListener("click", () => {
        deleteTaskItem(task.id);
    });

    const checkbox = listItemElement.querySelector("input") as HTMLInputElement;
    checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        saveTasks();
    });

    checkbox.checked = task.completed;
    return listItemElement;
}

const saveTasks = (): void => {
    const tasksJson = JSON.stringify(allTasks);
    localStorage.setItem("tasks", tasksJson);
}

const getTasks = (): Task[] => {
    try {
        const stored = localStorage.getItem("tasks");
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Error with localStorage:", e);
        return [];
    }
}

const deleteTaskItem = (taskId: number): void => {
    allTasks = allTasks.filter(task => task.id !== taskId);
    saveTasks();
    refreshTaskList();
}

const updateButtonState = (): void => {
    const taskText = taskInpt.value.trim();
    addBtn.disabled = taskText.length === 0;
};

// Event handling

buttons.forEach(button => {
    button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        currentFilter = button.id as FilterOption;
        refreshTaskList();
    });
});

sortButton.addEventListener('click', (e) => {
    e.stopPropagation();
    sortDropdown.classList.toggle('open');
});

sortDropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSort = (item.dataset['sort'] as SortOption) || "newest";
        sortDropdown.classList.remove('open');
        refreshTaskList();
    });
});

document.addEventListener('click', (e) => {
    if (!sortDropdown.contains(e.target as Node)) {
        sortDropdown.classList.remove('open');
    }
});

optionsLink.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});


if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
    themeSwitch.checked = true;
}

themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
    }
});

// Initialization

updateButtonState();

allTasks = getTasks();
refreshTaskList();

taskInpt.addEventListener('input', updateButtonState);
taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addTask();
});