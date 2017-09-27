# ![Literary](https://raw.githubusercontent.com/woofwoofinc/literacy/master/src/assets/title.png)

[![NPM](https://img.shields.io/npm/v/literacy.svg)](https://www.npmjs.com/package/literacy)
[![Build Status](https://travis-ci.org/woofwoofinc/literacy.svg?branch=master)](https://travis-ci.org/woofwoofinc/literacy)
[![License](https://img.shields.io/badge/license-Apache--2.0%20OR%20MIT-blue.svg)](https://github.com/woofwoofinc/literacy#license)

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
file and output to a file.

    $ literacy examples/blocks.js.rst --out-file blocks.js

The `.js.rst` or `.json.rst` files from an entire source directory can be
processed and output to another directory retaining the relative path prefixes.
This doesn’t overwrite any other files or directories in the output. Use
`-out-dir` to specify an output directory.

    $ literacy --out-dir lib src

To also copy the files which are not `.js.rst` or `.json.rst` files from the
source directory to the output directory, include the `--copy-files` option.

    $ literacy --copy-files --out-dir lib src

For other command options and usage, use `--help`.

    $ literacy --help
    
    Literate programming in JavaScript using reStructured Text. This command
    extracts code blocks from `.js.rst` and `.json.rst` reStructured Text files.
    
    Usage: literacy [options] <paths>
    
    Options:
      -o, --out-file    Compile to an output file                           [string]
      -d, --out-dir     Compile to an output directory                      [string]
      -D, --copy-files  Copy non-js.rst files to output directory          [boolean]
      -s, --source-maps Generate source maps for output files              [boolean]
      -q, --quiet       Suppress messages                                  [boolean]
      -h, --help        Show help                                          [boolean]
      -v, --version     Show version number                                [boolean]

Projects which incorporate Literacy can combine documentation and source trees
into a single reStructured Text document. See [src] in this project for an
example. There, the `index.rst` file is the entry point for the documentation
and includes the source `.js.rst` files from `src/js` into the document. These
source files are also separately processed by the Literacy command line tool to
make the `lib` module directory contents for publishing to the NPM registry.


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
A Webpack loader is provided for integrating Literacy with Webpack to support
`.js.rst` processing. See the example project included at
`example/webpack-literacy`.

See the [loader] directories or the [NPM Webpack loader] documentation for
details.

[loader]: loader
[NPM Webpack loader]: https://www.npmjs.com/package/literacy-loader


Developing
----------
The project build stack uses [Node.js] and the [Yarn] package manager. Install
these on your system if they are not already available.

[Node.js]: https://nodejs.org
[Yarn]: https://yarnpkg.com

A [rkt] container build script is included in the project repository and
provides an installation which can be used to build the project also. See the
description on building and running the container in the Development Tools
Container section of the documentation for more information.

[rkt]: https://coreos.com/rkt

For macOS, [RktMachine] provides a CoreOS VM which supports developing using
the rkt container system.

[RktMachine]: https://github.com/woofwoofinc/rktmachine

Start by installing [Literacy] and the other project dependencies using
Yarn.

[Literacy]: https://github.com/woofwoofinc/literacy

    $ yarn

Then build the project:

    $ yarn build

If you want to help extend and improve this project, then your contributions
would be greatly appreciated. Check out our [GitHub issues] for ideas or a
place to ask questions. Welcome to the team!

[GitHub issues]: https://github.com/woofwoofinc/literacy/issues


License
-------
This work is dual-licensed under the Apache License, Version 2.0 and under the
MIT Licence.

You may license this work under the Apache License, Version 2.0.

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

Alternatively, you may license this work under the MIT Licence at your option.

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
