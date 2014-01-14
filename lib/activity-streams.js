'use strict';

var NS_THREAD = exports.NS_THREAD = 'http://purl.org/syndication/thread/1.0'
var NS_ATOM = exports.NS_ATOM = 'http://www.w3.org/2005/Atom'

var attributes = ['ref', 'type', 'href']

var logger

exports.setLogger = function(log) {
    logger = log
}

var addInReplyToDetails = function(item, entity) {
    var inReplyTo = item.getChild('entry').getChild('in-reply-to')
    entity['in-reply-to'] = {}
    attributes.forEach(function(attribute) {
        if (inReplyTo.attrs[attribute])
            entity['in-reply-to'][attribute] = inReplyTo.attrs[attribute]
    })
}

var addTargetDetails = function(target, entity) {
    var id = target.getChildText('id')
    var objectType = target.getChildText('object-type')
    if ((null === id) && (null === objectType)) return
    entity.target = {}
    if (id) entity.target.id = id
    if (objectType) entity.target.objectType = objectType
}

var addAtomDetails = function(item, entity) {
    var target = item.getChild('entry').getChild('target')
    if (target) addTargetDetails(target, entity)
}

exports.parse = function(item, entity) {
    var xml = item.toString()
    if ((-1 === xml.indexOf(NS_THREAD)) && (-1 === xml.indexOf(NS_ATOM))) return
    
    if (xml.indexOf(NS_THREAD) !== -1) {
        addInReplyToDetails(item, entity)
    }
    if (xml.indexOf(NS_ATOM) !== -1) {
        addAtomDetails(item, entity)
    }
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


