#!/usr/bin/env bash

set -xe


################################################################################
# Setup
################################################################################

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TMP_DIR="$(mktemp -d -p "$DIR" dev-literacy.XXXXXX)"
pushd "$TMP_DIR" > /dev/null


################################################################################
# Download Base Image
################################################################################

wget http://cdimage.ubuntu.com/ubuntu-base/releases/17.04/release/ubuntu-base-17.04-base-amd64.tar.gz


################################################################################
# Start Image Build
################################################################################

acbuild begin --build-mode=oci ./ubuntu-base-17.04-base-amd64.tar.gz


################################################################################
# Basic Development Tools
################################################################################

acbuild run -- apt-get update -qq
acbuild run -- apt-get upgrade -qq

acbuild run -- apt-get install -qq wget
acbuild run -- apt-get install -qq build-essential
acbuild run -- apt-get install -qq git
acbuild run -- apt-get install -qq jq


################################################################################
# Sphinx
################################################################################

# Python pip is in Ubuntu universe.
acbuild run -- apt-get install -qq software-properties-common
acbuild run -- apt-add-repository universe
acbuild run -- apt-get update -qq

acbuild run -- apt-get install -qq python2.7
acbuild run -- apt-get install -qq python-pip
acbuild run -- pip install -q --upgrade pip

acbuild run -- pip install -q Sphinx
acbuild run -- pip install -q sphinx_bootstrap_theme


################################################################################
# Node
################################################################################

NODE_VERSION=6.11.3

acbuild run -- wget -q https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz
acbuild run -- tar xJf node-v${NODE_VERSION}-linux-x64.tar.xz -C /usr/ --strip-components=1
acbuild run -- rm node-v${NODE_VERSION}-linux-x64.tar.xz


################################################################################
# Yarn
################################################################################

YARN_VERSION=1.0.2

acbuild run -- wget -q https://github.com/yarnpkg/yarn/releases/download/v${YARN_VERSION}/yarn-v${YARN_VERSION}.tar.gz
acbuild run -- tar xzf yarn-v${YARN_VERSION}.tar.gz -C /usr/ --strip-components=1
acbuild run -- rm yarn-v${YARN_VERSION}.tar.gz


################################################################################
# Webpack
################################################################################

acbuild run -- yarn global add --no-progress webpack@3.6.0
acbuild run -- yarn global add --no-progress webpack-dev-server@2.8.2


################################################################################
# Finalise Image
################################################################################

acbuild run -- apt-get -qq autoremove
acbuild run -- apt-get -qq clean

acbuild port add 8080-tcp tcp 8080

acbuild set-exec -- /bin/bash
acbuild write --overwrite ../dev-literacy.oci

acbuild end


################################################################################
# Teardown
################################################################################

popd > /dev/null
rm -fr "$TMP_DIR"
