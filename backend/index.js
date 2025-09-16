require('dotenv').config(); //env 

const express = require('express');
const mongoose = require('mongoose');
const { Gig } = require('./models/Gigmodel');
const { gigsData } = require('./Data/GigsData');

const app = express();

const cors = require('cors');
const { Service } = require('./models/Servicemodel');
const { servicesData } = require('./Data/ServiceData');

const session = require('express-session');
const MongoStore = require('connect-mongo'); //session store on deployment
const passport = require('passport');//3 types 2 here 1 in modeluser
const LocalStrategy = require('passport-local');

const bodyParser = require('body-parser');
const { UserModel } = require('./models/UserModel');
const WrapAsync = require('./utils/WrapAsync');
const { isLoggedIn } = require('./middlewares/middleware');
const axios = require("axios");


const url = process.env.MONGO_URL;
const PORT = process.env.PORT || 3002;
const secret = process.env.SECRET;

const AI_URL = "http://127.0.0.1:5000/analyze"; // Python FastAPI service


app.use(express.json());
//
app.use(express.urlencoded({ extended: true }));


app.use(cors({
    origin: 'http://localhost:3000', // your React dev URL
    // methods: ['GET', 'POST'],
    credentials: true
}));

app.set("trust proxy", 1);

//mogno store
const store =MongoStore.create({
    mongoUrl:url,
    crypto: {
        secret: secret,
    },
    touchAfter:24*3600,
})
//if error
store.on("error",()=>{
    console.log("Error in Mongo Session Store",err);

})
const sessionOption = {
  store,
  secret: secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,   // ✅ must be false on localhost
    sameSite: "lax", // ✅ fixes cookie being blocked
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};


//session
app.use(session(sessionOption));

//passport //read documentation //for creatig user
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(UserModel.authenticate()))
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());


app.get('/app',(req,res)=>{
    res.send("working sdgv");
});




app.post('/dummy1', WrapAsync(async (req, res) => {
  try {
    await Gig.deleteMany({}); // clear old data
    const inserted = await Service.insertMany(servicesData);
    res.send("Seed success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error seeding data");
  }
}));

//new Gig post
// New Gig post with AI moderation
app.post('/addGig', isLoggedIn, async (req, res) => {
  try {
    const aiRes = await axios.post("http://127.0.0.1:5000/analyze", req.body);

    if (aiRes.data.status !== "ok") {
      return res.status(400).json({ error: aiRes.data.message });
    }
    console.log(req.body);
    const newGig = new Gig(req.body);
    await newGig.save();

    res.status(201).json({ message: "✅ Gig created successfully", gig: newGig });
  } catch (err) {
    console.error("Error in /addGig:", err.message);
    res.status(500).json({ error: "Server error while creating gig" });
  }
});


// New Service post
app.post('/addService', isLoggedIn, async (req, res) => {
  try {
    const newService = new Service(req.body);
    await newService.save();
    res.status(201).json({ message: 'Service created successfully', service: newService });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create service' });
  }
});



// app.get('/getGigs',WrapAsync(async(req,res)=>{
//     try{
//         let allGigs = await Gig.find({});
//         res.json(allGigs);
//     }catch(err){
//         console.log(err);
//     }
// }))
// backend: filter gigs by city
app.get('/getGigs/:city', WrapAsync(async (req, res) => {
    try {
        const city = req.params.city;
        let gigs = await Gig.find({ location: { $regex: new RegExp(city, "i") } });
        res.json(gigs);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}));

app.get('/getService/:city', WrapAsync(async(req,res)=>{
    try{
        const { city } = req.params;
        let allService = await Service.find({ location: new RegExp(`^${city}$`, "i") }); 
        res.json(allService);
    }catch(err){
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));




//user authentication
app.post("/signUp",WrapAsync(async(req,res,next)=>{
    // let hashedPassword = await bcrypt.hash(req.body.password,10);
    // console.log(hashedPassword);
        let newUser = UserModel({
        username:req.body.name,
        email:req.body.email,
        // password:hashedPassword,
        });
        let user = await UserModel.register(newUser,req.body.password);
        req.login(user, (err) => {
        if(err) {
           return next(err);
        }else{
            res.send("done");
        }
        });
    // } catch (error) {
    //     throw new ExpressError(404,error.message); //no use //try catch stops crash
    // }
}));

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    // failureFlash: true,
  }),
  WrapAsync(async (req, res) => {
    res.json({
      msg: "Login successful",
      user: { username: req.user.username },
    });
  }
));


app.get("/current-user", (req, res) => {
    if (req.isAuthenticated()) {
        return res.status(200).json({
            success: true,
            user: req.user, // Passport automatically attaches user to req
        });
    } else {
        return res.status(401).json({ success: false, message: "Not logged in" });
    }
});


// LOGOUT ROUTE
app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: "Logout failed" });
        }
        // Destroy session after logout
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Session destroy failed" });
            }

            res.clearCookie("connect.sid"); // Important: Clears session cookie
            return res.status(200).json({ success: true, message: "Logged out successfully" });
        });
    });
});



app.listen(PORT,()=>{
    console.log("App started!")
    //mono connecct
    mongoose.connect(url);
    console.log("DB connected..")
}) 