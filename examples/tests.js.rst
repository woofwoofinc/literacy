Tests
-----
Edge cases and previous bugs in Literacy implementation.

.. code-block:: javascript

    'use strict';

Admonishments should not be treated as JavaScript blocks. This happened because
the parser did not recognize ``.. <directive>::`` as a directive. Instead it
parsed it as a fully minimizied literal block.

.. NOTE::
   This is not JavaScript.

Code block directives are allowed to take options.

* ``:caption: <text>``
* ``:emphasize-lines: <comma separated integer list>``
* ``:linenos:``
* ``:dedent: integer``
* ``:number-lines:``

The common directive options are also supported.

* ``:name: <text>``
* ``:class: <text>``

.. code-block:: javascript
   :linenos:

    console.log('This is a code block directive with an option.');

Multiple options are permitted.

.. code-block:: javascript
   :name: option-block
   :linenos:

    console.log('This is a code block directive with multiple options.');

