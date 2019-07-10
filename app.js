//require express
const express = require('express')
const app = express();
//require user.model.js which contains database schema
const User = require('./user.model');


const bodyParser= require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

//password-hash for hashing the password
var passwordHash = require('password-hash');

//jwt for authentication 
const  jwt  =  require('jsonwebtoken');
const SECRET_KEY = "23456";

const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/authenticate", { useNewUrlParser: true })//database connection setup, 27017 is port number and authenticate is db name.

mongoose.connection.on('connected', () => {
    console.log("connected");
  });
//creating a server using express
const PORT = 3008;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});


// post function to add user email and a password to the database , the password is stored in db in hashed form 
app.post('/register', async (req, res) => {
    
    var hashedPassword = passwordHash.generate(req.body.password);// generates hashed password
    console.log(hashedPassword)
    const user = new User({
        email: req.body.email,
        password: hashedPassword
    });  
    
    const saveStatus = await user.save();//saving to db
    
    return res.status(200).json({})
});
//to login with email and respective password thats already been saved in db 
app.post('/login',async (req, res) => {   
 
    const user = await User.findOne({email: req.body.email});//find if the entered email exists in the db
    console.log(user)
    if (!user) {
        return res.status(400).json({
            err: true,
            msg: `${req.body.email} not found`
         });
    }
     const verify =passwordHash.verify(req.body.password,user.password );//if email present in db checks the entered password  
     if(!verify){
         return res.status(400).json({
             msg : "invalid password"

        });
     }
     else {
        let token = jwt.sign({email:req.body.email},SECRET_KEY,{ expiresIn:60}); //generates a jwt
          res.json({
            success: true,
            token: token,
            msg : `logged in from ${req.body.email} `
          });
     }
});

app.post('/check',verifytoken,(req, res) => { //only executes if the token is valid! verifytoken is a middleware
    const email = req.body.email;
    res.json({msg :"+++++++++++", email});

});
function verifytoken(req,res,next){ //middleware checks if the entered is valid!
    const bearerHeader=req.headers['authorization'];
    console.log(bearerHeader)
    if(typeof bearerHeader !== undefined ){
        const bearer = bearerHeader .split(" ");
        const bearerToken= bearer[1];
        req.token=bearerToken;

        try {
            const decoded = jwt.verify(req.token, SECRET_KEY);// if token verified then goes to post /check
            if(decoded){
                    // res.json({success : true,
                    // msg: " verified"})
                    next();
                  }
           
        }catch(err){// if token invalid returns the error
            console.log(err);
            res.json({success
                : false,
                err,
            msg : "failed"});
        }

        
    }
    else{
        res.sendStatus(403);
    }
}
