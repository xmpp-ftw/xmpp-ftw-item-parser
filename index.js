var atom    = require('./src/atom')
  , plain   = require('./src/plain')

var parsers = [
    atom,
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

exports.build = function(data) {

    // Place payload as key 'payload' so we can 
    // pass by reference not value more easily
    var p = {}

    parsers.forEach(function(parser) {
        parser.build(data, p)
    })
    return p.payload
}
