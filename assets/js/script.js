const html = document.querySelector('html')
const toggleButton = document.querySelector('.header__toggler')
const input = document.querySelector('.new-todo__input')
const todosContainer = document.querySelector('.todo-list')
const todos = todosContainer.childNodes
const clearButton = document.querySelector('.controllers__clear-completed__button')
const filterButtons =  document.querySelectorAll('.controllers__filter__button')
const elementsWithAnimate = document.querySelectorAll('[data-anime]')

setTimeout( () => {
    elementsWithAnimate.forEach( el => el.classList.add('animate'), 1)
})

// Toggle light and dark mode
const toggleTheme = () => html.classList.toggle('dark-mode')
toggleButton.addEventListener('click', toggleTheme)

// Add new todos to the list
function newTodo() {
    const todo = document.createElement('div')
    const todoText = input.value

    todo.classList.add('todo-list__todo')

    const todoContent = `
        <div class="todo-list__todo__content">
            <div class="checkbox"></div>
            <div class="todo-list__todo__text">${todoText}</div>
        </div>
        <div class="todo-list__todo__delete"></div>  
    `

    todo.innerHTML = todoContent

    // Mark todos as complete
    const todoCheckbox = todo.querySelector('.checkbox')
    todoCheckbox.addEventListener('click', () => {
        todoCheckbox.closest('.todo-list__todo').classList.toggle('is-completed')
        updateTodosLeft()
        const filterActive = document.querySelector('.controllers__filter__button.is-active')
        filterActive.click()
    })

    // Delete todos from the list
    const todoDeleteBtn = todo.querySelector('.todo-list__todo__delete')
    todoDeleteBtn.addEventListener('click', () => {
        todosContainer.removeChild(todo)
    })

    todosContainer.appendChild(todo)
}
function updateTodosLeft() {
    const todosLeftContainer = document.querySelector('.controllers__items-left__number')
    let todosLeft = 0

    todos.forEach( todo => {
        if (!todo.classList.contains('is-completed')) todosLeft++
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
    filterButtons.forEach( btn => btn.classList.remove('is-active'))
    const filterButton = evt.target
    filterButton.classList.add('is-active')
    
    const filter = evt.target.getAttribute('data-option')

    switch(filter) {
        case 'all':
            todos.forEach( todo => todo.classList.remove('is-hidden')) 
            break
        case 'completed':
            todos.forEach( todo => {
                todo.classList.contains('is-completed')
                    ?   todo.classList.remove('is-hidden')
                    :   todo.classList.add('is-hidden')
                
            })
            break
        case 'active':
            todos.forEach( todo => {
                !todo.classList.contains('is-completed')
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
    const todosCompleted = todosContainer.querySelectorAll('.is-completed')
    todosCompleted.forEach( todo => {
        todosContainer.removeChild(todo)
    })
}
clearButton.addEventListener('click', clearCompleted)
