var NS_ATOM = "http://www.w3.org/2005/Atom"
var entry
var linkAttributes = ['title', 'rel', 'href', 'type', 'hreflang', 'length']
var topLevelElements = ['title', 'id', 'updated', 'published', 'summary']

var addLinks = function(entity) {
    var links
    if (0 == (links = entry.getChildren('link')).length) return

    entity.links = []
    links.forEach(function(link) {
        var item = {}
        linkAttributes.forEach(function(attribute) {
            if (link.attrs[attribute]) item[attribute] = link.attrs[attribute]
        })
        entity.links.push(item)
    })
}

var addContent = function(entity) {
    var content
    if (!(content = entry.getChild('content'))) return
    entity.content = {
       type: content.attrs.type || 'text',
       content: content.children.join('').toString()
    }
    if (content.attrs['xml:lang']) entity.content.lang = content.attrs['xml:lang']
    if (content.attrs['xml:base']) entity.content.base = content.attrs['xml:base']
}

var authorDetails = ['name', 'email', 'uri', 'id']
var addAuthor = function(entity) {
    var author
    if (!(author = entry.getChild('author'))) return
    entity.author = {}
    authorDetails.forEach(function(attribute) {
        if (value = author.getChild(attribute))
            entity.author[attribute] = value.getText()
    })
}

var addContributors = function(entity) {
    var contributors
    if (0 == (contributors = entry.getChildren('contributor')).length) return
    entity.contributors = []
    contributors.forEach(function(contributor) {
        var c = {}
        authorDetails.forEach(function(attribute) {
            if (value = contributor.getChild(attribute))
                c[attribute] = value.getText()
        })
        entity.contributors.push(c)
    })
}

exports.parse = function(item, entity) {

    if (-1 == item.toString().indexOf(NS_ATOM)) return
    entry = item.getChild('entry')

    topLevelElements.forEach(function(element) {
        if (value = entry.getChild(element)) entity[element] = value.getText()
    })
     
    addContent(entity)
    addLinks(entity)
    addAuthor(entity)
    addContributors(entity)
}

var addPerson = function(details, stanza, element) {
    var person = stanza.c(element)
    if (details.name) person.c('name').t(details.name)
    if (details.uri) person.c('uri').t(details.uri)
    if (details.email) person.c('email').t(details.email)
    stanza.up()
}

exports.build = function(data, payload) {
    if (!data['atom']) return
    if (null == payload.getChild('entry'))
        payload.c('entry').up()
    var entry = payload.getChild('entry')
    entry.attrs.xmlns = NS_ATOM
    var elements = ['id', 'title', 'updated', 'summary', 'published']
    elements.forEach(function(element) {
        if (data.atom[element])
            entry.c(element).t(data.atom[element]).up()
    })
    if (data.atom.author) {
        var authors = data.atom.author
        if (false === (data.atom.author instanceof Array))
            authors = [ data.atom.author ]
        authors.forEach(function(a) {  
            addPerson(a, entry, 'author')
        })
    }
    if (data.atom.contributors) {
        data.atom.contributors.forEach(function(contributor) {
            addPerson(contributor, entry, 'contributor')
        })
    }

}
