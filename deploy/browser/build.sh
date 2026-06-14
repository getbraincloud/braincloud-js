#!/bin/bash
#
# Builds a self-contained browser bundle of the brainCloud JS client.
#
# The default web/node distribution (autobuild/build_js.sh) is just `cat src/*.js`, which
# leaves Node `require()` calls (crypto-js, get-user-locale, form-data, buffer) and an
# appended `exports.*` in the output. That only runs under Node — in a browser it throws
# "require is not defined" / "exports is not defined".
#
# This build resolves those dependencies through esbuild and emits an IIFE that exposes
# window.BrainCloudWrapper / window.BrainCloudClient, so it works from a single <script>
# tag with NO external CryptoJS and NO require/exports shims.
#
set -e
cd "$(dirname "$0")"

SRC_DIR="../../src"
OUT_DIR="lib"
BUILD_DIR="build"

echo "==> Installing build dependencies"
npm install --silent

echo "==> Building browser bundle via esbuild"
node build.mjs

echo "==> Done:"
ls -lh "$OUT_DIR"/brainCloudClient.browser*.js
