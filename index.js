if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}

// To print environment variable 
// console.log(process.env.SECRET) 

const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')

const mongoose = require('mongoose')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const ExpressError = require('./utils/ExpressError')
const session = require('express-session')

// Routes 
const frontendRoutes = require('./routes/frontend')

const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const numberToWords = require('number-to-words');
const cookieParser = require('cookie-parser') 

// const mysql = require('mysql');

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))     // To parse req.body from URL 

// To specify all public resource and use throughout application 
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser()) 

const sessionConfig = {
    secret: 'thisshouldbethesecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7         
    }
}

function getMainDirectory() {
    return __dirname;
}

// Setting up Session Configuration 
app.use(session(sessionConfig))

// Initialize Flash 
app.use(flash())

//** Make sure Session is defined before initializing the Passport */ 
// Initialize Passport 
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const dbUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travel';

console.log('DB URL below')
console.log(dbUrl)

mongoose.connect( dbUrl , { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connection Open')
    })
    .catch(err => {
        console.log('Error')
        console.log(err)
    })

app.use((req, res, next) => {
    // To debug what is included in Session 
    // console.log(req.session) 

    // Local is available to take any values in middleware 
    // This object can help to make login/logout/register button visible and invisible     

    // Locals >> Not required as of now 
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')

    res.locals.convertNumberToWords = (num) => {
        return numberToWords.toWords(num).replace(/\b\w/g, (char) => char.toUpperCase());
    };
    
    next()
})

// All campgrounds routes 
app.use('/', frontendRoutes)

app.get('/', (req, res) => {
    res.render('home')
}) 

// This will run when there is no matching path found 
app.all('*', (req, res, next) => {
    // console.log(req) 
    // next(new ExpressError('Page Not Found', 404))
    next(res.render('404')) 
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Something went wrong. Generic Message.'
    res.status(statusCode).render('error', { err })
})

app.listen(4600, '0.0.0.0', () => {
    console.log('Port is running on IPv4 (0.0.0.0:4600)');
})
