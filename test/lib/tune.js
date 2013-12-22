'use strict';

var parser = require('../../lib/tune')
  , ltx    = require('ltx')

parser.setLogger({
    log: function() {},
    info: function() {},
    warn: function() {},
    error: function() {}
})

/* jshint -W030 */
describe('Parsing \'tune\' stanzas', function() {

    var item = ltx.parse('<item>' +
        '<tune xmlns="http://jabber.org/protocol/tune">' +
            '<artist>Huey Lewis and the News</artist>' +
            '<length>233</length>' +
            '<rating>10</rating>' +
            '<source>Fore!</source>' +
            '<title>The power of love</title>' +
            '<track>8</track>' +
            '<uri>http://en.wikipedia.org/wiki/' +
                'The_Power_of_Love_(Huey_Lewis_and_the_News_song)</uri>' +
          '</tune></item>'
    )

    it('shouldn\'t act if no ATOM namespace', function() {
        var entity = { not: 'empty' }
        var item   = ltx.parse('<body/>')
        parser.parse(item, entity)
        entity.should.eql({ not: 'empty' })
    })

    it('Tune test', function() {
        item.should.exist
    })

})

describe('Building stanzas with \'tune\'', function() {

    it('Shouldn\'t attempt to build element if already built', function() {
        var data = 'Marty McFly'
        var p = ltx.parse('<item><body>Doc Brown</body></item>')
        parser.build(data, p)
        p.getChildText('body').should.equal('Doc Brown')
    })

    it.skip('should build expected element', function() {
        console.log('Not completed yet')
        return false
    })
})
