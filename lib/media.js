'use strict';

var logger

exports.setLogger = function(log) {
    logger = log
}

var NS_ATOM = exports.NS_ATOM = 'http://www.w3.org/2005/Atom'

exports.parse = function(item, entity) {
    var entry = item.getChild('entry', NS_ATOM)
    if (!entry) return
    var media = entry.getChild('media')
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
    var media = stanza.getChild('entry').c('media')
    data.media.forEach(function(item) {
        media.c('item').t(item)
    }, this)
}
