var builder = require('ltx')

exports.parse = function(item, entity) {
    if (0 != Object.keys(entity).length) return
    try {
        entity.body = item.getChild('body').children.join('')
    } catch (e) {
        console.error(e)
    }
}

exports.build = function(data, p) {
    if (p.payload) return
    p.payload = new builder.Element('body').t(data)
}
