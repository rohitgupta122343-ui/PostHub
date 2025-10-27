
const express = require('express');
const app = express();
const path = require('path');
const userModel = require('./models/user');
const postModel = require('./models/post');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const upload = require('./config/multer-config');

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {

    res.render("index");
})

app.post("/register", async (req, res) => {

    let { username, name, email, password, age } = req.body;

    const user = await userModel.findOne({ email: email });

    if (user) res.send("You can already register ");

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {

            const user = await userModel.create({
                username,
                name,
                email,
                password: hash,
                age
            })

            let token = jwt.sign({ email: email, userid: user._id }, "gupta");
            res.cookie("token", token);

            res.send(user);
        })
    })

})

app.get("/login", (req, res) => {

    res.render("login");
})

app.post("/login", async (req, res) => {

    let { email, password } = req.body;

    let user = await userModel.findOne({ email: email });

    if (!user) return res.send("something is wrong ");

    bcrypt.compare(password, user.password, (err, result) => {

        if (result) {
            let token = jwt.sign({ email: email, userid: user._id }, "gupta");
            res.cookie("token", token);
            res.redirect("/profile");
        }
        else res.redirect("/login");
    })

})

app.get("/profile", isLoggedIn, async (req, res) => {

    let user = await userModel.findOne({ email: req.user.email }).populate("post");


    res.render("profile", { user });
});

app.get("/logout", (req, res) => {

    res.cookie("token", "");
    res.redirect("/login");
})

function isLoggedIn(req, res, next) {

    if (req.cookies.token == "") {

        res.redirect("/login");
    }
    else {

        let data = jwt.verify(req.cookies.token, "gupta");

        req.user = data;
        next();
    }
}

app.post("/post", isLoggedIn, async (req, res) => {

    let user = await userModel.findOne({ email: req.user.email })

    let { content } = req.body;

    let post = await postModel.create({
        user: user._id,
        content
    })

    user.post.push(post._id);
    await user.save()
    res.redirect("/profile");

})

app.get("/profile/upload", isLoggedIn, async (req, res) => {

    let user = await userModel.findOne({ email: req.user.email });


    res.render("upload", { user });
})

app.post("/upload", isLoggedIn, upload.single("image"), async (req, res) => {

    let user = await userModel.findOne({ email: req.user.email });
    console.log(user);


    user.profilePic = req.file.filename;
    await user.save()
    res.redirect("/profile");


})

app.get("/edit/:id", isLoggedIn, async (req, res) => {

    let post = await postModel.findOne({ _id: req.params.id }).populate("user")

    res.render("edit", { post })

})

app.post("/update/:id", isLoggedIn, async (req, res) => {

    let post = await postModel.findOneAndUpdate({ _id: req.params.id }, { content: req.body.content });

    res.redirect("/profile");



})



app.listen(3000);