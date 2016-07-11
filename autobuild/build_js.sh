set -e

build_version=$1

if [ "$build_version" == "" ]; then
  echo "Must pass in build version"
  exit 1
fi

rm -rf artifacts
mkdir -p artifacts/brainCloudClient/optimized
cp docs/README.txt artifacts/brainCloudClient
sed -i xxx "s/Platform.*/Platform\: Javascript/" artifacts/brainCloudClient/README.TXT
sed -i xxx "s/Version.*/Version\: $build_version/" artifacts/brainCloudClient/README.TXT
rm artifacts/brainCloudClient/README.TXTxxx

cp ../src/*.js artifacts/brainCloudClient
pushd artifacts/brainCloudClient
cat `ls *.js` > optimized/brainCloudClient.concat.js
java -jar ../../../tools/closure/compiler.jar --js optimized/brainCloudClient.concat.js --js_output_file optimized/brainCloudClient.min.js
zip -r ../brainCloudClient_js_$build_version.zip .
popd

