var should = require('should')
  , parser = require('../index')
  , ltx    = require('ltx')

var ATOM_NS = "http://www.w3.org/2005/Atom"

describe('Building ATOM feed with thread', function() {

    it('Can build', function() {
        var stanza = ltx.parse('<item/>')
        var entity = {
            atom: {
                content: 'Where we\'re going we don\'t need roads!',
                author: {
                    name: 'Doc Brown'
                }
            },
            'in-reply-to': {
                ref: 'item-12345-parent'
            }
        }
        parser.build(entity, stanza)
        var expected = ''
            + '<item><entry xmlns="http://www.w3.org/2005/Atom" '
                + 'xmlns:thr="http://purl.org/syndication/thread/1.0">'
                + '<content>Where we\'re going we don\'t need roads!</content>'
                + '<author><name>Doc Brown</name></author>'
                + '<thr:in-reply-to ref="item-12345-parent"/>'
            + '</entry></item>'
        stanza.root().toString().should.equal(expected)
    })

})
