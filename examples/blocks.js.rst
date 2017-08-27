Blocks
------
An example ``.js.rst`` file illustrating the variant block inclusion forms.

First is the ``code-block`` directive syntax.

.. code-block:: javascript

    console.log('1/ A code block directive block.')

The text ``sourcecode`` can be used as a direct replacement for ``code-block``.

.. sourcecode:: javascript

    console.log('2/ A code block directive block using `sourcecode`.')

As can the text ``code``.

.. code:: javascript

    console.log('3/ A code block directive block using `code`.')

Literal blocks in a ``.js.rst`` file are assumed to be code blocks and included.

::

    console.log('4/ A literal block.')

Partially minimized literal block format is also accepted. This is where the
``::`` is inlined into the paragraph text and there is a space between the
paragraph end and the ``::`` marker. ::

    console.log('5/ A partially minimized literal block.')

For fully mimimized, the space is omitted::

    console.log('6/ A fully minimized literal block.')
