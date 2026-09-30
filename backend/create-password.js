const bcrypt = require("bcrypt");

const password = "admin123";

bcrypt.hash(password, 10, function (error, hash) {

    if (error) {
        console.log("Error creating password:", error);
        return;
    }

    console.log("Hashed password:");
    console.log(hash);

});