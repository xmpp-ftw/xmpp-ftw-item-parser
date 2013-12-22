'use strict';

var should = require('should')
  , parser = require('../../lib/json')
  , ltx    = require('ltx')

parser.setLogger({
    log: function() {},
    info: function() {},
    warn: function() {},
    error: function() {}
})

describe('JSON', function() {

    describe('Parsing posts with \'json\'', function() {

        var item = ltx.parse(
            '<item><json xmlns="' + parser.NS +
            '"/></item>'
        )
        item.getChild('json').t(JSON.stringify({ key: 'value' }))

        it('shouldn\'t act if entity has data', function() {
            var entity = { not: 'empty' }
            parser.parse(item, entity)
            entity.should.eql({ not: 'empty' })
        })

        it('should add and parse JSON from data element', function() {
            var entity = {}
            parser.parse(item, entity)
            entity.should.eql({ json: { key: 'value' }})
        })

        it('should throw exception if JSON can not be parsed', function(done) {
            var entity = {}
            var badItem = ltx.parse('<item><json xmlns="' + parser.NS +
                 '"><blah/></json></item>')
            try {
                parser.parse(badItem, entity)
            } catch (e) {
                return done()
            }
            should.fail('No exception was thrown')
        })

    })

    describe('Building stanzas with \'json\'', function() {

        it('should build expected element', function() {
            var data = { json: { key: 'value' }}
            var p = ltx.parse('<item/>')
            parser.build(data, p)
            p.children.join('').toString()
                .should.equal('<json xmlns="' + parser.NS + '">' +
                JSON.stringify(data.json) + '</json>')
        })

    })

})