var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Review = require('./Reviews');

mongoose.connect(process.env.DB);
//mongoose.connect('mongodb://localhost/hw3db');


const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Thriller", "Western"];


var ActorSchema = new Schema({
    actorName: {type: String, required: true},
    characterName: {type: String, required: true},
})

// movie schema
var MovieSchema = new Schema({
    title: { type: String, required: true, unique: true },
    year: { type: Number, min: 1900, max: 2018, required: true},
    genre: { type: String, required: true, enum: GENRES},
    //genre: ['Action','Adventure','Comedy','Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western'],
    // actorName: [{type: String, required: true}],
    // characterName: [{ type: String, required: true}]
    imageURL: String,
    avgRating: Number,
    actors : {type: [ActorSchema]}
    //reviews : {type: [ReviewSchema]}
});

MovieSchema.pre('save', function(next) {
    if(this.actors.length < 3){
        return next(new Error('Fewer than 3 actors'));
    }
    // console.log(genre.indexOf(this.genre))
    // if(genre.indexOf(this.genre) >= 0){
    //     return next(new Error('Genre does not match one of the specified genre --> Action,Adventure,Comedy,Drama,Fantasy,Horror,Mystery,Thriller,Western'));
    // }
    var movie = this;
    //movie.actors.push({actorName: 'joe', characterName: 'gijoe'});
    next();
});

// return the model
// module.exports = mongoose.model('Actor', ActorSchema);
module.exports = mongoose.model('Movie', MovieSchema);
