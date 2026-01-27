// Copyright 2026 bitHeads, Inc. All Rights Reserved.

function BCItemCatalog () {
  var bc = this

  bc.itemCatalog = {}

  bc.SERVICE_ITEMCATALOG = 'itemCatalog'

  bc.itemCatalog.OPERATION_GET_CATALOG_ITEM_DEFINITION =
    'GET_CATALOG_ITEM_DEFINITION'
  bc.itemCatalog.OPERATION_GET_CATALOG_ITEMS_PAGE = 'GET_CATALOG_ITEMS_PAGE'
  bc.itemCatalog.OPERATION_GET_CATALOG_ITEMS_PAGE_OFFSET =
    'GET_CATALOG_ITEMS_PAGE_OFFSET'

  /**
   * Reads an existing item definition from the server, with language fields
   * limited to the current or default language.
   *
   * Service Name - ItemCatalog
   * Service Operation - GET_CATALOG_ITEM_DEFINITION
   *
   * @param defId The identifier of the catalog item definition to retrieve
   * @param callback The method to be invoked when the server response is received
   */
  bc.itemCatalog.getCatalogItemDefinition = function (defId, callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_ITEMCATALOG,
      operation: bc.itemCatalog.OPERATION_GET_CATALOG_ITEM_DEFINITION,
      data: {
        defId: defId
      },
      callback: callback
    })
  }

  /**
   * Retrieve a page of catalog items from the server, with language fields
   * limited to the text for the current or default language.
   *
   * Service Name - ItemCatalog
   * Service Operation - GET_CATALOG_ITEMS_PAGE
   *
   * @param context The pagination context returned from a previous catalog page request
   * @param callback The method to be invoked when the server response is received
   */
  bc.itemCatalog.getCatalogItemsPage = function (context, callback) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_ITEMCATALOG,
      operation: bc.itemCatalog.OPERATION_GET_CATALOG_ITEMS_PAGE,
      data: {
        context: context
      },
      callback: callback
    })
  }

  /**
   * Gets a page of catalog items from the server based on the encoded
   * context and specified page offset, with language fields limited to the
   * text for the current or default language.
   *
   * Service Name - itemCatalog
   * Service Operation - GET_CATALOG_ITEMS_PAGE_OFFSET
   *
   * @param context The pagination context returned from a previous catalog page request
   * @param pageOffset The page offset relative to the current context
   * @param callback The method to be invoked when the server response is received
   */
  bc.itemCatalog.getCatalogItemsPageOffset = function (
    context,
    pageOffset,
    callback
  ) {
    bc.brainCloudManager.sendRequest({
      service: bc.SERVICE_ITEMCATALOG,
      operation: bc.itemCatalog.OPERATION_GET_CATALOG_ITEMS_PAGE_OFFSET,
      data: {
        context: context,
        pageOffset: pageOffset
      },
      callback: callback
    })
  }
}

BCItemCatalog.apply((window.brainCloudClient = window.brainCloudClient || {}))
