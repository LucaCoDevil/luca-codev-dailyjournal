//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

let PORT = process.env.PORT || 5000;

const homeStartingContent =
    " Welcome to the Daily Journal home page. From here you can view posts, seperating them into individual pages to make things a bit neater. From the Compose page one can add a new post which gets saved into our database. Please keep posts user friendly, nothing too crass!  ";
const aboutContent =
    "This is a blog webApp where one can compose a post consisting of a title and a body. Once the creation process is handled by the server and the post is added to the MongoDB database, the page is redirected to the home route where the post is displayed. Each post body on the home route is cut to be 100 characters. A read more button is displayed to take the user to a seperate page (this page and all the others are created through the use of custom ejs tempelates) in order to view the full post, from here the post can also be removed from the database. ";

const app = express();

app.set("view engine", "ejs");

app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.static("public"));

//database
mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/posts", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

const postSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Posts require a username"]
    },
    postTitle: {
        type: String,
        required: [true, "A title is required for a post"],
    },
    postBody: {
        type: String,
        required: [true, "a body is required for a post"]
    },
});

const Post = mongoose.model("post", postSchema);

//get home route
app.get("/", function(req, res) {
    Post.find({}, function(err, posts) {
        if (!err) {
            res.render("home", {
                startingContent: homeStartingContent,
                posts: posts,
            });
        }
    });
});

//get about route
app.get("/about", function(req, res) {
    let aboutArray = [
        "JavaScript",
        "HTML 5",
        "CSS",
        "Node.js",
        "Express",
        "EJS",
        "Mongoose",
        "NPM",
        "Git",
        "Bootstrap",
        "Lodash",
        "Bodyparser",
    ];
    res.render("about", {
        aboutContent: aboutContent,
        arr: aboutArray,
    });
});

//get compose route
app.get("/compose", function(req, res) {
    res.render("compose");
});

//post to compose route
app.post("/compose", function(req, res) {
    const post = new Post({
        username: req.body.username,
        postTitle: req.body.postTitle,
        postBody: req.body.postBody,
    });

    post.save(function(err) {
        if (!err) {
            res.redirect("/");
        }
    });
});

//get individual post route
app
    .route("/posts/:postId")

.get(function(req, res) {
    const reqPostId = req.params.postId;

    Post.findOne({ _id: reqPostId }, function(err, post) {
        const postId = post._id;

        if (postId === post._id) {
            res.render("post", {
                username: post.username,
                title: post.postTitle,
                body: post.postBody,
            });
        }
    });

    app.post("/delete", (req, res) => {
        Post.findOneAndDelete(reqPostId, (err) => {
            if (!err) {
                res.redirect("/");
            } else {
                console.log(err);
            }
        });
    });
});

app.listen(PORT, function() {
    console.log(`server started on port ${PORT}`);
});