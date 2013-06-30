xmpp-ftw-item-parser
====================

Used to parse "standard" XMPP pubsub payloads both from XML→JSON, and build stanzas JSON→XML.

Takes XML in the form of [ltx](https://github.com/astro/ltx) objects and 
parses these down to JSON. Alternatively its builds ltx objects (XML) 
from JSON objects.

# Build status

[![Build Status](https://secure.travis-ci.org/lloydwatkin/xmpp-ftw-item-parser.png)](http://travis-ci.org/lloydwatkin/xmpp-ftw-item-parser)

# Install

```
npm i --save xmpp-ftw-item-parser
```

# Examples


# Notes

* The atom builder does not currently build the 'rights' element. If you require this please raise an issue or, better still, send me a pull request
