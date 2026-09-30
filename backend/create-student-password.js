const bcrypt = require("bcrypt");

const password = "rahul123";

bcrypt.hash(password, 10, function (error, hash) {

    if (error) {
        console.log("Error creating password:", error);
        return;
    }

    console.log("Hashed student password:");
    console.log(hash);

});