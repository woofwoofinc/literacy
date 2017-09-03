Releasing
=========

Publishing to NPM
-----------------
Install the project development dependencies to get a bootstrap Literacy command
if this hasn't been done already.

::

    yarn

Build the ``lib`` directory contents for publication.

::

    rm -fr lib && yarn build

Login to the `npm registry`_.

.. _npm registry: https://www.npmjs.com

::

    $ npm login
    Username: woofwoofinc
    Password:
    Email: (this IS public) woofwoofinc@gmail.com
    Logged in as woofwoofinc on https://registry.npmjs.org/.

Then publish.

::

    $ npm publish
    + literacy@0.1.2

The latest version of the Literacy package can be verified in the npm registry
at `literacy`_.

.. _literacy: https://www.npmjs.com/package/literacy


Publishing the Documentation
----------------------------
Project documentation is published to `woofwoofinc.github.io/literacy`_ using
`GitHub Pages`_.

.. _woofwoofinc.github.io/literacy: https://woofwoofinc.github.io/literacy
.. _GitHub Pages: https://pages.github.com

First build the documentation as described in :ref:`documentation`.

The GitHub configuration for this project is to serve documentation from the
``gh-pages`` branch. Rather than attempt to build a new ``gh-pages`` in the
current repository, it is simpler to copy the repository, change to
``gh-pages`` in the repository copy, and clean everything from there. This has
the advantage of not operating in the current repository too so it is
non-destructive.

Create a copy of the repository.

::

    cp -r literacy literacy-gh-pages

Then change into the new repository and swap to the ``gh-pages`` branch.

::

    pushd literacy-gh-pages > /dev/null
    git checkout -b gh-pages

Clear out everything in the branch. This uses dot globing and extended glob
options to arrange deletion of everything except the .git directory.

::

    shopt -s dotglob
    shopt -s extglob
    rm -fr !(.git)

    shopt -u extglob
    shopt -u dotglob

Next, copy in the contents of ``src/_build/html`` from the main project
repository. This is the latest build of the documentation. Dot globing is
used again since the dot files in the ``src/_build/html`` directory are also
needed.

::

    shopt -s dotglob
    cp -r ../literacy/src/_build/html/* .

    shopt -u dotglob

Commit the documentation and push the ``gh-pages`` branch to GitHub.

::

    git add -A
    git commit -m "Add latest documentation."
    git push origin gh-pages

Then clean up the temporary repository.

::

    popd > /dev/null
    rm -fr literacy-gh-pages
