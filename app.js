require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const md5 = require('md5'); // Call module for hash your password



const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');

mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});



const User = new mongoose.model('User', userSchema);


//CODE HERE
app.get('/', (req,res) => {
    res.render('home');
});

app.get('/login', (req,res) => {
    res.render('login');
});

app.get('/register', (req,res) => {
    res.render('register');
});

app.post('/register', (req,res) => {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password) //using md5 function to hash password that store to DB
    });

    newUser.save((err) => {
        if(err){
            console.log(err);
        }else{
            res.render('secrets');
        }
    });
});

app.post('/login', (req,res) => {
    const username = req.body.username;
    const password = md5(req.body.password); // using md5 function to hash password to match user password that hashing before with user input on login page

    User.findOne({email: username}, (err, result) => {
        if(err){
            console.log(err);
        }else{
            if(result){
                if(result.password === password){
                    res.render('secrets');
                }
            }
        }
    });
});



app.listen(port, () => {
    console.log(`Server conntected to port ${port}`);
});

