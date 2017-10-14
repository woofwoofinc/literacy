# ![Literary](https://raw.githubusercontent.com/woofwoofinc/literacy/master/src/assets/title.png)

[![License](https://img.shields.io/badge/license-Apache--2.0%20OR%20MIT-blue.svg)](https://github.com/woofwoofinc/literacy#license)
[![NPM](https://img.shields.io/npm/v/literacy-loader.svg)](https://www.npmjs.com/package/literacy-loader)

Webpack loader for [Literacy].

Detailed documentation is provided at [woofwoofinc.github.io/literacy].

[Literacy]: https://www.npmjs.com/package/literacy
[woofwoofinc.github.io/literacy]: https://woofwoofinc.github.io/literacy


Installing
----------
Literacy Loader is distributed using NPM. See the latest details at the
[Literacy Loader NPM registry page].

[Literacy Loader NPM registry page]: https://www.npmjs.com/package/literacy-loader

Add it to an existing project:

    npm install --save literacy-loader
    
Or with [Yarn]:

    yarn add literacy-loader
    
[Yarn]: https://yarnpkg.com


Usage
-----
See the example project included at `/example/webpack-literacy`.

To incorporate Literacy into an existing Webpack project, first add the Literacy
loader to the Webpack project as described in the Installing section above.

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
          test: /\.js\.rst$/,
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
