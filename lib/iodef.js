'use strict';

var NS_IODEF = exports.NS_IODEF = 'urn:ietf:params:xml:ns:iodef-1.0'

var VERSION_IODEF = exports.VERSION_IODEF = '1.00'

var logger

var iodefDocumentAttributes = ['version', 'lang', 'formatid']
var incidentAttributes = ['purpose', 'ext-purpose', 'lang', 'restriction']
var incidentIdAttributes = ['name', 'instance', 'restriction']
var assessmentAttributes = ['occurrence', 'restriction']
var impactAttributes = ['lang', 'severity', 'completion', 'type', 'ext-type']
var contactAttributes = ['role', 'ext-role', 'type', 'ext-type', 'restriction']
var emailAttributes = ['meaning']

var parseIncidentId = function(incident, entity) {
    var incidentId

    if (!(incidentId = incident.getChild('IncidentID'))) return

    entity.IncidentID = {
        IncidentID: incidentId.getText()
    }

    incidentIdAttributes.forEach(function(attribute) {
        if (incidentId.attrs[attribute]) entity.IncidentID[attribute] = incidentId.attrs[attribute]
    })
}

var parseReportTime = function(incident, entity) {
    var reportTime

    if (!(reportTime = incident.getChild('ReportTime'))) return

    entity.ReportTime = {
        ReportTime: reportTime.getText()
    }
}

var parseImpact = function(assessment, entity) {
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

    // Simple string element with no attributes but I'd prefer to be consistent so:
    entity.ContactName = {
        ContactName: contactName.getText()
    }
}

var parseEmail = function(contact, entity) {
    var emails

    if (0 === (emails = contact.getChildren('Email')).length) return

    entity.Emails = []

    emails.forEach(function(email) {
        var item = {}

        emailAttributes.forEach(function(attribute) {
            if (email.attrs[attribute]) item[attribute] = email.attrs[attribute]
        })
        item.Email = email.getText()
        entity.Emails.push(item)
    })
}

var parseContact = function(incident, entity) {
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

var buildIncidentId = function(incidentIn, incidentOut) {
    if (incidentIn.IncidentID) {
        var attrs = {}
        incidentIdAttributes.forEach(function(attr){
            if (incidentIn.IncidentID[attr]) attrs[attr] = incidentIn.IncidentID[attr]
        })

        var incidentIdOut = incidentOut.c('IncidentID', attrs)

        if (incidentIn.IncidentID.IncidentID) incidentIdOut.t(incidentIn.IncidentID.IncidentID)
    }
}

var buildReportTime = function(incidentIn, incidentOut) {
    if (incidentIn.ReportTime) {
        var reportTimeOut = incidentOut.c('ReportTime')

        if (incidentIn.ReportTime.ReportTime) reportTimeOut.t(incidentIn.ReportTime.ReportTime)
    }
}

var buildImpact = function(impactIn, assessmentOut) {
    var impactOut = assessmentOut.c('Impact')

    impactAttributes.forEach(function(attributeName){
        if (impactIn[attributeName]) impactOut.attr(attributeName, impactIn[attributeName])
    })

    if (impactIn.Impact) impactOut.t(impactIn.Impact)
}

var buildImpacts = function(assessmentIn, assessmentOut) {

    if (!assessmentIn.Impacts || 0 === assessmentIn.Impacts.length) return

    assessmentIn.Impacts.forEach(function(impactIn) {
        buildImpact(impactIn, assessmentOut)
    })
}

var buildAssessment = function(assessmentIn, incidentOut) {
    var assessmentOut = incidentOut.c('Assessment')

    assessmentAttributes.forEach(function(attributeName){
        if (assessmentIn[attributeName]) assessmentOut.attr(attributeName, assessmentIn[attributeName])
    })

    buildImpacts(assessmentIn, assessmentOut)
}

var buildAssessments = function(incidentIn, incidentOut) {

    if (!incidentIn.Assessments || 0 === incidentIn.Assessments.length) return

    incidentIn.Assessments.forEach(function(assessmentIn) {
        buildAssessment(assessmentIn, incidentOut)
    })
}

var buildContactName = function(contactIn, contactOut) {
    if (contactIn.ContactName) {
        var contactNameOut = contactOut.c('ContactName')

        if (contactIn.ContactName.ContactName) contactNameOut.t(contactIn.ContactName.ContactName)
    }
}

var buildEmail = function(emailIn, contactOut) {
    var emailOut = contactOut.c('Email')

    emailAttributes.forEach(function(attributeName){
        if (emailIn[attributeName]) emailOut.attr(attributeName, emailIn[attributeName])
    })

    if (emailIn.Email) emailOut.t(emailIn.Email)
}

var buildEmails = function(contactIn, contactOut) {

    if (!contactIn.Emails || 0 === contactIn.Emails.length) return

    contactIn.Emails.forEach(function(emailIn) {
        buildEmail(emailIn, contactOut)
    })
}

var buildContact = function(contactIn, incidentOut) {
    var contactOut = incidentOut.c('Contact')

    contactAttributes.forEach(function(attributeName){
        if (contactIn[attributeName]) contactOut.attr(attributeName, contactIn[attributeName])
    })

    buildContactName(contactIn, contactOut)
    buildEmails(contactIn, contactOut)
}

var buildContacts = function(incidentIn, incidentOut) {

    if (!incidentIn.Contacts || 0 === incidentIn.Contacts.length) return

    incidentIn.Contacts.forEach(function(contactIn) {
        buildContact(contactIn, incidentOut)
    })
}

var buildIncident = function(incidentIn, iodefOut) {

    var incidentOut = iodefOut.c('Incident')

    incidentAttributes.forEach(function(attributeName){
        if (incidentIn[attributeName]) incidentOut.attr(attributeName, incidentIn[attributeName])
    })
    buildIncidentId(incidentIn, incidentOut)
    buildReportTime(incidentIn, incidentOut)
    buildAssessments(incidentIn, incidentOut)
    buildContacts(incidentIn, incidentOut)
}

var buildIncidents = function(iodefIn, iodefOut) {

    if (!iodefIn.Incidents || 0 === iodefIn.Incidents.length) return

    iodefIn.Incidents.forEach(function(incidentIn) {
        buildIncident(incidentIn, iodefOut)
    })
}

var buildIodefDocument = function(iodefIn, payload) {

    if (!payload.getChild('IODEF-Document')) payload.c('IODEF-Document').up()

    var iodefOut = payload.getChild('IODEF-Document')

    iodefDocumentAttributes.forEach(function(attributeName){
        if (iodefIn[attributeName]) iodefOut.attr(attributeName, iodefIn[attributeName])
    })

    iodefOut.attr('xmlns', NS_IODEF);

    buildIncidents(iodefIn, iodefOut)
}

exports.setLogger = function(log) {
    logger = log
}

exports.parse = function(item, entity) {

    if (-1 === item.toString().indexOf(NS_IODEF)) return

    if (VERSION_IODEF !== item.attrs.version) return

    parseIodefDocument(item, entity)
}

exports.build = function(iodefIn, payload) {

    if (!iodefIn['IODEF-Document']) return

    if (VERSION_IODEF !== iodefIn['IODEF-Document'].version) return

    buildIodefDocument(iodefIn['IODEF-Document'], payload)
}
