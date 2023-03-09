const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is not provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  // Check if the username already exists
  if (users.find((user) => user.username === username)) {
    return res.status(409).json({ error: "Username already exists" });
  }

  // Add the new user
  const newUser = { username, password };
  users.push(newUser);

  // Return the new user
  res.json(newUser);
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  res.status(200).json({ books: books });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  data = books[req.params.isbn];

  if (data) {
    res.send(JSON.stringify(data, null, 4));
  } else {
    res.send(`No book found with ISBN: ${req.params.isbn}`);
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const keys = Object.keys(books);
  const matchedBooks = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (books[key].author === author) {
      matchedBooks.push(books[key]);
    }
  }

  res.send(JSON.stringify(matchedBooks));
});

// Get all books based on title
public_users.get("/title/:title", (req, res) => {
  let matching_books = {};

  for (var book in books) {
    if (books[book].title.toLowerCase() === req.params.title.toLowerCase()) {
      matching_books[book] = books[book];
    }
  }

  if (Object.keys(matching_books).length !== 0) {
    res.send(
      `Books matching title ${req.params.title} are:\n` +
        JSON.stringify(matching_books, null, 4)
    );
  } else {
    res.status(404).send(`No books found with title ${req.params.title}`);
  }
});

//  Get book review
public_users.get("/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  if (!books.hasOwnProperty(isbn)) {
    return res.status(404).send("Book not found.");
  }
  let bookReviews = books[isbn].reviews;
  if (Object.keys(bookReviews).length === 0) {
    return res.send("No reviews for the book yet.");
  }
  return res.send(JSON.stringify(bookReviews, null, 2)); // neat JSON output with indentation
});

const axios = require("axios");

async function getBooks() {
  try {
    const response = await axios.get("/http://localhost:5000");
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
async function getBookByISBN(isbn) {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

async function getBooksByAuthor(authorName) {
  try {
    const { data } = await axios.get(
      `http://localhost:5000/author/${authorName}`
    );
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

module.exports.general = public_users;
