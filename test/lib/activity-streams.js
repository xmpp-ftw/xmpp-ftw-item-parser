'use strict';

var parser = require('../../lib/activity-streams')
  , ltx    = require('ltx')
  , should = require('should')


parser.setLogger({
    log: function() {},
    info: function() {},
    warn: function() {},
    error: function() {}
})

/* jshint -W030 */
describe('Parsing posts with \'activity streams\'', function() {

    it('Shouldn\'t act if no thread namespace', function() {
        var entity = { not: 'empty' }
        var item   = ltx.parse('<body/>')
        parser.parse(item, entity)
        entity.should.eql({ not: 'empty' })
    })

    it('Adds thread details', function() {

        var entity = {}
        var item = ltx.parse(
          '<item><entry xmlns="' + parser.NS_THREAD + '">' +
          '<thr:in-reply-to ' +
                'ref="tag:xmpp-ftw,2013:10" ' +
                'type="application/xhtml+xml" ' +
                'href="http://evilprofessor.co.uk/entries/1"/>' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({
            'in-reply-to': {
                ref: 'tag:xmpp-ftw,2013:10',
                type: 'application/xhtml+xml',
                href: 'http://evilprofessor.co.uk/entries/1'
            }
        })
    })
    
    it('Adds target details', function() {
        
        var entity = {}
        var item = ltx.parse(
          '<item><entry xmlns="' + parser.NS_ATOM + '" activity:xmlns="' + parser.NS_ACTIVITY + '">' +
          '<activity:target>' +
              '<id>tag:xmpp-ftw.jit.su,news,item-20130113</id>' +
              '<activity:object-type>comment</activity:object-type>' +
          '</activity:target>' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({
            activity: {
                target: {
                    id: 'tag:xmpp-ftw.jit.su,news,item-20130113',
                    'object-type': 'comment'
                }
            }
        })
    })
    
    
    it('Can skip target details', function() {
        
        var entity = {}
        var item = ltx.parse(
          '<item><entry xmlns="' + parser.NS_ATOM + '" activity:xmlns="' + parser.NS_ACTIVITY + '">' +
          '<activity:target />' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({
            activity: {}
        })
    })
    
    it('Adds rating details', function() {
        var entity = {}
        var item = ltx.parse(
          '<item><entry xmlns="' + parser.NS_REVIEW + '">' +
              '<review:rating>5.0</review:rating>' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({
            review: {
                rating: 5
            }
        })
    })

    it('Adds verb details', function() {
        var entity = {}
        var item = ltx.parse(
          '<item><entry xmlns="' + parser.NS_ATOM + '" activity:xmlns="' + parser.NS_ACTIVITY + '">' +
          '<activity:verb>post</activity:verb>' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({
            activity: {
                verb: 'post'
            }
        })
    })
    
    it('Adds object details', function() {
        
        var entity = {}
        var item = ltx.parse(
          '<item><entry xmlns="' + parser.NS_ATOM + '" activity:xmlns="' + parser.NS_ACTIVITY + '">' +
          '<activity:object><activity:object-type>post</activity:object-type></activity:object>' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({
            activity: {
                object: {
                    'object-type': 'post'
                }
            }
        })
    })
    
    it('Adds author extension details', function() {
        
        var entity = {}
        var item = ltx.parse(
          '<item><entry xmlns="' + parser.NS_ATOM + '">' +
          '<author>' +
              '<object-type xmlns="' + parser.NS_ACTIVITY + '">person</object-type>' +
          '</author>' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({
            activity: {
                author: {
                    'object-type': 'person'
                }
            }
        })
    })
    
    it('Can skip author details', function() {
        
        var entity = {}
        var item = ltx.parse(
          '<item><entry xmlns="' + parser.NS_ATOM + '">' +
          '<author>' +
              '<object-type />' +
          '</author>' +
          '</entry></item>'
        )
        parser.parse(item, entity)
        entity.should.eql({})
    })
    
})

describe('Building stanzas with \'activity streams\'', function() {

    it('Shouldn\'t add elements if no data attribute provided', function() {
        var stanza = ltx.parse('<item><entry xmlns="' + parser.NS_ATOM + '"/></item>')
        var original = ltx.parse(stanza.toString())
        var entry = {}
        parser.build(entry, stanza)
        stanza.root().toString().should.equal(original.root().toString())
    })

    it('Shouldn\'t get built if there\'s no atom namespace', function() {
        var stanza = ltx.parse('<item><entry/></item>')
        var entry = { 'in-reply-to': {} }
        parser.build(entry, stanza)
        stanza.root().toString().should.equal('<item><entry/></item>')
    })

    it('Should add namespace to parent element', function() {
        var stanza = ltx.parse('<item><entry xmlns="' + parser.NS_ATOM + '"/></item>')
        var entry = { 'in-reply-to': {} }
        parser.build(entry, stanza)
        stanza.root().getChild('entry').attrs['xmlns:' + parser.PREFIX_NS_THREAD]
            .should.equal(parser.NS_THREAD)
    })

    it('Adds expected <in-reply-to/> element', function() {
        var stanza = ltx.parse('<item><entry xmlns="' + parser.NS_ATOM + '"/></item>')
        var entry = { 'in-reply-to': {
            ref: 'tag:xmpp-ftw,2013:10',
            type: 'application/xhtml+xml',
            href: 'http://evilprofessor.co.uk/entires/1'
        } }
        parser.build(entry, stanza)
        stanza.root().getChild('entry').attrs['xmlns:' + parser.PREFIX_NS_THREAD]
            .should.equal(parser.NS_THREAD)
        var inReplyTo = stanza.root().getChild('entry').getChild('in-reply-to')
        inReplyTo.should.exist
        inReplyTo.attrs.ref.should.equal(entry['in-reply-to'].ref)
        inReplyTo.attrs.type.should.equal(entry['in-reply-to'].type)
        inReplyTo.attrs.href.should.equal(entry['in-reply-to'].href)
    })
    
    it('Adds <target/> element and namespace', function() {
        var stanza = ltx.parse('<item><entry xmlns="' + parser.NS_ATOM + '"/></item>')
        var entry = {
            activity: {
                target: {
                    id: 'tag:xmpp-ftw.jit.su,news,item-20130113',
                    'object-type': 'comment'
                }
            }
        }
        parser.build(entry, stanza)
        stanza.root().getChild('entry').attrs['xmlns:' + parser.PREFIX_NS_ACTIVITY]
            .should.equal(parser.NS_ACTIVITY)
        var target = stanza.root().getChild('entry').getChild('target')
        target.should.exist
        target.getChildText('id').should.equal(entry.activity.target.id)
        target.getChildText('object-type').should.equal(entry.activity.target['object-type'])
    })
    
    it('Adds <rating/> element and namespace', function() {
        var stanza = ltx.parse('<item><entry xmlns="' + parser.NS_ATOM + '"/></item>')
        var entry = {
            review: {
                rating: 5
            }
        }
        parser.build(entry, stanza)
        stanza.root().getChild('entry').attrs['xmlns:' + parser.PREFIX_NS_REVIEW]
            .should.equal(parser.NS_REVIEW)
        var rating = stanza.root().getChild('entry').getChild('rating')
        rating.should.exist
        rating.getText().should.equal(entry.review.rating.toString())
    })
    
    it('Adds <verb/> element and namespace', function() {
        var stanza = ltx.parse('<item><entry xmlns="' + parser.NS_ATOM + '"/></item>')
        var entry = {
            activity: {
                verb: 'post'
            }
        }
        parser.build(entry, stanza)
        stanza.root().getChild('entry').attrs['xmlns:' + parser.PREFIX_NS_ACTIVITY]
            .should.equal(parser.NS_ACTIVITY)
        stanza.root().getChild('entry').getChildText('verb').should.equal(entry.activity.verb)
    })
    
    it('Adds <object/> element and namespace', function() {
        var stanza = ltx.parse('<item><entry xmlns="' + parser.NS_ATOM + '"/></item>')
        var entry = {
            activity: {
                object: {
                    'object-type': 'post'
                }
            }
        }
        parser.build(entry, stanza)
        stanza.root().getChild('entry').attrs['xmlns:' + parser.PREFIX_NS_ACTIVITY]
            .should.equal(parser.NS_ACTIVITY)
        stanza.root().getChild('entry').getChild('object').getChildText('object-type')
            .should.equal(entry.activity.object['object-type'])
    })
    
    it('Can extend ATOM <author/> with object-type', function() {
        var stanza = ltx.parse('<item><entry xmlns="' + parser.NS_ATOM + '"><author/></entry></item>')
        var entry = {
            activity: {
                author: {
                    'object-type': 'person'
                }
            }
        }
        parser.build(entry, stanza)
        stanza.root().getChild('entry').attrs['xmlns:' + parser.PREFIX_NS_ACTIVITY]
            .should.equal(parser.NS_ACTIVITY)
        stanza.root().getChild('entry').getChild('author').getChildText('object-type')
            .should.equal(entry.activity.author['object-type'])
    })
    
    it('Doesn\'t add author extension if we don\'t have atom:author in place', function() {
        var stanza = ltx.parse('<item><entry xmlns="' + parser.NS_ATOM + '"/></item>')
        var entry = {
            activity: {
                author: {
                    'object-type': 'person'
                }
            }
        }
        parser.build(entry, stanza)
        stanza.root().getChild('entry').attrs['xmlns:' + parser.PREFIX_NS_ACTIVITY]
            .should.equal(parser.NS_ACTIVITY)
        should.not.exist(stanza.root().getChild('entry').getChild('author'))
    })

})
