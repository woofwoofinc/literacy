#!/usr/bin/env node

// Add the `.js.rst` file extension hook so can require `cli.js.rst` directly.
require('../src/register');

require('../src/cli');
