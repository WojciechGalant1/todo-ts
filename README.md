Powiedziałeś(-aś):
mam ten kod w pliku html
<script>
    const sortButton = document.getElementById('sortButton');
    const sortDropdown = sortButton.closest('.sort-dropdown');

    sortButton.addEventListener('click', () => {
        sortDropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!sortDropdown.contains(e.target)) {
            sortDropdown.classList.remove('open');
        }
    });
</script>

chce to dodać do pliku app.js:
fragment app.js:
// Selectors and global variables
const taskForm = document.querySelector('form');
const taskInpt = document.getElementById('taskInpt');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const addBtn = document.getElementById('addBtn');

const buttons = document.querySelectorAll('.btn-group .button');
const sortDropdownItems = document.querySelectorAll('.dropdown-item');


let allTasks = [];
let currentSort = "newest";
let currentFilter = "allTasks";

// Functions
const sortTasks = (tasks) => {
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

const filterTasks = (filterId = currentFilter) => {
    currentFilter = filterId;

    let filteredTasks = [];

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





// Event handling

sortDropdownItems.forEach(item => {
    item.addEventListener('click', () => {
        currentSort = item.dataset.sort;
        document.querySelector('.sort-dropdown').classList.remove('open');
        refreshTaskList();
    });
});

buttons.forEach(button => {
    button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        currentFilter = button.id;
        refreshTaskList();
    });
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