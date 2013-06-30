var should = require('should')
  , parser = require('../../lib/atom-thread')
  , ltx    = require('ltx')

var NS_THREAD = 'http://purl.org/syndication/thread/1.0'
var NS_ATOM = "http://www.w3.org/2005/Atom"

describe('Parsing posts with \'thread\'', function() {

    var attributes = ['ref', 'type', 'href']

    it('Shouldn\'t act if no thread namespace', function() {
        var entity = { not: 'empty' }
        var item   = ltx.parse('<body/>')
        parser.parse(item, entity)
        entity.should.eql({ not: 'empty' })
    })

    it('Adds thread details', function() {

        var entity = {}
        var item = ltx.parse(
            '<item><entry xmlns="' + NS_THREAD + '">'
          + '<thr:in-reply-to '
                + 'ref="tag:xmpp-ftw,2013:10" '
                + 'type="application/xhtml+xml" '
                + 'href="http://evilprofessor.co.uk/entries/1"/>'
          + '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({
            'in-reply-to': {
                'ref': 'tag:xmpp-ftw,2013:10',
                'type': 'application/xhtml+xml',
                'href': 'http://evilprofessor.co.uk/entries/1'
            }
        })
    })

})

describe('Building stanzas with \'atom\'', function() {

    it('Shouldn\'t add elements if no data attribute provided', function() {
        var stanza = ltx.parse('<item><entry xmlns="' + NS_ATOM + '"/></item>')
        var original = ltx.parse(stanza.toString())
        var entry = {}
        parser.build(entry, stanza)
        stanza.root().toString().should.equal(original.root().toString())
    })

    it('Shouldn\'t get built if there\'s no atom namespace', function() {
        var stanza = ltx.parse('<item><entry/></item>')
        var entry = { 'in-reply-to': {} }
        parser.build(entry, stanza)
        stanza.root().toString().should.equal('<item><entry/></item>')
    })

    it('Should add namespace to parent element', function() {
        var stanza = ltx.parse('<item><entry xmlns="' + NS_ATOM + '"/></item>')
        var entry = { 'in-reply-to': {} }
        parser.build(entry, stanza)
        stanza.root().getChild('entry').attrs['xmlns:thr']
            .should.equal(NS_THREAD)
    })

    it('Adds exected <in-reply-to/> element', function() {
        var stanza = ltx.parse('<item><entry xmlns="' + NS_ATOM + '"/></item>')
        var entry = { 'in-reply-to': {
            ref: 'tag:xmpp-ftw,2013:10',
            type: 'application/xhtml+xml',
            href: 'http://evilprofessor.co.uk/entires/1'
        } }
        parser.build(entry, stanza)
        stanza.root().getChild('entry').attrs['xmlns:thr']
            .should.equal(NS_THREAD)
    })

})
