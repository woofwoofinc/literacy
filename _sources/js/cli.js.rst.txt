Command Line Interface
======================
The Literacy command line interface for compiling ``.js.rst`` and ``.json.rst``
files. Use this for production environments to pre-generate JavaScript files
from reStructured Text code blocks instead of incorporating the require hook.

.. code-block:: javascript

    const literacy = require('./index');


Option Handling
---------------
The command line interface uses Yargs_ for option parsing, basic validation, and
help. The options and names follow the `babel-cli`_ tool.

.. _Yargs: http://yargs.js.org
.. _babel-cli: https://babeljs.io/docs/usage/cli

.. code-block:: javascript

    const argv = require('yargs')
      .usage(
        '\n' +
        'Literate programming in JavaScript using reStructured Text. This ' +
        'command extracts code blocks from `.js.rst` and `.json.rst` ' +
        'reStructured Text files.\n' +
        '\n' +
        'Usage: $0 [options] <paths>'
      )

Require at least one input parameter. The Literacy command does not support
stdin processing. More than one input file or directory source may be used.

.. code-block:: javascript

      .demandCommand(1)

To specify output generation to a file use ``--out-file``.

.. code-block:: javascript

      .describe('out-file', 'Compile to an output file')
      .string('out-file')
      .alias('o', 'out-file')

To specify output generation to a directory ``--out-dir``.

.. code-block:: javascript

      .describe('out-dir', 'Compile to an output directory')
      .string('out-dir')
      .alias('d', 'out-dir')

When the input source is a directory, files other than ``.js.rst`` and
``.json.rst`` files are ignored. If the output is also a directory then it may
be desireable in a build workflow to copy these files verbatim instead of
ignoring them. This can be specified with the ``--copy-files`` flag.

.. code-block:: javascript

      .describe('copy-files', 'Copy unprocessed files to output directory')
      .boolean('copy-files')
      .alias('D', 'copy-files')

Option to generate source maps for output JavaScript files.

.. code-block:: javascript

      .describe('source-maps', 'Generate source maps for output files')
      .boolean('source-maps')
      .alias('s', 'source-maps')

Include a ``--quiet`` option to suppress the console messages when files are
written.

.. code-block:: javascript

      .describe('quiet', 'Suppress messages')
      .boolean('quiet')
      .alias('q', 'quiet')

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

Expand the input paths using glob expansion. This converts wildcard patterns to
path locations.

.. code-block:: javascript

    const utils = require('./utils');
    const inputs = utils.expand(argv._);


Validation
----------
Basic validation of flags is included in Yargs. While Yargs can be configured to
reject if two flags are present, the output message is not user-friendly. So we
use manual validation for the conflict case where ``--out-file`` and
``--out-dir`` are both present.

.. code-block:: javascript

    const errors = [];

    const outFileFlagPresent = typeof argv.outFile !== 'undefined';
    const outDirFlagPresent = typeof argv.outDir !== 'undefined';

    if (outFileFlagPresent && outDirFlagPresent) {
      errors.push('Cannot have --out-file and --out-dir.');
    }

One of ``--out-file`` or ``--out-dir`` is required.

.. code-block:: javascript

    if (!outFileFlagPresent && !outDirFlagPresent) {
      errors.push('Must have either --out-file or --out-dir.');
    }

Similarly, Yargs can detect when a flag is present without another flag which it
requires but the messaging is not user-friendly. So we use manual validation for
the case where ``--copy-files`` has been provided but not ``--out-dir``.

.. code-block:: javascript

    if (argv.copyFiles && !outDirFlagPresent) {
      errors.push('--copy-files requires --out-dir.');
    }

Verify the input paths exist.

.. code-block:: javascript

    const fs = require('fs-extra');

    inputs.forEach(input => {
      if (!fs.existsSync(input)) {
        errors.push(`${ input } not found.`);
      }
    });

Disallow multiple input files for the output file option. The Literacy
command line tool focuses on a single task, transpilation of ``.js.rst`` to
``.js``. For concatenation or minification, etc, use a follow-up build step.

The input must also be a ``.js.rst`` or ``.json.rst`` file, not a directory.

.. code-block:: javascript

    if (outFileFlagPresent) {
      if (inputs.length !== 1) {
        errors.push('Must have exactly one input file for --out-file.');
      } else if (fs.statSync(inputs[0]).isDirectory()) {
        errors.push('Input file cannot be a directory for --out-file.');
      } else if (!inputs[0].endsWith('.js.rst') && !inputs[0].endsWith('.json.rst')) {
        errors.push('Input file must be `.js.rst` or `.json.rst` for --out-file.');
      }
    }

None of these errors are recoverable so error out. Only need to specify a single
error cause for this.

.. code-block:: javascript

    if (errors.length > 0) {
      console.error(`ERROR: ${ errors[0] }`);
      process.exit(1);
    }


Compile Single File
-------------------
Compile a single file ``examples/blocks.js.rst`` and output to a file. Uses
``--out-file`` or ``-o`` for the output filename.

.. code-block:: bash

    literacy examples/blocks.js.rst --out-file blocks.js

Process the input file using the Literacy module and perform the output.

.. code-block:: javascript

    function transpileRstFile(inputFile, outputFile) {
      try {
        const output = literacy.fromFile(inputFile);

        fs.ensureFileSync(outputFile);
        fs.writeFileSync(outputFile, output.content);
        if (!argv.quiet) {
          console.log(`Output written to ${ outputFile }.`);
        }

        if (argv.sourceMaps) {
          fs.writeFileSync(`${ outputFile }.map`, output.sourceMap);
          console.log(`Source map written to ${ outputFile }.map.`);
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (outFileFlagPresent) {
      transpileRstFile(inputs[0], argv.outFile);
    }


Compile Directory
-----------------
Compile the ``.js.rst`` and ``.json.rst`` files from a source directory and
output to another directory. This doesn’t overwrite any other files or
directories in the output.

Use ``--out-file`` or ``-o`` for the output directory name.

.. code-block:: bash

    literacy --out-dir lib src

Compile multiple directories into the output.

.. code-block:: bash

    literacy --out-dir lib examples src

Can specify a combination of files, directories, and wildcards.

.. code-block:: bash

    literacy --out-dir lib examples/basic.js.rst src examples/webpack-literacy/**.js.rst

Processing of the output directory case has to take a different approach from
single file output since it is necessary to take account of filenames relative
to the input paths.

- If an individual file is specified as an input path, then it is processed and
  any output written to a file of the same name but at the root of the output
  directory hierarchy.
- In the case that the input path is a directory then there is a root from which
  to take relative paths. Each file under the input directory path is processed
  and any output written to a file under the output directory retaining any
  intermediate directories.

Start by defining how an individual file is handled. This includes the cases of
``.js.rst`` and ``.json.rst`` files, other files when ``--copy-files`` is
specified, and skipped files.

.. code-block:: javascript

    const path = require('path');

    function transpileFile(inputFile, relativeOutputFile) {
      try {

For ``.js.rst`` and ``.json.rst`` files, calculate the correct output filename
by joining the relative output filename to ``--out-dir`` and trimming ``.rst``
from the ``.js.rst`` or ``.json.rst`` suffix. Then use the single file
compilation code path.

.. code-block:: javascript

        let outputFile = path.join(argv.outDir, relativeOutputFile);

        if (inputFile.endsWith('.js.rst') || inputFile.endsWith('json.rst')) {
          outputFile = outputFile.slice(0, -4);
          transpileRstFile(inputFile, outputFile);

Copy non-``.js.rst`` files to the target location if ``--copy-files`` was
specified, otherwise skip.

.. code-block:: javascript

        } else if (argv.copyFiles) {
          fs.ensureFileSync(outputFile);
          fs.copySync(inputFile, outputFile);

          if (!argv.quiet) {
            console.log(`Output written to ${ outputFile }.`);
          }
        } else if (!argv.quiet) {
          console.log(`Skipped ${ inputFile }.`);
        }
      } catch (error) {
        console.log(error);
      }
    }

Handle each input path in turn.

.. code-block:: javascript

    if (outDirFlagPresent) {
      inputs.forEach(input => {

If the path is a directory path, then recursively enumerate the files in that
directory and process each individually taking care to calculate the relative
output path from the base input directory path.

.. code-block:: javascript

        if (fs.statSync(input).isDirectory()) {
          const filenames = utils.recursivelyEnumerate(input);

          filenames.forEach(filename => {
            transpileFile(filename, path.relative(input, filename));
          });

Otherwise the path is a file and can be processed directly with its basename as
the relative output path.

.. code-block:: javascript

        } else {
          transpileFile(input, path.basename(input));
        }
      });
    }
