'use strict';

var logger

exports.setLogger = function(log) {
    logger = log
}

var NS_BUDDYCLOUD_MEDIA = exports.NS_BUDDYCLOUD_MEDIA = 'http://buddycloud.org/v1/media'
var NS_ATOM = exports.NS_ATOM = require('./atom').NS_ATOM

exports.parse = function(item, entity) {
    var entry = item.getChild('entry')
    if (!entry || !entry.getChild('media', NS_BUDDYCLOUD_MEDIA)) return

    var media = entry.getChild('media', NS_BUDDYCLOUD_MEDIA)

    if (!media) return
    entity.media = []
    media.getChildren('item').forEach(function(item) {
        entity.media.push(item.attrs.id)
    }, this)
}

exports.build = function(data, stanza) {
    if (!data.media || !Array.isArray(data.media)) return
    if (!stanza.getChild('entry', NS_ATOM))
        stanza.c('entry', { xmlns: NS_ATOM }).up()
    stanza.getChild('entry', NS_ATOM)
    var media = stanza.getChild('entry').c('media', { xmlns: NS_BUDDYCLOUD_MEDIA })
    data.media.forEach(function(item) {
        media.c('item', { id: item })
    }, this)
}
