// Literacy
// ========
// Literate programming in JavaScript using reStructuredText.
//
//
// Code Block Parser
// -----------------
// There are six ways of indicating code blocks in a reStructuredText document
// that Literacy will correctly interpret as JavaScript code to include.
//
// - The first is by using the `code block directive syntax`_. This requires a
//   ``.. code-block:: javascript`` directive in a new paragraph, i.e. separated
//   from the previous reStructedText element by a blank line. The language
//   argument must be ``javascript`` or the block will be omitted. The directive
//   and the language argument are case insensitive.
//
//   The indented contents below the directive are interpreted as the body of
//   the block. The block finishes at the outdent to the same level as or higher
//   than the directive line indentation.
//
//   .. _code block directive syntax: http://www.sphinx-doc.org/en/stable/markup/code.html#directive-code-block
//
// - The directive name ``sourcecode`` can be used as a direct replacement for
//   ``code-block`` in this syntax.
//
// - The directive name ``code`` can also be used as a direct replacement for
//   ``code-block`` in this syntax.
//
// - Literal blocks in a ``.js.rst`` are assumed to be code blocks and are
//   included. They can be in expanded form with ``::`` on a separate paragraph
//   opening line and with content indented underneath.
//
// - Partially minimized literal blocks are also interpreted as code. This is
//   where the ``::`` from a literal block is inlined onto the last line of the
//   previous paragraph with intermediate spacing before the ``::``.
//
// - Finally, fully minimized literal blocks are also supported. These are the
//   same as partially minimized literal blocks except the space is omitted
//   between the end of the paragraph and the ``::``.
//
// Quoted literal blocks are not supported. These are literal blocks which are
// not indented. Instead each line of the block begins with the same character.
// This is not commonly used for source code in reStructuredText.
//
// The ``literalinclude`` directive is also not supported since it is used to
// include entire sourcefiles. These can be required directly without Literacy.
//
// Parsing is implemented as a `PEG grammar`_ using the `PEG.js`_ library. PEG
// grammars are similar to context-free grammars except that in a multi-choice rule
// the choices are matched in order.
//
// .. _PEG grammar: https://github.com/PhilippeSigaud/Pegged/wiki/PEG-Basics
// .. _PEG.js: https://pegjs.org
//
// .. code-block:: javascript

    const peg = require('pegjs')
    const rules = [

// The grammar starts with the first rule. We take a line based approach in parsing
// and determine that the next read will be a line containing a code directive
// start line, a literal block start line, a minified literal block start line, a
// blank line, or a line of regular text.
//
// Note that the order matters here since all the lines would match a regular line
// of text if they weren't before it in the choice list. This would be ambiguous in
// a context-free grammar.
//
// .. code-block:: javascript

      'START = (CODE_DIRECTIVE / LITERAL / MINIFIED_LITERAL / BLANK / TEXT)*',

// It is useful to include an explicit rule for a blank line of text. Usually, it
// would be essential for parsing reStructuredText since many elements are
// sensitive to blank lines, e.g. directives should have a blank line before them.
// Instead, we choose to be permissive in this parser and allow some syntax which
// is not strictly correct.
//
// The blank line is useful to us because it is equivalent to trailing whitespace
// followed by a newline which we want to allow in all of the rules. The rules
// for matching directives often are the actual criteria for the rule followed by
// a blank line match to run out the rest of the current line. This helps us to
// keep the parsing line based in all the rules.
//
// The parser produces output objects, one per line, which indicate the line type
// classification and other necessary information, like indentation level and text
// for output if relevent. This output object is created by the parser function in
// braces which follows the rule. The return from this function is considered the
// result object of the rule.
//
// .. code-block:: javascript

      `
      BLANK = [ ]* EOL {
        return {
          type: 'blank',
          text: '',
        }
      }

      EOL = '\\r\\n' / '\\n' / '\\r'
      `,

// Indent is important for determining the end of a directive or literal block, so
// the remaining rules include a whitespace prefix. This is converted to an
// indentation count by the parser result function.
//
// A code directive line is some indentation followed by the directive name,
// e.g. ``code-block``, ``sourcecode``, or ``code``. Then the ``::`` delimiter,
// a space and the language name.
//
// The ``i`` after string literals in the rule means the literal is matched case
// insensitive.
//
// This rule returns a line object with type ``javascript`` to mark that it is
// start of a JavaScript block. The extent of the block can be found by comparing
// the indentation levels of the following blocks to the indentation level of this
// block and stoping at the first non-blank subsequent line which has a smaller or
// equal indentation level.
//
// .. code-block:: javascript

      `
      CODE_DIRECTIVE = indent:[ ]* '.. ' CODE_DIRECTIVE_NAME ':: javascript'i BLANK {
        return {
          type: 'javascript',
          indent: indent.length,
        }
      }

      CODE_DIRECTIVE_NAME = 'code-block'i / 'sourcecode'i / 'code'i
      `,

// A reStructuredText fully expanded literal block is ``::`` on a separate line.
// Usefully, this also covers the minified literal block case when the ``::`` is
// attached to the paragraph but on a separate line, e.g. the line in the
// paragraph was broken just before the concluding ``::``. This is an edge case
// that the minified literal block rule has difficulty handling.
//
// .. code-block:: javascript

      `
      LITERAL = indent:[ ]* '::' BLANK {
        return {
          type: 'javascript',
          indent: indent.length,
        }
      }
      `,

// The minified literal case is more difficult because a negative lookahead is
// needed. The critical part is ``(. !(EOL / '::' BLANK))* . '::'``. Here the
// parenthesed expression says match any number of characters which aren't
// immediately followed by an end of line or by ``::`` followed by optional blank
// material and then the end of line.
//
// The ``EOL`` is needed in this negative look ahead since the parser is not line
// based naturally. If it was omitted then this rule would match most of the file
// greedily if there were any literal blocks in the file.
//
// The reason for the single character match before the ``::`` is that the
// character just before the ``::`` on the line won't have matched in the
// negative lookahead parenthesed expression. The ``!(EOL / '::' BLANK)`` says to
// fail the match of the character if it is followed by ``::`` and the end of line
// sequence.
//
// So it is necessary to include this character with a wildcard match. This is
// also why the literal rule matching a solitary ``::`` above is useful. The
// minified rule will fail in this case since there is no character for the
// wildcard to match.
//
// .. code-block:: javascript

      `
      MINIFIED_LITERAL = indent:[ ]* (. !(EOL / '::' BLANK))* . '::' BLANK {
        return {
          type: 'javascript',
          indent: indent.length,
        }
      }
      `,

// Otherwise, the line is regular text with optional indentation.
//
// .. code-block:: javascript

      `
      TEXT = indent:[ ]* characters:(!EOL character:. { return character })+ EOL? {
        return {
          type: 'text',
          indent: indent.length,
          text: characters.join('')
        }
      }
      `
    ]

    const parser = peg.generate(rules.join(''))

// Prep the content by detabing it to a tab stop of eight per the reStructuredText
// specification. This also means that the grammar rules can assume there is no
// tab whitespacing.
//
// .. code-block:: javascript

    const detab = require('detab')

    function extractJavaScript(content) {
      const detabbed = detab(content, 8)

// Then parse the content.
//
// .. code-block:: javascript

      const parsed = parser.parse(detabbed)

// Use the parser output blocks to select the lines which should be interpreted as
// JavaScript and collect these for output.
//
// Any non-blank lines with text should be considered JavaScript if they follow
// one of the marker directive start lines and have an indentation level which is
// greater than the directive start line. The first line with an indentation level
// the same as or less than the marker directive line terminates the line
// inclusions for that directive line.
//
// Start with some tracking state and scan the line classification blocks.
//
// .. code-block:: javascript

      var output = []
      var indent = 0
      var inJavaScript = false

      parsed.forEach(function(line) {

// Do the directive end condition first. We need to be already in a JavaScript
// block and the current line must have an indentation level less than or equal to
// the directive line.
//
// Note that blank lines are not given an ``indent`` indentation level in the
// parser. This means they are ignored for the purposes of concluding a JavaScript
// directive block.
//
// .. code-block:: javascript

        if (inJavaScript && typeof line.indent !== 'undefined' && line.indent <= indent) {
          inJavaScript = false
          indent = 0
        }

// If the current line classification is for a marker directive line, set
// tracking state to indicate we are currently in a JavaScript block.
//
// .. code-block:: javascript

        if (line.type === 'javascript') {
          inJavaScript = true
          indent = line.indent
        }

// If we are currently in a JavaScript block and the line has text then include
// that into the output. Note that the directive lines themselves are not given a
// ``text`` property in the parser so they don't contribute to the output here.
// Blank lines have text consisting of an empty line so they are included in the
// generated JavaScript.
//
// .. code-block:: javascript

        if (inJavaScript && typeof line.text !== 'undefined') {
          output.push(line.text)
        }
      })

      return output.join('\n')
    }


// Register ``.js.rst``` File Extension
// ------------------------------------
// Intercept Node module loading for filenames ending in ``.js.rst``.  This
// allows ``.js.rst`` files to be passed to ``require`` calls without including
// the suffix.
//
// Implementation is copied from `register.coffee`_ in CoffeeScript and is similar
// to `babel-register`_.
//
// .. _register.coffee: https://github.com/jashkenas/coffeescript/tree/master/src/register.coffee
// .. _babel-register: https://github.com/babel/babel/tree/master/packages/babel-register
//
// The implementation uses the ``require.extensions`` global in Node. Setting a
// key in this dictionary adds Node handling for new file extensions. The key is
// the file suffix string to support, the value is a function to call to load and
// process the file.
//
// But ``require.extenions`` has been deprecated in Node because there is the
// potential for conflicts when a suffix is used by two modules simultaneously.
// It also encourages the offloading of compilation to runtime instead of build
// time.
//
// Strictly speaking it should not be used. However:
//
// - Only this module uses ``.js.rst`` suffixes.
// - The Node module containing the ``require.extensions`` implementation is
//   locked so Node is committed to keeping the current form indefinitely.
// - Production use cases are encouraged to precompile ``.js.rst`` sources.
//
// For ``.js.rst`` loads, read the file contents and strip the Unicode byte order
// mark if it is present. Then use the parser defined earlier to extract the
// JavaScript codeblocks from the reStructuredText. This material is passed to
// ``module._compile`` for compilation and incorporation into the running
// environment.
//
// .. code-block:: javascript

    const fs = require('fs');

    const loadFile = function(module, filename) {
      let content = fs.readFileSync(filename).toString();
      let javaScript = extractJavaScript(content);

      module._compile(javaScript, filename);
    }

// Add this ``.js.rst`` file extension handler to ``require.extensions``.
//
// .. code-block:: javascript

    if (require.extensions) {
      require.extensions['.js.rst'] = loadFile;

// This is not enough unfortunately since although the ``.js.rst`` extension is
// registered, the Node module loader isn't able to handle multi-part extensions.
// For this, we follow CoffeeScript in reimplementing Module::load to support
// multi-part extension handling.
//
//     "This is a horrible thing that should not be required."
//
// Start by determining the best extension choice from the filename where best is
// the file extension with the most parts.
//
// There is also the edge case of dotfiles to handle, i.e. a leading dot in the
// filename is legitimate.
//
// Note although there is only one multi-part extension, we cannot simply test
// for it and then use the existing single-part extension implementation in Node
// for everything else. This is because other modules may have added multi-part
// extension implementations too. A specific test approach here would break these
// other modules.
//
// This implementation follows the CoffeeScript directly.
//
// .. code-block:: javascript

      const path = require('path');
      const Module = require('module');

      function findExtension(filename) {
        let extensions = path.basename(filename).split('.');

// Remove the initial dot from dotfiles. This means there can be filenames
// consisting entirely of an extension, e.g. the ``.js.rst`` case is handled by
// trimming the initial ``.`` and then putting it back before the test into
// ``Module._extensions[...]``.
//
// .. code-block:: javascript

        if (extensions[0] === '') {
          extensions.shift();
        }

// Start with the longest possible extension and work towards the shortest.
//
// .. code-block:: javascript

        while (extensions.shift()) {
          let current = '.' + extensions.join('.');

          if (Module._extensions[current]) {
            return current;
          }
        }

// Default to the '.js' file handler if nothing more specific is registered.
//
// .. code-block:: javascript

        return '.js';
      }

// Now we have ``findExtension``, finish by patching the module load itself.
// This involves adding the file directory path to the Node module paths list
// and calling the extension handler for the file.
//
// See the Node implementation of `Module.prototype.load`_ for comparison. It is
// identical save for the ``findExtension`` amendment.
//
// .. _Module.prototype.load: https://github.com/nodejs/node/blob/c83d9bbffbe879f9d67f72c14213139616ec4302/lib/module.js#L497
//
// .. code-block:: javascript

      const assert = require('assert').ok;
      const debug = Module._debug;

      Module.prototype.load = function(filename) {
        debug('load %j for module %j', filename, this.id);

        assert(!this.loaded);
        this.filename = filename;
        this.paths = Module._nodeModulePaths(path.dirname(filename));

        const extension = findExtension(filename);
        Module._extensions[extension](this, filename);

        this.loaded = true;
      };
    }
