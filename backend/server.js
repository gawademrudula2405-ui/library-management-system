const express = require("express");
const path = require("path");
const db = require("./db");
const bcrypt = require("bcrypt");

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());


// ==========================================
// LIBRARIAN LOGIN
// ==========================================

app.post("/api/login", function (req, res) {

    const { login_id, password } = req.body;

    const sql = `
        SELECT *
        FROM staff
        WHERE login_id = ?
    `;

    db.query(sql, [login_id], function (error, results) {

        if (error) {
            console.log("Login error:", error.message);

            return res.status(500).json({
                error: "Server error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                error: "Invalid login ID or password"
            });
        }

        const staff = results[0];

        bcrypt.compare(
            password,
            staff.password_hash,
            function (error, match) {

                if (error) {
                    return res.status(500).json({
                        error: "Password verification failed"
                    });
                }

                if (!match) {
                    return res.status(401).json({
                        error: "Invalid login ID or password"
                    });
                }

                res.json({
                    message: "Login successful",
                    staff_id: staff.staff_id,
                    name: staff.name
                });

            }
        );

    });

});


// ==========================================
// STUDENT LOGIN
// ==========================================

app.post("/api/student/login", function (req, res) {

    const { email, password } = req.body;

    const sql = `
        SELECT *
        FROM readers
        WHERE email = ?
    `;

    db.query(sql, [email], function (error, results) {

        if (error) {
            console.log("Student login error:", error.message);

            return res.status(500).json({
                error: "Server error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const student = results[0];

        bcrypt.compare(
            password,
            student.password,
            function (error, match) {

                if (error) {
                    return res.status(500).json({
                        error: "Password verification failed"
                    });
                }

                if (!match) {
                    return res.status(401).json({
                        error: "Invalid email or password"
                    });
                }

                res.json({
                    message: "Student login successful",
                    user_id: student.user_id,
                    name: student.first_name + " " + (student.last_name || ""),
                    email: student.email
                });

            }
        );

    });

});


// ==========================================
// STATIC FRONTEND
// ==========================================

app.use(express.static(path.join(__dirname, "../frontend")));


// ==========================================
// HOME
// ==========================================

app.get("/", function (req, res) {

    res.sendFile(
        path.join(__dirname, "../frontend/index.html")
    );

});


// ==================================================
// BOOKS - LIBRARIAN
// ==================================================

// GET ALL BOOKS

app.get("/api/books", function (req, res) {

    const sql = `
        SELECT *
        FROM books
        ORDER BY book_id DESC
    `;

    db.query(sql, function (error, results) {

        if (error) {
            console.log("Error fetching books:", error.message);

            return res.status(500).json({
                error: "Failed to fetch books"
            });
        }

        res.json(results);

    });

});


// ADD BOOK

app.post("/api/books", function (req, res) {

    const {
        title,
        isbn,
        edition,
        author_name,
        category,
        price,
        publisher_id
    } = req.body;

    const sql = `
        INSERT INTO books
        (
            title,
            isbn,
            edition,
            author_name,
            category,
            price,
            publisher_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        title,
        isbn,
        edition,
        author_name,
        category,
        price,
        publisher_id
    ];

    db.query(sql, values, function (error, result) {

        if (error) {
            console.log("Error adding book:", error.message);

            return res.status(500).json({
                error: error.message
            });
        }

        res.status(201).json({
            message: "Book added successfully",
            book_id: result.insertId
        });

    });

});


// DELETE BOOK

app.delete("/api/books/:id", function (req, res) {

    const bookId = req.params.id;

    const sql = `
        DELETE FROM books
        WHERE book_id = ?
    `;

    db.query(sql, [bookId], function (error) {

        if (error) {
            console.log("Error deleting book:", error.message);

            return res.status(500).json({
                error: "Cannot delete book. It may have borrowing records."
            });
        }

        res.json({
            message: "Book deleted successfully"
        });

    });

});


// ==================================================
// STUDENT BOOKS
// ==================================================

// VIEW AVAILABLE BOOKS + SEARCH

app.get("/api/student/books", function (req, res) {

    const search = req.query.search || "";

    const sql = `
        SELECT
            bk.book_id,
            bk.title,
            bk.isbn,
            bk.edition,
            bk.author_name,
            bk.category,
            bk.price,
            bk.publisher_id,

            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM borrowings br
                    WHERE br.book_id = bk.book_id
                    AND br.status IN ('Reserved', 'Issued', 'Overdue')
                )
                THEN 'Not Available'
                ELSE 'Available'
            END AS availability

        FROM books bk

        WHERE
            bk.title LIKE ?
            OR bk.author_name LIKE ?
            OR bk.category LIKE ?
            OR bk.isbn LIKE ?

        ORDER BY bk.book_id DESC
    `;

    const searchValue = "%" + search + "%";

    db.query(
        sql,
        [
            searchValue,
            searchValue,
            searchValue,
            searchValue
        ],
        function (error, results) {

            if (error) {

                console.log(
                    "Error fetching student books:",
                    error.message
                );

                return res.status(500).json({
                    error: "Failed to fetch books"
                });
            }

            res.json(results);

        }
    );

});


// ==================================================
// STUDENT RESERVE / REQUEST BOOK
// ==================================================

app.post("/api/student/reserve", function (req, res) {

    const {
        user_id,
        book_id
    } = req.body;

    if (!user_id || !book_id) {

        return res.status(400).json({
            error: "User ID and Book ID are required"
        });

    }

    // First check whether the book is already reserved/issued

    const checkSql = `
        SELECT borrowing_id
        FROM borrowings
        WHERE book_id = ?
        AND status IN ('Reserved', 'Issued', 'Overdue')
        LIMIT 1
    `;

    db.query(
        checkSql,
        [book_id],
        function (error, results) {

            if (error) {

                console.log(
                    "Error checking book availability:",
                    error.message
                );

                return res.status(500).json({
                    error: "Failed to check book availability"
                });

            }

            if (results.length > 0) {

                return res.status(400).json({
                    error: "This book is currently not available"
                });

            }

            // Check if this student already has this book active

            const studentCheckSql = `
                SELECT borrowing_id
                FROM borrowings
                WHERE user_id = ?
                AND book_id = ?
                AND status IN ('Reserved', 'Issued', 'Overdue')
                LIMIT 1
            `;

            db.query(
                studentCheckSql,
                [user_id, book_id],
                function (error, studentResults) {

                    if (error) {

                        return res.status(500).json({
                            error: "Failed to check existing request"
                        });

                    }

                    if (studentResults.length > 0) {

                        return res.status(400).json({
                            error: "You have already requested this book"
                        });

                    }

                    // Create reservation

                    const insertSql = `
                        INSERT INTO borrowings
                        (
                            user_id,
                            book_id,
                            reserve_date,
                            status
                        )
                        VALUES (?, ?, CURDATE(), 'Reserved')
                    `;

                    db.query(
                        insertSql,
                        [user_id, book_id],
                        function (error, result) {

                            if (error) {

                                console.log(
                                    "Error reserving book:",
                                    error.message
                                );

                                return res.status(500).json({
                                    error: "Failed to reserve book"
                                });

                            }

                            res.status(201).json({
                                message: "Book requested successfully",
                                borrowing_id: result.insertId
                            });

                        }
                    );

                }
            );

        }
    );

});


// ==================================================
// STUDENT BORROWED BOOKS
// ==================================================

app.get("/api/student/borrowings/:user_id", function (req, res) {

    const userId = req.params.user_id;

    const sql = `
        SELECT
            b.borrowing_id,
            b.book_id,
            bk.title,
            bk.author_name,
            bk.category,
            b.reserve_date,
            b.issue_date,
            b.due_date,
            b.return_date,
            b.status
        FROM borrowings b

        JOIN books bk
            ON b.book_id = bk.book_id

        WHERE b.user_id = ?

        ORDER BY b.borrowing_id DESC
    `;

    db.query(
        sql,
        [userId],
        function (error, results) {

            if (error) {

                console.log(
                    "Error fetching student borrowings:",
                    error.message
                );

                return res.status(500).json({
                    error: "Failed to fetch borrowing records"
                });

            }

            res.json(results);

        }
    );

});


// ==================================================
// READERS - LIBRARIAN
// ==================================================

// GET ALL READERS

app.get("/api/readers", function (req, res) {

    const sql = `
        SELECT
            user_id,
            first_name,
            last_name,
            email,
            phone,
            address
        FROM readers
        ORDER BY user_id DESC
    `;

    db.query(sql, function (error, results) {

        if (error) {

            console.log(
                "Error fetching readers:",
                error.message
            );

            return res.status(500).json({
                error: "Failed to fetch readers"
            });

        }

        res.json(results);

    });

});


// ADD READER

app.post("/api/readers", function (req, res) {

    const {
        first_name,
        last_name,
        email,
        phone,
        address,
        password
    } = req.body;

    if (!password) {

        return res.status(400).json({
            error: "Password is required"
        });

    }

    const sql = `
        INSERT INTO readers
        (
            first_name,
            last_name,
            email,
            phone,
            address,
            password
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    bcrypt.hash(
        password,
        10,
        function (error, hash) {

            if (error) {

                console.log(
                    "Error hashing reader password:",
                    error.message
                );

                return res.status(500).json({
                    error: "Failed to create password"
                });

            }

            const values = [
                first_name,
                last_name,
                email,
                phone,
                address,
                hash
            ];

            db.query(
                sql,
                values,
                function (error, result) {

                    if (error) {

                        console.log(
                            "Error adding reader:",
                            error.message
                        );

                        return res.status(500).json({
                            error: error.message
                        });

                    }

                    res.status(201).json({
                        message: "Reader added successfully",
                        user_id: result.insertId
                    });

                }
            );

        }
    );

});


// ==================================================
// BORROWINGS - LIBRARIAN
// ==================================================

// GET ALL BORROWINGS

app.get("/api/borrowings", function (req, res) {

    const sql = `
        SELECT
            b.borrowing_id,
            r.user_id,
            CONCAT(r.first_name, ' ', r.last_name) AS reader_name,
            b.book_id,
            bk.title,
            b.reserve_date,
            b.issue_date,
            b.due_date,
            b.return_date,
            b.status
        FROM borrowings b
        JOIN readers r
            ON b.user_id = r.user_id
        JOIN books bk
            ON b.book_id = bk.book_id
        ORDER BY b.borrowing_id DESC
    `;

    db.query(sql, function (error, results) {

        if (error) {

            console.log(
                "Error fetching borrowings:",
                error.message
            );

            return res.status(500).json({
                error: "Failed to fetch borrowing records"
            });

        }

        res.json(results);

    });

});


// ISSUE BOOK

app.post("/api/borrowings", function (req, res) {

    const {
        user_id,
        book_id,
        due_date
    } = req.body;

    const sql = `
        INSERT INTO borrowings
        (
            user_id,
            book_id,
            reserve_date,
            issue_date,
            due_date,
            status
        )
        VALUES (?, ?, CURDATE(), CURDATE(), ?, 'Issued')
    `;

    db.query(
        sql,
        [user_id, book_id, due_date],
        function (error, result) {

            if (error) {

                console.log(
                    "Error issuing book:",
                    error.message
                );

                return res.status(500).json({
                    error: error.message
                });

            }

            res.status(201).json({
                message: "Book issued successfully",
                borrowing_id: result.insertId
            });

        }
    );

});


// RETURN BOOK

app.put("/api/borrowings/:id/return", function (req, res) {

    const borrowingId = req.params.id;

    const sql = `
        UPDATE borrowings
        SET
            return_date = CURDATE(),
            status = 'Returned'
        WHERE borrowing_id = ?
    `;

    db.query(
        sql,
        [borrowingId],
        function (error, result) {

            if (error) {

                console.log(
                    "Error returning book:",
                    error.message
                );

                return res.status(500).json({
                    error: "Failed to return book"
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    error: "Borrowing record not found"
                });

            }

            res.json({
                message: "Book returned successfully"
            });

        }
    );

});


// ==================================================
// SERVER
// ==================================================

app.listen(5000, function () {

    console.log("Server is running on port 5000");

});