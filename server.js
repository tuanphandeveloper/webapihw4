var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./Movies');
var Actor = require('./Movies');
var jwt = require('jsonwebtoken');
var Review = require('./Reviews');
var cors = require('cors');


var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(cors());

var router = express.Router();

router.route('/movie/:title')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.findOne({title: req.params.title}).exec(function(err, movie) {
            if (err) res.send(err);

            //var userJson = JSON.stringify(movie);
            // return that user
            if(req.query.reviews === "true"){
                Movie.aggregate([{
                    $lookup: {
                        from: "reviews",
                        localField: "title",
                        foreignField: "movie",
                        as: 'review'
                    }
                },
                    // {
                    //     $unwind:"$review"
                    // },
                    {
                        $match:{ title: movie.title }
                    }

                ], function (err, result) {
                    if(err) res.send(err);
                    else res.json(result);
                });
            } else {
                res.json(movie);
            }
        });
    });


router.route('/review')
    .post(authJwtController.isAuthenticated, function (req, res) {
        if(!req.body.movie){
            res.json({sucess: false, msg: 'Please pass movie'})
        }
        else if (!req.body.reviewer) {
            res.json({sucess: false, msg: 'Please pass reviewer'})
        }
        else if (!req.body.quote) {
            res.json({sucess: false, msg: 'Please pass opinion quote of movie'})
        }
        else if (!req.body.rate) {
            res.json({sucess: false, msg: 'Please pass rating(0 - 5)'})
        } else {
            Movie.findOne({title: req.body.movie}).select('title').exec(function (err, result) {
                if (err) {
                    res.send({success: false, msg: 'Please pass movie from the database'})
                    // var movieJson = JSON.stringify(movie);
                    // return that user
                    // res.json(movie)
                }else if(result){

                    var review = new Review(req.body)
                    review.movie = req.body.movie
                    review.reviewer = req.body.reviewer
                    review.quote = req.body.quote
                    review.rate = req.body.rate

                    review.save(function (err) {
                        if (err) {
                            return res.send(err);
                        }
                        res.json({message: 'review created!'});
                    });
                } else {
                    res.status(424);
                    res.json({message: 'Movie not found in database'})
                }
            });
        }
    });

router.route('/reviews')
    .get(authJwtController.isAuthenticated, function (req, res) {
        //.get( function (req, res) {
        //.get(function (req, res) {
        Review.find(function (err, reviews) {
            if (err) res.send(err);
            // return the movies
            res.json(reviews);
        });
    });

router.route('/movie')
    .post(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.title ||!req.body.year) {
            res.json({success: false, msg: 'Please pass title and year(1900 - 2018)'});
        } else {
            var movie = new Movie(req.body);
            movie.title = req.body.title;
            movie.year = req.body.year;
            movie.genre = req.body.genre;
            movie.imageURL = req.body.image;

            console.log(req.body.actor.length);
            if(req.body.actor.length >= 3 && req.body.actor.length == req.body.character.length){
                var i = 0;
                while(i < req.body.actor.length){
                    movie.actors.push({actorName: req.body.actor[i], characterName: req.body.character[i]})
                    console.log(req.body.actor[i]);
                    i++;
                }
            } else {
                return res.json({success: false, message: 'Please pass in at least 3 actors and a character for each actor. '});
            }
            // movie.actors.push({actorName: 'joe', characterName: 'gijoe'});
            // movie.actors.push({actorName: 'joe1', characterName: 'gijoe1'});

            // movie.actors.actorName = req.body.actor;
            // movie.actors.characterName = req.body.character;
            // movie.actorName = req.body.actor;
            // movie.characterName = req.body.character;

            //console.log(movie.actors[0].actorName);
            //movie.actors[0].characterName = req.body.character;
            // var actor = new Actor();
            // actor.actorName = req.body.actor1;
            // actor.characterName = req.body.character1;
            // console.log(movie.actorName);
            // console.log(movie.characterName);

            // console.log(req.body.actor[1]);
            // console.log(req.body.character);
            // console.log(movie.actors);

            // save the movie
            movie.save(function (err) {
                if (err) {
                    // duplicate entry
                    if (err.code == 11000)
                        return res.json({success: false, message: 'A movie with that title already exists. '});
                    else
                        //movie.actors.push({ name: actor.actorName});
                        return res.send(err);
                }
                //movie.genre.push('badGenre');
                res.json({message: 'movie created!'});
            });
        }
    });

router.route('/movie/:movieId')
    .put(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.movieId;
        Movie.findById(id, function(err, movieToRemove) {
            if (err) res.send(err);

            if (!req.body.title ||!req.body.year) {
                res.json({success: false, msg: 'Please pass title and year(1900 - 2018)'});
            } else {
                var movie = new Movie(req.body);
                movie.title = req.body.title;
                movie.year = req.body.year;
                movie.genre = req.body.genre;
                movie.imageURL = req.body.image;

                console.log(req.body.actor.length);
                if (req.body.actor.length >= 3 && req.body.actor.length == req.body.character.length) {
                    var i = 0;
                    while (i < req.body.actor.length) {
                        movie.actors.push({actorName: req.body.actor[i], characterName: req.body.character[i]})
                        console.log(req.body.actor[i]);
                        i++;
                    }
                } else {
                    return res.json({success: false, message: 'Please pass in at least 3 actors and a character for each actor. '});
                }
            }

        console.log(req.body.actor.length);

            // update the movie
            movie.save(function (err) {
                if (err) {
                    // duplicate entry
                    if (err)
                        return res.json(err);
                    else
                    //movie.actors.push({ name: actor.actorName});
                        return res.send(err);
                }
                movieToRemove.remove();
                //movie.genre.push('badGenre');
                res.json({message: 'movie updated!'});
            });
        });
    });

router.route('/movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var reviews = req.headers.reviews;
    //.get( function (req, res) {
        //.get(function (req, res) {
        Movie.find(function (err, movies) {
            if (err) res.send(err);
            // return the movies
            if(req.query.reviews === 'true'){
                Movie.aggregate([{
                    $lookup:{
                        from: "reviews",
                        localField: "title",
                        foreignField: "movie",
                        as: 'review'
                    }
                }
                ], function (err, result) {
                    if(err) res.send(err);
                    else res.json(result);
                });
            } else {
                res.json(movies);
            }
        });
    });
/*
router.route('/movie/:movieId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.movieId;
        var review = req.headers.reviews;
        Movie.findById(id, function (err, movie) {
            if (err) res.send(err);

            // var movieJson = JSON.stringify(movie);
            // return that user
            if(req.query.reviews === "true"){
                Movie.aggregate([{
                    $lookup: {
                        from: "reviews",
                        localField: "title",
                        foreignField: "movie",
                        as: 'review'
                    }
                },
                    // {
                    //     $unwind:"$review"
                    // },
                    {
                        $match:{ title: movie.title }
                    }

                ], function (err, result) {
                    if(err) res.send(err);
                    else res.json(result);
                });
            } else {
                res.json(movie);
            }
        });

    })
*/
router.route('/deletemovie/:movieId')
    .delete(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.movieId;
        Movie.findById(id, function (err, movie) {
            if (err) res.send(err);

            movie.remove();
            // var movieJson = JSON.stringify(movie);
            // return that user
            res.json('movie removed');
        });
    });


router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/post')
    .post(function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
    //.get( function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
    //.get(function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, name: user.name, username: user.username, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        });


    });
});

app.use('/', router);
app.listen(process.env.PORT || 8080);
