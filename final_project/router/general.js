const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    // Validate that both fields are provided
    if (!username || !password) {
        return res.status(400).json({ 
            message: "Username and password are required" 
        });
    }
    
    // Check for duplicate username
    if (users.find(user => user.username === username)) {
        return res.status(409).json({ 
            message: "Username already exists. Please choose a different username." 
        });
    }
    
    // Store new user (in production, password should be hashed)
    users.push({ username: username, password: password });
    return res.status(201).json({ 
        message: "User successfully registered. You can now login." 
    });
});

public_users.get('/', async function (req, res) {
    try {
        // Wrap the synchronous books object in a Promise to simulate async API call
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                if (books) {
                    resolve(books);  // Success: return all books
                } else {
                    reject(new Error("Books not found"));  // Error: books data missing
                }
            });
        };
        
        // Await the Promise resolution
        const bookList = await getBooks();
        
        // Send formatted JSON response with 2-space indentation
        res.send(JSON.stringify(bookList, null, 2));
    } catch (error) {
        // Handle any errors during the async operation
        res.status(500).json({ 
            message: "Error fetching books", 
            error: error.message 
        });
    }
});

public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        
        // Promise wrapper for looking up book by ISBN
        const getBookByISBN = (isbn) => {
            return new Promise((resolve, reject) => {
                const book = books[isbn];
                if (book) {
                    resolve(book);  // Book found - return details
                } else {
                    reject(new Error("Book not found with the given ISBN"));  // Book not found
                }
            });
        };
        
        // Execute the async lookup
        const book = await getBookByISBN(isbn);
        res.send(JSON.stringify(book, null, 2));
    } catch (error) {
        // Return 404 for not found, other errors handled here
        res.status(404).json({ message: error.message });
    }
});

public_users.get('/author/:author', async function (req, res) {
    try {
        const authorName = req.params.author;
        
        // Promise wrapper that filters books by author
        const getBooksByAuthor = (authorName) => {
            return new Promise((resolve, reject) => {
                // Get all ISBN keys from the books object
                const isbnList = Object.keys(books);
                let booksByAuthor = [];
                
                // Iterate through all books and check for author match
                for (let i = 0; i < isbnList.length; i++) {
                    const isbn = isbnList[i];
                    const book = books[isbn];
                    
                    // Case-insensitive comparison for author names
                    if (book.author.toLowerCase() === authorName.toLowerCase()) {
                        booksByAuthor.push({
                            isbn: isbn,
                            title: book.title,
                            author: book.author,
                            reviews: book.reviews
                        });
                    }
                }
                
                // Resolve or reject based on whether matches were found
                if (booksByAuthor.length > 0) {
                    resolve(booksByAuthor);
                } else {
                    reject(new Error("No books found by this author"));
                }
            });
        };
        
        // Execute the async search
        const booksByAuthor = await getBooksByAuthor(authorName);
        res.send(JSON.stringify(booksByAuthor, null, 2));
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

public_users.get('/title/:title', async function (req, res) {
    try {
        const bookTitle = req.params.title;
        
        // Promise wrapper that filters books by title
        const getBooksByTitle = (bookTitle) => {
            return new Promise((resolve, reject) => {
                // Get all ISBN keys
                const isbnList = Object.keys(books);
                let booksByTitle = [];
                
                // Iterate through books and check title match
                for (let i = 0; i < isbnList.length; i++) {
                    const isbn = isbnList[i];
                    const book = books[isbn];
                    
                    // Case-insensitive title matching
                    if (book.title.toLowerCase() === bookTitle.toLowerCase()) {
                        booksByTitle.push({
                            isbn: isbn,
                            title: book.title,
                            author: book.author,
                            reviews: book.reviews
                        });
                    }
                }
                
                // Handle no matches case
                if (booksByTitle.length > 0) {
                    resolve(booksByTitle);
                } else {
                    reject(new Error("No books found with this title"));
                }
            });
        };
        
        // Execute async title search
        const booksByTitle = await getBooksByTitle(bookTitle);
        res.send(JSON.stringify(booksByTitle, null, 2));
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    // Check if book exists
    if (book) {
        // Check if there are any reviews
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
