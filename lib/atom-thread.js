'use strict';

var NS_THREAD = 'http://purl.org/syndication/thread/1.0'
var NS_ATOM = 'http://www.w3.org/2005/Atom'

var attributes = ['ref', 'type', 'href']

var logger

exports.setLogger = function(log) {
    logger = log
}

exports.parse = function(item, entity) {

    if (-1 === item.toString().indexOf(NS_THREAD)) return
    var inReplyTo = item.getChild('entry').getChild('in-reply-to')
    entity['in-reply-to'] = {}
    attributes.forEach(function(attribute) {
        if (inReplyTo.attrs[attribute])
            entity['in-reply-to'][attribute] = inReplyTo.attrs[attribute]
    })
}

exports.build = function(data, payload) {
    if (!data['in-reply-to']) return
    var entry
    if (!(entry = payload.getChild('entry', NS_ATOM))) return
    entry.attrs['xmlns:thr'] = NS_THREAD
    var inReplyTo = payload.getChild('entry').c('thr:in-reply-to')
    attributes.forEach(function(attribute) {
        if (data['in-reply-to'][attribute])
            inReplyTo.attrs[attribute] = data['in-reply-to'][attribute]
    })
}
