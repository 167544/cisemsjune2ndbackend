const express = require('express');
const { getDB } = require('./dbconnection')

const bcrypt = require('bcrypt');
const { verifyIfManager } = require('../controllers/user');


const Register = express.Router().post("/", async (req, res) => {
    try {
        const db = getDB()
        const { name, Username, password, repeatPassword, userRole } = req.body;
        console.log('testing otp33333333333333333', name, Username)
        console.log("userRoleuserRole", userRole)


        // Check if a user with the same name or username already exists
        const existingUser = await db.collection("Users").findOne({ $or: [{ name }] });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        const isManager = await verifyIfManager(Username)

        if (isManager && userRole == "User") {
            return res.status(400).json({ message: `You are a manager. Kindly try registring as an admin!` })
        }

        // Check if password and repeatPassword match
        if (password !== repeatPassword) {
            return res.status(400).send("Passwords do not match");
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            name,
            Username,
            password: hashedPassword,
            userRole
        };
        // if (data.user.userRole === "") {
        //     data.user.userRole = "User"; 
        // }

        // Insert the new user into the database
        await db.collection("Users").insertOne(newUser);
        res.json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).send("An error occurred during registration. Please try again later.");
    }
});

module.exports = Register;
