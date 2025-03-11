# Concat brainCloud
pushd src
cat `ls *.js` > ../deploy/node/lib/brainCloudClient.concat.js
popd

pushd deploy/node/lib
echo "exports.BrainCloudWrapper = BrainCloudWrapper" >>brainCloudClient.concat.js
echo "exports.BrainCloudClient = BrainCloudClient" >>brainCloudClient.concat.js
popd

# Install modules
pushd deploy/node
npm install
popd

# Compile to make sure its all fine and ES5 worthy
java -jar tools/closure/compiler.jar --js deploy/node/lib/brainCloudClient.concat.js --js_output_file deploy/node/lib/brainCloudClient.min.js

cd testte

# Install test modules then run tests
npm install
