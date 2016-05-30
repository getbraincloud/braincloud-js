
brainCloudClient.entity = {};

brainCloudClient.SERVICE_ENTITY = "entity";

brainCloudClient.entity.OPERATION_READ = "READ";
brainCloudClient.entity.OPERATION_CREATE = "CREATE";
brainCloudClient.entity.OPERATION_READ_BY_TYPE = "READ_BY_TYPE";
brainCloudClient.entity.OPERATION_READ_SHARED = "READ_SHARED";
brainCloudClient.entity.OPERATION_READ_SHARED_ENTITY = "READ_SHARED_ENTITY";
brainCloudClient.entity.OPERATION_READ_SINGLETON = "READ_SINGLETON";
brainCloudClient.entity.OPERATION_UPDATE = "UPDATE";
brainCloudClient.entity.OPERATION_UPDATE_SHARED = "UPDATE_SHARED";
brainCloudClient.entity.OPERATION_UPDATE_SINGLETON = "UPDATE_SINGLETON";
brainCloudClient.entity.OPERATION_UPDATE_PARTIAL = "UPDATE_PARTIAL";
brainCloudClient.entity.OPERATION_DELETE = "DELETE";
brainCloudClient.entity.OPERATION_DELETE_SINGLETON = "DELETE_SINGLETON";
brainCloudClient.entity.OPERATION_GET_LIST = "GET_LIST";
brainCloudClient.entity.OPERATION_GET_LIST_COUNT = "GET_LIST_COUNT";
brainCloudClient.entity.OPERATION_GET_PAGE = "GET_PAGE";
brainCloudClient.entity.OPERATION_GET_PAGE_BY_OFFSET = "GET_PAGE_BY_OFFSET";
brainCloudClient.entity.OPERATION_READ_SHARED_ENTITIES_LIST = "READ_SHARED_ENTITIES_LIST";
brainCloudClient.entity.OPERATION_INCREMENT_USER_ENTITY_DATA = "INCREMENT_USER_ENTITY_DATA";

/**
 * Method creates a new entity on the server.
 *
 * @param entityType
 *            {string} The entity type as defined by the user
 * @param data
 *            {json} The entity's data as a json string
 * @param acl
 *            {json} The entity's access control list as json. A null acl
 *            implies default permissions which make the entity
 *            readable/writeable by only the player.
 * @param callback
 *            {function} The callback handler.
 */
brainCloudClient.entity.createEntity = function(entityType, data, acl, callback) {
    var message = {
        entityType : entityType,
        data : data
    };

    if (acl) {
        message["acl"] = acl;
    }

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_CREATE,
        data : message,
        callback : callback
    });
};

/**
 * Method to get a specific entity.
 *
 * @param entityId
 *            {string} The id of the entity
 * @param callback
 *            {function} The callback handler
 */
brainCloudClient.entity.getEntity = function(entityId, callback) {
    var message = {
        entityId : entityId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_READ,
        data : message,
        callback : callback
    });
};

/**
 * Method returns all player entities that match the given type.
 *
 * @param entityType
 *            {string} The entity type to retrieve
 * @param callback
 *            {function} The callback handler
 */
brainCloudClient.entity.getEntitiesByType = function(entityType, callback) {
    var message = {
        entityType : entityType
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_READ_BY_TYPE,
        data : message,
        callback : callback
    });
};

/**
* Method returns a shared entity for the given player and entity ID.
* An entity is shared if its ACL allows for the currently logged
* in player to read the data.
*
* Service Name - Entity
* Service Operation - READ_SHARED_ENTITY
*
* @param playerId The the profile ID of the player who owns the entity
* @param entityId The ID of the entity that will be retrieved
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.entity.getSharedEntityForPlayerId = function(playerId, entityId, callback) {
    var message = {
        targetPlayerId : playerId,
        entityId: entityId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_READ_SHARED_ENTITY,
        data : message,
        callback : callback
    });
};

/**
 * Method returns all shared entities for the given player id.
 * An entity is shared if its ACL allows for the currently logged
 * in player to read the data.
 *
 * Service Name - Entity
 * Service Operation - ReadShared
 *
 * @param playerId The player id to retrieve shared entities for
 * @param callback The method to be invoked when the server response is received
 */
brainCloudClient.entity.getSharedEntitiesForPlayerId = function(playerId, callback) {
    var message = {
        targetPlayerId : playerId
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_READ_SHARED,
        data : message,
        callback : callback
    });
};

/**
* Method gets list of shared entities for the specified player based on type and/or where clause
*
* Service Name - entity
* Service Operation - READ_SHARED_ENTITIES_LIST
*
* @param playerId The player ID to retrieve shared entities for
* @param where Mongo style query
* @param orderBy Sort order
* @param maxReturn The maximum number of entities to return
* @param callback The method to be invoked when the server response is received
*/
brainCloudClient.entity.getSharedEntitiesListForPlayerId = function(playerId, where, orderBy, maxReturn, callback) {
    var message = {
        targetPlayerId : playerId,
        maxReturn : maxReturn
    };

    if(where) message.where = where;
    if(orderBy) message.orderBy = orderBy;

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_READ_SHARED_ENTITIES_LIST,
        data : message,
        callback : callback
    });
}

/**
 * Method updates an entity. This operation results in the entity data being
 * completely replaced by the passed in JSON string.
 *
 * @param entityId
 *            {string} The id of the entity to update
 * @param entityType
 *            {string} The entity type as defined by the user
 * @param data
 *            {json} The entity's data as a json string.
 * @param acl
 *            {json} The entity's access control list as json. A null acl
 *            implies default permissions which make the entity
 *            readable/writeable by only the player.
 * @param version
 *            {number} Current version of the entity. If the version of the
 *            entity on the server does not match the version passed in, the
 *            server operation will fail. Use -1 to skip version checking.
 * @param callback
 *            {function} The callback handler
 */
brainCloudClient.entity.updateEntity = function(entityId, entityType, data,
        acl, version, callback) {
    var message = {
        entityId : entityId,
        data : data,
        version : version
    };

    if (entityType) {
        message["entityType"] = entityType;
    }

    if (acl) {
        message["acl"] = acl;
    }

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_UPDATE,
        data : message,
        callback : callback
    });
};

/**
 * Method updates another player's entity. This operation results in the entity
 * data being completely replaced by the passed in JSON string.
 *
 * @param targetPlayerId
 *            {string} The entity's owning player id
 * @param entityId
 *            {string} The id of the entity to update
 * @param entityType
 *            {string} The entity type as defined by the user
 * @param data
 *            {json} The entity's data as a json string.
 * @param version
 *            {number} Current version of the entity. If the version of the
 *            entity on the server does not match the version passed in, the
 *            server operation will fail. Use -1 to skip version checking.
 * @param callback
 *            {function} The callback handler
 */
brainCloudClient.entity.updateSharedEntity = function(entityId, targetPlayerId,
        entityType, data, version, callback) {
    var message = {
        targetPlayerId : targetPlayerId,
        entityId : entityId,
        data : data,
        version : version
    };

    if (entityType) {
        message["entityType"] = entityType;
    }

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_UPDATE_SHARED,
        data : message,
        callback : callback
    });
};

/**
 * Method updates a singleton entity. This operation results in the entity data
 * being completely replaced by the passed in JSON string.
 *
 * @param entityType
 *            {string} The entity type as defined by the user
 * @param data
 *            {json} The entity's data as a json string.
 * @param acl
 *            {json} The entity's access control list as json. A null acl
 *            implies default permissions which make the entity
 *            readable/writeable by only the player.
 * @param version
 *            {number} Current version of the entity. If the version of the
 *            entity on the server does not match the version passed in, the
 *            server operation will fail. Use -1 to skip version checking.
 * @param callback
 *            {function} The callback handler
 */
brainCloudClient.entity.updateSingleton = function(entityType, data, acl,
        version, callback) {
    var message = {
        entityType : entityType,
        data : data,
        version : version
    };

    if (acl) {
        message["acl"] = acl;
    }

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_UPDATE_SINGLETON,
        data : message,
        callback : callback
    });
};

/**
 * Method retrieves a singleton entity on the server. If the entity doesn't exist, null is returned.
 *
 * @param entityType
 *            {string} The entity type as defined by the user
 * @param callback
 *            {function} Callback handler
 */
brainCloudClient.entity.getSingleton = function(entityType, callback) {
    var message = {
        entityType : entityType
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_READ_SINGLETON,
        data : message,
        callback : callback
    });
};

/**
 * Method to delete the specified entity for the player.
 *
 * @param entityId
 *            {string} ID of the entity
 * @param version
 *            {number} Current version of the entity. If the version of the
 *            entity on the server does not match the version passed in, the
 *            server operation will fail. Use -1 to skip version checking.
 * @param callback
 *            {function} Callback handler
 */
brainCloudClient.entity.deleteEntity = function(entityId, version, callback) {
    var message = {
        entityId : entityId,
        version : version
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_DELETE,
        data : message,
        callback : callback
    });
};

/**
 * Method to delete the specified singleton entity for the player.
 *
 * @param entityType
 *            {string} Type of the entity to delete
 * @param version
 *            {number} Current version of the entity. If the version of the
 *            entity on the server does not match the version passed in, the
 *            server operation will fail. Use -1 to skip version checking.
 * @param callback
 *            {function} Callback handler
 */
brainCloudClient.entity.deleteSingleton = function(entityType, version,
        callback) {
    var message = {
        entityType : entityType,
        version : version
    };

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_DELETE_SINGLETON,
        data : message,
        callback : callback
    });
};

/**
* Method gets list of entities from the server base on type and/or where clause
*
* Service Name - Entity
* Service Operation - GET_LIST
*
* @param whereJson Mongo style query string
* @param orderByJson Sort order
* @param maxReturn The maximum number of entities to return
* @param callback The callback object
*/
brainCloudClient.entity.getList = function(whereJson, orderByJson, maxReturn, callback) {
    var message = {
        where : whereJson,
        maxReturn : maxReturn
    };

    if (orderByJson) {
        message.orderBy = orderByJson;
    }

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_GET_LIST,
        data : message,
        callback : callback
        });
};

/**
* Method gets a count of entities based on the where clause
*
* Service Name - Entity
* Service Operation - GET_LIST_COUNT
*
* @param whereJson Mongo style query string
* @param callback The callback object
*/
brainCloudClient.entity.getListCount = function(whereJson, callback) {
    var message = {
        where : whereJson
    };

    brainCloudManager
        .sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_GET_LIST_COUNT,
        data : message,
        callback : callback
        });
};

/**
 * Method uses a paging system to iterate through entities
 * After retrieving a page of entities with this method,
 * use GetPageOffset() to retrieve previous or next pages.
 *
 * Service Name - Entity
 * Service Operation - GetPage
 *
 * @param context The json context for the page request.
 *                   See the portal appendix documentation for format.
 * @param callback The callback object
 */
brainCloudClient.entity.getPage = function(context, callback)
{
    var message = {
    context : context
    };

    brainCloudManager
        .sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_GET_PAGE,
        data : message,
        callback : callback
        });
};

/**
 * Method to retrieve previous or next pages after having called the GetPage method.
 *
 * Service Name - Entity
 * Service Operation - GetPageOffset
 *
 * @param context The context string returned from the server from a
 *      previous call to GetPage or GetPageOffset
 * @param pageOffset The positive or negative page offset to fetch. Uses the last page
 *      retrieved using the context string to determine a starting point.
 * @param callback The callback object
 */
brainCloudClient.entity.getPageOffset = function(context, pageOffset, callback)
{
    var message = {
    context : context,
    pageOffset : pageOffset
    };

    brainCloudManager
        .sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_GET_PAGE_BY_OFFSET,
        data : message,
        callback : callback
        });
};

/**
* Partial increment of entity data field items. Partial set of items incremented as specified.
*
* Service Name - entity
* Service Operation - INCREMENT_USER_ENTITY_DATA
*
* @param entityId The id of the entity to update
* @param targetPlayerId Profile ID of the entity owner
* @param data The entity's data object
* @param returnData Should the entity be returned in the response?
* @param callback The callback object
*/
brainCloudClient.entity.incrementUserEntityData = function(entityId, targetPlayerId, data, returnData, callback)
{
    var message = {
        entityId : entityId,
        targetPlayerId : targetPlayerId
    };

    if(data) message.data = data;
    if(returnData) message.returnData = returnData;

    brainCloudManager.sendRequest({
        service : brainCloudClient.SERVICE_ENTITY,
        operation : brainCloudClient.entity.OPERATION_INCREMENT_USER_ENTITY_DATA,
        data : message,
        callback : callback
    });
};
