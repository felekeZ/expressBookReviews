const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // returns boolean - check if username is valid (doesn't already exist)
    return !users.find(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    // returns boolean - check if username and password match records
    const user = users.find(user => user.username === username && user.password === password);
    return !!user;
}

// Task 7: Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT token
        let accessToken = jwt.sign({
            data: username
        }, 'access', { expiresIn: '1h' });
        
        // Save user credentials in session
        req.session.authorization = {
            accessToken: accessToken,
            username: username
        };
        
        return res.status(200).json({ 
            message: "User successfully logged in", 
            token: accessToken,
            username: username
        });
    } else {
        return res.status(401).json({ message: "Invalid login credentials. Please check your username and password." });
    }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // Get review from query parameter
    const username = req.session.authorization.username; // Get username from session
    
    // Check if review is provided
    if (!review) {
        return res.status(400).json({ message: "Review content is required. Please provide it as a query parameter." });
    }
    
    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found with the given ISBN" });
    }
    
    // Initialize reviews object if it doesn't exist
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    
    // Add or modify review
    books[isbn].reviews[username] = review;
    
    return res.status(200).json({ 
        message: "Review successfully added/modified",
        isbn: isbn,
        review: review,
        reviewer: username
    });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    
    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found with the given ISBN" });
    }
    
    // Check if reviews exist for this book
    if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
    
    // Check if user has a review for this book
    if (books[isbn].reviews[username]) {
        // Delete the user's review
        delete books[isbn].reviews[username];
        return res.status(200).json({ 
            message: "Review successfully deleted",
            isbn: isbn,
            reviewer: username
        });
    } else {
        return res.status(404).json({ 
            message: "You don't have a review for this book to delete",
            reviewer: username
        });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
