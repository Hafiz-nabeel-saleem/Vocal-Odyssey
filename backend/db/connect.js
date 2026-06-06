const mongoose = require('mongoose');

const connect = (uri) => {
    return mongoose.connect(uri)
        .then(value => console.log('Connected to DB'))
        .catch(err => console.log(err));
}

module.exports = connect;
