
function BCUtils() {
    var bc = this;

    bc.utils = {};

    bc.utils.ToUTCEpochTime = function(dateTime) {
        return dateTime.getTime(); // return the utc milliseconds
    };

    bc.utils.ToDateTimeFromUTCEpoch = function(utcDateTime) {
        //var date = new Date(0); // The 0 sets the date to the epoch
        //return date.setUTCSeconds(utcSeconds); //add the seconds to the date
        return new Date(utcDateTime);
    };
}
BCUtils.apply(window.brainCloudClient = window.brainCloudClient || {});
