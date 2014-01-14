'use strict';

var NS_THREAD = exports.NS_THREAD = 'http://purl.org/syndication/thread/1.0'
var NS_ATOM = exports.NS_ATOM = 'http://www.w3.org/2005/Atom'
var NS_ACTIVITY = exports.NS_ACTIVITY = 'http://activitystrea.ms/spec/1.0/'
var NS_REVIEW = exports.NS_REVIEW = 'http://activitystrea.ms/schema/1.0/review'

var PREFIX_NS_THREAD = exports.PREFIX_NS_THREAD = 'thr'
var PREFIX_NS_ACTIVITY = exports.PREFIX_NS_ACTIVITY = 'activity'
var PREFIX_NS_REVIEW = exports.PREFIX_NS_REVIEW = 'review'

var inReplyToAttributes = ['ref', 'type', 'href']

var logger

exports.setLogger = function(log) {
    logger = log
}

var parseInReplyToDetails = function(item, entity) {
    var inReplyTo = item.getChild('entry').getChild('in-reply-to')
    entity['in-reply-to'] = {}
    inReplyToAttributes.forEach(function(attribute) {
        if (inReplyTo.attrs[attribute])
            entity['in-reply-to'][attribute] = inReplyTo.attrs[attribute]
    })
}

var parseTargetDetails = function(target, entity) {
    var id = target.getChildText('id')
    var objectType = target.getChildText('object-type')
    if ((null === id) && (null === objectType)) return
    entity.target = {}
    if (id) entity.target.id = id
    if (objectType) entity.target['object-type'] = objectType
}

var parseAtomDetails = function(item, entity) {
    var target = item.getChild('entry').getChild('target')
    if (target) parseTargetDetails(target, entity)
}

var parseRatingDetails = function(rating, entity) {
    entity.review = { rating: parseInt(rating.getText()) }
}

var parseReviewDetails = function(item, entity) {
    var rating = item.getChild('entry').getChild('rating')
    if (rating) parseRatingDetails(rating, entity)
}

var addInReplyToElement = function(data, entry) {
    entry.attrs['xmlns:' + PREFIX_NS_THREAD] = NS_THREAD
    var inReplyTo = entry.c(PREFIX_NS_THREAD + ':in-reply-to')
    inReplyToAttributes.forEach(function(attribute) {
        if (data['in-reply-to'][attribute])
            inReplyTo.attrs[attribute] = data['in-reply-to'][attribute]
    })
}

var addTargetElement = function(data, entry) {
    entry.attrs['xmlns:' + PREFIX_NS_ACTIVITY] = NS_ACTIVITY
    var target = entry.c(PREFIX_NS_ACTIVITY + ':target')
    if (data.id) target.c('id').t(data.id)
    if (data['object-type']) target.c('object-type').t(data['object-type'])
}

var addReviewElement = function(data, entry) {
    entry.attrs['xmlns:' + PREFIX_NS_REVIEW] = NS_REVIEW
    if (data.rating) {
        entry.c(PREFIX_NS_REVIEW + ':rating').t(data.rating)
    }
}

exports.parse = function(item, entity) {
    var xml = item.toString()
    if (xml.indexOf(NS_ATOM) !== -1) {
        parseAtomDetails(item, entity)
    }
    if (xml.indexOf(NS_THREAD) !== -1) {
        parseInReplyToDetails(item, entity)
    }
    if (xml.indexOf(NS_REVIEW) !== -1) {
        parseReviewDetails(item, entity)
    }
}

exports.build = function(data, payload) {
    var entry

    if (!(entry = payload.getChild('entry', NS_ATOM))) return
    
    if (data['in-reply-to'])
        addInReplyToElement(data, entry)
    if (data.target)
        addTargetElement(data.target, entry)
    if (data.review)
        addReviewElement(data.review, entry)
}


