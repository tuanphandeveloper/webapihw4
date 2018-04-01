var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// Review schema
var ReviewSchema = new Schema({
    movie: { type: String, required: true },
    reviewer: { type: String, required: true },
    quote: { type: String, required: true },
    rate : { type: Number, min: 0, max: 5, required: true }
});

ReviewSchema.pre('save', function(next) {
    var review = this;
    next();
});

// return the model
// module.exports = mongoose.model('Actor', ActorSchema);
module.exports = mongoose.model('Review', ReviewSchema);