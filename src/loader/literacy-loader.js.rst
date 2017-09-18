Webpack Loader
==============
Webpack_ is a extensible JavaScript module bundler. It can be configured with
custom loaders_ to support loading filetypes which are not natively supported.

.. _Webpack: https://webpack.js.org
.. _loaders: https://webpack.github.io/docs/loaders.html

We use this mechanism to support the use of Literacy and ``.js.rst`` files in
Webpack projects. See the example project at ``/examples/webpack-literacy`` for
details.

.. code-block:: javascript

    const literacy = require('literacy');

The Webpack documentation on `writing loaders`_ outlines how to implement a new
loader. For a case like ``.js.rst`` the implementation only needs a function to
process ``.js.rst`` file content to the desired form, e.g. to run the main
Literacy module operation.

.. _writing loaders: https://webpack.js.org/development/how-to-write-a-loader

.. code-block:: javascript

    const path = require('path');

    module.exports = function exports(content) {
        if (this.cacheable) {
          this.cacheable();
        }

Determine the Webpack input filename from the context and resource path so that
it can be passed to the Literacy generator. An input filename is needed in order
to create source maps.

.. code-block:: javascript

        const inputFilename = path.relative(this.context, this.resourcePath);
        const output = literacy.fromFileContents(inputFilename, content);

        this.callback(null, output.content, output.sourceMap);
    };
