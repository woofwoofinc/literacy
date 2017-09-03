//
// Wrapper Webpack configuration file to load from .js.rst instead.
//

// Load Literacy support for `.js.rst` files in Node.
require('literacy/lib/register');

module.exports = require('./webpack.config.js.rst');
