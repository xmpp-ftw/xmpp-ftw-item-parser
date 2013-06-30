var atom    = require('./lib/atom')
  , thread  = require('./lib/atom-thread')
  , plain   = require('./lib/plain')

var parsers = [
    atom,
    thread,
    plain
]

exports.parse = function(item) {
   var entity = {}
   parsers.forEach(function(parser) {
       try {
           parser.parse(item, entity)
       } catch (e) {
           console.error(e)
       }
   })
   
   return entity
}

exports.build = function(data, stanza) {

    parsers.forEach(function(parser) {
        parser.build(data, stanza)
    })
}
