Command Line Interface
----------------------
The Literacy command line interface for compiling ``.js.rst`` files. Use this
for production environments to pre-generate JavaScript files from ``.js.rst``
code blocks instead of incorporating the require hook.

.. code-block:: javascript

    'use strict';

    const literacy = require('./index');


Option Handling
~~~~~~~~~~~~~~~
The command line interface uses Yargs_ for option parsing, basic validation, and
help. The options and names follow the `babel-cli`_ tool.

.. _Yargs: http://yargs.js.org
.. _babel-cli: https://babeljs.io/docs/usage/cli

.. code-block:: javascript

    const argv = require('yargs')
      .usage(
        '\n' +
        'Literate programming in JavaScript using reStructuredText. This ' +
        'command extracts code blocks from \`.js.rst\` reStructuredText ' +
        'files.\n' +
        '\n' +
        'Usage: $0 [options] <paths>'
      )

Require at least one input parameter. The Literacy command does not support
stdin processing. More than one input file or directory source may be used.

.. code-block:: javascript

      .demandCommand(1)

To specify output generation to a single file use ``--out-file``.

.. code-block:: javascript

      .describe('out-file', 'Compile to a single output file')
      .string('out-file')
      .alias('o', 'out-file')

To specify output generation to a directory ``--out-dir``.

.. code-block:: javascript

      .describe('out-dir', 'Compile to an output directory')
      .string('out-dir')
      .alias('d', 'out-dir')

When the input source is a directory, files other than ``.js.rst`` files are
ignored. If the output is also a directory then it may be desireable in a build
workflow to copy these files verbatim instead of ignoring them. This can be
specified with the ``--copy-files`` flag.

.. code-block:: javascript

      .describe('copy-files', 'Copy non-js.rst files to output directory')
      .boolean('copy-files')
      .alias('D', 'copy-files')

Add help and version option handling.

.. code-block:: javascript

      .help()
      .alias('h', 'help')

      .version()
      .alias('v', 'version')

Now that the options are defined, run the Yargs processor over the command
inputs to produce an object with the flag settings and values.

.. code-block:: javascript

      .argv;


Input Path Wildcard Expansion
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Paths may be specified using glob_ wildcard syntax. Expand the provided inputs
to an array of non-wildcard paths.

.. _glob: https://github.com/isaacs/node-glob

.. code-block:: javascript

    const glob = require('glob');

    let filenames = []

    argv._.forEach(function(input) {
      let expanded = glob.sync(input);

      if (expanded.length == 0) {
        // The input path does not expand, include it unchanged.
        filenames.push(input);
      } else {
        // Otherwise just include the expansions.
        filenames.push(...expanded);
      }
    });

Take only the unique results since the wildcard patterns may match an
individual path multiple times.

.. code-block:: javascript

    const uniq = require('lodash/uniq');

    filenames = uniq(filenames);


Validation
~~~~~~~~~~
Basic validation of flags is included in Yargs. While Yargs can be configured to
reject if two flags are present, the output message is not user-friendly. So we
use manual validation for the conflict case where ``--out-file`` and
``--out-dir`` are both present.

.. code-block:: javascript

    const errors = [];

    const outFileFlagPresent = typeof argv.outFile !== 'undefined';
    const outDirFlagPresent = typeof argv.outDir !== 'undefined';

    if (outFileFlagPresent && outDirFlagPresent) {
      errors.push("Cannot have --out-file and --out-dir.");
    }

Similarly, Yargs can detect when a flag is present without another flag which it
requires but the messaging is not user-friendly. So we use manual validation for
the case where ``--copy-files`` has been provided but not ``--out-dir``.

.. code-block:: javascript

    if (argv['copy-files'] && !outDirFlagPresent) {
      errors.push("--copy-files requires --out-dir.");
    }

Verify the input paths exist.

.. code-block:: javascript

    const fs = require('fs-extra');

    filenames.forEach(function(filename) {
      if (!fs.existsSync(filename)) {
        errors.push(`${filename} not found.`);
      }
    });

None of these errors are recoverable so we error out. We only need to specify a
single error cause for this.

.. code-block:: javascript

    if (errors.length) {
      console.error(`ERROR: ${errors[0]}`);
      process.exit(1);
    }


File Utilities
~~~~~~~~~~~~~~
Since input paths may be directories, it is necessary to be able to enumerate
the contents of directories recursively.

.. code-block:: javascript

    const dir = require('node-dir');

    function enumerate(filename) {
      let expanded = [filename];
      if (fs.statSync(filename).isDirectory()) {
        expanded = dir.files(filename, {sync: true});
      }

      return expanded;
    }

A version of this which takes a list of input filenames is needed for the
multiple input cases.  Since there may be nesting of input paths, it is
necessary to calculate a full list of files first and only output the unique
entries.

.. code-block:: javascript

    function enumerateAll(filenames) {
      let all = [];

      filenames.forEach(function(filename) {
        let expanded = enumerate(filename);
        all.push(...expanded);
      });

      return uniq(all);
    }

It is also convenient to test if a file has a ``.js.rst`` suffix.

.. code-block:: javascript

    function hasJsRstExtension(filename) {
      return filename.endsWith('.js.rst');
    }


Compile File(s)
~~~~~~~~~~~~~~~
Compile a single file ``examples/blocks.js.rst`` and output to stdout.

.. code-block:: bash

    literacy examples/blocks.js.rst

Compile multiple files and output to stdout.

.. code-block:: bash

    literacy examples/basic.js.rst examples/blocks.js.rst

Can specify a directory containing files also.

.. code-block:: bash

    literacy examples

To output to a file, use ``--out-file`` or ``-o``.

.. code-block:: bash

    literacy examples/blocks.js.rst --out-file blocks.js

Compile multiple files into output.

.. code-block:: bash

    literacy examples/basic.js.rst examples/blocks.js.rst --out-file examples.js

Can specify a directory containing files also.

.. code-block:: bash

    literacy examples --out-file examples.js

All of these cases can be handled together by first expanding the input paths
using recursive directory enumeration. Only ``.js.rst`` files are included in
the output.

.. code-block:: javascript

    if (!outDirFlagPresent) {
      const inputs = enumerateAll(filenames);
      const filtered = inputs.filter(hasJsRstExtension);

      const outputs = filtered.map(function(filename) {
        return literacy.fromFile(filename);
      });

      const output = outputs.join('\n') + '\n';

The single combined output file and stdout output cases differ only in where the
generated JavaScript is written.

.. code-block:: javascript

      if (outFileFlagPresent) {
        try {
          fs.writeFileSync(argv.outFile, output);
        } catch(err) {
          return console.log(err);
        }

        console.log(`Output written to ${argv.outFile}.`);
      } else {
        console.log(output);
      }
    }


Compile to Output Directory
~~~~~~~~~~~~~~~~~~~~~~~~~~~
Compile the ``.js.rst`` files from a source directory and output to another
directory. This doesn’t overwrite any other files or directories in the output.

.. code-block:: bash

    literacy --out-dir lib src

Processing of the output directory case has to take a different approach from
that above since it is necessary to take account of filenames relative to the
input paths.

- If an individual file is specified as an input path, then it is processed and
  any output written to a file of the same name but at the root of the output
  directory hierarchy.
- In the case that the input path is a directory then there is a root from which
  to take relative paths. Each file under the input directory path is processed
  and any output written to a file under the output directory retaining any
  intermediate directories.

Start by defining the processing operation on an individual file. Once we know
the input filename and the relative destination path, then we just need to use
Literacy to convert the file if it is ``.js.rst``. If not, we copy the file to
the target location if ``--copy-files`` was specified.

The final output filename is generated joining to ``--out-dir`` and trimming the
``.rst`` from ``.js.rst``.

.. code-block:: javascript

    const path = require('path');

    function process(inputFile, relativeOutputFile) {
      try {
        if (hasJsRstExtension(inputFile) || argv.copyFiles) {
          let outputFile = path.join(argv.outDir, relativeOutputFile);
          if (hasJsRstExtension(inputFile)) {
            outputFile = outputFile.slice(0, -4);
          }

          fs.ensureFileSync(outputFile);

          if (hasJsRstExtension(inputFile)) {
            const output = literacy.fromFile(inputFile) + '\n';
            fs.writeFileSync(outputFile, output);
          } else if (argv.copyFiles) {
            fs.copySync(inputFile, outputFile);
          }

          console.log(`Output written to ${outputFile}.`);
        }
      } catch (err) {
        return console.log(err);
      }
    }

Process each input path in turn.

.. code-block:: javascript

    if (outDirFlagPresent) {
      filenames.forEach(function(filename) {

If the path is a directory path, then recursively enumerate the files in that
directory and process each individually taking care to calculate the relative
output path from the base input directory path.

.. code-block:: javascript

        if (fs.statSync(filename).isDirectory()) {
          let files = enumerate(filename);

          files.forEach(function(filename) {
            process(filename, path.relative(path.dirname(filename), filename));
          });

Otherwise the path is a file and can be processed directly with its basename as
the relative output path.

.. code-block:: javascript

        } else {
          process(filename, path.basename(filename));
        }
      });
    }

