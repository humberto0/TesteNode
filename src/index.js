const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User does not exists" });
  }

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const customerAlreadyExists = users.some(
    (item) => item.username === username
  );

  if (customerAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = { username, name, id: uuidv4(), todos: [] };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;
  const account = user.todos.find((item) => item.id === id);
  if (!account) {
    return response.status(404).json({ error: "Todo not found" });
  }

  account.title = title;
  account.deadline = new Date(deadline);

  return response.json(account);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const account = user.todos.find((item) => item.id === id);

  if (!account) {
    return response.status(404).json({ error: "Todos already exists" });
  }
  account.done = true;

  return response.json(account);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const todoIndex = user.todos.findIndex((item) => item.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todos already exists" });
  }
  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
