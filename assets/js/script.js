const html = document.querySelector('html')
const toggleButton = document.querySelector('.header__toggler')
const input = document.querySelector('.new-todo__input')
const todosContainer = document.querySelector('.todo-list')
const todos = todosContainer.childNodes
const clearButton = document.querySelector('.controllers__clear-completed__button')
const filterButtons =  document.querySelectorAll('.controllers__filter__button')
const localStorageTasks = JSON.parse(localStorage.getItem('tasks'))
const tasks = localStorage.getItem('tasks') !== null ? localStorageTasks : [] 
const elementsWithAnimate = document.querySelectorAll('[data-anime]')

setTimeout( () => {
    elementsWithAnimate.forEach( el => el.classList.add('animate'), 1)
})

// Toggle light and dark mode
function toggleTheme() {
    html.classList.toggle('dark-mode')  
}
toggleButton.addEventListener('click', toggleTheme)

// Add new todos to the list
function newTodo() {
    const todo = document.createElement('div')
    const todoText = input.value

    todo.classList.add('todo-list__todo')
    todo.classList.add('active')
    todo.setAttribute('draggable', 'true')
    todo.setAttribute('data-index', todos.length)

    const todoContent = `
        <div class="todo-list__todo__content">
            <div class="checkbox"></div>
            <div class="todo-list__todo__text">${todoText}</div>
        </div>
        <div class="todo-list__todo__delete"></div>  
    `

    todo.innerHTML = todoContent

    addTodoEventListeners(todo)
    
    todosContainer.appendChild(todo)
    
    saveTodo(todo)
}

function saveTodo(todo) {
    const task = todo.querySelector('.todo-list__todo__text').textContent 
    const status = todo.classList.contains('active') 
        ? 'active'
        : 'completed'
    tasks.push({status, task})
    localStorage.setItem('tasks', JSON.stringify(tasks))
}

function reorderTodos() {
    tasks.splice(0, tasks.length)

    todos.forEach( (todo, index) => {
        todo.setAttribute('data-index', index)
        saveTodo(todo)
    })

    console.log(tasks)
}

function renderTodos() {
    tasks.forEach( task => {
        const todo = document.createElement('div')
        const todoText = task.task

        todo.classList.add('todo-list__todo')
        todo.classList.add(task.status)
        todo.setAttribute('draggable', 'true')
        todo.setAttribute('data-index', todos.length)

        const todoContent = `
            <div class="todo-list__todo__content">
                <div class="checkbox"></div>
                <div class="todo-list__todo__text">${todoText}</div>
            </div>
            <div class="todo-list__todo__delete"></div>  
        `

        todo.innerHTML = todoContent

        addTodoEventListeners(todo)

        todosContainer.appendChild(todo)
    
        updateTodosLeft()
    })
}

function addTodoEventListeners(todo) {
    // Mark todos as complete
    const todoCheckbox = todo.querySelector('.checkbox')
    todoCheckbox.addEventListener('click', () => {
        todo.classList.toggle('active')
        todo.classList.toggle('completed')
        updateTodosLeft()

        const todoIndex = todo.getAttribute('data-index')
        
        tasks[todoIndex].status === 'active'
            ? tasks[todoIndex].status = 'completed'
            : tasks[todoIndex].status = 'active'
        localStorage.setItem('tasks', JSON.stringify(tasks))
        
        const filterActive = document.querySelector('.controllers__filter__button.active')
        filterActive.click()
    })

    // Delete todos from the list
    const todoDeleteBtn = todo.querySelector('.todo-list__todo__delete')
    todoDeleteBtn.addEventListener('click', () => {
        const todoIndex = todo.getAttribute('data-index')
        
        todosContainer.removeChild(todo)
        tasks.splice(todoIndex, 1)
        localStorage.setItem('tasks', JSON.stringify(tasks))
        
        reorderTodos()
        updateTodosLeft()
    })

    // Drag and drop to reorder items on the list
    todo.addEventListener('dragstart', () => {
        todo.classList.add('dragging')
    })
    todo.addEventListener('dragend', () => {
        todo.classList.remove('dragging')
    })
    todo.addEventListener('dragover', e => {
        e.preventDefault()
        const afterElement = getDragAfterElement(e.clientY)
        const draggable = document.querySelector('.dragging')
        if (afterElement == null) {
            todosContainer.appendChild(draggable)
        } else {
            todosContainer.insertBefore(draggable, afterElement)
        }
    })
    todo.addEventListener('drop', () => {
        reorderTodos()
    })
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

function updateTodosLeft() {
    const todosLeftContainer = document.querySelector('.controllers__items-left__number')
    let todosLeft = 0

    todos.forEach( todo => {
        if (!todo.classList.contains('completed')) todosLeft++
    })

    todosLeftContainer.innerHTML = todosLeft
}

function clearInputText() {
    input.value = ''
}

function checkInput(evt) {
    if (evt.keyCode === 13 && input.value !== '') {
        newTodo()
        updateTodosLeft()
        clearInputText()
    }
}

input.addEventListener('keydown', checkInput)

// Filter by all/active/complete todos
function filter(evt) {
    filterButtons.forEach( btn => btn.classList.remove('active'))
    const filterButton = evt.target
    filterButton.classList.add('active')
    
    const filter = evt.target.getAttribute('data-option')

    switch(filter) {
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

    tasks.forEach( (task, index) => {
        if (task.status === 'completed') tasks.splice(index, 1)
    })

    localStorage.setItem('tasks', JSON.stringify(tasks))
    
}
clearButton.addEventListener('click', clearCompleted)

renderTodos()
