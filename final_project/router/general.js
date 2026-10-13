const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Регистрация нового пользователя
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.some(u => u.username === username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Список всех книг
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Книга по ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

// Книги по автору
public_users.get('/author/:author', (req, res) => {
  const result = Object.values(books).filter(
    b => b.author.toLowerCase() === req.params.author.toLowerCase()
  );
  if (result.length === 0) return res.status(404).json({ message: "No books by this author" });
  return res.status(200).json(result);
});

// Книги по названию
public_users.get('/title/:title', (req, res) => {
  const result = Object.values(books).filter(
    b => b.title.toLowerCase() === req.params.title.toLowerCase()
  );
  if (result.length === 0) return res.status(404).json({ message: "No books with this title" });
  return res.status(200).json(result);
});

// Отзывы на книгу
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book.reviews);
});

// ---------- Task 11: Axios (async/await и промисы) ----------

// Все книги (async/await)
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// По ISBN (промисы)
public_users.get('/async/isbn/:isbn', (req, res) => {
  axios.get(`${BASE_URL}/isbn/${req.params.isbn}`)
    .then(response => res.status(200).json(response.data))
    .catch(() => res.status(404).json({ message: "Book not found" }));
});

// По автору (async/await)
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(req.params.author)}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(404).json({ message: "No books by this author" });
  }
});

// По названию (промисы)
public_users.get('/async/title/:title', (req, res) => {
  axios.get(`${BASE_URL}/title/${encodeURIComponent(req.params.title)}`)
    .then(response => res.status(200).json(response.data))
    .catch(() => res.status(404).json({ message: "No books with this title" }));
});

module.exports.general = public_users;