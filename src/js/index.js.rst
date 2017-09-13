Literacy
========
Literate programming in JavaScript using reStructuredText.

Support converting string content from reStructuredText format to JavaScript.
This parses the parameter file contents as a ``.js.rst`` file and returns the
JavaScript blocks concatenated together with a sourcemap.

.. code-block:: javascript

    const parser = require('./parser');
    const sourcemap = require('source-map');

    module.exports.fromFileContents = function fromFileContents(inputFilename, input) {

Start a `source maps`_ for the output. The Literacy ``.js.rst`` file format is
impractical without access to debugger tools or stacktrace line number
translation so source maps are essential.

.. _source maps: https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

Uses the `Mozilla source map module`_ to generate line based source maps.
Accurate correspondence is sufficiently granular at line-level. Calculating line
and column correspondence is complicated since the input file is detabbed for
convenience during parsing.

.. _Mozilla source map module: https://github.com/mozilla/source-map

.. code-block:: javascript

      const sourceMapGenerator = new sourcemap.SourceMapGenerator({
        file: inputFilename,
      });

      sourceMapGenerator.setSourceContent(inputFilename, input);

Now, parse the input file contents and use the parser output blocks to select
the lines which should be interpreted as JavaScript and collect these for output.

This will require some tracking state.

.. code-block:: javascript

      const parsed = parser(input);

      const output = [];
      let outputLineNumber = 0;

      let indent = 0;
      let inJavaScript = false;

Any non-blank lines with text should be considered JavaScript if they follow
one of the marker directive start lines and have an indentation level which is
greater than the directive start line. The first line with an indentation level
the same as or less than the marker directive line terminates the line
inclusions for that directive line.

Scan the line classification blocks in turn.

.. code-block:: javascript

      parsed.forEach(line => {

Do the directive end condition first. We need to be already in a JavaScript
block and the current line must have an indentation level less than or equal to
the directive line.

Note that blank lines are not given an ``indent`` indentation level in the
parser. This means they are ignored for the purposes of concluding a JavaScript
directive block.

.. code-block:: javascript

        if (inJavaScript && typeof line.indent !== 'undefined' && line.indent <= indent) {
          inJavaScript = false;
          indent = 0;
        }

If the current line classification is for a marker directive line, set
tracking state to indicate we are currently in a JavaScript block.

.. code-block:: javascript

        if (line.type === 'javascript') {
          inJavaScript = true;
          indent = line.indent;
        }

If we are currently in a JavaScript block and the line has text then include
that into the output. Note that the directive lines themselves are not given a
``text`` property in the parser so they don't contribute to the output here.
Blank lines have text consisting of an empty line so they are included in the
generated JavaScript.

.. code-block:: javascript

        if (inJavaScript && typeof line.text !== 'undefined') {
          outputLineNumber += 1;
          output.push(line.text);

For each output line, add an entry in the source map generator with the
corresponding input line.

Source map line numbers are required to be one-indexed. The PEG.js line numbers
are already one-indexed and we have maintained the output line number counter
one-indexed also by design.

.. code-block:: javascript

          sourceMapGenerator.addMapping({
            source: inputFilename,
            original: {
              line: line.lineNumber,
              column: 0,
            },
            generated: {
              line: outputLineNumber,
              column: 0,
            },
          });
        }
      });

Create the output, ensuring it ends on a newline.

.. code-block:: javascript

      output.push('\n');

      return {
        content: output.join('\n'),
        sourceMap: sourceMapGenerator.toString(),
      };
    };

Include a wrapper for processing a ``.js.rst`` file directly.

.. code-block:: javascript

    const fs = require('fs');

    module.exports.fromFile = function fromFile(filename) {
      const content = fs.readFileSync(filename).toString();
      return exports.fromFileContents(filename, content);
    };
