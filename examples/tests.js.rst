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

