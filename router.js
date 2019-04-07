const bodyParser = require('body-parser');

module.exports = [
    bodyParser.urlencoded({ extended: false }),
    bodyParser.json(),
    'auth',
    'products',
    /* global error handler */
];