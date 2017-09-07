Webpack Literacy Loader Example
===============================
Example Webpack configuration file in ``.js.rst`` format.

Webpack does not natively support ``webpack.config.js.rst``, instead a wrapper
is used which imports the Literacy require hook and then includes this file.
Webpack uses `node-interpret`_ for file extension handling when reading
``webpack.config`` files and Literacy isn't included for ``.js.rst`` files.

.. _node-interpret: https://github.com/js-cli/js-interpret

.. code-block:: javascript

    const path = require('path');

    module.exports = {

Load Literacy loader support for ``.js.rst`` files in Webpack.

.. code-block:: javascript

      resolveLoader: {
        modules: ['node_modules', 'node_modules/literacy/lib']
      },

Enable ``.js.rst`` requires without suffix.

.. code-block:: javascript

      resolve: {
        extensions: ['.js', '.json', '.js.rst']
      },

Include a rule in ``modules.exports.modules`` for handing ``.js.rst`` files.

.. code-block:: javascript

      module: {
        rules: [
          {
            test: /\.js\.rst/,
            use: [
              'eslint-loader',
              'literacy-loader',
            ]
          }
        ]
      },

We can now use ``.js.rst`` filenames where ``.js`` is accepted. For example, in
the ``modules.exports.entry`` entrypoint. Since the ``resolve.extensions`` has
been provided for ``.js.rst`` above, this line will work without the explicit
extension.

.. code-block:: javascript

      entry: './src/main',

The rest of the Webpack configuration is unchanged. Here we indicate that the
bundled files should be output to ``./dist/bundle.js``. After running
``yarn build`` the contents of this file can be inspected to see the ``.js.rst``
input content is present.

.. code-block:: javascript

      output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
      },

Run a development server with recompilation on page refresh.

.. code-block:: javascript

      devServer: {
        contentBase: path.resolve(__dirname, './src')
      },

Generate source maps to show original ``.rst.js`` files in browser debugger
tools.

.. code-block:: javascript

      devtool: 'source-map'
    };
