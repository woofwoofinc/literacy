Parser
======
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
      CODE_DIRECTIVE = indent:[ ]* tag:CODE_DIRECTIVE_TAG BLANK DIRECTIVE_OPTION* {
        return {
          type: 'code',
          language: tag.language,
          indent: indent.length,
        }
      }

      CODE_DIRECTIVE_TAG = '.. ' CODE_DIRECTIVE_NAME ':: ' language:CODE_DIRECTIVE_LANGUAGE {
        return {
          language: language,
        }
      }

      CODE_DIRECTIVE_NAME = 'code-block'i / 'sourcecode'i / 'code'i
      CODE_DIRECTIVE_LANGUAGE = 'javascript'i / 'json'i
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


Exports
-------
The module export is a function to detab and parse the input content.

.. code-block:: javascript

    const detab = require('detab');

    module.exports = function parse(content) {

Prep the input by detabing it to a tab stop of eight per the reStructuredText
specification. This also means that the grammar rules can assume there is no
tab whitespacing.

.. code-block:: javascript

      const detabbed = detab(content, 8);

Then parse and return the input content.

.. code-block:: javascript

      return parser.parse(detabbed);
    };
