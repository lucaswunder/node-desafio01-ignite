const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

const findTodo = (id,user) => {
  return user.todos.find(elem => elem.id === id);
};

function checksExistsUserAccount(request, response, next) {
    const {username} = request.headers;
    const user = users.find(elem => elem.username === username);

    if(user) { request.userObj = user; return next();}

    return response.status(404).json({error:`user not found for username ${username}`});
};

app.post('/users', (request, response) => {
  const { name,username } = request.body;

  const findedUser = users.find(elem => elem.username === username);
  if(findedUser) return response.status(400).json({error:"user already registered"});

  const user = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  };

  users.push(user);

  return response.json(user).status(201)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.userObj;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.userObj;

  const newTodo = {
      id: uuidv4(),
      title,
      done: false, 
      deadline: new Date(deadline), 
      created_at: new Date()
  };
  
  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const {id} = request.params;
  const user = request.userObj;
  const todo = findTodo(id,user);
  
  if(todo){
    todo.title = title;
    todo.deadline = deadline;
    return response.status(200).json(todo);
  }
  
  return response.status(404).json({error:'Not found'});
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const user = request.userObj;
  const todo = findTodo(id,user);
  
  if(todo){
    todo.done = true;
    return response.status(200).json(todo);
  }
  return response.status(404).json({error:'Not found'});
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const user = request.userObj;

  if(findTodo(id,user)){
    for (let index = 0; index < user.todos.length; index++) {
      if(user.todos[index].id === id) {
        user.todos.splice(index, 1);
      }
    }
    return response.status(204).json(user.todos);
  }
  return response.status(404).json({error:'Not found'});
});

module.exports = app;
