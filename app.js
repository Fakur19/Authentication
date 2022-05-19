require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// Modules to add cookies and sessions
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');




const app = express();
const port = 3000;

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

//Initial configurasion to create a session 
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

// Using passport in express, to start initialize passport, and initialize session
app.use(passport.initialize());
app.use(passport.session()); // Use pasport to manage the session 

mongoose.connect('mongodb://localhost:27017/userDB');

//Make new user schema with mongoose schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Use passport-local-mongoose plugin to userSchema, to salt and hash password that store to database
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

//passport-local-mongoose configuration, to create local log in strategy and set a passport to serialize and deserialize
passport.use(User.createStrategy()); // create local strategy
passport.serializeUser(User.serializeUser()); // to serialize and fill the info/message and all identifiacation to the cookie
passport.deserializeUser(User.deserializeUser()); // to crumble the cookie and discover the info/message inside cookie and all identification 


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

app.get('/secrets', (req,res) => {
    if(req.isAuthenticated()){ //Check if user is authenticate or not
        res.render('secrets'); 
    }else{
        res.redirect('/login'); 
    }
});

app.get('/logout', (req,res) => {
    // To end user session
    req.logout();
    res.redirect('/');
});

app.post('/register', (req,res) => {
    // To register data to Database
    User.register({username: req.body.username}, req.body.password, (err,user) => {
        if(err){
            console.log(err);
            res.redirect('/register');
        }else{
            // Authenticate username and password to database
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            });
        }
    });
});

app.post('/login', (req,res) => {
    // Create new user
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    // To authenticate user is register on DB or not using login()
    req.login(user, (err) => {
        if(err){
            console.log(err);
        }else{
            passport.authenticate('local')(req,res, () => {
                res.redirect('/secrets');
            });
        }
    });
});



app.listen(port, () => {
    console.log(`Server conntected to port ${port}`);
});

