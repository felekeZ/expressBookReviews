const express = require('express');
const axios = require('axios'); // Add axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Registration endpoint (unchanged)
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    
    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists. Please choose a different username." });
    }
    
    users.push({ username: username, password: password });
    return res.status(201).json({ message: "User successfully registered. You can now login." });
});

// Task 10: Get the book list available in the shop using Async-Await
public_users.get('/', async function (req, res) {
    try {
        // Simulate async operation with Promise
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                if (books) {
                    resolve(books);
                } else {
                    reject(new Error("Books not found"));
                }
            });
        };
        
        const bookList = await getBooks();
        res.send(JSON.stringify(bookList, null, 2));
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Alternative Promise-based implementation for Task 10 (commented)
/*
public_users.get('/', function (req, res) {
    const getBooks = () => {
        return new Promise((resolve, reject) => {
            if (books) {
                resolve(books);
            } else {
                reject(new Error("Books not found"));
            }
        });
    };
    
    getBooks()
        .then(bookList => res.send(JSON.stringify(bookList, null, 2)))
        .catch(error => res.status(500).json({ message: "Error fetching books", error: error.message }));
});
*/

// Task 11: Get book details based on ISBN using Async-Await
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        
        // Simulate async operation with Promise
        const getBookByISBN = (isbn) => {
            return new Promise((resolve, reject) => {
                const book = books[isbn];
                if (book) {
                    resolve(book);
                } else {
                    reject(new Error("Book not found with the given ISBN"));
                }
            });
        };
        
        const book = await getBookByISBN(isbn);
        res.send(JSON.stringify(book, null, 2));
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Task 12: Get book details based on Author using Async-Await
public_users.get('/author/:author', async function (req, res) {
    try {
        const authorName = req.params.author;
        
        // Simulate async operation with Promise
        const getBooksByAuthor = (authorName) => {
            return new Promise((resolve, reject) => {
                const isbnList = Object.keys(books);
                let booksByAuthor = [];
                
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
                    resolve(booksByAuthor);
                } else {
                    reject(new Error("No books found by this author"));
                }
            });
        };
        
        const booksByAuthor = await getBooksByAuthor(authorName);
        res.send(JSON.stringify(booksByAuthor, null, 2));
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Task 13: Get all books based on Title using Async-Await
public_users.get('/title/:title', async function (req, res) {
    try {
        const bookTitle = req.params.title;
        
        // Simulate async operation with Promise
        const getBooksByTitle = (bookTitle) => {
            return new Promise((resolve, reject) => {
                const isbnList = Object.keys(books);
                let booksByTitle = [];
                
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
                    resolve(booksByTitle);
                } else {
                    reject(new Error("No books found with this title"));
                }
            });
        };
        
        const booksByTitle = await getBooksByTitle(bookTitle);
        res.send(JSON.stringify(booksByTitle, null, 2));
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Task 5: Get book review (unchanged, synchronous)
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
