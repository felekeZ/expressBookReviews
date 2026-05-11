/**
 * General Routes Module - Handles public endpoints for book browsing
 * This module contains all public-facing routes that don't require authentication
 */

const express = require('express');
const axios = require('axios'); // HTTP client for making external API calls
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ==================== USER REGISTRATION ====================

/**
 * Register a new user account
 * @route POST /register
 * @param {string} username - User's chosen username
 * @param {string} password - User's password
 * @returns {Object} Success or error message
 */
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

// ==================== TASK 10: GET ALL BOOKS ====================

/**
 * Retrieve the complete list of books from the shop
 * Uses Async-Await pattern with Promise wrapper for async operation
 * @route GET /
 * @returns {Object} JSON object containing all books
 */
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

// ==================== TASK 11: GET BOOK BY ISBN ====================

/**
 * Retrieve a specific book using its ISBN number
 * Uses Async-Await pattern for asynchronous operation
 * @route GET /isbn/:isbn
 * @param {string} isbn - The ISBN identifier of the book
 * @returns {Object} Book details including title, author, and reviews
 */
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

// ==================== TASK 12: GET BOOKS BY AUTHOR ====================

/**
 * Find all books written by a specific author
 * Performs case-insensitive search by author name
 * @route GET /author/:author
 * @param {string} author - The author's name to search for
 * @returns {Array} List of books matching the author
 */
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

// ==================== TASK 13: GET BOOKS BY TITLE ====================

/**
 * Find all books with a specific title (case-insensitive)
 * Note: Multiple books could have the same title in different editions
 * @route GET /title/:title
 * @param {string} title - The book title to search for
 * @returns {Array} List of books matching the title
 */
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

// ==================== TASK 5: GET BOOK REVIEWS ====================

/**
 * Retrieve all reviews for a specific book
 * This endpoint remains synchronous as it's a simple lookup
 * @route GET /review/:isbn
 * @param {string} isbn - The ISBN of the book
 * @returns {Object} All reviews for the requested book
 */
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

// Export the router for use in the main application
module.exports.general = public_users;
