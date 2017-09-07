.. _dev:

Development Tools Container
===========================
The project source comes with a ``dev`` directory which contains a script for
building a rkt Ubuntu container with useful development tools for Literacy
development.

To build this you must have a system with an installation of rkt and acbuild.
For macOS, the RktMachine_ project provides an xhyve-based VM running CoreOS
with installations of rkt, acbuild, docker2aci, and other useful container
tools.

.. _RktMachine: https://github.com/woofwoofinc/rktmachine


Building
--------
Build the container using the provided build script:

::

    ./dev-literacy.acbuild.sh

This will make a ``dev-literacy.oci`` in the directory. Convert this to
``dev-literacy.aci`` for installation into rkt:

::

    gunzip < dev-literacy.oci > dev-literacy.oci.tar
    docker2aci dev-literacy.oci.tar
    rm dev-literacy.oci.tar
    mv dev-literacy-latest.aci dev-literacy.aci

Install this into rkt:

::

    rkt --insecure-options=image fetch ./dev-literacy.aci

This container is intended for interactive use, so to run it with rkt use:

::

    sudo rkt run \
        --interactive \
        --port 8080-tcp:8080 \
        --volume literacy,kind=host,source=$(pwd) \
        dev-literacy \
        --mount volume=literacy,target=/literacy

The current working directory is available on the container at ``/literacy``.
