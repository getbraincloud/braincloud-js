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
echo "serverUrl=https://api.braincloudservers.com/dispatcherv2" >ids.txt
echo "appId=12011" >>ids.txt
echo "secret=a32cb6c7-e5eb-4095-b94e-2bfb1a7473f2" >>ids.txt
echo "version=1.0.0" >>ids.txt
echo "childAppId=12109" >>ids.txt
echo "childSecret=7c929b87-ed3d-4e1c-bb43-b2dc09ecc2b1" >>ids.txt
echo "parentLevelName=Master" >>ids.txt
echo "peerName=peerapp" >>ids.txt
npm install
node test
popd
