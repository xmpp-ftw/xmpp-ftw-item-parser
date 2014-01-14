'use strict';

var should = require('should')
  , parser = require('../../lib/atom')
  , ltx    = require('ltx')

parser.setLogger({
    log: function() {},
    info: function() {},
    warn: function() {},
    error: function() {}
})

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
          '<item><entry xmlns="' + parser.NS_ATOM + '">' +
          '<id>' + topLevelElements.id + '</id>' +
          '<updated>' + topLevelElements.updated + '</updated>' +
          '<published>' + topLevelElements.published + '</published>' +
          '<summary>' + topLevelElements.summary + '</summary>' +
          '<title>' + topLevelElements.title + '</title>' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql(topLevelElements)
    })

    it('Adds content', function() {
        var entity = {}
        var content = 'Great Scott!'
        var item = ltx.parse(
          '<item><entry xmlns="' + parser.NS_ATOM + '">' +
          '<content>' + content + '</content>' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({ content: { type: 'text', content: content } })
    })

    it('Adds XHTML content with language', function() {
        var entity = {}
        var content = '<p>Great <strong>Scott!</strong></p>'
        var language = 'en_GB'
        var type = 'xhtml'
        var item = ltx.parse(
          '<item><entry xmlns="' + parser.NS_ATOM + '">' +
          '<content xml:lang="' + language + '" type="' + type + '">' +
          content +
          '</content>' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({
            content: { type: 'xhtml', lang: 'en_GB', content: content }
        })
    })

    it('Adds links to the entry', function() {
        var entity = {}
        var item = ltx.parse(
          '<item><entry xmlns="' + parser.NS_ATOM + '">' +
          '<link title="A link" rel="alternative" ' +
              'href="http://bttf.net/film-1" type="text/html" />' +
          '<link hreflang="en_GB" length="64" ' +
              'href="http://bttf.net/film-2" />' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.links.length.should.equal(2)
        entity.links[0].should.eql({
            title: 'A link',
            rel: 'alternative',
            href: 'http://bttf.net/film-1',
            type: 'text/html'
        })
        entity.links[1].should.eql({
            href: 'http://bttf.net/film-2',
            hreflang: 'en_GB',
            length: '64'
        })
    })

    it('Adds author details', function() {
        var entity = {}
        var item = ltx.parse(
          '<item><entry xmlns="' + parser.NS_ATOM + '">' +
          '<author>' +
              '<name>Marty McFly</name>' +
              '<email>marty@mcfly.net</email>' +
              '<uri>http://notchick.en</uri>' +
              '<id>1</id>' +
          '</author>' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({
            author: {
                name: 'Marty McFly',
                email: 'marty@mcfly.net',
                uri: 'http://notchick.en',
                id: '1'
            }
        })
    })

    it('Adds contributor details', function() {
        var entity = {}
        var item = ltx.parse(
          '<item><entry xmlns="' + parser.NS_ATOM + '">' +
          '<contributor>' +
              '<name>Marty McFly</name>' +
              '<email>marty@mcfly.net</email>' +
          '</contributor>' +
          '<contributor>' +
              '<name>Doc Brown</name>' +
              '<id>1</id>' +
          '</contributor>' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.contributors.length.should.equal(2)
        entity.contributors[0].should.eql({
            name: 'Marty McFly',
            email: 'marty@mcfly.net'
        })
        entity.contributors[1].should.eql({
            name: 'Doc Brown',
            id: '1'
        })
    })

})

/* jshint -W030 */
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
        stanza.getChild('entry', parser.NS_ATOM).should.exist
    })

    it('Adds atom namespace with existing <entry> element', function() {
        var stanza = ltx.parse('<item><entry/></item>')
        var entity = { atom: {} }
        parser.build(entity, stanza)
        stanza.getChild('entry', parser.NS_ATOM).should.exist
    })

    it('Adds simple elements', function() {
        var entity = {
            atom: {
                id: 'id-value',
                title: 'title-value',
                updated: 'updated-value',
                summary: 'summary-value',
                published: 'published-value',
                content: 'content-value'
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
        entry.getChildText('content').should.equal(entity.atom.content)
    })

    it('Can add a single author', function() {
        var entity = {
            atom: {
                author: {
                    name: 'Doc Brown',
                    email: 'doc@outtatime.org'
                }
            }
        }
        var stanza = ltx.parse('<item/>')
        parser.build(entity, stanza)
        var entry = stanza.getChild('entry')
        entry.getChildren('author').length.should.equal(1)
        entry.getChild('author').getChildText('name')
            .should.equal(entity.atom.author.name)
        entry.getChild('author').getChildText('email')
            .should.equal(entity.atom.author.email)
        should.not.exist(entry.getChild('author').getChildText('uri'))
    })

    it('Can add multiple authors', function() {
        var entity = {
            atom: {
                author: [
                    { name: 'Doc Brown', email: 'doc@outtatime.org' },
                    { name: 'Marty McFly', uri: 'http://notachick.en' }
                ]
            }
        }
        var stanza = ltx.parse('<item/>')
        parser.build(entity, stanza)
        var entry = stanza.getChild('entry')
        entry.getChildren('author').length.should.equal(2)
        var authors = entry.getChildren('author')
        authors[0].getChildText('name')
            .should.equal(entity.atom.author[0].name)
        authors[0].getChildText('email')
            .should.equal(entity.atom.author[0].email)
        should.not.exist(authors[0].getChildText('uri'))
        authors[1].getChildText('name')
            .should.equal(entity.atom.author[1].name)
        authors[1].getChildText('uri')
            .should.equal(entity.atom.author[1].uri)
        should.not.exist(authors[1].getChildText('email'))
    })

    it('Can add contributors', function() {
        var entity = {
            atom: {
                contributors: [
                    { name: 'Doc Brown', email: 'doc@outtatime.org' },
                    { name: 'Marty McFly', uri: 'http://notachick.en' }
                ]
            }
        }
        var stanza = ltx.parse('<item/>')
        parser.build(entity, stanza)
        var entry = stanza.getChild('entry')
        entry.getChildren('contributor').length.should.equal(2)
        var contributors = entry.getChildren('contributor')
        contributors[0].getChildText('name')
            .should.equal(entity.atom.contributors[0].name)
        contributors[1].getChildText('name')
            .should.equal(entity.atom.contributors[1].name)
    })

    it('Can add categories', function() {
        var entity = {
            atom: {
                categories: [ 'one', 'two', 'three' ]
            }
        }
        var stanza = ltx.parse('<item/>')
        parser.build(entity, stanza)
        var entry = stanza.getChild('entry')
        entry.getChildren('category').length.should.equal(3)
        var categories = entry.getChildren('category')
        categories[0].attrs.term.should.equal('one')
        categories[1].attrs.term.should.equal('two')
        categories[2].attrs.term.should.equal('three')
    })

    it('Adds links', function() {
        var entity = {
            atom: {
                links: [
                    { href: 'href-1', rel: 'alternative' },
                    { hreflang: 'en_GB', type: 'image', length: 64 }
                ]
            }
        }
        var stanza = ltx.parse('<item/>')
        parser.build(entity, stanza)
        var entry = stanza.getChild('entry')
        entry.getChildren('link').length.should.equal(2)
        var links = entry.getChildren('link')

        links[0].attrs.href.should.equal(entity.atom.links[0].href)
        links[0].attrs.rel.should.equal(entity.atom.links[0].rel)
        should.not.exist(links[0].attrs.hreflang)
        should.not.exist(links[0].attrs.type)
        should.not.exist(links[0].attrs.length)

        should.not.exist(links[1].attrs.href)
        should.not.exist(links[1].attrs.rel)
        links[1].attrs.hreflang.should.equal(entity.atom.links[1].hreflang)
        links[1].attrs.type.should.equal(entity.atom.links[1].type)
        links[1].attrs.length.should.equal(entity.atom.links[1].length)
    })

})