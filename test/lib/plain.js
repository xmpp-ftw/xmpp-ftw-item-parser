var should = require('should')
  , parser = require('../../lib/plain')
  , ltx    = require('ltx')

parser.setLogger({
    log: function() {},
    info: function() {},
    warn: function() {},
    error: function() {}
})

describe('Parsing posts with \'plain\'', function() {

    var item = ltx.parse('<item><body>This is <i>some</i> text</body></item>')

    it('shouldn\'t act if entity has data', function() {
        var entity = { not: 'empty' }
        parser.parse(item, entity)
        entity.should.eql({ not: 'empty' })
    })

    it('should add text from body element', function() {
        var entity = {}
        parser.parse(item, entity)
        entity.body.should.equal('This is <i>some</i> text')
    })

    it('should throw exception if missing expected element', function(done) {
        var entity = {}
        var badItem = ltx.parse('<item/>')
        try {
            parser.parse(badItem, entity)
        } catch (e) {
            return done()
        }
        should.fail('No exception was thrown')
    })
})

describe('Building stanzas with \'plain\'', function() {

    it('Shouldn\'t attempt to build element if already built', function() {
        var data = 'Marty McFly'
        var p = ltx.parse('<item><body>Doc Brown</body></item>')
        parser.build(data, p)
        p.getChildText('body').should.equal('Doc Brown')
    })

    it('should build expected element', function() {
        var data = 'Back to the future'
        var p = ltx.parse('<item/>')
        parser.build(data, p)
        p.children.join('').toString().should.equal('<body>' + data + '</body>')
    })
})
