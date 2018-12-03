#!/bin/bash

set -e

pushd ../src
cat `ls *.js` > ../deploy/node/lib/brainCloudClient.concat.js
popd

pushd ../deploy/node/lib
echo "exports.BrainCloudWrapper = BrainCloudWrapper" >>brainCloudClient.concat.js
echo "exports.BrainCloudClient = BrainCloudClient" >>brainCloudClient.concat.js
popd

pushd ../deploy/node
npm install
popd

# Compile to make sure its all fine and ES5 worthy
java -jar ../tools/closure/compiler.jar --js ../deploy/node/lib/brainCloudClient.concat.js --js_output_file ../deploy/node/lib/brainCloudClient.min.js

pushd ../test
echo "serverUrl=https://internal.braincloudservers.com/dispatcherv2" >ids.txt
echo "appId=20001" >>ids.txt
echo "secret=4e51b45c-030e-4f21-8457-dc53c9a0ed5f" >>ids.txt
echo "version=1.0.0" >>ids.txt
echo "childAppId=20005" >>ids.txt
echo "childSecret=f8cec1cf-2f95-4989-910c-8caf598f83db" >>ids.txt
echo "parentLevelName=Master" >>ids.txt
echo "peerName=peerapp" >>ids.txt
npm install
node test
popd
