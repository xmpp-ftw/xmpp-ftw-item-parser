'use strict';

var NS_IODEF = exports.NS_IODEF = 'urn:ietf:params:xml:ns:iodef-1.0'

var VERSION_IODEF = exports.VERSION_IODEF = '1.00'

var logger

var parseIncidentId = function(incident, entity) {
    var incidentId
    var incidentIdAttributes = ['name', 'instance', 'restriction']

    if (!(incidentId = incident.getChild('IncidentID'))) return

    entity.IncidentID = {
        IncidentID : incidentId.getText()
    }

    incidentIdAttributes.forEach(function(attribute) {
        if (incidentId.attrs[attribute]) entity.IncidentID[attribute] = incidentId.attrs[attribute]
    })
}

var parseReportTime = function(incident, entity) {
    var reportTime

    if (!(reportTime = incident.getChild('ReportTime'))) return

    entity.ReportTime = {
        ReportTime : reportTime.getText()
    }
}

var parseImpact = function(assessment, entity) {
    var impactAttributes = ['lang', 'severity', 'completion', 'type', 'ext-type', 'restriction']
    var impacts

    if (0 === (impacts = assessment.getChildren('Impact')).length) return

    entity.Impacts = []

    impacts.forEach(function(impact) {
        var item = {}

        impactAttributes.forEach(function(attribute) {
            if (impact.attrs[attribute]) item[attribute] = impact.attrs[attribute]
        })

        item.Impact = impact.getText()

        entity.Impacts.push(item)
    })
}

var parseAssessments = function(incident, entity) {
    var assessmentAttributes = ['occurrence', 'restriction']
    var assessments

    if (0 === (assessments = incident.getChildren('Assessment')).length) return

    entity.Assessments = []

    assessments.forEach(function(assessment) {
        var item = {}

        assessmentAttributes.forEach(function(attribute) {
            if (assessment.attrs[attribute]) item[attribute] = assessment.attrs[attribute]
        })

        parseImpact(assessment, item);
        entity.Assessments.push(item)
    })
}

var parseContactName = function(contact, entity) {
    var contactName

    if (!(contactName = contact.getChild('ContactName'))) return

    // Simple string element but I prefer to be consistent so:
    entity.ContactName = {
        ContactName : contactName.getText()
    }
}

var parseEmail = function(contact, entity) {
    var emails

    if (0 === (emails = contact.getChildren('Email')).length) return

    entity.Emails = []

    emails.forEach(function(email) {
        var item = {}

        if (email.attrs.meaning) item.meaning = email.attrs.meaning
        item.Email = email.getText()

        entity.Emails.push(item)
    })
}

var parseContact = function(incident, entity) {
    var contactAttributes = ['role', 'ext-role', 'type', 'ext-type', 'restriction']
    var contacts

    if (0 === (contacts = incident.getChildren('Contact')).length) return

    entity.Contacts = []

    contacts.forEach(function(contact) {
        var item = {}

        contactAttributes.forEach(function(attribute) {
            if (contact.attrs[attribute]) item[attribute] = contact.attrs[attribute]
        })

        parseContactName(contact, item);
        parseEmail(contact, item);

        entity.Contacts.push(item)
    })
}

var parseIncidents = function(iodefDocument, entity) {
    var incidentAttributes = ['purpose', 'ext-purpose', 'lang', 'restriction']
    var incidents

    if (0 === (incidents = iodefDocument.getChildren('Incident')).length) return

    entity.Incidents = []

    incidents.forEach(function(incident) {
        var item = {}

        incidentAttributes.forEach(function(attribute) {
            if (incident.attrs[attribute]) item[attribute] = incident.attrs[attribute]
        })

        parseIncidentId(incident, item);
        parseReportTime(incident, item);
        parseAssessments(incident, item);
        parseContact(incident, item);

        entity.Incidents.push(item)
    })
}

var parseIodefDocument = function(item, entity) {

    entity['IODEF-Document'] = {}

    var iodefDocumentAttributes = ['version', 'lang', 'formatid']
    iodefDocumentAttributes.forEach(function(attribute) {
        if (item.attrs[attribute]) entity['IODEF-Document'][attribute] = item.attrs[attribute]
    })

    parseIncidents(item, entity['IODEF-Document'])
}

exports.setLogger = function(log) {
    logger = log
}

exports.parse = function(item, entity) {
    if (-1 === item.toString().indexOf(NS_IODEF)) return

    if (VERSION_IODEF !== item.attrs.version) return

    parseIodefDocument(item, entity)
}

exports.build = function(data, payload) {
    var iodefDocument

    if (!(iodefDocument = payload.getChild('IODEF-Document', NS_IODEF))) return
}
