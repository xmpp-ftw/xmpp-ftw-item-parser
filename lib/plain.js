'use strict';

var logger

exports.setLogger = function(log) {
    logger = log
}

exports.parse = function(item, entity) {
    if (0 !== Object.keys(entity).length) return
    entity.body = item.getChild('body').children.join('')
}

exports.build = function(data, stanza) {
    if (stanza.children.length > 0) return
    stanza.c('body').t(data).up()
}