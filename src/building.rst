Building
========
The build stack uses `Node.js`_ and the Yarn_ package manager. Install these on
your system if they are not already available.

.. _Node.js: https://nodejs.org
.. _Yarn: https://yarnpkg.com

A rkt_ container build script is included in the project repository and
provides an installation which can be used to build the project also. See the
description on building and running the container in the :ref:`dev` section
of this document for details.

.. _rkt: https://coreos.com/rkt

For macOS, RktMachine_ provides a CoreOS VM which supports developing using
the rkt container system.

.. _RktMachine: https://github.com/woofwoofinc/rktmachine

Start by installing the project dependencies using Yarn.

::

    $ yarn

Then build the project.

::

    $ yarn build
