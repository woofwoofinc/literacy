Webpack Literacy Loader Example
===============================
This is a reStructuredText JavaScript source file. It is loaded in Webpack using
the Literacy loader.

.. code-block:: javascript

    'use strict';

    console.log('Hello, Doggies!');

To test require references to ``.js.rst`` files, we include another ``.js.rst``
module from here. This works but needs a ``.js.rst`` entry in the
``resolve.extensions`` list in Webpack configuration.

.. code-block:: javascript

    require('./module');
