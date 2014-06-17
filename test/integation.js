'use strict';

var parser = require('../index')
  , ltx    = require('ltx')

var activityStreams = require('../lib/activity-streams')
  , atom = require('../lib/atom')
  , iodef = require('../lib/iodef')
  , buddycloud = require('../lib/media')

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
            activity: {
                target: {
                    id: '12345',
                    'object-type': 'comment'
                },
                verb: 'rated',
                object: {
                    'object-type': 'comment'
                },
                author: {
                    'object-type': 'person'
                }
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
                '<author>' +
                    '<name>Doc Brown</name>' +
                    '<' + activityStreams.PREFIX_NS_ACTIVITY + ':object-type>' +
                        'person' +
                    '</' + activityStreams.PREFIX_NS_ACTIVITY + ':object-type>' +
                '</author>' +
                '<' + activityStreams.PREFIX_NS_THREAD + ':in-reply-to ref="item-12345-parent"/>' +
                '<' + activityStreams.PREFIX_NS_ACTIVITY + ':target>' +
                    '<id>12345</id>' +
                    '<object-type>comment</object-type>' +
                '</' + activityStreams.PREFIX_NS_ACTIVITY + ':target>' +
                '<' + activityStreams.PREFIX_NS_ACTIVITY + ':verb>rated' +
                    '</' + activityStreams.PREFIX_NS_ACTIVITY + ':verb>' +
                '<' + activityStreams.PREFIX_NS_ACTIVITY + ':object>' +
                    '<' + activityStreams.PREFIX_NS_ACTIVITY + ':object-type>comment' +
                        '</' + activityStreams.PREFIX_NS_ACTIVITY + ':object-type>' +
                '</activity:object>' +
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
            activity: {
                target: {
                    id: '12345',
                    'object-type': 'comment'
                },
                verb: 'rated',
                object: {
                    'object-type': 'comment'
                },
                author: {
                    'object-type': 'person'
                }
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
                '<author>' +
                    '<name>Doc Brown</name>' +
                    '<' + activityStreams.PREFIX_NS_ACTIVITY + ':object-type>' +
                        'person' +
                    '</' + activityStreams.PREFIX_NS_ACTIVITY + ':object-type>' +
                '</author>' +
                '<' + activityStreams.PREFIX_NS_THREAD + ':in-reply-to ref="item-12345-parent"/>' +
                '<' + activityStreams.PREFIX_NS_ACTIVITY + ':target>' +
                    '<id>12345</id>' +
                    '<object-type>comment</object-type>' +
                '</' + activityStreams.PREFIX_NS_ACTIVITY + ':target>' +
                '<' + activityStreams.PREFIX_NS_ACTIVITY + ':verb>rated' +
                    '</' + activityStreams.PREFIX_NS_ACTIVITY + ':verb>' +
                '<' + activityStreams.PREFIX_NS_ACTIVITY + ':object>' +
                    '<' + activityStreams.PREFIX_NS_ACTIVITY + ':object-type>comment' +
                        '</' + activityStreams.PREFIX_NS_ACTIVITY + ':object-type>' +
                '</activity:object>' +
                '<' + activityStreams.PREFIX_NS_REVIEW + ':rating>5.0' +
                    '</' + activityStreams.PREFIX_NS_REVIEW + ':rating>' +
            '</entry></item>'
        parser.parse(ltx.parse(stanza)).should.eql(expected)
    })

})

describe('Parser injection', function() {

    var defaultParsers = parser.getParsers().slice(0)
    var parserCount = parser.getParsers().length

    beforeEach(function() {
        parser.setParsers(defaultParsers)
        parserCount = parser.getParsers().length
    })

    after(function() {
        parser.setParsers(defaultParsers)
    })

    it('Should not include iodef parser by default', function() {
        defaultParsers.should.not.include(parser.availableParsers.iodef)
    })

    it('Should add an available parser to enabled parsers', function() {
        parser.addParser(parser.availableParsers.iodef)
        parser.getParsers().should.have.length(parserCount + 1)
    })

    it('Should remove a parser from enabled parsers', function() {
        parser.removeParser(parser.availableParsers.json)
        parser.getParsers().should.have.length(parserCount - 1)
    })

    it('Should remove all enabled parsers', function() {
        parser.removeAllParsers()
        parser.getParsers().should.have.length(0)
    })

    it('Should set all enabled parsers in a single call', function() {
        parser.setParsers([parser.availableParsers.json, parser.availableParsers.iodef])
        parser.getParsers().should.have.length(2)
    })

    it('Should not add the same parser more than once', function() {
        parser.addParser(parser.availableParsers.iodef)
        parser.addParser(parser.availableParsers.iodef)
        parser.getParsers().should.have.length(parserCount + 1)
    })
})

describe('IODEF support', function() {

    var iodefJson = {
        'IODEF-Document': {
            version: iodef.VERSION_IODEF,
            lang: 'en',
            formatid: 'simulation',
            Incidents: [{
                purpose: 'ext-value',
                'ext-purpose': 'new-purpose',
                lang: 'en',
                restriction: 'need-to-know',
                IncidentID: {
                    IncidentID: '189493',
                    name: 'cert.example.com',
                    instance: '5',
                    restriction: 'private',
                },
                ReportTime: {ReportTime:'2014-03-27T12:39:24+00:00'},
                Assessments: [{
                    occurrence : 'actual',
                    restriction : 'private',
                    Impacts: [{
                        lang: 'en',
                        severity: 'medium',
                        completion: 'succeeded',
                        type: 'ext-value',
                        'ext-type': 'new-type',
                        Impact: 'A new type of attack has taken all of our printers offline.',
                    }],
                }],
                Contacts: [{
                    role: 'ext-value',
                    'ext-role': 'new-role',
                    type: 'ext-value',
                    'ext-type': 'new-type',
                    restriction: 'public',
                    ContactName: {ContactName:'Bill Folds'},
                    Emails: [{
                        meaning: 'IRT group address, manned Mon-Fri 9-5 UTC',
                        Email: 'contact@cert.example.com',
                    }]
                }],
            }],
        }
    }

    var iodefXml = '' +
        '<IODEF-Document'  +
            ' version="' + iodef.VERSION_IODEF + '"' +
            ' lang="en"'+
            ' formatid="simulation"' +
            ' xmlns="' + iodef.NS_IODEF +
        '">' +
        '<Incident purpose="ext-value" ext-purpose="new-purpose" lang="en" restriction="need-to-know">' +
            '<IncidentID name="cert.example.com" instance="5" restriction="private">189493</IncidentID>' +
            '<ReportTime>2014-03-27T12:39:24+00:00</ReportTime>' +
            '<Assessment occurrence="actual" restriction="private">' +
                '<Impact lang="en" severity="medium" completion="succeeded" type="ext-value" ext-type="new-type">' +
                    'A new type of attack has taken all of our printers offline.' +
                '</Impact>' +
            '</Assessment>' +
            '<Contact role="ext-value" ext-role="new-role" '  +
                        'type="ext-value" ext-type="new-type" restriction="public">' +
                '<ContactName>Bill Folds</ContactName>' +
                '<Email meaning="IRT group address, manned Mon-Fri 9-5 UTC">contact@cert.example.com</Email>' +
            '</Contact>' +
        '</Incident>' +
        '</IODEF-Document>'

    before(function(){
        parser.addParser(parser.availableParsers.iodef)
    })

    after(function(){
        parser.removeParser(parser.availableParsers.iodef)
    })

    it('Should parse a basic IODEF document', function() {
        var iodefDocument = iodefXml
        var expected = iodefJson

        parser.parse(ltx.parse(iodefDocument)).should.eql(expected)
    })

    it('Should build a basic IODEF document', function() {
        var emptyIodefDocument = '<item/>'
        var stanza = ltx.parse(emptyIodefDocument)

        var entity = iodefJson
        var expected = iodefXml

        parser.build(entity, stanza)
        stanza.root().getChild('IODEF-Document').toString().should.equal(expected)
    })
})

describe('Buddycloud media posts', function() {
    
    it('Should parse a full stanza', function() {
        var expected = {
            atom: {
                title: 'Back to the future quote of the day',
                published: '2014-01-13T13:19:00.000Z',
                content: {
                    content: '<p>Where we\'re going we don\'t need roads!</p>',
                    type: 'xhtml',
                    lang: 'en_GB',
                    base: 'http://doc.brown.org'
                },
                author: {
                    name: 'Doc Brown'
                }
            },
            media: [ '12345', '67890' ]
        }
        var stanza = '' +
            '<item><entry xmlns="' + atom.NS_ATOM + '" xmlns:bcm="' +
                buddycloud.NS_BUDDYCLOUD_MEDIA + '">' +
                '<content xml:lang="en_GB" xml:base="http://doc.brown.org" type="xhtml">' +
                    '<p>Where we\'re going we don\'t need roads!</p>' +
                '</content>' +
                '<title>Back to the future quote of the day</title>' +
                '<published>2014-01-13T13:19:00.000Z</published>' +
                '<author>' +
                    '<name>Doc Brown</name>' +
                    '<' + activityStreams.PREFIX_NS_ACTIVITY + ':object-type>' +
                        'person' +
                    '</' + activityStreams.PREFIX_NS_ACTIVITY + ':object-type>' +
                '</author>' +
                '<' + buddycloud.NS_PREFIX_MEDIA + ':media>' +
                    '<' + buddycloud.NS_PREFIX_MEDIA + ':item id="12345" />' +
                    '<' + buddycloud.NS_PREFIX_MEDIA + ':item id="67890" />'+
                '</' + buddycloud.NS_PREFIX_MEDIA + ':media>' +
            '</entry></item>'
        parser.parse(ltx.parse(stanza)).should.eql(expected)
    })
        
    it('Can build an atom feed with <media/>', function() {
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
            media: [ '12345', '67890' ]
        }
        parser.build(entity, stanza)
        var expected = '' +
            '<item><entry xmlns="' + atom.NS_ATOM + '" xmlns:bcm="' +
                buddycloud.NS_BUDDYCLOUD_MEDIA + '">' +
                '<content xml:lang="en_GB" xml:base="http://doc.brown.org" type="xhtml">' +
                    '<p>Where we\'re going we don\'t need roads!</p>' +
                '</content>' +
                '<title>Back to the future quote of the day</title>' +
                '<published>2014-01-13T13:19:00.000Z</published>' +
                '<author>' +
                    '<name>Doc Brown</name>' +
                '</author>' +
                '<' + buddycloud.NS_PREFIX_MEDIA + ':media>' +
                    '<' + buddycloud.NS_PREFIX_MEDIA + ':item id="12345"/>' +
                    '<' + buddycloud.NS_PREFIX_MEDIA + ':item id="67890"/>'+
                '</' + buddycloud.NS_PREFIX_MEDIA + ':media>' +
            '</entry></item>'
        
        stanza.root().toString().should.equal(expected)
    })

})