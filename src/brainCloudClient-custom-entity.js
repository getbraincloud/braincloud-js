// Copyright 2026 bitHeads, Inc. All Rights Reserved.

function BCCustomEntity () {
  var bc = this

  bc.customEntity = {}

  bc.SERVICE_CUSTOM_ENTITY = 'customEntity'

  bc.customEntity.OPERATION_CREATE = 'CREATE_ENTITY'
  bc.customEntity.OPERATION_GET_COUNT = 'GET_COUNT'
  bc.customEntity.OPERATION_GET_PAGE = 'GET_PAGE'
  bc.customEntity.OPERATION_GET_RANDOM_ENTITIES_MATCHING =
    'GET_RANDOM_ENTITIES_MATCHING'
  bc.customEntity.OPERATION_GET_PAGE_OFFSET = 'GET_PAGE_BY_OFFSET'
  bc.customEntity.OPERATION_GET_ENTITY_PAGE = 'GET_ENTITY_PAGE'
  bc.customEntity.OPERATION_GET_ENTITY_PAGE_OFFSET = 'GET_ENTITY_PAGE_OFFSET'
  bc.customEntity.OPERATION_READ_ENTITY = 'READ_ENTITY'
  bc.customEntity.OPERATION_UPDATE_ENTITY = 'UPDATE_ENTITY'
  bc.customEntity.OPERATION_UPDATE_ENTITY_FIELDS = 'UPDATE_ENTITY_FIELDS'
  bc.customEntity.OPERATION_UPDATE_ENTITY_FIELDS_SHARDED =
    'UPDATE_ENTITY_FIELDS_SHARDED'
  bc.customEntity.OPERATION_DELETE_ENTITY = 'DELETE_ENTITY'
  bc.customEntity.OPERATION_DELETE_ENTITIES = 'DELETE_ENTITIES'
  bc.customEntity.OPERATION_DELETE_SINGLETON = 'DELETE_SINGLETON'
  bc.customEntity.OPERATION_READ_SINGLETON = 'READ_SINGLETON'
  bc.customEntity.OPERATION_INCREMENT_SINGLETON_DATA =
    'INCREMENT_SINGLETON_DATA'
  bc.customEntity.OPERATION_UPDATE_SINGLETON = 'UPDATE_SINGLETON'
  bc.customEntity.OPERATION_UPDATE_SINGLETON_FIELDS = 'UPDATE_SINGLETON_FIELDS'

  /**
   * Creates new custom entity.
   *
   * Service Name - CustomEntity
   * Service Operation - CreateEntity
   *
   * @param entityType The entity type as defined by the user
   * @param jsonEntityData The entity's data as a json string
   * @param jsonEntityAcl The entity's access control list as json. A null acl implies default
   * permissions which make the entity readable/writeable by only the user.
   * @param timeToLive
   * @param isOwned
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.createEntity = function (
    entityType,
    dataJson,
    acl,
    timeToLive,
    isOwned,
    callback
  ) {
    var message = {
      entityType: entityType,
      dataJson: dataJson,
      timeToLive: timeToLive,
      isOwned: isOwned
    }

    if (acl) {
      message['acl'] = acl
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_CREATE,
      data: message,
      callback: callback
    })
  }

  /**
   * Counts the number of custom entities meeting the specified where clause, enforcing ownership/ACL permissions
   *
   * Service Name - CustomEntity
   * Service Operation - GetCount
   *
   * @param entityType The entity type as defined by the user
   * @param whereJson Mongo style query string
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.getCount = function (entityType, whereJson, callback) {
    var message = {
      entityType: entityType,
      whereJson: whereJson
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_GET_COUNT,
      data: message,
      callback: callback
    })
  }

  /**
   * Gets a list of up to maxReturn randomly selected custom entities from the
   * server based on the entity type and where condition.
   *
   * Service Name - CustomEntity
   * Service Operation - GetRandomEntitiesMatching
   *
   * @param entityType The entity type as defined by the user
   * @param whereJson Mongo style query string
   * @param maxReturn Max number of returns
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.getRandomEntitiesMatching = function (
    entityType,
    whereJson,
    maxReturn,
    callback
  ) {
    var message = {
      entityType: entityType,
      whereJson: whereJson,
      maxReturn: maxReturn
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_GET_RANDOM_ENTITIES_MATCHING,
      data: message,
      callback: callback
    })
  }

  /**
   * Method uses a paging system to iterate through Custom Entities
   * After retrieving a page of Custom Entities with this method,
   * use GetEntityPageOffset() to retrieve previous or next pages.
   *
   * Service Name - CustomEntity
   * Service Operation - GetCustomEntityPage
   *
   * @param entityType The entity type as defined by the user
   * @param context The json context for the page request.
   *                   See the portal appendix documentation for format.
   * @param callback The callback object
   */
  bc.customEntity.getEntityPage = function (entityType, context, callback) {
    var message = {
      entityType: entityType,
      context: context
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_GET_ENTITY_PAGE,
      data: message,
      callback: callback
    })
  }

  /**
   * Gets the page of custom entities from the server based on the encoded context and specified page offset.
   *
   * Service Name - CustomEntity
   * Service Operation - GetEntityPageOffset
   *
   * @param entityType The entity type as defined by the user
   * @param context The context string returned from the server from a previous
   *                   call to GetPage or GetPageOffset.
   * @param pageOffset The positive or negative page offset to fetch. Uses the
   *                   last page retrieved using the context string to determine a
   *                   starting point.
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.getEntityPageOffset = function (
    entityType,
    context,
    pageOffset,
    callback
  ) {
    var message = {
      entityType: entityType,
      context: context,
      pageOffset: pageOffset
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_GET_ENTITY_PAGE_OFFSET,
      data: message,
      callback: callback
    })
  }

  /**
   * Reads the specified custom entity from the server.
   *
   * Service Name - CustomEntity
   * Service Operation - ReadEntity
   *
   * @param entityType The entity type as defined by the user
   * @param entityId The entity id as defined by the system
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.readEntity = function (entityType, entityId, callback) {
    var message = {
      entityType: entityType,
      entityId: entityId
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_READ_ENTITY,
      data: message,
      callback: callback
    })
  }

  /**
   * Replaces the specified custom entity's data, and optionally updates the acl and expiry, on the server.
   *
   * Service Name - CustomEntity
   * Service Operation - UpdateEntity
   *
   * @param entityType The entity type as defined by the user
   * @param entityId The id of custom entity being updated.
   * @param version Version of the custom entity being updated.
   * @param jsonEntityData The entity's data as a json string
   * @param jsonEntityAcl The entity's access control list as json. A null acl implies default
   * permissions which make the entity readable/writeable by only the user.
   * @param timeToLive
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.updateEntity = function (
    entityType,
    entityId,
    version,
    dataJson,
    acl,
    timeToLive,
    callback
  ) {
    var message = {
      entityType: entityType,
      entityId: entityId,
      version: version,
      timeToLive: timeToLive
    }

    if (dataJson) message.dataJson = dataJson
    if (acl) message.acl = acl

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_UPDATE_ENTITY,
      data: message,
      callback: callback
    })
  }

  /**
   * Replaces the specified custom entity's data, and optionally updates the acl and expiry, on the server.
   *
   * Service Name - CustomEntity
   * Service Operation - UpdateEntityFields
   *
   * @param entityType The entity type as defined by the user
   * @param entityId The id of custom entity being updated.
   * @param version Version of the custom entity being updated.
   * @param fieldsJson Specific fields, as JSON, to set within entity's custom data.
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.updateEntityFields = function (
    entityType,
    entityId,
    version,
    fieldsJson,
    callback
  ) {
    var message = {
      entityType: entityType,
      entityId: entityId,
      version: version
    }

    if (fieldsJson) message.fieldsJson = fieldsJson

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_UPDATE_ENTITY_FIELDS,
      data: message,
      callback: callback
    })
  }

  /**
   * For sharded custom collection entities. Sets the specified fields within custom entity data on the server, enforcing ownership/ACL permissions.
   *
   * Service Name - CustomEntity
   * Service Operation - UpdateEntityFieldsSharded
   *
   * @param entityType The entity type as defined by the user
   * @param entityId The id of custom entity being updated.
   * @param version Version of the custom entity being updated.
   * @param fieldsJson Specific fields, as JSON, to set within entity's custom data.
   * @param shardKeyJson The shard key field(s) and value(s), as JSON, applicable to the entity being updated.
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.updateEntityFieldsSharded = function (
    entityType,
    entityId,
    version,
    fieldsJson,
    shardKeyJson,
    callback
  ) {
    var message = {
      entityType: entityType,
      entityId: entityId,
      version: version
    }

    if (fieldsJson) message.fieldsJson = fieldsJson
    if (shardKeyJson) message.shardKeyJson = shardKeyJson

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_UPDATE_ENTITY_FIELDS_SHARDED,
      data: message,
      callback: callback
    })
  }

  /**
   * deletes entities based on the delete criteria.
   *
   * Service Name - CustomEntity
   * Service Operation - DeleteEntities
   *
   * @param entityType The entity type as defined by the user
   * @param deleteCriteria Json string of criteria wanted for deletion
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.deleteEntities = function (
    entityType,
    deleteCriteria,
    callback
  ) {
    var message = {
      entityType: entityType,
      deleteCriteria: deleteCriteria
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_DELETE_ENTITIES,
      data: message,
      callback: callback
    })
  }

  /**
   * Deletes the specified custom entity singleton, owned by the session's user,
   * for the specified entity type, on the server.
   *
   * Service Name - CustomEntity
   * Service Operation - DeleteSingleton
   *
   * @param entityType The entity type as defined by the user
   * @param version Version of the singleton being deleted.
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.deleteSingleton = function (entityType, version, callback) {
    var message = {
      entityType: entityType,
      version: version
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_DELETE_SINGLETON,
      data: message,
      callback: callback
    })
  }

  /**
   * Reads the custom entity singleton owned by the session's user.
   *
   * Service Name - CustomEntity
   * Service Operation - ReadSingleton
   *
   * @param entityType The entity type as defined by the user
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.readSingleton = function (entityType, callback) {
    var message = {
      entityType: entityType
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_READ_SINGLETON,
      data: message,
      callback: callback
    })
  }

  /**
   * Increments the specified fields, of the singleton owned by the user, by the specified amount within the custom entity data on the server.
   *
   * Service Name - customEntity
   * Service Operation - INCREMENT_SINGLETON_DATA
   *
   * @param entityType The type of custom entity being updated.
   * @param fieldsJson Specific fields, as JSON, within entity's custom data, with respective increment amount.
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.incrementSingletonData = function (
    entityType,
    fieldsJson,
    callback
  ) {
    var message = {
      entityType: entityType,
      fieldsJson: fieldsJson
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_INCREMENT_SINGLETON_DATA,
      data: message,
      callback: callback
    })
  }

  /**
   * Updates the singleton owned by the user for the specified custom entity type on the server,
   * creating the singleton if it does not exist.
   * This operation results in the owned singleton's data being completely replaced by the passed in JSON object.
   *
   * Service Name - CustomEntity
   * Service Operation - UpdateSingleton
   *
   * @param entityType The entity type as defined by the user
   * @param version Version of the singleton being updated.
   * @param dataJson The full data for the singleton as a json string
   * @param acl The singleton entity's Access Control List as an object.
   * 				 A null ACL implies default permissions which make the entity readable by others.
   * @param timeToLive The duration of time, in milliseconds, the singleton custom entity should live
   * 				before being expired. Null indicates never expires. Value of -1 indicates no change for updates.
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.updateSingleton = function (
    entityType,
    version,
    dataJson,
    acl,
    timeToLive,
    callback
  ) {
    var message = {
      entityType: entityType,
      version: version,
      dataJson: dataJson,
      acl: acl,
      timeToLive: timeToLive
    }

    if (acl) {
      message['acl'] = acl
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_UPDATE_SINGLETON,
      data: message,
      callback: callback
    })
  }

  /**
   * Partially updates the data, of the singleton owned by the user for the specified custom entity type,
   * with the specified fields, on the server
   *
   * Service Name - CustomEntity
   * Service Operation - UpdateSingletonFields
   *
   * @param entityType The entity type as defined by the user
   * @param version Version of the singleton being updated.
   * @param fieldsJson Specific fields, as JSON, within entity's custom data to be updated.
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.updateSingletonFields = function (
    entityType,
    version,
    fieldsJson,
    callback
  ) {
    var message = {
      entityType: entityType,
      version: version,
      fieldsJson: fieldsJson
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_UPDATE_SINGLETON_FIELDS,
      data: message,
      callback: callback
    })
  }

  /**
   * Increments fields on the specified custom entity owned by the user on the server.
   *
   * Service Name - customEntity
   * Service Operation - INCREMENT_DATA
   *
   * @param entityType The entity type as defined by the user
   * @param entityId The entity id as defined by the system
   * @param fieldsJson Specific fields, as JSON, within entity's custom data, with respective increment amount.
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.incrementData = function (
    entityType,
    entityId,
    fieldsJson,
    callback
  ) {
    var message = {
      entityType: entityType,
      entityId: entityId,
      fieldsJson: fieldsJson
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_INCREMENT_DATA,
      data: message,
      callback: callback
    })
  }

  /**
   * Deletes the specified custom entity on the server.
   *
   * Service Name - CustomEntity
   * Service Operation - DeleteEntity
   *
   * @param entityType The entity type as defined by the user
   * @param jsonEntityData The entity's data as a json string
   * @param version Version of the custom entity being updated.
   * @param callback The method to be invoked when the server response is received
   */
  bc.customEntity.deleteEntity = function (
    entityType,
    entityId,
    version,
    callback
  ) {
    var message = {
      entityType: entityType,
      entityId: entityId,
      version: version
    }

    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_CUSTOM_ENTITY,
      operation: bc.customEntity.OPERATION_DELETE_ENTITY,
      data: message,
      callback: callback
    })
  }
}

BCCustomEntity.apply((window.brainCloudClient = window.brainCloudClient || {}))
