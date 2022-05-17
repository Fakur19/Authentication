require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');  // Require bcrypt modules
const saltRounds =10; // Set salt rounds number, 10 is sufficient, the bigger the number, the longer it will take to hash a password



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
    bcrypt.hash(req.body.password, saltRounds, (err,hash) => {
        const newUser = new User({
            email: req.body.username,
            password: hash //using bcrypt hash function to hash password
        });
    
        newUser.save((err) => {
            if(err){
                console.log(err);
            }else{
                res.render('secrets');
            }
        });
    });
});

app.post('/login', (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, result) => {
        if(err){
            console.log(err);
        }else{
            if(result){
                bcrypt.compare(password, result.password, (err, result) => { // Using bcrypt to compare hashing password
                    if(result === true){  
                        res.render('secrets');
                    }
                });  
            }
        }
    });
});



app.listen(port, () => {
    console.log(`Server conntected to port ${port}`);
});

