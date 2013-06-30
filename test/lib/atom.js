var should = require('should')
  , parser = require('../../lib/atom')
  , ltx    = require('ltx')

var ATOM_NS = "http://www.w3.org/2005/Atom"

describe('Parsing posts with \'atom\'', function() {

    var topLevelElements = {
        title: 'Back to the future',
        id: 'film1',
        updated: '1985-10-26 01:22',
        published: '1955-11-05 01:21',
        summary: 'A great series of films about time travel'
    }

    it('shouldn\'t act if no ATOM namespace', function() {
        var entity = { not: 'empty' }
        var item   = ltx.parse('<body/>')
        parser.parse(item, entity)
        entity.should.eql({ not: 'empty' })
    })

    it('adds top level elements', function() {

        var entity = {}
        var item = ltx.parse(
            '<item><entry xmlns="' + ATOM_NS + '">'
          + '<id>' + topLevelElements.id + '</id>'
          + '<updated>' + topLevelElements.updated + '</updated>'
          + '<published>' + topLevelElements.published + '</published>'
          + '<summary>' + topLevelElements.summary + '</summary>'
          + '<title>' + topLevelElements.title + '</title>'
          + '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql(topLevelElements)
    })

    it('Adds content', function() {
        var entity = {}
        var content = 'Hello world!'
        var item = ltx.parse(
            '<item><entry xmlns="' + ATOM_NS + '">'
          + '<content>' + content + '</content>'
          + '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({ content: { type: 'text', content: content } })
    })   

    it('Adds XHTML content with language', function() {
        var entity = {}
        var content = '<p>Hello <strong>world!</strong></p>'
        var language = 'en_GB'
        var type = 'xhtml'
        var item = ltx.parse(
            '<item><entry xmlns="' + ATOM_NS + '">'
          + '<content xml:lang="' + language + '" type="' + type + '">' 
          + content
          + '</content>'
          + '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({
            content: { type: 'xhtml', lang: 'en_GB', content: content } 
        })
    })

    it('Adds links to the entry', function() {
        var entity = {}
        var item = ltx.parse(
            '<item><entry xmlns="' + ATOM_NS + '">'
          + '<link title="A link" rel="alternative" '
              + 'href="http://buddycloud.org/blog/post-1" type="text/html" />'
          + '<link hreflang="en_GB" length="64" '
              + 'href="http://buddycloud.co.uk/blog/post-1" />'
          + '</entry></item>'
        )
        parser.parse(item, entity)
        entity.links.length.should.equal(2)
        entity.links[0].should.eql({
            title: 'A link',
            rel: 'alternative',
            href: 'http://buddycloud.org/blog/post-1',
            type: 'text/html'
        })
        entity.links[1].should.eql({
            href: 'http://buddycloud.co.uk/blog/post-1',
            hreflang: 'en_GB',
            length: '64'
        })
    })

    it('Adds author details', function() {
        var entity = {}
        var item = ltx.parse(
            '<item><entry xmlns="' + ATOM_NS + '">'
          + '<author>'
              + '<name>Lloyd Watkin</name>'
              + '<email>lloyd@evilprofessor.co.uk</email>'
              + '<uri>http://evilprofessor.co.uk</uri>'
              + '<id>1</id>'
          + '</author>'
          + '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({
            author: {
                name: 'Lloyd Watkin', 
                email: 'lloyd@evilprofessor.co.uk',
                uri: 'http://evilprofessor.co.uk',
                id: '1'
            } 
        })    
    })

    it('Adds contributor details', function() {
        var entity = {}
        var item = ltx.parse(
            '<item><entry xmlns="' + ATOM_NS + '">'
          + '<contributor>'
              + '<name>Lloyd Watkin</name>'
              + '<email>lloyd@evilprofessor.co.uk</email>'
          + '</contributor>'
          + '<contributor>'
              + '<name>Steven Watkin</name>'
              + '<id>1</id>'
          + '</contributor>'
          + '</entry></item>'
        )
        parser.parse(item, entity)
        entity.contributors.length.should.equal(2)
        entity.contributors[0].should.eql({
            name: 'Lloyd Watkin',
            email: 'lloyd@evilprofessor.co.uk'
        })
        entity.contributors[1].should.eql({
            name: 'Steven Watkin',
            id: '1'
        })
    })

})

describe('Building stanzas with \'atom\'', function() {

    it('Doesn\'t touch stanza if no \'atom\' attribute', function() {
       var stanza = ltx.parse('<item/>')
       var original = ltx.parse(stanza.toString())
       var entity = {}
       parser.build(entity, stanza)
       stanza.root().toString().should.equal(original.toString())
    })

    it('Adds atom namespace and <entry> element', function() {
       var stanza = ltx.parse('<item/>')
       var entity = { atom: {} }
       parser.build(entity, stanza)
       stanza.getChild('entry', ATOM_NS).should.exist
    })

    it('Adds atom namespace with existing <entry> element', function() {
        var stanza = ltx.parse('<item><entry/></item>')
        var entity = { atom: {} }
        parser.build(entity, stanza)
        stanza.getChild('entry', ATOM_NS).should.exist
    })

    it('Adds simple elements', function() {
        var entity = {
            atom: {
                id: 'id-value',
                title: 'title-value',
                updated: 'updated-value',
                summary: 'summary-value',
                published: 'published-value'
            }
        }
        var stanza = ltx.parse('<item/>')
        parser.build(entity, stanza)
        var entry = stanza.getChild('entry')
        entry.getChildText('id').should.equal(entity.atom.id)
        entry.getChildText('title').should.equal(entity.atom.title)
        entry.getChildText('updated').should.equal(entity.atom.updated)
        entry.getChildText('summary').should.equal(entity.atom.summary)
        entry.getChildText('published').should.equal(entity.atom.published)
    })
 
})
