mkdir -p lib

cat `ls ../../src/*.js` > lib/brainCloudClient.concat.js
echo "" >> lib/brainCloudClient.concat.js
echo "CryptoJS = {};" >> lib/brainCloudClient.concat.js
echo "CryptoJS.MD5 = require('md5');" >> lib/brainCloudClient.concat.js
echo "jQuery = require('jquery');" >> lib/brainCloudClient.concat.js
echo "" >> lib/brainCloudClient.concat.js
echo "/** " >>  lib/brainCloudClient.concat.js
echo "* Exporting node modules" >>  lib/brainCloudClient.concat.js
echo "*/ " >>  lib/brainCloudClient.concat.js

echo "exports.BrainCloudWrapper = BrainCloudWrapper" >> lib/brainCloudClient.concat.js
echo "exports.BrainCloudClient = BrainCloudClient" >> lib/brainCloudClient.concat.js

exit 0;
