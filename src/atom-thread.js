var NS = 'http://purl.org/syndication/thread/1.0'
var attributes = ['ref', 'type', 'href']

exports.parse = function(item, entity) {

    if (-1 == item.toString().indexOf(NS)) return
    var inReplyTo = item.getChild('entry').getChild('in-reply-to')
    entity['in-reply-to'] = {}
    attributes.forEach(function(attribute) {
        if (inReplyTo.attrs[attribute]) 
           entity['in-reply-to'][attribute] = inReplyTo.attrs[attribute]
    })
}

exports.build = function(data, payload) {
    if (!data['in-reply-to']) return
    payload.getChild('entry').attrs['xmlns:thr'] = NS
    var inReplyTo = payload.getChild('entry').c('thr:in-reply-to')
    attributes.forEach(function(attribute) {
        if (data[attribute])
            inReplyTo.attrs[attribute] = data[attribute]
    })
}
