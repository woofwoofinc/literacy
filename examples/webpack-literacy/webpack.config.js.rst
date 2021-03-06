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
    const CopyWebpackPlugin = require('copy-webpack-plugin');

Use UglifyJS to perform minification. This results in significant savings.

.. code-block:: javascript

    const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

Enable ``.js.rst`` requires without suffix.

.. code-block:: javascript

    module.exports = {
      resolve: {
        extensions: ['.js', '.json', '.js.rst']
      },

Include a rule in ``module.rules`` for handing ``.js.rst`` files. Run the source
code through ESLint and Babel.

.. code-block:: javascript

      module: {
        rules: [
          {
            test: /\.js\.rst$/,
            use: [
              'babel-loader',
              'eslint-loader',
              'literacy-loader',
            ]
          }
        ]
      },

We can now use ``.js.rst`` filenames where ``.js`` is accepted. For example, in
the ``module.exports.entry`` entrypoint. Since the ``resolve.extensions`` has
been provided for ``.js.rst`` above, this line will work without the explicit
extension.

.. code-block:: javascript

      entry: './main',

The rest of the Webpack configuration is unchanged. Here we indicate that the
bundled files should be output to ``./dist/bundle.js``. After running
``yarn build`` the contents of this file can be inspected to see the ``.js.rst``
input content is present.

.. code-block:: javascript

      context: path.resolve(__dirname, './src'),
      output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
      },

CopyWebpackPlugin to copy ``index.html`` to the output directory.

.. code-block:: javascript

      plugins: [
        new CopyWebpackPlugin([
          { from: 'index.html' }
        ]),

And for UglifyJS minification.

.. code-block:: javascript

        new UglifyJsPlugin({
          sourceMap: true
        }),
      ],

Generate source maps to show original ``.rst.js`` files in browser debugger
tools.

.. code-block:: javascript

      devtool: 'source-map'
    };
