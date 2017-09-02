# ![Literary](https://raw.githubusercontent.com/woofwoofinc/literacy/master/src/assets/title.png)

[![License](https://img.shields.io/badge/license-Apache--2.0%20OR%20MIT-blue.svg)](https://github.com/woofwoofinc/literacy#license)
[![NPM](https://img.shields.io/npm/v/literacy.svg)](https://www.npmjs.com/package/literacy)

Literate programming in JavaScript using [reStructuredText].

[reStructuredText]: http://docutils.sourceforge.net/rst.html

Detailed documentation is provided in the [src] directories and at
[woofwoofinc.github.io/literacy].

[src]: src
[woofwoofinc.github.io/literacy]: https://woofwoofinc.github.io/literacy


Installing
----------
Literacy is distributed using NPM. See the latest details at the
[Literacy NPM registry page].

[Literacy NPM registry page]: https://www.npmjs.com/package/literacy

Add it to an existing project:

    npm install --save literacy
    
Or with [Yarn]:

    yarn add literacy
    
[Yarn]: https://yarnpkg.com


Usage
-----
Use the `literacy` command to extract the code blocks from a single `.js.rst`
file and output them to stdout.

    $ literacy examples/blocks.js.rst

Multiple file paths and even directories can be specified in the command line.

    $ literacy examples/blocks.js.rst examples/basic.js.rst src

To output to a file, use `--out-file`.

    $ literacy examples/blocks.js.rst --out-file blocks.js

The `.js.rst` files from an entire source directory can be processed and output
to another directory retaining the relative path prefixes. This doesn’t
overwrite any other files or directories in the output. Use `-out-dir` to
specify an output directory.

    $ literacy --out-dir lib src

To also copy the files which are not `.js.rst` files from the source directory
to the output directory, include the `--copy-files` option.

    $ literacy --copy-files --out-dir lib src

For other command options and usage, use `--help`.

    $ literacy --help
    
    Literate programming in JavaScript using reStructuredText. This command extracts
    code blocks from `.js.rst` reStructuredText files.
    
    Usage: bin/literacy.js [options] <paths>
    
    Options:
      -o, --out-file    Compile to a single output file                     [string]
      -d, --out-dir     Compile to an output directory                      [string]
      -D, --copy-files  Copy non-js.rst files to output directory          [boolean]
      -q, --quiet       Suppress messages                                  [boolean]
      -h, --help        Show help                                          [boolean]
      -v, --version     Show version number                                [boolean]


Require Hook
------------
For non-production use cases there is a require hook for including `.js.rst`
files without specifying the suffix. This can be convenient for developing in
source trees which use the `literacy` command to compile to `.js` files since
the transpilation step can be omitted.

Using a require hook in production code is not recommended practice.

To use the hook, require it from the development run harness, e.g. inside a
wrapper Yarn/NPM script.

    require('literacy/lib/register');

Then require `.js.rst` files as if they were `.js` files. The hook takes care
of intercepting the extension and performing the JavaScript code block
extraction before handing it to the Node module compiler.


Webpack Loader
--------------
Literacy can be integrated with Webpack to support `.js.rst` processing. See the
example project included at `example/webpack-literacy`.

To incorporate Literacy into an existing Webpack project, first add the Literacy
dependencies to the Webpack project.

    npm install --save literacy
    
Or with Yarn:

    yarn add literacy

There isn't a separate module in the NPM registry for `literacy-loader`, it's
included in the main `literacy` module. This means that Webpack needs to know
where to resolve the loader before it can be used. For this, add the path to the
`libs` directory in `literacy` to `modules.exports.resolveLoader.modules` in
`webpack.config.js`.

    // Load Literacy loader support for `.js.rst` files in Webpack.
    resolveLoader: {
      modules: ['node_modules', 'node_modules/literacy/lib']
    }

Webpack does not allow the `require.extension` hook so requiring `.js.rst`
modules needs the file extension to be provided. Extensionless require can be
enabled by adding `.js.rst` to the Webpack `modules.exports.resolve.extensions
list.

    // Enable `.js.rst` requires without suffix.
    resolve: {
      extensions: ['.js', '.json', '.js.rst']
    }  

Include a rule in `modules.exports.modules` for handing `.js.rst` files.

    module: {
      rules: [
        {
          test: /\.js\.rst/,
          use: [
            'literacy-loader'
          ]
        }
      ]
    }

And we can now use `.js.rst` filenames where `.js` was used previously. For
example, in the `modules.exports.entry` entrypoint.

    entry: './src/index.js.rst'
    
If the `resolve.extensions` has been provided for `.js.rst`, then this line
will work without the explicit extension.

    entry: './src/index'


License
-------
This work is dual-licensed under the Apache License, Version 2.0 and under the
MIT Licence.

You may licence this work under the Apache License, Version 2.0.

    Copyright 2017 Woof Woof, Inc. contributors

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

Alternatively, you may licence this work under the MIT Licence at your option.

    Copyright (c) 2017 Woof Woof, Inc. contributors

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

The license explainers at [Choose a License] may be helpful. They have
descriptions for both the [Apache 2.0 Licence] and [MIT Licence] conditions.

[Choose a License]: http://choosealicense.com
[Apache 2.0 Licence]: http://choosealicense.com/licenses/apache-2.0/
[MIT Licence]: http://choosealicense.com/licenses/mit/


Contributing
------------
Please note that this project is released with a [Contributor Code of Conduct].
By participating in this project you agree to abide by its terms. Instances of
abusive, harassing, or otherwise unacceptable behavior may be reported by
contacting the project team at woofwoofinc@gmail.com.

[Contributor Code of Conduct]: src/conduct.rst

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
