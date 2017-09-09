Utility Functions
-----------------

Recursive Directory Enumeration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Since input paths may be directories, we need to be able to enumerate the
contents of directories recursively.

.. code-block:: javascript

    const fs = require('fs-extra');
    const dir = require('node-dir');

    module.exports.recursivelyEnumerate = function recursivelyEnumerate(filename) {
      let expanded = [ filename ];
      if (fs.statSync(filename).isDirectory()) {
        expanded = dir.files(filename, { sync: true });
      }

      return expanded;
    };


Glob Expansion
~~~~~~~~~~~~~~
Paths may be specified using glob_ wildcard syntax. Expand the provided inputs
to an array of non-wildcard paths.

.. _glob: https://github.com/isaacs/node-glob

.. code-block:: javascript

    const glob = require('glob');
    const uniq = require('lodash/uniq');

    module.exports.expand = function expand(paths) {
      const output = [];

      paths.forEach(path => {
        const expanded = glob.sync(path);

If the path does not expand, include it unchanged. Otherwise add the expansions
to the output list.

.. code-block:: javascript

        if (expanded.length === 0) {
          output.push(path);
        } else {
          output.push(...expanded);
        }
      });

Take only the unique results since the wildcard patterns may match an
individual path multiple times.

.. code-block:: javascript

      return uniq(output);
    };
