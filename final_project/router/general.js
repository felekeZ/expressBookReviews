const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Registration endpoint
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    
    // Check if username already exists
    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists. Please choose a different username." });
    }
    
    // Register the new user
    users.push({ username: username, password: password });
    return res.status(201).json({ message: "User successfully registered. You can now login." });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 2));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (book) {
        res.send(JSON.stringify(book, null, 2));
    } else {
        res.status(404).json({ message: "Book not found with the given ISBN" });
    }
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author;
    let booksByAuthor = [];
    
    // Get all keys from books object
    const isbnList = Object.keys(books);
    
    // Iterate through books and find matching author
    for (let i = 0; i < isbnList.length; i++) {
        const isbn = isbnList[i];
        const book = books[isbn];
        
        if (book.author.toLowerCase() === authorName.toLowerCase()) {
            booksByAuthor.push({
                isbn: isbn,
                title: book.title,
                author: book.author,
                reviews: book.reviews
            });
        }
    }
    
    if (booksByAuthor.length > 0) {
        res.send(JSON.stringify(booksByAuthor, null, 2));
    } else {
        res.status(404).json({ message: "No books found by this author" });
    }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const bookTitle = req.params.title;
    let booksByTitle = [];
    
    // Get all keys from books object
    const isbnList = Object.keys(books);
    
    // Iterate through books and find matching title
    for (let i = 0; i < isbnList.length; i++) {
        const isbn = isbnList[i];
        const book = books[isbn];
        
        if (book.title.toLowerCase() === bookTitle.toLowerCase()) {
            booksByTitle.push({
                isbn: isbn,
                title: book.title,
                author: book.author,
                reviews: book.reviews
            });
        }
    }
    
    if (booksByTitle.length > 0) {
        res.send(JSON.stringify(booksByTitle, null, 2));
    } else {
        res.status(404).json({ message: "No books found with this title" });
    }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (book) {
        if (Object.keys(book.reviews).length > 0) {
            res.send(JSON.stringify(book.reviews, null, 2));
        } else {
            res.json({ message: "No reviews available for this book" });
        }
    } else {
        res.status(404).json({ message: "Book not found with the given ISBN" });
    }
});

module.exports.general = public_users;
