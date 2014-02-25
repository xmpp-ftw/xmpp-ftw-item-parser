'use strict';

var logger

exports.setLogger = function(log) {
    logger = log
}

var NS = exports.NS = 'http://jabber.org/protocol/tune'

var attributes = [
    'artist', 'length', 'rating', 'source', 'title', 'track', 'uri'
]

exports.parse = function(item, entity) {
    if (!item.getChild('tune', NS)) return
    var details = {}
    var tune = item.getChild('tune')
    attributes.forEach(function(attribute) {
        var value = tune.getChildText(attribute)
        if (!value) return
        if (('length' === attribute) || ('rating' === attribute)) {
            value = parseInt(value)
        }
        details[attribute] = value
    })
    entity.tune = details
}

exports.build = function(data, stanza) {
    if (stanza.children.length > 0) return
    data = data
    logger.error('Not implemented yet')
}
