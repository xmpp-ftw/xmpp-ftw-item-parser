var logger

exports.NS = NS = 'urn:xmpp:json:0'

exports.setLogger = function(log) {
    logger = log
}

exports.parse = function(item, entity) {
    if (0 !== Object.keys(entity).length) return
    if (!item.getChild('json', NS)) return
    entity.json = JSON.parse(item.getChildText('json', NS))
}

exports.build = function(data, stanza) {
    if (stanza.children.length > 0) return
    if (!data.json) return
    var payload = data.json
    stanza.c('json', { xmlns: NS }).t(JSON.stringify(payload)).up()
}
