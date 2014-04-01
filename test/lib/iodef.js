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

    var IODEF_DOC_START = '<IODEF-Document version="1.00" xmlns="' + parser.NS_IODEF + '">'
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
        var item   = ltx.parse('<IODEF-Document version="1.00" xmlns="' + parser.NS_IODEF + '"/>')
        parser.parse(item, entity)
        entity['IODEF-Document'].should.eql({ version : '1.00'})
    })

    it('Adds lang attribute to IODEF-Document', function() {
        var entity = {}
        var item   = ltx.parse('<IODEF-Document version="1.00" lang="en" xmlns="' + parser.NS_IODEF + '"/>')
        parser.parse(item, entity)
        entity['IODEF-Document'].should.eql({ version : '1.00', lang : 'en'})
    })

    it('Adds formatid attribute to IODEF-Document', function() {
        var entity = {}
        var item   = ltx.parse('<IODEF-Document version="1.00" formatid="simulation" xmlns="' + parser.NS_IODEF + '"/>')
        parser.parse(item, entity)
        entity['IODEF-Document'].should.eql({ version : '1.00', formatid : 'simulation'})
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
            entity['IODEF-Document'].should.eql({version : '1.00', Incidents : [{}]})
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
            entity['IODEF-Document'].should.eql({version : '1.00', Incidents : [{}, {}]})
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

    it('Doesn\'t touch stanza if no \'IODEF-Document\' attribute', function() {
        var stanza = ltx.parse('<IODEF-Document/>')
        var original = ltx.parse(stanza.toString())
        var entity = {}
        parser.build(entity, stanza)
        stanza.root().toString().should.equal(original.toString())
    })
})
