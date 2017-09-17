Register ``.js.rst`` File Extension
-----------------------------------
Intercept Node module loading for filenames ending in ``.js.rst`` or
``.json.rst``. This allows ``.js.rst`` and ``.json.rst`` files to be passed to
``require`` calls without including the suffix.

Implementation is copied from `register.coffee`_ in CoffeeScript and is similar
to `babel-register`_.

.. _register.coffee: https://github.com/jashkenas/coffeescript/tree/master/src/register.coffee
.. _babel-register: https://github.com/babel/babel/tree/master/packages/babel-register

The implementation uses the ``require.extensions`` global in Node. Setting a
key in this dictionary adds Node handling for new file extensions. The key is
the file suffix string to support, the value is a function to call to load and
process the file.

But ``require.extenions`` has been deprecated in Node because there is the
potential for conflicts when a suffix is used by two modules simultaneously.
It also encourages the offloading of compilation to runtime instead of build
time.

Strictly speaking it should not be used. However:

- Only this module uses ``.js.rst`` and ``.json.rst`` suffixes.
- The Node module containing the ``require.extensions`` implementation is
  locked so Node is committed to keeping the current form indefinitely.
- Production use cases are encouraged to precompile ``.js.rst`` and
  ``.json.rst`` sources.

For ``.js.rst`` loads, read the file contents and use the parser defined in
``index.js.rst`` to extract the JavaScript codeblocks from the reStructured
Text. This material is passed to ``module._compile`` for compilation and
incorporation into the running environment.

.. code-block:: javascript

    const literacy = require('./index.js');

    function loadJsRstFile(module, filename) {
      const javaScript = literacy.fromFile(filename).content;
      module._compile(javaScript, filename);
    }

Add this ``.js.rst`` file extension handler to ``require.extensions``.

.. code-block:: javascript

    if (require.extensions) {
      require.extensions['.js.rst'] = loadJsRstFile;
    }

Similarly for ``.json.rst`` files except parse the JSON content instead of
passing it to ``module._compile``.

.. code-block:: javascript

    function loadJsonRstFile(module, filename) {
      const json = literacy.fromFile(filename).content;
      module.exports = JSON.parse(json);
    }

    if (require.extensions) {
      require.extensions['.json.rst'] = loadJsonRstFile;
    }

This is not enough unfortunately since although the ``.js.rst`` and
``.json.rst`` extensions are registered, the Node module loader isn't able to
handle multi-part extensions. For this, we follow CoffeeScript in reimplementing
Module::load to support multi-part extension handling.

    "This is a horrible thing that should not be required."

Start by determining the best extension choice from the filename where best is
the file extension with the most parts.

There is also the edge case of dotfiles to handle, i.e. a leading dot in the
filename is legitimate.

Note although there is only one multi-part extension, we cannot simply test
for it and then use the existing single-part extension implementation in Node
for everything else. This is because other modules may have added multi-part
extension implementations too. A specific test approach here would break these
other modules.

This implementation follows the CoffeeScript directly.

.. code-block:: javascript

    const path = require('path');
    const Module = require('module');

    function findExtension(filename) {
      const extensions = path.basename(filename).split('.');

Remove the initial dot from dotfiles. This means there can be filenames
consisting entirely of an extension, e.g. the ``.js.rst`` case is handled by
trimming the initial ``.`` and then putting it back before the test into
``Module._extensions[...]``.

.. code-block:: javascript

      if (extensions[0] === '') {
        extensions.shift();
      }

Start with the longest possible extension and work towards the shortest.

.. code-block:: javascript

      while (extensions.shift()) {
        const current = `.${ extensions.join('.') }`;

        if (Module._extensions[current]) {
          return current;
        }
      }

Default to the '.js' file handler if nothing more specific is registered.

.. code-block:: javascript

      return '.js';
    }

Now we have ``findExtension``, finish by patching the module load itself.
This involves adding the file directory path to the Node module paths list
and calling the extension handler for the file.

See the Node implementation of `Module.prototype.load`_ for comparison. It is
identical save for the ``findExtension`` amendment.

.. _Module.prototype.load: https://github.com/nodejs/node/blob/c83d9bbffbe879f9d67f72c14213139616ec4302/lib/module.js#L497

.. code-block:: javascript

    const assert = require('assert').ok;
    const debug = Module._debug;

    if (require.extensions) {
      Module.prototype.load = function load(filename) {
        debug('load %j for module %j', filename, this.id);

        assert(!this.loaded);
        this.filename = filename;
        this.paths = Module._nodeModulePaths(path.dirname(filename));

        const extension = findExtension(filename);
        Module._extensions[extension](this, filename);

        this.loaded = true;
      };
    }
