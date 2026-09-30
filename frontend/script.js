// ==========================================
// LIBRARIAN PAGE PROTECTION
// ==========================================

const currentPage = window.location.pathname;

const publicPages = [
    "/login.html"
];

if (!publicPages.includes(currentPage)) {

    const loggedIn =
        sessionStorage.getItem("librarianLoggedIn");

    if (loggedIn !== "true") {

        window.location.href = "login.html";

    }

}
// ==========================================
// ADD BOOK
// ==========================================

const bookForm = document.getElementById("bookForm");

if (bookForm) {

    bookForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const data = {

            title: document.getElementById("title").value,

            isbn: document.getElementById("isbn").value,

            edition: document.getElementById("edition").value,

            author_name:
                document.getElementById("author_name").value,

            category:
                document.getElementById("category").value,

            price:
                document.getElementById("price").value,

            publisher_id:
                document.getElementById("publisher_id").value

        };

        try {

            const response = await fetch("/api/books", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)

            });

            const result = await response.json();

            if (response.ok) {

                document.getElementById("message").textContent =
                    "Book added successfully! Book ID: " +
                    result.book_id;

                bookForm.reset();

            } else {

                document.getElementById("message").textContent =
                    result.error;

            }

        } catch (error) {

            console.log(error);

            document.getElementById("message").textContent =
                "Server connection failed.";

        }

    });

}


// ==========================================
// DISPLAY BOOKS
// ==========================================

const booksBody = document.getElementById("booksBody");

if (booksBody) {

    async function loadBooks() {

        try {

            const response = await fetch("/api/books");

            const books = await response.json();

            booksBody.innerHTML = "";

            books.forEach(function (book) {

                const row = document.createElement("tr");

                row.innerHTML = `

                    <td>${book.book_id}</td>

                    <td>${book.title}</td>

                    <td>${book.isbn}</td>

                    <td>${book.edition || ""}</td>

                    <td>${book.author_name || ""}</td>

                    <td>${book.category || ""}</td>

                    <td>₹${book.price}</td>

                `;

                booksBody.appendChild(row);

            });

        } catch (error) {

            console.log(error);

            booksBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        Failed to load books.
                    </td>
                </tr>
            `;

        }

    }

    loadBooks();

}


// ==========================================
// ADD READER
// ==========================================

const readerForm = document.getElementById("readerForm");

if (readerForm) {

    readerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const data = {

            first_name:
                document.getElementById("first_name").value,

            last_name:
                document.getElementById("last_name").value,

            email:
                document.getElementById("email").value,

            phone:
                document.getElementById("phone").value,

            address:
                document.getElementById("address").value

        };

        try {

            const response = await fetch("/api/readers", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)

            });

            const result = await response.json();

            if (response.ok) {

                document.getElementById("readerMessage").textContent =
                    "Reader added successfully! User ID: " +
                    result.user_id;

                readerForm.reset();

            } else {

                document.getElementById("readerMessage").textContent =
                    result.error;

            }

        } catch (error) {

            console.log(error);

            document.getElementById("readerMessage").textContent =
                "Server connection failed.";

        }

    });

}


// ==========================================
// DISPLAY READERS
// ==========================================

const readersBody =
    document.getElementById("readersBody");

if (readersBody) {

    async function loadReaders() {

        try {

            const response =
                await fetch("/api/readers");

            const readers =
                await response.json();

            readersBody.innerHTML = "";

            readers.forEach(function (reader) {

                const row =
                    document.createElement("tr");

                row.innerHTML = `

                    <td>${reader.user_id}</td>

                    <td>
                        ${reader.first_name}
                        ${reader.last_name || ""}
                    </td>

                    <td>${reader.email}</td>

                    <td>${reader.phone || ""}</td>

                    <td>${reader.address || ""}</td>

                `;

                readersBody.appendChild(row);

            });

        } catch (error) {

            console.log(error);

        }

    }

    loadReaders();

}


// ==========================================
// ISSUE BOOK
// ==========================================

const issueForm =
    document.getElementById("issueForm");

if (issueForm) {

    async function loadIssueData() {

        try {

            const readerResponse =
                await fetch("/api/readers");

            const readers =
                await readerResponse.json();

            const userSelect =
                document.getElementById("user_id");

            readers.forEach(function (reader) {

                const option =
                    document.createElement("option");

                option.value = reader.user_id;

                option.textContent =
                    reader.user_id +
                    " - " +
                    reader.first_name +
                    " " +
                    (reader.last_name || "");

                userSelect.appendChild(option);

            });


            const bookResponse =
                await fetch("/api/books");

            const books =
                await bookResponse.json();

            const bookSelect =
                document.getElementById("book_id");

            books.forEach(function (book) {

                const option =
                    document.createElement("option");

                option.value = book.book_id;

                option.textContent =
                    book.book_id +
                    " - " +
                    book.title;

                bookSelect.appendChild(option);

            });

        } catch (error) {

            console.log(error);

        }

    }

    loadIssueData();


    issueForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const data = {

                user_id:
                    document.getElementById("user_id").value,

                book_id:
                    document.getElementById("book_id").value,

                due_date:
                    document.getElementById("due_date").value

            };

            try {

                const response =
                    await fetch("/api/borrowings", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(data)

                    });

                const result =
                    await response.json();

                if (response.ok) {

                    document.getElementById(
                        "issueMessage"
                    ).textContent =
                        "Book issued successfully! Borrowing ID: " +
                        result.borrowing_id;

                    issueForm.reset();

                } else {

                    document.getElementById(
                        "issueMessage"
                    ).textContent =
                        result.error;

                }

            } catch (error) {

                console.log(error);

                document.getElementById(
                    "issueMessage"
                ).textContent =
                    "Server connection failed.";

            }

        }
    );

}


// ==========================================
// BORROWING RECORDS
// ==========================================

const borrowingsBody =
    document.getElementById("borrowingsBody");

if (borrowingsBody) {

    async function loadBorrowings() {

        try {

            const response =
                await fetch("/api/borrowings");

            const borrowings =
                await response.json();

            borrowingsBody.innerHTML = "";

            borrowings.forEach(function (borrowing) {

                const row =
                    document.createElement("tr");

                let actionButton = "";

                if (borrowing.status !== "Returned") {

                    actionButton = `
                        <button
                            onclick="returnBook(${borrowing.borrowing_id})">
                            Return
                        </button>
                    `;

                } else {

                    actionButton = "Returned";

                }

                row.innerHTML = `

                    <td>${borrowing.borrowing_id}</td>

                    <td>
                        ${borrowing.reader_name}
                    </td>

                    <td>
                        ${borrowing.title}
                    </td>

                    <td>
                        ${borrowing.issue_date || ""}
                    </td>

                    <td>
                        ${borrowing.due_date || ""}
                    </td>

                    <td>
                        ${borrowing.return_date || ""}
                    </td>

                    <td>
                        ${borrowing.status}
                    </td>

                    <td>
                        ${actionButton}
                    </td>

                `;

                borrowingsBody.appendChild(row);

            });

        } catch (error) {

            console.log(error);

        }

    }

    loadBorrowings();

}


// ==========================================
// RETURN BOOK
// ==========================================

async function returnBook(id) {

    try {

        const response =
            await fetch(
                "/api/borrowings/" + id + "/return",
                {
                    method: "PUT"
                }
            );

        const result =
            await response.json();

        alert(result.message || result.error);

        location.reload();

    } catch (error) {

        console.log(error);

        alert("Failed to return book.");

    }

}
// ==========================================
// LIBRARIAN LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const login_id =
            document.getElementById("login_id").value;

        const password =
            document.getElementById("password").value;

        try {

            const response =
                await fetch("/api/login", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        login_id: login_id,
                        password: password
                    })

                });

            const result =
                await response.json();

            if (response.ok) {

                sessionStorage.setItem(
                    "librarianLoggedIn",
                    "true"
                );

                sessionStorage.setItem(
                    "librarianName",
                    result.name
                );

                window.location.href = "index.html";

            } else {

                document.getElementById(
                    "loginMessage"
                ).textContent = result.error;

            }

        } catch (error) {

            console.log(error);

            document.getElementById(
                "loginMessage"
            ).textContent =
                "Server connection failed.";

        }

    });

}
// ==========================================
// LOGOUT
// ==========================================

