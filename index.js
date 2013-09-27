var atom    = require('./lib/atom')
  , thread  = require('./lib/atom-thread')
  , plain   = require('./lib/plain')

var parsers = [
    atom,
    thread,
    plain
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

parsers.forEach(function(parser) {
    parser.setLogger(getLogger())
})

exports.parse = function(item) {
   var entity = {}
   parsers.forEach(function(parser) {
       try {
           parser.parse(item, entity)
       } catch (e) {
           getLogger().error(e.message)
       }
   })
   
   return entity
}

exports.build = function(data, stanza) {

    parsers.forEach(function(parser) {
        parser.build(data, stanza)
    })
}
