'use strict';

var availableParsers
exports.availableParsers = availableParsers = {
    atom            : require('./lib/atom'),
    activityStreams : require('./lib/activity-streams'),
    plain           : require('./lib/plain'),
    json            : require('./lib/json'),
    tune            : require('./lib/tune'),
    media           : require('./lib/media'),
    iodef           : require('./lib/iodef'),
}

var enabledParsers = [
    availableParsers.tune,
    availableParsers.json,
    availableParsers.atom,
    availableParsers.media,
    availableParsers.activityStreams,
    availableParsers.plain,
]

var logger

exports.setLogger = function(log) {
    logger = log
}

var getLogger = function() {
    if (!logger)
        logger = {
            log: function() {},
            info: function() {},
            warn: function() {},
            error: function() {}
        }
    return logger
}

enabledParsers.forEach(function(parser) {
    parser.setLogger(getLogger())
})

exports.parse = function(item) {
    var entity = {}
    enabledParsers.forEach(function(parser) {
        try {
            parser.parse(item, entity)
        } catch (e) {
            getLogger().error(e.message)
        }
    })
    return entity
}

exports.build = function(data, stanza) {
    enabledParsers.forEach(function(parser) {
        parser.build(data, stanza)
    })
}

var addParser
exports.addParser = addParser = function(parserToAdd) {
    var index = enabledParsers.indexOf(parserToAdd)
    if (index === -1) {
        parserToAdd.setLogger(getLogger())
        enabledParsers.push(parserToAdd)
    }
}

exports.removeParser = function(parserToRemove) {
    var index = enabledParsers.indexOf(parserToRemove)
    if (index > -1) {
        enabledParsers.splice(index, 1)
    }
}

var removeAllParsers
exports.removeAllParsers = removeAllParsers = function() {
    enabledParsers = []
}

exports.setParsers = function(newParsers) {
    removeAllParsers()
    newParsers.forEach(function(parserToAdd) {
        addParser(parserToAdd)
    })
}

exports.getParsers = function() {
    return enabledParsers
}
