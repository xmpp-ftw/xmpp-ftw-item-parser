'use strict';

var parser = require('../index')
  , ltx    = require('ltx')

var activityStreams = require('../lib/activity-streams')
  , atom = require('../lib/atom')

describe('Building ATOM feed with thread', function() {

    it('Can build an atom feed with <in-reply-to/>', function() {
        var stanza = ltx.parse('<item/>')
        var entity = {
            atom: {
                content: {
                    content: '<p>Where we\'re going we don\'t need roads!</p>',
                    lang: 'en_GB',
                    base: 'http://doc.brown.org',
                    type: 'xhtml'
                },
                title: 'Back to the future quote of the day',
                published: '2014-01-13T13:19:00.000Z',
                author: {
                    name: 'Doc Brown'
                }
            },
            'in-reply-to': {
                ref: 'item-12345-parent'
            },
            target: {
                id: '12345',
                'object-type': 'comment'
            },
            review: {
                rating: '5.0'
            }
        }
        parser.build(entity, stanza)
        var expected = '' +
            '<item><entry xmlns="' + atom.NS_ATOM + '" ' +
                'xmlns:' + activityStreams.PREFIX_NS_THREAD + '="' + activityStreams.NS_THREAD + '" ' +
                'xmlns:' + activityStreams.PREFIX_NS_ACTIVITY + '="' + activityStreams.NS_ACTIVITY + '" ' +
                'xmlns:' + activityStreams.PREFIX_NS_REVIEW + '="' + activityStreams.NS_REVIEW + '">' +
                '<content xml:lang="en_GB" xml:base="http://doc.brown.org" type="xhtml">' +
                    '<p>Where we\'re going we don\'t need roads!</p>' +
                '</content>' +
                '<title>Back to the future quote of the day</title>' +
                '<published>2014-01-13T13:19:00.000Z</published>' +
                '<author><name>Doc Brown</name></author>' +
                '<' + activityStreams.PREFIX_NS_THREAD + ':in-reply-to ref="item-12345-parent"/>' +
                '<' + activityStreams.PREFIX_NS_ACTIVITY + ':target>' +
                    '<id>12345</id>' +
                    '<object-type>comment</object-type>' +
                '</' + activityStreams.PREFIX_NS_ACTIVITY + ':target>' +
                '<' + activityStreams.PREFIX_NS_REVIEW + ':rating>5.0' +
                    '</' + activityStreams.PREFIX_NS_REVIEW + ':rating>' +
            '</entry></item>'
        stanza.root().toString().should.equal(expected)
    })

})

describe('Parsing ATOM feed with activity streams', function() {
    
    it('Should parse a full stanza', function() {
        var expected = {
            atom: {
                title: 'Back to the future quote of the day',
                published: '2014-01-13T13:19:00.000Z',
                content: {
                    content: '<p>Where we\'re going we don\'t need roads!</p>',
                    lang: 'en_GB',
                    base: 'http://doc.brown.org',
                    type: 'xhtml'
                },
                author: {
                    name: 'Doc Brown'
                }
            },
            target: {
                id: '12345',
                'object-type': 'comment'
            },
            'in-reply-to': {
                ref: 'item-12345-parent'
            },
            review: {
                rating: 5
            }
        }
        var stanza = '' +
            '<item><entry xmlns="' + atom.NS_ATOM + '" ' +
                'xmlns:' + activityStreams.PREFIX_NS_THREAD + '="' + activityStreams.NS_THREAD + '" ' +
                'xmlns:' + activityStreams.PREFIX_NS_ACTIVITY + '="' + activityStreams.NS_ACTIVITY + '" ' +
                'xmlns:' + activityStreams.PREFIX_NS_REVIEW + '="' + activityStreams.NS_REVIEW + '">' +
                '<content xml:lang="en_GB" xml:base="http://doc.brown.org" type="xhtml">' +
                    '<p>Where we\'re going we don\'t need roads!</p>' +
                '</content>' +
                '<title>Back to the future quote of the day</title>' +
                '<published>2014-01-13T13:19:00.000Z</published>' +
                '<author><name>Doc Brown</name></author>' +
                '<' + activityStreams.PREFIX_NS_THREAD + ':in-reply-to ref="item-12345-parent"/>' +
                '<' + activityStreams.PREFIX_NS_ACTIVITY + ':target>' +
                    '<id>12345</id>' +
                    '<object-type>comment</object-type>' +
                '</' + activityStreams.PREFIX_NS_ACTIVITY + ':target>' +
                '<' + activityStreams.PREFIX_NS_REVIEW + ':rating>5.0' +
                    '</' + activityStreams.PREFIX_NS_REVIEW + ':rating>' +
            '</entry></item>'
        console.log(parser.parse(ltx.parse(stanza)))
        parser.parse(ltx.parse(stanza)).should.eql(expected)
    })
    
})