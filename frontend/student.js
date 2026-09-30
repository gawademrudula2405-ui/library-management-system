// ==========================================
// STUDENT LOGIN
// ==========================================

const loginForm = document.getElementById("studentLoginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("loginMessage");

        message.textContent = "Logging in...";

        try {

            const response = await fetch(
                "/api/student/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                message.textContent =
                    data.error || "Login failed";

                return;
            }

            // Save student information in browser

            localStorage.setItem(
                "studentUserId",
                data.user_id
            );

            localStorage.setItem(
                "studentName",
                data.name
            );

            localStorage.setItem(
                "studentEmail",
                data.email
            );

            // Go to dashboard

            window.location.href =
                "student-dashboard.html";

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to server";

        }

    });

}


// ==========================================
// STUDENT DASHBOARD
// ==========================================

const booksContainer =
    document.getElementById("booksContainer");

if (booksContainer) {

    const userId =
        localStorage.getItem("studentUserId");

    const studentName =
        localStorage.getItem("studentName");

    // If student is not logged in

    if (!userId) {

        window.location.href =
            "student-login.html";

    } else {

        document.getElementById(
            "studentName"
        ).textContent = studentName;

        loadBooks();

        loadBorrowings();

    }

}


// ==========================================
// LOAD BOOKS
// ==========================================

async function loadBooks(search = "") {

    const container =
        document.getElementById("booksContainer");

    if (!container) {
        return;
    }

    container.innerHTML =
        "<p>Loading books...</p>";

    try {

        const response = await fetch(
            "/api/student/books?search=" +
            encodeURIComponent(search)
        );

        const books = await response.json();

        if (!response.ok) {

            container.innerHTML =
                "<p>Failed to load books.</p>";

            return;
        }

        if (books.length === 0) {

            container.innerHTML =
                "<p>No books found.</p>";

            return;
        }

        let html =
            '<div class="books-grid">';

        books.forEach(function (book) {

            const available =
                book.availability === "Available";

            html += `

                <div class="book-card">

                    <h3>${escapeHtml(book.title)}</h3>

                    <p>
                        <strong>Author:</strong>
                        ${escapeHtml(book.author_name || "N/A")}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${escapeHtml(book.category || "N/A")}
                    </p>

                    <p>
                        <strong>ISBN:</strong>
                        ${escapeHtml(book.isbn)}
                    </p>

                    <p>
                        <strong>Edition:</strong>
                        ${escapeHtml(book.edition || "N/A")}
                    </p>

                    <p class="${
                        available
                            ? "available"
                            : "not-available"
                    }">

                        ${book.availability}

                    </p>

                    <button
                        class="reserve-button"
                        onclick="reserveBook(${book.book_id})"
                        ${available ? "" : "disabled"}
                    >

                        ${
                            available
                                ? "📖 Request / Reserve"
                                : "Not Available"
                        }

                    </button>

                </div>

            `;

        });

        html += "</div>";

        container.innerHTML = html;

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// ==========================================
// SEARCH BUTTON
// ==========================================

const searchButton =
    document.getElementById("searchButton");

if (searchButton) {

    searchButton.addEventListener(
        "click",
        function () {

            const search =
                document.getElementById(
                    "searchInput"
                ).value.trim();

            loadBooks(search);

        }
    );

}


// ==========================================
// ENTER KEY SEARCH
// ==========================================

const searchInput =
    document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener(
        "keypress",
        function (event) {

            if (event.key === "Enter") {

                const search =
                    searchInput.value.trim();

                loadBooks(search);

            }

        }
    );

}


// ==========================================
// SHOW ALL BOOKS
// ==========================================

const showAllButton =
    document.getElementById("showAllButton");

if (showAllButton) {

    showAllButton.addEventListener(
        "click",
        function () {

            document.getElementById(
                "searchInput"
            ).value = "";

            loadBooks();

        }
    );

}


// ==========================================
// RESERVE BOOK
// ==========================================

async function reserveBook(bookId) {

    const userId =
        localStorage.getItem("studentUserId");

    if (!userId) {

        window.location.href =
            "student-login.html";

        return;
    }

    const confirmRequest =
        confirm(
            "Do you want to request this book?"
        );

    if (!confirmRequest) {
        return;
    }

    try {

        const response = await fetch(
            "/api/student/reserve",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    user_id: userId,
                    book_id: bookId
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.error ||
                "Unable to reserve book"
            );

            return;
        }

        alert(
            "Book requested successfully!"
        );

        loadBooks();

        loadBorrowings();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server"
        );

    }

}


// ==========================================
// LOAD MY BORROWINGS
// ==========================================

async function loadBorrowings() {

    const container =
        document.getElementById(
            "borrowingsContainer"
        );

    if (!container) {
        return;
    }

    const userId =
        localStorage.getItem("studentUserId");

    if (!userId) {
        return;
    }

    container.innerHTML =
        "<p>Loading...</p>";

    try {

        const response = await fetch(
            "/api/student/borrowings/" +
            userId
        );

        const records =
            await response.json();

        if (!response.ok) {

            container.innerHTML =
                "<p>Failed to load records.</p>";

            return;
        }

        if (records.length === 0) {

            container.innerHTML =
                "<p>You have no borrowing records.</p>";

            return;
        }

        let html = `
            <div class="table-container">

            <table>

                <thead>

                    <tr>
                        <th>Book</th>
                        <th>Author</th>
                        <th>Reserve Date</th>
                        <th>Issue Date</th>
                        <th>Due Date</th>
                        <th>Return Date</th>
                        <th>Status</th>
                    </tr>

                </thead>

                <tbody>
        `;

        records.forEach(function (record) {

            html += `

                <tr>

                    <td>
                        ${escapeHtml(record.title)}
                    </td>

                    <td>
                        ${escapeHtml(
                            record.author_name || "N/A"
                        )}
                    </td>

                    <td>
                        ${record.reserve_date || "-"}
                    </td>

                    <td>
                        ${record.issue_date || "-"}
                    </td>

                    <td>
                        ${record.due_date || "-"}
                    </td>

                    <td>
                        ${record.return_date || "-"}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(record.status)}
                        </strong>
                    </td>

                </tr>

            `;

        });

        html += `
                </tbody>

            </table>

            </div>
        `;

        container.innerHTML = html;

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}


// ==========================================
// LOGOUT
// ==========================================

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "studentUserId"
            );

            localStorage.removeItem(
                "studentName"
            );

            localStorage.removeItem(
                "studentEmail"
            );

            window.location.href =
                "student-login.html";

        }
    );

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}