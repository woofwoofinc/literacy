Literacy
========
Literate programming in JavaScript using reStructuredText.


Parser
------
There are six ways of indicating code blocks in a reStructuredText document
that Literacy will correctly interpret as JavaScript code to include.

- The first is by using the `code block directive syntax`_. This requires a
  ``.. code-block:: javascript`` directive in a new paragraph, i.e. separated
  from the previous reStructedText element by a blank line. The language
  argument must be ``javascript`` or the block will be omitted. The directive
  and the language argument are case insensitive.

  The indented contents below the directive are interpreted as the body of
  the block. The block finishes at the outdent to the same level as or higher
  than the directive line indentation.

  .. _code block directive syntax: http://www.sphinx-doc.org/en/stable/markup/code.html#directive-code-block

- The directive name ``sourcecode`` can be used as a direct replacement for
  ``code-block`` in this syntax.

- The directive name ``code`` can also be used as a direct replacement for
  ``code-block`` in this syntax.

- Literal blocks in a ``.js.rst`` are assumed to be code blocks and are
  included. They can be in expanded form with ``::`` on a separate paragraph
  opening line and with content indented underneath.

- Partially minimized literal blocks are also interpreted as code. This is
  where the ``::`` from a literal block is inlined onto the last line of the
  previous paragraph with intermediate spacing before the ``::``.

- Finally, fully minimized literal blocks are also supported. These are the
  same as partially minimized literal blocks except the space is omitted
  between the end of the paragraph and the ``::``.

Quoted literal blocks are not supported. These are literal blocks which are
not indented. Instead each line of the block begins with the same character.
This is not commonly used for source code in reStructuredText.

The ``literalinclude`` directive is also not supported since it is used to
include entire sourcefiles. These can be required directly without Literacy.

Parsing is implemented as a `PEG grammar`_ using the `PEG.js`_ library. PEG
grammars are similar to context-free grammars except that in a multi-choice rule
the choices are matched in order.

.. _PEG grammar: https://github.com/PhilippeSigaud/Pegged/wiki/PEG-Basics
.. _PEG.js: https://pegjs.org

.. code-block:: javascript

    const peg = require('pegjs');
    const rules = [

The grammar starts with the first rule. We take a line based approach in parsing
and determine that the next read will be a line containing a code directive
start line, a directive for something other than a code block, a literal block
start line, a minified literal block start line, a blank line, or a line of
regular text.

Note that the order matters here since all the lines would match a regular line
of text if they weren't before it in the choice list. This would be ambiguous in
a context-free grammar.

.. code-block:: javascript

      'START = (CODE_DIRECTIVE / DIRECTIVE / LITERAL / MINIFIED_LITERAL / BLANK / TEXT)*',

It is useful to include an explicit rule for a blank line of text. Usually, it
would be essential for parsing reStructuredText since many elements are
sensitive to blank lines, e.g. directives should have a blank line before them.
Instead, we choose to be permissive in this parser and allow some syntax which
is not strictly correct.

The blank line is useful to us because it is equivalent to trailing whitespace
followed by a newline which we want to allow in all of the rules. The rules
for matching directives often are the actual criteria for the rule followed by
a blank line match to run out the rest of the current line. This helps us to
keep the parsing line based in all the rules.

The parser produces output objects, one per line, which indicate the line type
classification and other necessary information, like indentation level and text
for output if relevent. This output object is created by the parser function in
braces which follows the rule. The return from this function is considered the
result object of the rule.

.. code-block:: javascript

      `
      BLANK = [ ]* EOL {
        return {
          type: 'blank',
          text: '',
          lineNumber: location().start.line,
        }
      }

      EOL = '\\r\\n' / '\\n' / '\\r'
      `,

Indent is important for determining the end of a directive or literal block, so
the remaining rules include a whitespace prefix. This is converted to an
indentation count by the parser result function.

A code directive line is some indentation followed by the directive name,
e.g. ``code-block``, ``sourcecode``, or ``code``. Then the ``::`` delimiter,
a space and the language name.

The ``i`` after string literals in the rule means the literal is matched case
insensitive.

This rule returns a line object with type ``javascript`` to mark that it is
start of a JavaScript block. The extent of the block can be found by comparing
the indentation levels of the following blocks to the indentation level of this
block and stoping at the first non-blank subsequent line which has a smaller or
equal indentation level.

.. code-block:: javascript

      `
      CODE_DIRECTIVE = indent:[ ]* '.. ' CODE_DIRECTIVE_NAME ':: javascript'i BLANK DIRECTIVE_OPTION* {
        return {
          type: 'javascript',
          indent: indent.length,
        }
      }

      CODE_DIRECTIVE_NAME = 'code-block'i / 'sourcecode'i / 'code'i
      `,

Code block directives_ are allowed to take options.

* ``:caption: <text>``
* ``:emphasize-lines: <comma separated integer list>``
* ``:linenos:``
* ``:dedent: integer``
* ``:number-lines:``

.. _directives: http://docutils.sourceforge.net/docs/ref/rst/directives.html

The common directive options are also supported.

* ``:name: <text>``
* ``:class: <text>``

Directive options following a code directive are dropped completely.

.. code-block:: javascript

      `
      DIRECTIVE_OPTION = indent:[ ]* ':' [A-Za-z-]+ ':' (!EOL .)* BLANK
      `,

It is necessary to distinguish the other directives in reStructuredText since
they end in ``::``. If these are not separately covered then they will be
interpreted as code blocks by the fully minimized form of the literal block rule
later.

.. code-block:: javascript

      `
      DIRECTIVE = indent:[ ]* '.. ' [A-Za-z-]+ '::' BLANK {
        return {
          type: 'directive',
          indent: indent.length,
        }
      }
      `,

A reStructuredText fully expanded literal block is ``::`` on a separate line.

Aside, this also covers the minified literal block case when the ``::`` is
attached to the paragraph but on a separate line, e.g. the line in the paragraph
was broken just before the concluding ``::``. Both result in the same parse
action response so this is not a problem.

.. code-block:: javascript

      `
      LITERAL = indent:[ ]* '::' BLANK {
        return {
          type: 'javascript',
          indent: indent.length,
        }
      }
      `,

The minified literal case is more difficult because a negative lookahead is
needed. The critical part is ``(!EOL !('::' BLANK) .)* '::'``. Here the
parenthesed expression says match any number of characters on this line unless
this are the beginning of ``::`` followed by optional blank material to the end
of line.

The ``EOL`` is needed in this negative look ahead since the parser is not line
based naturally. If it was omitted then this rule would match most of the file
greedily if there were any literal blocks in the file.

.. code-block:: javascript

      `
      MINIFIED_LITERAL = indent:[ ]* (!EOL !('::' BLANK) .)* '::' BLANK {
        return {
          type: 'javascript',
          indent: indent.length,
        }
      }
      `,

Otherwise, the line is regular text with optional indentation.

.. code-block:: javascript

      `
      TEXT = indent:[ ]* characters:(!EOL character:. { return character })+ EOL? {
        return {
          type: 'text',
          indent: indent.length,
          text: indent.join('') + characters.join(''),
          lineNumber: location().start.line,
        }
      }
      `,
    ];

    const parser = peg.generate(rules.join(''));


Source Maps
-----------
Calculate `source maps`_ for Literacy output. The ``.js.rst`` file format is
impractical without access to debugger tools or stacktrace line number
translation.

.. _source maps: https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

Uses the `Mozilla source map module`_ to generate line based source maps.
Accurate correspondence is sufficiently granular at line-level. Calculating line
and column correspondence is unwieldy since the input file is detabbed for
convenience in parsing.

.. _Mozilla source map module: https://github.com/mozilla/source-map

.. code-block:: javascript

    const sourcemap = require('source-map');

    function generateSourceMap(inputFilename, input, output, inputLineNumbers) {
      const sourceMapGenerator = new sourcemap.SourceMapGenerator({
        file: inputFilename,
      });

      sourceMapGenerator.setSourceContent(inputFilename, input);

For each output line, add an entry in the source map generator with the
corresponding input line collected in ``inputLineNumbers``.

Drop the last entry in the output line array since the array was padded to
include a separate newline. The padded line does not have a corresponding input
file line number.

.. code-block:: javascript

      output.slice(0, -1).forEach((outputLine, outputLineNumber) => {

The ``inputLineNumbers`` array is zero-indexed.

.. code-block:: javascript

        const inputLineNumber = inputLineNumbers[outputLineNumber];

        sourceMapGenerator.addMapping({
          source: inputFilename,
          original: {

PEG.js line numbers are one-indexed like source map line numbers are required to
be.

.. code-block:: javascript

            line: inputLineNumber,
            column: 0,
          },
          generated: {

But we need to adjust the zero-indexed array indices or the first line number,
i.e. 0, is invalid and breaks the source map generation.

.. code-block:: javascript

            line: outputLineNumber + 1,
            column: 0,
          },
        });
      });

      return sourceMapGenerator.toString();
    }


Exports
-------
Support converting string content from reStructuredText format to JavaScript.
This parses the parameter string as a ``.js.rst`` file and returns the
JavaScript blocks concatenated together.

.. code-block:: javascript

    const detab = require('detab');

    module.exports.fromString = function fromString(input, inputFilename) {

Prep the input by detabing it to a tab stop of eight per the reStructuredText
specification. This also means that the grammar rules can assume there is no
tab whitespacing.

.. code-block:: javascript

      const detabbed = detab(input, 8);

Then parse the input content.

.. code-block:: javascript

      const parsed = parser.parse(detabbed);

Use the parser output blocks to select the lines which should be interpreted as
JavaScript and collect these for output.

Any non-blank lines with text should be considered JavaScript if they follow
one of the marker directive start lines and have an indentation level which is
greater than the directive start line. The first line with an indentation level
the same as or less than the marker directive line terminates the line
inclusions for that directive line.

Start with some tracking state and scan the line classification blocks.

.. code-block:: javascript

      const output = [];
      const inputLineNumbers = [];
      let indent = 0;
      let inJavaScript = false;

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

Record the input file line number for each output line so we can create a source
map later if needed.

.. code-block:: javascript

        if (inJavaScript && typeof line.text !== 'undefined') {
          output.push(line.text);
          inputLineNumbers.push(line.lineNumber);
        }
      });

Create the output, ensuring it ends on a newline.

.. code-block:: javascript

      output.push('\n');
      const result = {
        content: output.join('\n'),
      };

If the input filename was provided then generate a source map. Without an input
filename we cannot generate a valid source map. The source map created is line
based, linking line numbers in the output to corresponding JavaScript block line
numbers in the input.

.. code-block:: javascript

      if (typeof inputFilename !== 'undefined') {
        result.sourcemap = generateSourceMap(
          inputFilename,
          input,
          output,
          inputLineNumbers
        );
      }

      return result;
    };

Include a wrapper for processing ``.js.rst`` from a file directly.

.. code-block:: javascript

    const fs = require('fs');

    module.exports.fromFile = function fromFile(filename) {
      const content = fs.readFileSync(filename).toString();
      return exports.fromString(content, filename);
    };
