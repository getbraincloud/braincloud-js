
function BCGlobalEntity() {
    var bc = this;

	bc.globalEntity = {};

	bc.SERVICE_GLOBAL_ENTITY = "globalEntity";

	bc.globalEntity.OPERATION_CREATE = "CREATE";
	bc.globalEntity.OPERATION_CREATE_WITH_INDEXED_ID = "CREATE_WITH_INDEXED_ID";
	bc.globalEntity.OPERATION_READ = "READ";
	bc.globalEntity.OPERATION_UPDATE = "UPDATE";
	bc.globalEntity.OPERATION_UPDATE_ACL = "UPDATE_ACL";
	bc.globalEntity.OPERATION_UPDATE_TIME_TO_LIVE = "UPDATE_TIME_TO_LIVE";
	bc.globalEntity.OPERATION_DELETE = "DELETE";
	bc.globalEntity.OPERATION_GET_LIST = "GET_LIST";
	bc.globalEntity.OPERATION_GET_LIST_BY_INDEXED_ID = "GET_LIST_BY_INDEXED_ID";
	bc.globalEntity.OPERATION_GET_LIST_COUNT = "GET_LIST_COUNT";
	bc.globalEntity.OPERATION_GET_PAGE = "GET_PAGE";
	bc.globalEntity.OPERATION_GET_PAGE_BY_OFFSET = "GET_PAGE_BY_OFFSET";
	bc.globalEntity.OPERATION_INCREMENT_GLOBAL_ENTITY_DATA = "INCREMENT_GLOBAL_ENTITY_DATA";
	bc.globalEntity.OPERATION_GET_RANDOM_ENTITIES_MATCHING = "GET_RANDOM_ENTITIES_MATCHING";
	bc.globalEntity.OPERATION_UPDATE_ENTITY_INDEXED_ID = "UPDATE_INDEXED_ID";
	bc.globalEntity.OPERATION_UPDATE_ENTITY_OWNER_AND_ACL = "UPDATE_ENTITY_OWNER_AND_ACL";
	bc.globalEntity.OPERATION_MAKE_SYSTEM_ENTITY = "MAKE_SYSTEM_ENTITY";

	/**
	 * Method creates a new entity on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - Create
	 *
	 * @param entityType The entity type as defined by the user
	 * @param timeToLive Sets expiry time for entity in milliseconds if > 0
	 * @param acl The entity's access control list as json. A null acl implies default
	 * @param data   The entity's data as a json string
	 * @param callback The callback object
	 */
	bc.globalEntity.createEntity = function(entityType, timeToLive,
														  acl, data, callback) {
		var message = {
			entityType : entityType,
			timeToLive : timeToLive,
			data : data
		};

		if (acl) {
			message["acl"] = acl;
		}

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_CREATE,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method creates a new entity on the server with an indexed id.
	 *
	 * Service Name - globalEntity
	 * Service Operation - CreateWithIndexedId
	 *
	 * @param entityType The entity type as defined by the user
	 * @param indexedId A secondary ID that will be indexed
	 * @param timeToLive Sets expiry time for entity in milliseconds if > 0
	 * @param acl The entity's access control list as json. A null acl implies default
	 * @param data   The entity's data as a json string
	 * @param callback The callback object
	 */
	bc.globalEntity.createEntityWithIndexedId = function(entityType,
																	   indexedId, timeToLive, acl, data, callback) {
		var message = {
			entityType : entityType,
			entityIndexedId : indexedId,
			timeToLive : timeToLive,
			data : data
		};

		if (acl) {
			message["acl"] = acl;
		}

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_CREATE_WITH_INDEXED_ID,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method deletes an existing entity on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - Delete
	 *
	 * @param entityId The entity ID
	 * @param version The version of the entity to delete
	 * @param callback The callback object
	 */
	bc.globalEntity.deleteEntity = function(entityId, version,
														  callback) {
		var message = {
			entityId : entityId,
			version : version
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_DELETE,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method gets list of entities from the server base on type and/or where clause
	 *
	 * Service Name - globalEntity
	 * Service Operation - GetList
	 *
	 * @param where Mongo style query string
	 * @param orderBy Sort order
	 * @param maxReturn The maximum number of entities to return
	 * @param callback The callback object
	 */
	bc.globalEntity.getList = function(where, orderBy, maxReturn,
													 callback) {
		var message = {
			where : where,
			maxReturn : maxReturn
		};

		if (orderBy) {
			message["orderBy"] = orderBy;
		}

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_GET_LIST,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method gets list of entities from the server base on indexed id
	 *
	 * Service Name - globalEntity
	 * Service Operation - GetListByIndexedId
	 *
	 * @param entityIndexedId The entity indexed Id
	 * @param maxReturn The maximum number of entities to return
	 * @param callback The callback object
	 */
	bc.globalEntity.getListByIndexedId = function(entityIndexedId,
																maxReturn, callback) {
		var message = {
			entityIndexedId : entityIndexedId,
			maxReturn : maxReturn
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_GET_LIST_BY_INDEXED_ID,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method gets a count of entities based on the where clause
	 *
	 * Service Name - globalEntity
	 * Service Operation - GetListCount
	 *
	 * @param where Mongo style query string
	 * @param callback The callback object
	 */
	bc.globalEntity.getListCount = function(where, callback) {
		var message = {
			where : where
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_GET_LIST_COUNT,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method reads an existing entity from the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - Read
	 *
	 * @param entityId The entity ID
	 * @param callback The callback object
	 */
	bc.globalEntity.readEntity = function(entityId, callback) {
		var message = {
			entityId : entityId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_ENTITY,
			operation : bc.globalEntity.OPERATION_READ,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method updates an existing entity on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - UPDATE
	 *
	 * @param entityId The entity ID
	 * @param version The version of the entity to update
	 * @param data   The entity's data as a json string
	 * @param callback The callback object
	 */
	bc.globalEntity.updateEntity = function(entityId, version, data, callback) {
		var message = {
			entityId : entityId
		};

		if(typeof version === "number") {
			message.version = version;
			message.data = data;
		}
		else {
			message.version = data;
			message.data = version;
		}

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_UPDATE,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method updates an existing entity's Acl on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - UpdateAcl
	 *
	 * @param entityId The entity ID
	 * @param acl The entity's access control list as json.
	 * @param version The version of the entity to update
	 * @param callback The callback object
	 */
	bc.globalEntity.updateEntityAcl = function(entityId, acl,
															 version, callback) {
		var message = {
			entityId : entityId,
			version : version,
			acl : acl
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_UPDATE_ACL,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method updates an existing entity's time to live on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - UpdateTimeToLive
	 *
	 * @param entityId The entity ID
	 * @param timeToLive Sets expiry time for entity in milliseconds if > 0
	 * @param version The version of the entity to update
	 * @param callback The callback object
	 */
	bc.globalEntity.updateEntityUpdateTimeToLive = function(entityId,
																		  timeToLive, version, callback) {
		var message = {
			entityId : entityId,
			version : version,
			timeToLive : timeToLive
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_UPDATE_TIME_TO_LIVE,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method uses a paging system to iterate through Global Entities
	 * After retrieving a page of Global Entities with this method,
	 * use GetPageOffset() to retrieve previous or next pages.
	 *
	 * Service Name - globalEntity
	 * Service Operation - GetPage
	 *
	 * @param context The json context for the page request.
	 *                   See the portal appendix documentation for format.
	 * @param callback The callback object
	 */
	bc.globalEntity.getPage = function(context, callback) {
		var message = {
			context : context
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_GET_PAGE,
				data : message,
				callback : callback
			});
	};

	/**
	 * Method to retrieve previous or next pages after having called the GetPage method.
	 *
	 * Service Name - globalEntity
	 * Service Operation - GetPageOffset
	 *
	 * @param context The context string returned from the server from a
	 *      previous call to GetPage or GetPageOffset
	 * @param pageOffset The positive or negative page offset to fetch. Uses the last page
	 *      retrieved using the context string to determine a starting point.
	 * @param callback The callback object
	 */
	bc.globalEntity.getPageOffset = function(context, pageOffset,
														   callback) {
		var message = {
			context : context,
			pageOffset : pageOffset
		};

		bc.brainCloudManager
			.sendRequest({
				service : bc.SERVICE_GLOBAL_ENTITY,
				operation : bc.globalEntity.OPERATION_GET_PAGE_BY_OFFSET,
				data : message,
				callback : callback
			});
	};

	/**
	 * Partial increment of global entity data field items. Partial set of items incremented as specified.
	 *
	 * Service Name - globalEntity
	 * Service Operation - INCREMENT_GLOBAL_ENTITY_DATA
	 *
	 * @param entityId The id of the entity to update
	 * @param data The entity's data object
	 * @param callback The callback object
	 */
	bc.globalEntity.incrementGlobalEntityData = function(entityId, data, callback)
	{
		var message = {
			entityId : entityId,
			data : data
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_ENTITY,
			operation : bc.globalEntity.OPERATION_INCREMENT_GLOBAL_ENTITY_DATA,
			data : message,
			callback : callback
		});
	};

	/**
	 * Gets a list of up to randomCount randomly selected entities from the server based on the where condition and specified maximum return count.
	 *
	 * Service Name - globalEntity
	 * Service Operation - GET_RANDOM_ENTITIES_MATCHING
	 *
	 * @param where Mongo style query string.
	 * @param maxReturn The maximum number of entities to return.
	 * @param callback The callback object
	 */
	bc.globalEntity.getRandomEntitiesMatching = function(where, maxReturn, callback)
	{
		var message = {
			where : where,
			maxReturn : maxReturn
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_ENTITY,
			operation : bc.globalEntity.OPERATION_GET_RANDOM_ENTITIES_MATCHING,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method updates an existing entity's Owner and ACL on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - UPDATE_ENTITY_OWNER_AND_ACL
	 *
	 * @param entityId The entity ID
	 * @param version The version of the entity to update
	 * @param entityIndexedId the id index of the entity
	 * @param callback The callback object
	 */
	bc.globalEntity.updateEntityIndexedId = function(entityId, version, entityIndexedId, callback)
	{
		var message = {
			entityId : entityId,
			version : version,
			entityIndexedId: entityIndexedId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_ENTITY,
			operation : bc.globalEntity.OPERATION_UPDATE_ENTITY_INDEXED_ID,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method updates an existing entity's Owner and ACL on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - UPDATE_ENTITY_OWNER_AND_ACL
	 *
	 * @param entityId The entity ID
	 * @param version The version of the entity to update
	 * @param ownerId The owner ID
	 * @param acl The entity's access control list
	 * @param callback The callback object
	 */
	bc.globalEntity.updateEntityOwnerAndAcl = function(entityId, version, ownerId, acl, callback)
	{
		var message = {
			entityId : entityId,
			version : version,
			ownerId: ownerId,
			acl : acl
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_ENTITY,
			operation : bc.globalEntity.OPERATION_UPDATE_ENTITY_OWNER_AND_ACL,
			data : message,
			callback : callback
		});
	};

	/**
	 * Method clears the owner id of an existing entity and sets the ACL on the server.
	 *
	 * Service Name - globalEntity
	 * Service Operation - MAKE_SYSTEM_ENTITY
	 *
	 * @param entityId The entity ID
	 * @param version The version of the entity to update
	 * @param acl The entity's access control list
	 * @param callback The callback object
	 */
	bc.globalEntity.makeSystemEntity = function(entityId, version, acl, callback)
	{
		var message = {
			entityId : entityId,
			version : version,
			acl : acl
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_GLOBAL_ENTITY,
			operation : bc.globalEntity.OPERATION_MAKE_SYSTEM_ENTITY,
			data : message,
			callback : callback
		});
	};

}

BCGlobalEntity.apply(window.brainCloudClient = window.brainCloudClient || {});
