'use strict';

var logger

exports.setLogger = function(log) {
    logger = log
}

exports.parse = function(item, entity) {
    entity = item = true
    logger.error('Not implemented yet')
}

exports.build = function(data, stanza) {
    if (stanza.children.length > 0) return
    data = data
    logger.error('Not implemented yet')
}
