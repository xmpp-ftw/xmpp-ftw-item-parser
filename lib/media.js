'use strict';

var logger

exports.setLogger = function(log) {
    logger = log
}

var NS_BUDDYCLOUD_MEDIA = exports.NS_BUDDYCLOUD_MEDIA = 'http://buddycloud.org/v1/media'
var NS_ATOM = exports.NS_ATOM = require('./atom').NS_ATOM

exports.parse = function(item, entity) {
    var entry = item.getChild('entry')
    if (!entry || (entry.attrs['xmlns:bcm'] !== NS_BUDDYCLOUD_MEDIA)) return

    var media = entry.getChild('media', NS_BUDDYCLOUD_MEDIA)

    if (!media) return
    entity.media = []
    media.getChildren('item').forEach(function(item) {
        entity.media.push(item.getText().trim())
    }, this)
}

exports.build = function(data, stanza) {
    if (!data.media || !Array.isArray(data.media)) return
    if (!stanza.getChild('entry', NS_ATOM))
        stanza.c('entry', { xmlns: NS_ATOM }).up()
    stanza.getChild('entry', NS_ATOM).attr('xmlns:bcm', NS_BUDDYCLOUD_MEDIA)
    var media = stanza.getChild('entry').c('bcm:media')
    data.media.forEach(function(item) {
        media.c('bcm:item').t(item)
    }, this)
}
