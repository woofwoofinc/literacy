#!/usr/bin/env bash

set -xe


################################################################################
# Setup
################################################################################

IMAGE=dev-literacy
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TMP_DIR="$(mktemp -d -p "$DIR" $IMAGE.XXXXXX)"
pushd "$TMP_DIR" > /dev/null


################################################################################
# Start Image Build
################################################################################

buildah from scratch --name $IMAGE


################################################################################
# Base Image
################################################################################

wget http://cdimage.ubuntu.com/ubuntu-base/releases/17.10/release/ubuntu-base-17.10-base-amd64.tar.gz

MOUNT=$(buildah mount $IMAGE)
tar xzf ubuntu-base-17.10-base-amd64.tar.gz -C "$MOUNT"
buildah umount $IMAGE


################################################################################
# Basic Development Tools
################################################################################

buildah run $IMAGE -- apt-get update -qq
buildah run $IMAGE -- apt-get upgrade -qq

buildah run $IMAGE -- apt-get install -qq wget
buildah run $IMAGE -- apt-get install -qq build-essential
buildah run $IMAGE -- apt-get install -qq git
buildah run $IMAGE -- apt-get install -qq jq


################################################################################
# Sphinx
################################################################################

# Python pip is in Ubuntu universe.
buildah run $IMAGE -- apt-get install -qq software-properties-common
buildah run $IMAGE -- apt-add-repository universe
buildah run $IMAGE -- apt-get update -qq

buildah run $IMAGE -- apt-get install -qq python2.7
buildah run $IMAGE -- apt-get install -qq python-pip
buildah run $IMAGE -- pip install -q --upgrade pip

buildah run $IMAGE -- pip install -q Sphinx
buildah run $IMAGE -- pip install -q sphinx_bootstrap_theme


################################################################################
# Node
################################################################################

NODE_VERSION=8.9.0

buildah run $IMAGE -- wget -q https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz
buildah run $IMAGE -- tar xJf node-v${NODE_VERSION}-linux-x64.tar.xz -C /usr/ --strip-components=1
buildah run $IMAGE -- rm node-v${NODE_VERSION}-linux-x64.tar.xz


################################################################################
# Yarn
################################################################################

YARN_VERSION=1.3.2

buildah run $IMAGE -- wget -q https://github.com/yarnpkg/yarn/releases/download/v${YARN_VERSION}/yarn-v${YARN_VERSION}.tar.gz
buildah run $IMAGE -- tar xzf yarn-v${YARN_VERSION}.tar.gz -C /usr/ --strip-components=1
buildah run $IMAGE -- rm yarn-v${YARN_VERSION}.tar.gz


################################################################################
# Webpack
################################################################################

buildah run $IMAGE -- yarn global add --no-progress webpack@3.6.0
buildah run $IMAGE -- yarn global add --no-progress webpack-dev-server@2.9.1


################################################################################
# Finalise Image
################################################################################

buildah run $IMAGE -- apt-get -qq autoremove
buildah run $IMAGE -- apt-get -qq clean

echo "nameserver 8.8.8.8" > resolv.conf
buildah copy $IMAGE resolv.conf /etc/resolv.conf

buildah config $IMAGE --port 8080
buildah config $IMAGE --entrypoint /bin/bash

buildah commit -rm $IMAGE $IMAGE


################################################################################
# Output Image
################################################################################

buildah push $IMAGE oci:$IMAGE:latest
tar cf ../$IMAGE.oci -C $IMAGE .


################################################################################
# Teardown
################################################################################

buildah rmi $IMAGE

popd > /dev/null
rm -fr "$TMP_DIR"
