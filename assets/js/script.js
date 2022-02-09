const html = document.querySelector('html')
const toggleThemeButton = document.querySelector('.header__toggler')
const input = document.querySelector('.new-todo__input')
const todosContainer = document.querySelector('.todo-list')
const todos = todosContainer.childNodes 
const clearButton = document.querySelector('.controllers__clear-completed__button')
const filterButtons =  document.querySelectorAll('.controllers__filter__button')
const localStorageTasks = JSON.parse(localStorage.getItem('tasks'))
const tasks = localStorage.getItem('tasks') !== null ? localStorageTasks : [] 
const elementsWithAnimation = document.querySelectorAll('[data-anime]')

// Toggle light and dark mode
function toggleTheme() {
    const theme = html.classList.contains('light-mode') ? 'dark-mode' : 'light-mode'
    html.classList = theme
    localStorage.setItem('theme', theme)
}
toggleThemeButton.addEventListener('click', toggleTheme)

function checkInput(e) {
    if (isTheEnterKey(e) && !isInputEmpty()) {
        const task = input.value
        const todo = createTodo(task)
        renderTodo(todo)
        reorderTodos()
        checkEmpty()
        updateTodosLeft()
        clearInputText()
    }
}
input.addEventListener('keydown', checkInput)

function isTheEnterKey(e) {
    return e.keyCode === 13
}

function isInputEmpty() {
    return input.value === ''
}

function clearInputText() {
    input.value = ''
}

// Add new todos to the list
function createTodo(task, state='active') {
    const todo = document.createElement('div')

    todo.classList.add('todo-list__todo')
    todo.classList.add(state)
    todo.setAttribute('draggable', 'true')
    todo.setAttribute('data-index', tasks.length)

    const todoContent = `
        <div class="todo-list__todo__content">
            <div class="checkbox"></div>
            <div class="todo-list__todo__text">${task}</div>
        </div>
        <div class="todo-list__todo__delete"></div>  
    `

    todo.innerHTML = todoContent

    addTodoEventListeners(todo)

    return todo
}

function addTodoEventListeners(todo) {
    // Mark todos as complete
    todo.querySelector('.checkbox').addEventListener('click', () => markTodoAsCompleted(todo))
    
    // Delete todos from the list
    todo.querySelector('.todo-list__todo__delete').addEventListener('click', () => deleteTodo(todo))

    // Drag and drop to reorder items on the list
    todo.addEventListener('dragstart', dragStart)
    todo.addEventListener('dragend', dragEnd)
    todo.addEventListener('dragover', dragOver)
}

function saveTodo(todo) {
    const task = todo.querySelector('.todo-list__todo__text').textContent 
    const state = todo.classList.contains('active') 
        ? 'active'
        : 'completed'
    tasks.push({task, state})
    localStorage.setItem('tasks',JSON.stringify(tasks))
}

function checkEmpty() {
    const todoAppContainer = document.querySelector('.todo-app')

    if (tasks.length === 0) {
        todoAppContainer.classList.add('empty')

        const emptyMsg = document.createElement('p')
        emptyMsg.classList.add('msg-empty')
        emptyMsg.innerText = 'There is no tasks 👀'
        todosContainer.appendChild(emptyMsg)
    } else {
        const emptyMsg = todosContainer.querySelector('.msg-empty')
        todoAppContainer.classList.remove('empty')
        if (emptyMsg) {
            todosContainer.removeChild(emptyMsg)
        }
    }
}

function deleteTodo(todo) {
    const todoIndex = todo.getAttribute('data-index')
        
    todosContainer.removeChild(todo)
    
    tasks.splice(todoIndex, 1)
    localStorage.setItem('tasks', JSON.stringify(tasks))
    
    reorderTodos()
    updateTodosLeft()
    checkEmpty()
}

function markTodoAsCompleted(todo) {
    const todoIndex = todo.getAttribute('data-index')

    todo.classList.toggle('active')
    todo.classList.toggle('completed')

    console.log(tasks)
    console.log(todoIndex)
    console.log(todo.classList[1])

    tasks[todoIndex].state = todo.classList[1]
    localStorage.setItem('tasks', JSON.stringify(tasks))
    
    const filterActive = document.querySelector('.controllers__filter__button.active')
    filterActive.click()

    updateTodosLeft()
}

function renderTodo(todo) {
    todosContainer.insertBefore(todo, todosContainer.childNodes[0])
}

function updateTodosLeft() {
    const todosLeftContainer = document.querySelector('.controllers__items-left__number')

    let todosLeft = 0

    todos.forEach( todo => {
        if (!todo.classList.contains('completed')) {
            todosLeft++
        }
    })

    todosLeftContainer.innerHTML = todosLeft
}

// Filter by all/active/complete todos
function filter(e) {
    const filterButtonClicked = e.target
    const filterOption = e.target.getAttribute('data-option')

    filterButtons.forEach( btn => btn.classList.remove('active'))
    filterButtonClicked.classList.add('active')
    
    switch(filterOption) {
        case 'all':
            todos.forEach( todo => todo.classList.remove('is-hidden')) 
            break
        case 'completed':
            todos.forEach( todo => {
                todo.classList.contains('completed')
                    ?   todo.classList.remove('is-hidden')
                    :   todo.classList.add('is-hidden')
            })
            break
        case 'active':
            todos.forEach( todo => {
                !todo.classList.contains('completed')
                    ?   todo.classList.remove('is-hidden')
                    :   todo.classList.add('is-hidden')
            })
            break
    }
}
filterButtons.forEach( filterButton => {
    filterButton.addEventListener('click', filter)
})

// Clear all completed todos
function clearCompleted() {
    const todosCompleted = todosContainer.querySelectorAll('.completed')

    todosCompleted.forEach( todo => {
        todosContainer.removeChild(todo)
    })

    reorderTodos()

    const todosActive = tasks.filter( task => task.state !== 'completed')

    localStorage.setItem('tasks', JSON.stringify(todosActive))

    checkEmpty()
}
clearButton.addEventListener('click', clearCompleted)

// drag and drop functions
function dragStart(e) {
    const todo = e.target
    todo.classList.add('dragging')
}

function dragOver(e) {
    e.preventDefault()
    const afterElement = getDragAfterElement(e.clientY)
    const draggable = document.querySelector('.dragging')
    if (afterElement == null) {
        todosContainer.appendChild(draggable)
    } else {
        todosContainer.insertBefore(draggable, afterElement)
    }
}

function dragEnd(e) {
    const todo = e.target
    todo.classList.remove('dragging')
    reorderTodos()
}

function getDragAfterElement(y) {
    const draggablesTodos = [...todosContainer.querySelectorAll('.todo-list__todo:not(.dragging)')]
    return draggablesTodos.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
            return {offset: offset, element: child}
        } else {
            return closest
        }
    }, {offset: Number.NEGATIVE_INFINITY}).element

}

function reorderTodos() {
    tasks.splice(0, tasks.length)

    todos.forEach( (todo, index) => {
        if (todo.classList.contains('todo-list__todo')) {
            todo.setAttribute('data-index', index)
            saveTodo(todo)
        }
    })
}

// init
function init() {
    html.classList = localStorage.getItem('theme')
    tasks.forEach( task => todosContainer.appendChild(createTodo(task.task, task.state)))
    updateTodosLeft()
    reorderTodos()
    checkEmpty()
    setTimeout( () => elementsWithAnimation.forEach( el => el.classList.add('animate'), 1))
}
init()
