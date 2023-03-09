const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  return users.find((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  return users.find(
    (user) => user.username === username && user.password === password
  );
};

const secret_key = "my_secret_key";

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  //Get the user from the users array by filtering it based on the given username
  const user = isValid(username);
  console.log("user", user);
  if (!user) return res.status(400).json({ msg: "User does not exist" });

  //check if the password matches for the given user
  if (password !== user.password) {
    return res.status(401).json({ msg: "Invalid credentials" });
  }

  //sign in the user using JWT token and save the user credentials for the session.
  jwt.sign({ username }, secret_key, (err, token) => {
    if (err) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  });
});

regd_users.put("/review/:isbn", (req, res) => {
  console.log("vgcx");
  const isbn = parseInt(req.params.isbn);
  const review = req.query.review;

  if (!req.session.username) {
    return res.status(401).send("You are not authorized to add/modify reviews");
  }

  const username = req.session.username;

  if (!books[isbn]) {
    return res.status(404).send("No such book found");
  }

  if (!review) {
    return res.status(400).send("Please provide review");
  }

  const bookReviews = books[isbn].reviews;

  if (bookReviews[username]) {
    bookReviews[username] = review;
    return res.send(`Review for ISBN ${isbn} updated successfully`);
  }

  // For new review for the same book
  bookReviews[username] = review;
  return res.send(`Review for ISBN ${isbn} added successfully`);
});
regd_users.delete("/review/:isbn", (req, res) => {
  const isbn = parseInt(req.params.isbn);
  const userId = req.session.userId;

  if (userId === null || userId === undefined) {
    res.send("Please login first");
  } else {
    // check if the book exists
    if (books[isbn]) {
      const userReviews = books[isbn].reviews;

      let findUserReview = Object.keys(userReviews).find(
        (key) => key === userId.toString()
      );

      // check if the user has reviewed the book
      if (!findUserReview) {
        res.send("Sorry, you have not left a review so nothing to delete");
      } else {
        // delete the user review
        delete userReviews[userId];
        res.send("Review successfully deleted!");
      }
    } else {
      res.sendStatus(404); // if the book does not exist
    }
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
