
function BCCustomEntity() {
    var bc = this;

	bc.customEntity = {};

	bc.SERVICE_CUSTOM_ENTITY = "customEntity";

	bc.customEntity.OPERATION_CREATE= "CREATE_ENTITY";
	bc.customEntity.OPERATION_GET_COUNT= "GET_COUNT";
	bc.customEntity.OPERATION_GET_PAGE= "GET_PAGE";
	bc.customEntity.OPERATION_GET_PAGE_OFFSET= "GET_PAGE_BY_OFFSET";
	bc.customEntity.OPERATION_GET_ENTITY_PAGE= "GET_ENTITY_PAGE";
	bc.customEntity.OPERATION_GET_ENTITY_PAGE_OFFSET= "GET_ENTITY_PAGE_OFFSET";
	bc.customEntity.OPERATION_READ_ENTITY= "READ_ENTITY";
	bc.customEntity.OPERATION_UPDATE_ENTITY= "UPDATE_ENTITY";
	bc.customEntity.OPERATION_UPDATE_ENTITY_FIELDS= "UPDATE_ENTITY_FIELDS";
	bc.customEntity.OPERATION_DELETE_ENTITY = "DELETE_ENTITY";
	bc.customEntity.OPERATION_DELETE_ENTITIES = "DELETE_ENTITIES";
	bc.customEntity.OPERATION_DELETE_SINGLETON = "DELETE_SINGLETON";
	bc.customEntity.OPERATION_READ_SINGLETON = "READ_SINGLETON";
	bc.customEntity.OPERATION_UPDATE_SINGLETON = "UPDATE_SINGLETON";
	bc.customEntity.OPERATION_UPDATE_SINGLETON_FIELDS = "UPDATE_SINGLETON_FIELDS";

	/**
	 * Creates new custom entity.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param data
	 *            {json} The entity's data as a json string
	 * @param acl
	 *            {json} The entity's access control list as json. A null acl
	 *            implies default permissions which make the entity
	 *            readable/writeable by only the user.
	 * @param timeToLive
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.createEntity = function(entityType, data, acl, timeToLive, isOwned, callback) {
		var message = {
			entityType : entityType,
			data : data,
			timeToLive : timeToLive, 
			isOwned : isOwned 
		};

		if (acl) {
			message["acl"] = acl;
		}

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_CREATE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Counts the number of custom entities meeting the specified where clause.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param whereJson
	 *            {json} The entity data
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.getCount = function(entityType, whereJson, callback) {
		var message = {
			entityType : entityType,
			whereJson : whereJson
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_GET_COUNT,
			data : message,
			callback : callback
		});
	};

	/**
	 * Retrieves first page of custom entities from the server based on the custom entity type and specified query context
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param rowsPerPage
	 *            {int} 
	 * @param searchJson
	 * 			  {json} data to look for
	 * @param sortJson
	 * 			  {json} data to sort by
	 * @param doCount 
	 * 			  {bool} 
	 * @param callback
	 *            {function} The callback handler.
	 */

	/**
     * @deprecated Use getEntityPage() instead
     */
	bc.customEntity.getPage = function(entityType, rowsPerPage, searchJson, sortJson, doCount, callback) {
		var message = {
			entityType : entityType,
			rowsPerPage : rowsPerPage,
			doCount : doCount
		};

		if(searchJson) message.searchJson = searchJson;
		if(sortJson) message.sortJson = sortJson;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_GET_PAGE,
			data : message,
			callback : callback
		});
	};

	/** 
	* @param context The json context for the page request.
	*                   See the portal appendix documentation for format.
	* @param entityType
	* @param callback The callback object
	*/
	bc.customEntity.getEntityPage = function(entityType, context, callback) {
		var message = {
			entityType : entityType,
			context : context
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_GET_ENTITY_PAGE,
			data : message,
			callback : callback
		});
	};

	/**
	 * Creates new custom entity.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param context
	 * 			  {string} context
	 * @param pageOffset
	 *            {int} 
	 * @param callback
	 *            {function} The callback handler.
	 */

	 /**
     * @deprecated Use getEntityPageOffset() instead
     */
	bc.customEntity.getPageOffset = function(entityType, context, pageOffset, callback) {
		var message = {
			entityType : entityType,
			context : context,
			pageOffset : pageOffset
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_GET_PAGE_OFFSET,
			data : message,
			callback : callback
		});
	};

		/**
	 * Creates new custom entity.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param context
	 * 			  {string} context
	 * @param pageOffset
	 *            {int} 
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.getEntityPageOffset = function(entityType, context, pageOffset, callback) {
		var message = {
			entityType : entityType,
			context : context,
			pageOffset : pageOffset
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_GET_ENTITY_PAGE_OFFSET,
			data : message,
			callback : callback
		});
	};


	/**
	 * Reads a custom entity.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param entityId
	 * 			  {string}
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.readEntity = function(entityType, entityId, callback) {
		var message = {
			entityType : entityType,
			entityId : entityId
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_READ_ENTITY,
			data : message,
			callback : callback
		});
	};

	/**
	 * Replaces the specified custom entity's data, and optionally updates the acl and expiry, on the server.
	 *
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param entityId
	 * 			  {string}
	 * @param version
	 * @param dataJson
	 * 			  {json} data of entity
	 * @param acl 
	 * 			  {json} 
	 * @param timeToLive
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.updateEntity = function(entityType, entityId, version, dataJson, acl, timeToLive, callback) {
		var message = {
			entityType : entityType,
			entityId : entityId,
			version : version,
			timeToLive : timeToLive
		};

		if(dataJson) message.dataJson = dataJson;
		if(acl) message.acl = acl;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_UPDATE_ENTITY,
			data : message,
			callback : callback
		});
	};

	/**
	 *Sets the specified fields within custom entity data on the server.
	 * 
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param entityId
	 * 			  {string}
	 * @param version
	 * @param fieldsJson
	 * 			  {json} the fields in the entity
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.updateEntityFields = function(entityType, entityId, version, fieldsJson, callback) {
		var message = {
			entityType : entityType,
			entityId : entityId,
			version : version
		};

		if(fieldsJson) message.fieldsJson = fieldsJson;

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_UPDATE_ENTITY_FIELDS,
			data : message,
			callback : callback
		});
	};

/**
*deletes entities based on the delete criteria.
* 
* @param entityType
*            {string} The entity type as defined by the user
* @param deleteCriteria
* 			  {json} delte criteria
* @param callback
*            {function} The callback handler.
*/
bc.customEntity.deleteEntities = function(entityType, deleteCriteria, callback) {
	var message = {
		entityType : entityType,
		deleteCriteria : deleteCriteria
	};

	bc.brainCloudManager.sendRequest({
		service : bc.SERVICE_CUSTOM_ENTITY,
		operation : bc.customEntity.OPERATION_DELETE_ENTITIES,
		data : message,
		callback : callback
	});
};

/**
*
* 
* @param entityType
*            {string} The entity type as defined by the user
* @param version
* 			  
* @param callback
*            {function} The callback handler.
*/
bc.customEntity.deleteSingleton = function(entityType, version, callback) {
	var message = {
		entityType : entityType,
		version : version
	};

	bc.brainCloudManager.sendRequest({
		service : bc.SERVICE_CUSTOM_ENTITY,
		operation : bc.customEntity.OPERATION_DELETE_SINGLETON,
		data : message,
		callback : callback
	});
};

/**
*
* 
* @param entityType
*            {string} The entity type as defined by the user
* @param callback
*            {function} The callback handler.
*/
bc.customEntity.readSingleton = function(entityType, callback) {
	var message = {
		entityType : entityType,
	};

	bc.brainCloudManager.sendRequest({
		service : bc.SERVICE_CUSTOM_ENTITY,
		operation : bc.customEntity.OPERATION_READ_SINGLETON,
		data : message,
		callback : callback
	});
};

/**
*
* 
* @param entityType
*            {string} The entity type as defined by the user
* @param version
* 			  
* @param callback
*            {function} The callback handler.
*/
bc.customEntity.updateSingleton = function(entityType, version, dataJson, acl, timeToLive, callback) {
	var message = {
		entityType : entityType,
		version : version,
		dataJson : dataJson,
		acl : acl,
		timeToLive: timeToLive
	};

	bc.brainCloudManager.sendRequest({
		service : bc.SERVICE_CUSTOM_ENTITY,
		operation : bc.customEntity.OPERATION_UPDATE_SINGLETON,
		data : message,
		callback : callback
	});
};

/**
*
* 
* @param entityType
*            {string} The entity type as defined by the user
* @param version
* 			  
* @param callback
*            {function} The callback handler.
*/
bc.customEntity.updateSingletonFields = function(entityType, version, fieldsJson, callback) {
	var message = {
		entityType : entityType,
		version : version,
		fieldsJson : fieldsJson
	};

	bc.brainCloudManager.sendRequest({
		service : bc.SERVICE_CUSTOM_ENTITY,
		operation : bc.customEntity.OPERATION_UPDATE_SINGLETON_FIELDS,
		data : message,
		callback : callback
	});
};

/**
*
* 
* @param entityType
*            {string} The entity type as defined by the user
* @param version
* 			  
* @param callback
*            {function} The callback handler.
*/
bc.customEntity.incrementData = function(entityType, entityId, fieldsJson, callback) {
	var message = {
		entityType : entityType,
		entityId : entityId,
		fieldsJson : fieldsJson
	};

	bc.brainCloudManager.sendRequest({
		service : bc.SERVICE_CUSTOM_ENTITY,
		operation : bc.customEntity.OPERATION_INCREMENT_DATA,
		data : message,
		callback : callback
	});
};


	/**
	 *Deletes the specified custom entity on the server.
	 * 
	 * @param entityType
	 *            {string} The entity type as defined by the user
	 * @param entityId
	 * @param version
	 * @param callback
	 *            {function} The callback handler.
	 */
	bc.customEntity.deleteEntity = function(entityType, entityId, version, callback) {
		var message = {
			entityType : entityType,
			entityId : entityId,
			version : version
		};

		bc.brainCloudManager.sendRequest({
			service : bc.SERVICE_CUSTOM_ENTITY,
			operation : bc.customEntity.OPERATION_DELETE_ENTITY,
			data : message,
			callback : callback
		});
	};

}

BCCustomEntity.apply(window.brainCloudClient = window.brainCloudClient || {});
