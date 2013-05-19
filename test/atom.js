require('mocha')

var should = require('should')
  , parser = require('../src/atom')
  , ltx    = require('ltx')

describe('Parsing posts with \'atom\'', function() {

    var NS_ATOM = "http://www.w3.org/2005/Atom"

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
            '<item><entry xmlns="' + NS_ATOM + '">'
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
})

describe('Building stanzas with \'atom\'', function() {})
