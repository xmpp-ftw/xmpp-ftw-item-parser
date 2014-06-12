'use strict';

var parser = require('../../lib/media')
  , ltx    = require('ltx')

parser.setLogger({
    log: function() {},
    info: function() {},
    warn: function() {},
    error: function() {}
})

describe('Buddycloud Media', function() {

    describe('Parsing posts with \'media\'', function() {

        var item = ltx.parse(
            '<item><entry xmlns="' + parser.NS_ATOM + '" ' +
                'xmlns:bcm="' + parser.NS_BUDDYCLOUD_MEDIA + '">' +
            '<bcm:media>' +
            '<bcm:item >12345</bcm:item><bcm:item>67890</bcm:item>' +
            '</bcm:media>' +
            '</entry></item>'
        )
        
        it('should add media and items', function() {
            var entity = {}
            parser.parse(item, entity)
            entity.should.eql({ media: [ '12345', '67890' ] })
        })

    })

    describe('Building stanzas with \'media\'', function() {

        it('should build expected element', function() {
            var data = { media: [ '12345', '67890' ] }
            var p = ltx.parse('<item/>')
            parser.build(data, p)
            var items = p.getChild('entry', parser.NS_ATOM)
                .getChild('media')
                .getChildren('item')
            items.length.should.equal(2)
            items[0].getText().should.equal(data.media[0])
            items[1].getText().should.equal(data.media[1])
        })

    })

})