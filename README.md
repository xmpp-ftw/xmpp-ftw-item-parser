xmpp-ftw-item-parser
====================

Used to parse "standard" XMPP pubsub payloads both from XML→JSON, and build stanzas JSON→XML.

Takes XML in the form of [ltx](https://github.com/astro/ltx) objects and 
parses these down to JSON. Alternatively its builds ltx objects (XML) 
from JSON objects.

# Build status

[![Build Status](https://secure.travis-ci.org/xmpp-ftw/xmpp-ftw-item-parser.png)](http://travis-ci.org/xmpp-ftw/xmpp-ftw-item-parser)

# Install

``` bash
$ npm i --save xmpp-ftw-item-parser
```

# Examples

## Configuration
It is possible to configure this component to only enable parsers for the formats you wish to handle in your application. A set of common parsers are enabled by default but some will need to be enabled depending on the needs of your application.

The following example shows how to add the IODEF parser to the standard set of enabled parsers:
```javascript
parser.addParser(parser.availableParsers.iodef)
```

Removing a parser from the set of enabled parsers is equally simple: 
```javascript
parser.removeParser(parser.availableParsers.activityStreams)
```

The full list of available parsers is available from `parser.availableParsers`. 

As well as adding and removing individual parsers you are also able to define a list of parsers to add in a single call. The following example replaces the default set of parsers with the JSON and IODEF parsers.
```javascript
parser.setParsers([parser.availableParsers.json, parser.availableParsers.iodef])
```

You can, if you wish, remove all parsers from the list of enabled parsers using the following call: 
```javascript
parser.removeAllParsers()
```

## IODEF
The IODEF parser will translate between XML and JSON in both directions. The following JSON and XML documents represent the complete set of elements and attributes currently supported:

```xml
<IODEF-Document version="1.00" lang="en" formatid="simulation" xmlns="urn:ietf:params:xml:ns:iodef-1.0">
<Incident purpose="ext-value" ext-purpose="new-purpose" lang="en" restriction="need-to-know">
    <IncidentID name="cert.example.com" instance="5" restriction="private">189493</IncidentID>
    <ReportTime>2014-03-27T12:39:24+00:00</ReportTime>
    <Assessment occurrence="actual" restriction="private">
        <Impact lang="en" severity="medium" completion="succeeded" type="ext-value" ext-type="new-type">
            A new type of attack has taken all of our printers offline.
        </Impact>
    </Assessment>
    <Contact role="ext-value" ext-role="new-role" type="ext-value" ext-type="new-type" restriction="public">
        <ContactName>Bill Folds</ContactName>
        <Email meaning="IRT group address, manned Mon-Fri 9-5 UTC">contact@cert.example.com</Email>
    </Contact>
</Incident>
</IODEF-Document>
```

```json
{
    "IODEF-Document" : {
        "version" : "1.00",
        "lang" : "en",
        "formatid" : "simulation",
        "Incidents" : [{
            "purpose" : "ext-value",
            "ext-purpose" : "new-purpose",
            "lang" : "en",
            "restriction" : "need-to-know",
            "IncidentID" : {
                "IncidentID" : "189493",
                "name" : "cert.example.com",
                "instance" : "5",
                "restriction" : "private"
            },
            "ReportTime" : {"ReportTime" : "2014-03-27T12:39:24+00:00"},
            "Assessments" : [{
                "occurrence" : "actual",
                "restriction" : "private",
                "Impacts" : [{
                    "lang" : "en",
                    "severity" : "medium",
                    "completion" : "succeeded",
                    "type" : "ext-value",
                    "ext-type" : "new-type",
                    "Impact" : "A new type of attack has taken all of our printers offline."
                }]
            }],
            "Contacts" : [{
                "role" : "ext-value",
                "ext-role" : "new-role",
                "type" : "ext-value",
                "ext-type" : "new-type",
                "restriction" : "public",
                "ContactName" : {"ContactName" : "Bill Folds"},
                "Emails" : [{
                    "meaning" : "IRT group address, manned Mon-Fri 9-5 UTC",
                    "Email" : "contact@cert.example.com"
                }]
            }]
        }]
    }
}
```

Note that support is provided for multiple elements where permitted by the specification (currently `Incident`, `Assessment`, `Impact`, `Contact`, `Email`).

The following example shows how an XML IODEF document can be parsed into JSON:
```javascript
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

parser.addParser(parser.availableParsers.iodef)
var iodefJson = parser.parse(iodefXml)
```

The following example shows how IODEF in JSON format can be built into a valid IODEF XML document:
```javascript
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

var elementToBuildInto = ltx.parse('<item/>')
var iodefXml = parser.build(iodefJson, elementToBuildInto)
```

# Notes

* The atom builder does not currently build the 'rights' element. If you require this please raise an issue or, better still, send me a pull request

* Support for [IODEF](http://tools.ietf.org/html/rfc5070 "The Incident Object Description Exchange Format") is limited to a minimal set of elements. The implementation currently supports the `IODEF-Document` element and all of its attributes along with the following sub-elements, including all of their attributes:

    * `Incident`
        * `IncidentID`
        * `ReportTime`
    * `Assessment` 
        * `Impact`
    * `Contact`
        * `ContactName`
        * `Email`

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/xmpp-ftw/xmpp-ftw-item-parser/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

