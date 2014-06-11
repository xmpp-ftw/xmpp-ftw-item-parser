'use strict';

var parser = require('../../lib/iodef')
  , ltx    = require('ltx')

parser.setLogger({
    log: function() {},
    info: function() {},
    warn: function() {},
    error: function() {}
})

describe('Parsing \'IODEF\'', function() {

    var IODEF_DOC_START = '<IODEF-Document version="' + parser.VERSION_IODEF + '" xmlns="' + parser.NS_IODEF + '">'
    var IODEF_DOC_END = '</IODEF-Document>'
    var IODEF_INCIDENT_START = '<Incident purpose="reporting">'
    var IODEF_INCIDENT_END = '</Incident>'

    it('Shouldn\'t act if no IODEF namespace', function() {
        var entity = { not: 'empty' }
        var item   = ltx.parse('<IODEF-Document/>')
        parser.parse(item, entity)
        entity.should.eql({ not: 'empty' })
    })

    it('Shouldn\'t act if incorrect IODEF version', function() {
        var entity = { not: 'empty' }
        var item   = ltx.parse('<IODEF-Document version="0.00" xmlns="' + parser.NS_IODEF + '"/>')
        parser.parse(item, entity)
        entity.should.eql({ not: 'empty' })
    })

    it('Adds version attribute to IODEF-Document', function() {
        var entity = {}
        var item   = ltx.parse('<IODEF-Document ' +
                                    'version="' + parser.VERSION_IODEF + '" ' +
                                    'xmlns="' + parser.NS_IODEF + '"/>')
        parser.parse(item, entity)
        entity['IODEF-Document'].should.eql({ version : parser.VERSION_IODEF})
    })

    it('Adds lang attribute to IODEF-Document', function() {
        var entity = {}
        var item   = ltx.parse('<IODEF-Document  ' +
                                    'version="' + parser.VERSION_IODEF + '"  ' +
                                    'lang="en"  ' +
                                    'xmlns="' + parser.NS_IODEF + '"/>')
        parser.parse(item, entity)
        entity['IODEF-Document'].should.eql({ version : parser.VERSION_IODEF, lang : 'en'})
    })

    it('Adds formatid attribute to IODEF-Document', function() {
        var entity = {}
        var item   = ltx.parse('<IODEF-Document  ' +
                                    'version="' + parser.VERSION_IODEF + '"  ' +
                                    'formatid="simulation"  ' +
                                    'xmlns="' + parser.NS_IODEF + '"/>')
        parser.parse(item, entity)
        entity['IODEF-Document'].should.eql({ version : parser.VERSION_IODEF, formatid : 'simulation'})
    })

    it('Should parse IODEF if wrapped in another element', function() {
        var entity = {}
        var item = ltx.parse(
            '<item>' +
                IODEF_DOC_START +
                IODEF_DOC_END +
            '</item>'
        )
        parser.parse(item, entity)
        entity['IODEF-Document'].should.eql({version : parser.VERSION_IODEF})
    })

    describe('Parsing Incident within \'IODEF\'', function() {

        it('Adds Incident', function() {
            var entity = {}
            var item = ltx.parse(
                IODEF_DOC_START +
                  '<Incident/>' +
                IODEF_DOC_END
            )
            parser.parse(item, entity)
            entity['IODEF-Document'].should.eql({version : parser.VERSION_IODEF, Incidents : [{}]})
        })

        it('Adds multiple Incidents', function() {
            var entity = {}
            var item = ltx.parse(
                IODEF_DOC_START +
                  '<Incident/>' +
                  '<Incident/>' +
                IODEF_DOC_END
            )
            parser.parse(item, entity)
            entity['IODEF-Document'].should.eql({version : parser.VERSION_IODEF, Incidents : [{}, {}]})
        })

        it('Adds purpose attribute to Incident', function() {
            var entity = {}
            var item = ltx.parse(
                IODEF_DOC_START +
                  '<Incident purpose="reporting" />' +
                IODEF_DOC_END
            )
            parser.parse(item, entity)
            entity['IODEF-Document'].Incidents[0].should.eql({purpose : 'reporting'})
        })

        it('Adds lang attribute to Incident', function() {
            var entity = {}
            var item = ltx.parse(
                IODEF_DOC_START +
                  '<Incident lang="en" />' +
                IODEF_DOC_END
            )
            parser.parse(item, entity)
            entity['IODEF-Document'].Incidents[0].should.eql({lang : 'en'})
        })

        it('Adds restriction attribute to Incident', function() {
            var entity = {}
            var item = ltx.parse(
                IODEF_DOC_START +
                  '<Incident restriction="private" />' +
                IODEF_DOC_END
            )
            parser.parse(item, entity)
            entity['IODEF-Document'].Incidents[0].should.eql({restriction : 'private'})
        })

        it('Adds ext-purpose attribute to Incident', function() {
            var entity = {}
            var item = ltx.parse(
                IODEF_DOC_START +
                  '<Incident ext-purpose="new-purpose" />' +
                IODEF_DOC_END
            )
            parser.parse(item, entity)
            entity['IODEF-Document'].Incidents[0].should.eql({'ext-purpose' : 'new-purpose'})
        })

        describe('Parsing IncidentID within \'IODEF\'', function() {

            it('Adds IncidentID to Incident', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<IncidentID name="cert.example.com">1234</IncidentID>' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].should.eql({
                    'purpose' : 'reporting',
                    'IncidentID' : {name : 'cert.example.com', IncidentID : '1234'}
                })
            })

            it('Adds instance attribute to IncidentID', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<IncidentID instance="5" name="cert.example.com">1234</IncidentID>' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].IncidentID.should.eql({
                    instance : '5',
                    name : 'cert.example.com',
                    IncidentID : '1234'
                })
            })

            it('Adds restriction attribute to IncidentID', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<IncidentID restriction="need-to-know" name="cert.example.com">1234</IncidentID>' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].IncidentID.should.eql({
                    restriction : 'need-to-know',
                    name : 'cert.example.com',
                    IncidentID : '1234'
                })
            })
        })

        describe('Parsing ReportTime within \'IODEF\'', function() {

            it('Adds ReportTime to Incident', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<ReportTime>2014-03-27T12:39:24+00:00</ReportTime>' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].should.eql({
                    'purpose' : 'reporting',
                    'ReportTime' : {ReportTime : '2014-03-27T12:39:24+00:00'}
                })
            })
        })

        describe('Parsing Assessment within \'IODEF\'', function() {

            it('Adds Assessment to Incident', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<Assessment/>' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].should.eql({
                    'purpose' : 'reporting',
                    'Assessments' : [{}]
                })
            })

            it('Adds multiple Assessments to Incident', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<Assessment/>' +
                        '<Assessment/>' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].should.eql({
                    'purpose' : 'reporting',
                    'Assessments' : [{}, {}]
                })
            })

            it('Adds occurrence attribute to Assessment', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<Assessment occurrence="potential" />' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].should.eql({
                    'purpose' : 'reporting',
                    'Assessments' : [{occurrence : 'potential'}]
                })
            })

            it('Adds restriction attribute to Assessment', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<Assessment restriction="private" />' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].should.eql({
                    'purpose' : 'reporting',
                    'Assessments' : [{restriction : 'private'}]
                })
            })

            describe('Parsing Impact within \'IODEF\'', function() {

                it('Adds Impact to Assessment', function() {
                    var entity = {}
                    var item = ltx.parse(
                        IODEF_DOC_START +
                          IODEF_INCIDENT_START +
                            '<Assessment>' +
                              '<Impact></Impact>' +
                            '</Assessment>' +
                          IODEF_INCIDENT_END +
                        IODEF_DOC_END
                    )
                    parser.parse(item, entity)
                    entity['IODEF-Document'].Incidents[0].Assessments[0].should.eql({
                        Impacts : [{Impact : ''}]
                    })
                })

                it('Adds multiple Impacts to Assessment', function() {
                    var entity = {}
                    var item = ltx.parse(
                        IODEF_DOC_START +
                          IODEF_INCIDENT_START +
                            '<Assessment>' +
                              '<Impact></Impact>' +
                              '<Impact></Impact>' +
                            '</Assessment>' +
                          IODEF_INCIDENT_END +
                        IODEF_DOC_END
                    )
                    parser.parse(item, entity)
                    entity['IODEF-Document'].Incidents[0].Assessments[0].should.eql({
                        Impacts : [
                            {Impact : ''},
                            {Impact : ''}
                        ]

                    })
                })

                it('Adds lang attribute to Impact', function() {
                    var entity = {}
                    var item = ltx.parse(
                        IODEF_DOC_START +
                          IODEF_INCIDENT_START +
                            '<Assessment>' +
                              '<Impact lang="en"></Impact>' +
                            '</Assessment>' +
                          IODEF_INCIDENT_END +
                        IODEF_DOC_END
                    )
                    parser.parse(item, entity)
                    entity['IODEF-Document'].Incidents[0].Assessments[0].Impacts[0].should.eql({
                        Impact : '',
                        lang : 'en'
                    })
                })

                it('Adds severity attribute to Impact', function() {
                    var entity = {}
                    var item = ltx.parse(
                        IODEF_DOC_START +
                          IODEF_INCIDENT_START +
                            '<Assessment>' +
                              '<Impact severity="medium"></Impact>' +
                            '</Assessment>' +
                          IODEF_INCIDENT_END +
                        IODEF_DOC_END
                    )
                    parser.parse(item, entity)
                    entity['IODEF-Document'].Incidents[0].Assessments[0].Impacts[0].should.eql({
                        Impact : '',
                        severity : 'medium'
                    })
                })

                it('Adds completion attribute to Impact', function() {
                    var entity = {}
                    var item = ltx.parse(
                        IODEF_DOC_START +
                          IODEF_INCIDENT_START +
                            '<Assessment>' +
                              '<Impact completion="failed"></Impact>' +
                            '</Assessment>' +
                          IODEF_INCIDENT_END +
                        IODEF_DOC_END
                    )
                    parser.parse(item, entity)
                    entity['IODEF-Document'].Incidents[0].Assessments[0].Impacts[0].should.eql({
                        Impact : '',
                        completion : 'failed'
                    })
                })

                it('Adds type attribute to Impact', function() {
                    var entity = {}
                    var item = ltx.parse(
                        IODEF_DOC_START +
                          IODEF_INCIDENT_START +
                            '<Assessment>' +
                              '<Impact type="info-leak"></Impact>' +
                            '</Assessment>' +
                          IODEF_INCIDENT_END +
                        IODEF_DOC_END
                    )
                    parser.parse(item, entity)
                    entity['IODEF-Document'].Incidents[0].Assessments[0].Impacts[0].should.eql({
                        Impact : '',
                        type : 'info-leak'
                    })
                })

                it('Adds ext-type attribute to Impact', function() {
                    var entity = {}
                    var item = ltx.parse(
                        IODEF_DOC_START +
                          IODEF_INCIDENT_START +
                            '<Assessment>' +
                              '<Impact ext-type="new-type"></Impact>' +
                            '</Assessment>' +
                          IODEF_INCIDENT_END +
                        IODEF_DOC_END
                    )
                    parser.parse(item, entity)
                    entity['IODEF-Document'].Incidents[0].Assessments[0].Impacts[0].should.eql({
                        Impact : '',
                        'ext-type' : 'new-type'
                    })
                })
            })
        })

        describe('Parsing Contact within \'IODEF\'', function() {

            it('Adds Contact to Incident', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<Contact/>' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].should.eql({
                    'purpose' : 'reporting',
                    'Contacts' : [{}]
                })
            })

            it('Adds multiple Contacts to Incident', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<Contact/>' +
                        '<Contact/>' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].should.eql({
                    'purpose' : 'reporting',
                    'Contacts' : [{}, {}]
                })
            })

            it('Adds role attribute to Contact', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<Contact role="creator"/>' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].Contacts[0].should.eql({
                    role : 'creator'
                })
            })

            it('Adds ext-role attribute to Contact', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<Contact ext-role="new-role"/>' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].Contacts[0].should.eql({
                    'ext-role' : 'new-role'
                })
            })

            it('Adds type attribute to Contact', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<Contact type="person"/>' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].Contacts[0].should.eql({
                    type : 'person'
                })
            })

            it('Adds ext-type attribute to Contact', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<Contact ext-type="new-type"/>' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].Contacts[0].should.eql({
                    'ext-type' : 'new-type'
                })
            })

            it('Adds restriction attribute to Contact', function() {
                var entity = {}
                var item = ltx.parse(
                    IODEF_DOC_START +
                      IODEF_INCIDENT_START +
                        '<Contact restriction="public"/>' +
                      IODEF_INCIDENT_END +
                    IODEF_DOC_END
                )
                parser.parse(item, entity)
                entity['IODEF-Document'].Incidents[0].Contacts[0].should.eql({
                    restriction : 'public'
                })
            })

            describe('Parsing ContactName within \'IODEF\'', function() {

                it('Adds ContactName to Contact', function() {
                    var entity = {}
                    var item = ltx.parse(
                        IODEF_DOC_START +
                          IODEF_INCIDENT_START +
                            '<Contact>' +
                              '<ContactName>Bill Folds</ContactName>' +
                            '</Contact>' +
                          IODEF_INCIDENT_END +
                        IODEF_DOC_END
                    )
                    parser.parse(item, entity)
                    entity['IODEF-Document'].Incidents[0].Contacts[0].should.eql({
                        ContactName : {
                            ContactName : 'Bill Folds'
                        }
                    })
                })
            })

            describe('Parsing Email within \'IODEF\'', function() {

                it('Adds Email to Contact', function() {
                    var entity = {}
                    var item = ltx.parse(
                        IODEF_DOC_START +
                          IODEF_INCIDENT_START +
                            '<Contact>' +
                              '<Email>contact@cert.example.com</Email>' +
                            '</Contact>' +
                          IODEF_INCIDENT_END +
                        IODEF_DOC_END
                    )
                    parser.parse(item, entity)
                    entity['IODEF-Document'].Incidents[0].Contacts[0].should.eql({
                        Emails : [{Email : 'contact@cert.example.com'}]
                    })
                })

                it('Adds multiple Emails to Contact', function() {
                    var entity = {}
                    var item = ltx.parse(
                        IODEF_DOC_START +
                          IODEF_INCIDENT_START +
                            '<Contact>' +
                              '<Email>contact@cert.example.com</Email>' +
                              '<Email>contact@cert.example.com</Email>' +
                            '</Contact>' +
                          IODEF_INCIDENT_END +
                        IODEF_DOC_END
                    )
                    parser.parse(item, entity)
                    entity['IODEF-Document'].Incidents[0].Contacts[0].should.eql({
                        Emails : [
                            {Email : 'contact@cert.example.com'},
                            {Email : 'contact@cert.example.com'}
                        ]
                    })
                })

                it('Adds meaning attribute to Email', function() {
                    var entity = {}
                    var item = ltx.parse(
                        IODEF_DOC_START +
                          IODEF_INCIDENT_START +
                            '<Contact>' +
                              '<Email meaning="General enquiries"/>' +
                            '</Contact>' +
                          IODEF_INCIDENT_END +
                        IODEF_DOC_END
                    )
                    parser.parse(item, entity)
                    entity['IODEF-Document'].Incidents[0].Contacts[0].Emails[0].should.eql({
                        Email : '',
                        meaning : 'General enquiries'
                    })
                })
            })
        })
    })
})

/* jshint -W030 */
describe('Building stanzas with \'IODEF\'', function() {

    var ELEMENT_TO_BUILD_INTO = '<item/>'

    it('Doesn\'t touch stanza if no IODEF-Dicument attribute', function() {
        var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)
        var original = ltx.parse(stanza.toString())

        var entity = {}
        parser.build(entity, stanza)
        stanza.root().toString().should.equal(original.toString())
    })

    it('Doesn\'t touch stanza if incorrect IODEF version specified', function() {
        var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)
        var original = ltx.parse(stanza.toString())

        var entity = {
            'IODEF-Document': {
                version: '0.00',
            }
        }
        parser.build(entity, stanza)
        stanza.root().toString().should.equal(original.toString())
    })

    describe('Building Incident stanza within \'IODEF\'', function() {

        it('Can add single Incident element', function() {
            var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

            var entity = {
                'IODEF-Document': {
                    version: parser.VERSION_IODEF,
                    lang: 'en',
                    formatid: 'simulation',
                    Incidents: [{}],
                }
            }

            parser.build(entity, stanza)

            var iodef = stanza.getChild('IODEF-Document')
            iodef.getChildren('Incident').length.should.equal(1)
        })

        it('Can add multiple Incident elements', function() {
            var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

            var entity = {
                'IODEF-Document': {
                    version: parser.VERSION_IODEF,
                    lang: 'en',
                    formatid: 'simulation',
                    Incidents: [{}, {}],
                }
            }

            parser.build(entity, stanza)

            var iodef = stanza.getChild('IODEF-Document')
            iodef.getChildren('Incident').length.should.equal(2)
        })

        it('Can add attributes to Incident element', function() {
            var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

            var entity = {
                'IODEF-Document': {
                    version: parser.VERSION_IODEF,
                    lang: 'en',
                    formatid: 'simulation',
                    Incidents: [{
                        'purpose' : 'ext-value',
                        'lang' : 'en',
                        'restriction' : 'private',
                        'ext-purpose' : 'new-purpose',
                    }]
                }
            }

            parser.build(entity, stanza)

            var iodef = stanza.getChild('IODEF-Document')

            iodef.getChild('Incident').attrs.purpose
                .should.equal(entity['IODEF-Document'].Incidents[0].purpose)

            iodef.getChild('Incident').attrs.lang
                .should.equal(entity['IODEF-Document'].Incidents[0].lang)

            iodef.getChild('Incident').attrs.restriction
                .should.equal(entity['IODEF-Document'].Incidents[0].restriction)

            iodef.getChild('Incident').attrs['ext-purpose']
                .should.equal(entity['IODEF-Document'].Incidents[0]['ext-purpose'])
        })

    })

    describe('Building IncidentID stanza within \'IODEF\'', function() {

        it('Can add IncidentID to Incident element', function() {
            var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

            var entity = {
                'IODEF-Document': {
                    version: parser.VERSION_IODEF,
                    lang: 'en',
                    formatid: 'simulation',
                    Incidents: [{
                        IncidentID : {
                            IncidentID : '1234',
                        }
                    }]
                }
            }

            parser.build(entity, stanza)

            var iodef = stanza.getChild('IODEF-Document')

            iodef.getChild('Incident').getChildText('IncidentID')
                .should.equal(entity['IODEF-Document'].Incidents[0].IncidentID.IncidentID)
        })

        it('Can add attributes to IncidentID element', function() {
            var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

            var entity = {
                'IODEF-Document': {
                    version: parser.VERSION_IODEF,
                    lang: 'en',
                    formatid: 'simulation',
                    Incidents: [{
                        IncidentID : {
                            name : 'cert.example.com',
                            instance : '5',
                            restriction : 'need-to-know',
                        }
                    }]
                }
            }

            parser.build(entity, stanza)

            var iodef = stanza.getChild('IODEF-Document')

            iodef.getChild('Incident').getChild('IncidentID').attrs.name
                .should.equal(entity['IODEF-Document'].Incidents[0].IncidentID.name)

            iodef.getChild('Incident').getChild('IncidentID').attrs.instance
                .should.equal(entity['IODEF-Document'].Incidents[0].IncidentID.instance)

            iodef.getChild('Incident').getChild('IncidentID').attrs.restriction
                .should.equal(entity['IODEF-Document'].Incidents[0].IncidentID.restriction)
        })
    })

    describe('Building ReportTime stanza within \'IODEF\'', function() {

        it('Can add ReportTime to Incident element', function() {
            var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

            var entity = {
                'IODEF-Document': {
                    version: parser.VERSION_IODEF,
                    lang: 'en',
                    formatid: 'simulation',
                    Incidents: [{
                        ReportTime : {
                            ReportTime : '2014-03-27T12:39:24+00:00',
                        }
                    }]
                }
            }

            parser.build(entity, stanza)

            var iodef = stanza.getChild('IODEF-Document')

            iodef.getChild('Incident').getChildText('ReportTime')
                .should.equal(entity['IODEF-Document'].Incidents[0].ReportTime.ReportTime)
        })
    })

    describe('Building Assessment stanza within \'IODEF\'', function() {

        it('Can add Assessment to Incident element', function() {
            var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

            var entity = {
                'IODEF-Document': {
                    version: parser.VERSION_IODEF,
                    lang: 'en',
                    formatid: 'simulation',
                    Incidents: [{
                        Assessments : [{}]
                    }]
                }
            }

            parser.build(entity, stanza)

            var iodef = stanza.getChild('IODEF-Document')

            iodef.getChild('Incident').getChildren('Assessment').length.should.equal(1)
        })

        it('Can add multiple Assessments to Incident element', function() {
            var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

            var entity = {
                'IODEF-Document': {
                    version: parser.VERSION_IODEF,
                    lang: 'en',
                    formatid: 'simulation',
                    Incidents: [{
                        Assessments : [{}, {}]
                    }]
                }
            }

            parser.build(entity, stanza)

            var iodef = stanza.getChild('IODEF-Document')

            iodef.getChild('Incident').getChildren('Assessment').length.should.equal(2)
        })

        it('Can add attributes to Assessment element', function() {
            var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

            var entity = {
                'IODEF-Document': {
                    version: parser.VERSION_IODEF,
                    lang: 'en',
                    formatid: 'simulation',
                    Incidents: [{
                        Assessments : [{
                            occurrence : 'potential',
                            restriction : 'private',
                        }]
                    }]
                }
            }

            parser.build(entity, stanza)

            var iodef = stanza.getChild('IODEF-Document')

            iodef.getChild('Incident').getChild('Assessment').attrs.occurrence
                .should.equal(entity['IODEF-Document'].Incidents[0].Assessments[0].occurrence)

            iodef.getChild('Incident').getChild('Assessment').attrs.restriction
                .should.equal(entity['IODEF-Document'].Incidents[0].Assessments[0].restriction)
        })

        describe('Building Impact stanza within \'IODEF\'', function() {

            it('Can add Impact to Assessment element', function() {
                var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

                var entity = {
                    'IODEF-Document': {
                        version: parser.VERSION_IODEF,
                        lang: 'en',
                        formatid: 'simulation',
                        Incidents: [{
                            Assessments : [
                                {Impacts : [{Impact : 'Still under investigation, could increase.'}]}
                            ]
                        }]
                    }
                }

                parser.build(entity, stanza)

                var iodef = stanza.getChild('IODEF-Document')

                iodef.getChild('Incident').getChild('Assessment').getChildren('Impact').length.should.equal(1)

                iodef.getChild('Incident').getChild('Assessment').getChildText('Impact')
                    .should.equal(entity['IODEF-Document'].Incidents[0].Assessments[0].Impacts[0].Impact)
            })

            it('Can add multiple Impacts to Assessment element', function() {
                var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

                var entity = {
                    'IODEF-Document': {
                        version: parser.VERSION_IODEF,
                        lang: 'en',
                        formatid: 'simulation',
                        Incidents: [{
                            Assessments : [
                                {Impacts : [{}, {}]}
                            ]
                        }]
                    }
                }

                parser.build(entity, stanza)

                var iodef = stanza.getChild('IODEF-Document')

                iodef.getChild('Incident').getChild('Assessment').getChildren('Impact').length.should.equal(2)
            })

            it('Can add attributes to Impact element', function() {
                var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

                var entity = {
                    'IODEF-Document': {
                        version: parser.VERSION_IODEF,
                        lang: 'en',
                        formatid: 'simulation',
                        Incidents: [{
                            Assessments : [
                                {Impacts : [{
                                    'lang' : 'en',
                                    'severity' : 'medium',
                                    'completion' : 'succeeded',
                                    'type' : 'ext-value',
                                    'ext-type' : 'new-type',
                                }]}
                            ]
                        }]
                    }
                }

                parser.build(entity, stanza)

                var iodef = stanza.getChild('IODEF-Document')

                iodef.getChild('Incident').getChild('Assessment').getChild('Impact').attrs.lang
                    .should.equal(entity['IODEF-Document'].Incidents[0].Assessments[0].Impacts[0].lang)

                iodef.getChild('Incident').getChild('Assessment').getChild('Impact').attrs.severity
                    .should.equal(entity['IODEF-Document'].Incidents[0].Assessments[0].Impacts[0].severity)

                iodef.getChild('Incident').getChild('Assessment').getChild('Impact').attrs.completion
                    .should.equal(entity['IODEF-Document'].Incidents[0].Assessments[0].Impacts[0].completion)

                iodef.getChild('Incident').getChild('Assessment').getChild('Impact').attrs.type
                    .should.equal(entity['IODEF-Document'].Incidents[0].Assessments[0].Impacts[0].type)

                iodef.getChild('Incident').getChild('Assessment').getChild('Impact').attrs['ext-type']
                    .should.equal(entity['IODEF-Document'].Incidents[0].Assessments[0].Impacts[0]['ext-type'])
            })
        })
    })

    describe('Building Contact stanza within \'IODEF\'', function() {

        it('Can add Contact to Incident element', function() {
            var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

            var entity = {
                'IODEF-Document': {
                    version: parser.VERSION_IODEF,
                    lang: 'en',
                    formatid: 'simulation',
                    Incidents: [{
                        Contacts : [{}]
                    }]
                }
            }

            parser.build(entity, stanza)

            var iodef = stanza.getChild('IODEF-Document')

            iodef.getChild('Incident').getChildren('Contact').length.should.equal(1)
        })

        it('Can add multiple Contacts to Incident element', function() {
            var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

            var entity = {
                'IODEF-Document': {
                    version: parser.VERSION_IODEF,
                    lang: 'en',
                    formatid: 'simulation',
                    Incidents: [{
                        Contacts : [{}, {}]
                    }]
                }
            }

            parser.build(entity, stanza)

            var iodef = stanza.getChild('IODEF-Document')

            iodef.getChild('Incident').getChildren('Contact').length.should.equal(2)
        })

        it('Can add attributes to Contact element', function() {
            var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

            var entity = {
                'IODEF-Document': {
                    version: parser.VERSION_IODEF,
                    lang: 'en',
                    formatid: 'simulation',
                    Incidents: [{
                        Contacts : [{
                            'role' : 'ext-value',
                            'ext-role' : 'new-role',
                            'type' : 'ext-value',
                            'ext-type' : 'new-value',
                            'restriction' : 'public',
                        }]
                    }]
                }
            }

            parser.build(entity, stanza)

            var iodef = stanza.getChild('IODEF-Document')

            iodef.getChild('Incident').getChild('Contact').attrs.role
                .should.equal(entity['IODEF-Document'].Incidents[0].Contacts[0].role)

            iodef.getChild('Incident').getChild('Contact').attrs['ext-role']
                .should.equal(entity['IODEF-Document'].Incidents[0].Contacts[0]['ext-role'])

            iodef.getChild('Incident').getChild('Contact').attrs.type
                .should.equal(entity['IODEF-Document'].Incidents[0].Contacts[0].type)

            iodef.getChild('Incident').getChild('Contact').attrs['ext-type']
                .should.equal(entity['IODEF-Document'].Incidents[0].Contacts[0]['ext-type'])

            iodef.getChild('Incident').getChild('Contact').attrs.restriction
                .should.equal(entity['IODEF-Document'].Incidents[0].Contacts[0].restriction)
        })

        describe('Building ContactName stanza within \'IODEF\'', function() {

            it('Can add ContactName to Contact element', function() {
                var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

                var entity = {
                    'IODEF-Document': {
                        version: parser.VERSION_IODEF,
                        lang: 'en',
                        formatid: 'simulation',
                        Incidents: [{
                            Contacts : [{ContactName : {ContactName : 'Bill Folds'}}]
                        }]
                    }
                }

                parser.build(entity, stanza)

                var iodef = stanza.getChild('IODEF-Document')

                iodef.getChild('Incident').getChild('Contact').getChildText('ContactName')
                    .should.equal(entity['IODEF-Document'].Incidents[0].Contacts[0].ContactName.ContactName)
            })
        })

        describe('Building Email stanza within \'IODEF\'', function() {

            it('Can add Email to Contact element', function() {
                var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

                var entity = {
                    'IODEF-Document': {
                        version: parser.VERSION_IODEF,
                        lang: 'en',
                        formatid: 'simulation',
                        Incidents: [{
                            Contacts : [
                                {Emails : [{Email : 'contact@cert.example.com'}]}
                            ]
                        }]
                    }
                }

                parser.build(entity, stanza)

                var iodef = stanza.getChild('IODEF-Document')

                iodef.getChild('Incident').getChild('Contact').getChildren('Email').length.should.equal(1)

                iodef.getChild('Incident').getChild('Contact').getChildText('Email')
                    .should.equal(entity['IODEF-Document'].Incidents[0].Contacts[0].Emails[0].Email)
            })

            it('Can add multiple Emails to Contact element', function() {
                var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

                var entity = {
                    'IODEF-Document': {
                        version: parser.VERSION_IODEF,
                        lang: 'en',
                        formatid: 'simulation',
                        Incidents: [{
                            Contacts : [
                                {Emails : [{}, {}]}
                            ]
                        }]
                    }
                }

                parser.build(entity, stanza)

                var iodef = stanza.getChild('IODEF-Document')

                iodef.getChild('Incident').getChild('Contact').getChildren('Email').length.should.equal(2)
            })

            it('Can add attributes to Email element', function() {
                var stanza = ltx.parse(ELEMENT_TO_BUILD_INTO)

                var entity = {
                    'IODEF-Document': {
                        version: parser.VERSION_IODEF,
                        lang: 'en',
                        formatid: 'simulation',
                        Incidents: [{
                            Contacts : [
                                {Emails : [{meaning : 'General enquiries'}]}
                            ]
                        }]
                    }
                }

                parser.build(entity, stanza)

                var iodef = stanza.getChild('IODEF-Document')

                iodef.getChild('Incident').getChild('Contact').getChild('Email').attrs.meaning
                    .should.equal(entity['IODEF-Document'].Incidents[0].Contacts[0].Emails[0].meaning)
            })
        })
    })
})
