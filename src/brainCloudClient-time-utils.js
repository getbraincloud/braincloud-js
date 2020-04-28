
function BCTimeUtils() {
    var bc = this;

    bc.timeUtils = {};

    bc.timeUtils.UTCDateTimeToUTCMillis = function(utcDate) {
        return utcDate.getTime(); // return the utc milliseconds
    };

    bc.timeUtils.UTCMillisToUTCDateTime = function(utcMillis) {
        //var date = new Date(0); // The 0 sets the date to the epoch
        //return date.setUTCSeconds(utcSeconds); //add the seconds to the date
        return new Date(utcMillis);
    };

    //redundant calls in JS that will simply return that which they pass in. Here to note that these calls are in the other libs.
    //Date LocalTimeToUTCTime(Date localDate)
    //Date UTCTimeToLocalTime (Date utcDate)

}
BCTimeUtils.apply(window.brainCloudClient = window.brainCloudClient || {});
