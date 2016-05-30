
brainCloudClient.gamification = {};

brainCloudClient.gamification.SERVICE_GAMIFICATION = "gamification";

brainCloudClient.gamification.OPERATION_READ = "READ";
brainCloudClient.gamification.OPERATION_READ_XP_LEVELS = "READ_XP_LEVELS";
brainCloudClient.gamification.OPERATION_READ_ACHIEVEMENTS = "READ_ACHIEVEMENTS";
brainCloudClient.gamification.OPERATION_READ_ACHIEVED_ACHIEVEMENTS = "READ_ACHIEVED_ACHIEVEMENTS";
brainCloudClient.gamification.OPERATION_AWARD_ACHIEVEMENTS = "AWARD_ACHIEVEMENTS";

brainCloudClient.gamification.OPERATION_READ_MILESTONES = "READ_MILESTONES";
brainCloudClient.gamification.OPERATION_READ_MILESTONES_BY_CATEGORY = "READ_MILESTONES_BY_CATEGORY";
brainCloudClient.gamification.OPERATION_READ_COMPLETED_MILESTONES = "READ_COMPLETED_MILESTONES";
brainCloudClient.gamification.OPERATION_READ_IN_PROGRESS_MILESTONES = "READ_IN_PROGRESS_MILESTONES";
brainCloudClient.gamification.OPERATION_RESET_MILESTONES = "RESET_MILESTONES";

brainCloudClient.gamification.OPERATION_READ_QUESTS = "READ_QUESTS";
brainCloudClient.gamification.OPERATION_READ_QUESTS_BY_CATEGORY = "READ_QUESTS_BY_CATEGORY";
brainCloudClient.gamification.OPERATION_READ_COMPLETED_QUESTS = "READ_COMPLETED_QUESTS";
brainCloudClient.gamification.OPERATION_READ_IN_PROGRESS_QUESTS = "READ_IN_PROGRESS_QUESTS";
brainCloudClient.gamification.OPERATION_READ_NOT_STARTED_QUESTS = "READ_NOT_STARTED_QUESTS";
brainCloudClient.gamification.OPERATION_READ_QUESTS_WITH_STATUS = "READ_QUESTS_WITH_STATUS";
brainCloudClient.gamification.OPERATION_READ_QUESTS_WITH_BASIC_PERCENTAGE = "READ_QUESTS_WITH_BASIC_PERCENTAGE";
brainCloudClient.gamification.OPERATION_READ_QUESTS_WITH_COMPLEX_PERCENTAGE = "READ_QUESTS_WITH_COMPLEX_PERCENTAGE";


/**
 * Method retrieves all gamification data for the player.
 *
 * Service Name - Gamification
 * Service Operation - Read
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readAllGamification = function(callback, includeMetaData) {
    message = {};

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ,
        data: message,
        callback: callback
    });
};



/**
 * Method will award the achievements specified. On success, this will
 * call AwardThirdPartyAchievement to hook into the client-side Achievement
 * service (ie GameCentre, Facebook etc).
 *
 * Service Name - Gamification
 * Service Operation - AwardAchievements
 *
 * @param achievementIds An array of achievementId strings
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.awardAchievements = function(achievements, callback, includeMetaData) {
    message = {};
    message["achievements"] = achievements;

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_AWARD_ACHIEVEMENTS,
        data: message,
        callback: callback
    });
};


/**
 * Method retrives the list of achieved achievements.
 *
 * Service Name - Gamification
 * Service Operation - ReadAchievedAchievements
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readAchievedAchievements = function(callback, includeMetaData) {
    message = {};

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_ACHIEVED_ACHIEVEMENTS,
        data: message,
        callback: callback
    });
};

/**
 * Method returns all defined xp levels and any rewards associated
 * with those xp levels.
 *
 * Service Name - Gamification
 * Service Operation - ReadXpLevels
 *
 * @param callback {function} The callback handler
 */
brainCloudClient.gamification.readXPLevelsMetaData = function(callback) {
    message = {};

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_XP_LEVELS,
        callback: callback
    });
};

/**
 * Read all of the achievements defined for the game.
 *
 * Service Name - Gamification
 * Service Operation - ReadAchievements
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readAchievements = function(callback, includeMetaData) {
    message = {};

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_ACHIEVEMENTS,
        data: message,
        callback: callback
    });
};

/**
 * Method retrieves all milestones defined for the game.
 *
 * Service Name - Gamification
 * Service Operation - ReadMilestones
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readMilestones = function(callback, includeMetaData) {
    message = {};

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_MILESTONES,
        data: message,
        callback: callback
    });
};

/**
 * Method retrieves milestones of the given category.
 *
 * Service Name - Gamification
 * Service Operation - ReadMilestonesByCategory
 *
 * @param category The milestone category
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readMilestonesByCategory = function(category, callback, includeMetaData) {
    message = {};
    message["category"] = category;

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_MILESTONES_BY_CATEGORY,
        data: message,
        callback: callback
    });
};

/**
 * Method retrieves the list of completed milestones.
 *
 * Service Name - Gamification
 * Service Operation - ReadCompleteMilestones
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readCompletedMilestones = function(callback, includeMetaData) {
    message = {};

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_COMPLETED_MILESTONES,
        data: message,
        callback: callback
    });
};

/**
 * Method retrieves the list of in progress milestones
 *
 * Service Name - Gamification
 * Service Operation - ReadInProgressMilestones
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readInProgressMilestones = function(callback, includeMetaData) {
    message = {};

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_IN_PROGRESS_MILESTONES,
        data: message,
        callback: callback
    });
};

/**
* Resets the specified milestones' statuses to LOCKED.
*
* Service Name - Gamification
* Service Operation - ResetMilestones
*
* @param milestoneIds Comma separate list of milestones to reset
* @param callback Method to be invoked when the server response is received.
*/
brainCloudClient.gamification.resetMilestones = function(milestones, callback, includeMetaData) {
    message = {};
    message["milestones"] = milestones;

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_RESET_MILESTONES,
        data: message,
        callback: callback
    });
};


/**
 * Method retrieves all of the quests defined for the game.
 *
 * Service Name - Gamification
 * Service Operation - ReadQuests
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readQuests = function(callback, includeMetaData) {
    message = {};

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_QUESTS,
        data: message,
        callback: callback
    });
};

/**
 * Method returns quests for the given category.
 *
 * Service Name - Gamification
 * Service Operation - ReadQuestsByCategory
 *
 * @param category The quest category
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readQuestsByCategory = function(category, callback, includeMetaData) {
    message = {};
    message["category"] = category;

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_QUESTS_BY_CATEGORY,
        data: message,
        callback: callback
    });
};

/**
 *  Method returns all completed quests.
 *
 * Service Name - Gamification
 * Service Operation - ReadCompletedQuests
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readCompletedQuests = function(callback, includeMetaData) {
    message = {};

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_COMPLETED_QUESTS,
        data: message,
        callback: callback
    });
};

/**
 *  Method returns quests that are in progress.
 *
 * Service Name - Gamification
 * Service Operation - ReadInProgressQuests
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readInProgressQuests = function(callback, includeMetaData) {
    message = {};

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_IN_PROGRESS_QUESTS,
        data: message,
        callback: callback
    });
};

/**
 *  Method returns quests that have not been started.
 *
 * Service Name - Gamification
 * Service Operation - ReadNotStartedQuests
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readNotStartedQuests = function(callback, includeMetaData) {
    message = {};

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_NOT_STARTED_QUESTS,
        data: message,
        callback: callback
    });
};

/**
 *  Method returns quests with a status.
 *
 * Service Name - Gamification
 * Service Operation - ReadQuestsWithStatus
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readQuestsWithStatus = function(callback, includeMetaData) {
    message = {};

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_QUESTS_WITH_STATUS,
        data: message,
        callback: callback
    });
};

/**
 *  Method returns quests with a basic percentage.
 *
 * Service Name - Gamification
 * Service Operation - ReadQuestsWithBasicPercentage
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readQuestsWithBasicPercentage = function(callback, includeMetaData) {
    message = {};

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_QUESTS_WITH_BASIC_PERCENTAGE,
        data: message,
        callback: callback
    });
};

/**
 *  Method returns quests with a complex percentage.
 *
 * Service Name - Gamification
 * Service Operation - ReadQuestsWithComplexPercentage
 *
 * @param callback Method to be invoked when the server response is received.
 */
brainCloudClient.gamification.readQuestsWithComplexPercentage = function(callback, includeMetaData) {
    message = {};

    if (includeMetaData) {
        message["includeMetaData"] = includeMetaData;
    }

    brainCloudManager.sendRequest({
        service: brainCloudClient.gamification.SERVICE_GAMIFICATION,
        operation: brainCloudClient.gamification.OPERATION_READ_QUESTS_WITH_COMPLEX_PERCENTAGE,
        data: message,
        callback: callback
    });
};

