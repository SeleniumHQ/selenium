email-addresses.js
==================

An RFC 5322 email address parser.

v 3.0.2

What?
-----
Want to see if something could be an email address? Want to grab the display name or just the address out of a string? Put your regexes down and use this parser!

This library does not validate email addresses - we can't really do that without sending an email. However, it attempts to parse addresses using the (fairly liberal) grammar specified in RFC 5322. You can use this to check if user input looks like an email address.

Note carefully though - this parser supports all features of RFC 5322, which means that `"Bob Example" <bob@example.com>`
is a valid email address. If you just want to validate the `bob@example.com` part, that is RFC 5321, for which you want
to use something like node-address-rfc2821.

Why use this?
-------------
Use this library because you can be sure it really respects the RFC:
 - The functions in the recursive decent parser match up with the productions in the RFC
 - The productions from the RFC are written above each function for easy verification
 - Tests include all of the test cases from the [is_email](https://github.com/dominicsayers/isemail) project, which are extensive

Installation
------------
npm install email-addresses

Example
-------

```
$ node
> addrs = require("email-addresses")
{ [Function: parse5322]
  parseOneAddress: [Function: parseOneAddressSimple],
  parseAddressList: [Function: parseAddressListSimple] }
> addrs.parseOneAddress('"Jack Bowman" <jack@fogcreek.com>')
{ parts:
   { name: [Object],
     address: [Object],
     local: [Object],
     domain: [Object] },
  name: 'Jack Bowman',
  address: 'jack@fogcreek.com',
  local: 'jack',
  domain: 'fogcreek.com' }
> addrs.parseAddressList('jack@fogcreek.com, Bob <bob@example.com>')
[ { parts:
     { name: null,
       address: [Object],
       local: [Object],
       domain: [Object] },
    name: null,
    address: 'jack@fogcreek.com',
    local: 'jack',
    domain: 'fogcreek.com' },
  { parts:
     { name: [Object],
       address: [Object],
       local: [Object],
       domain: [Object] },
    name: 'Bob',
    address: 'bob@example.com',
    local: 'bob',
    domain: 'example.com' } ]
> addrs("jack@fogcreek.com")
{ ast:
   { name: 'address-list',
     tokens: 'jack@fogcreek.com',
     semantic: 'jack@fogcreek.com',
     children: [ [Object] ] },
  addresses:
   [ { node: [Object],
       parts: [Object],
       name: null,
       address: 'jack@fogcreek.com',
       local: 'jack',
       domain: 'fogcreek.com' } ] }
> addrs("bogus")
null
```

API
---

`obj = addrs(opts)`
===================

Call the module directly as a function to get access to the AST. Returns null for a failed parse (an invalid
address).

Options:

* `string` - An email address to parse. Parses as `address-list`, a list of email addresses separated by commas.
* `object` with the following keys:
  * `input` - An email address to parse. Required.
  * `rfc6532` - Enable rfc6532 support (unicode in email addresses). Default: `false`.
  * `partial` - Allow a failed parse to return the AST it managed to produce so far. Default: `false`.
  * `simple` - Return just the address or addresses parsed. Default: `false`.
  * `strict` - Turn off features of RFC 5322 marked "Obsolete". Default: `false`.
  * `rejectTLD` - Require at least one `.` in domain names. Default: `false`.
  * `startAt` - Start the parser at one of `address-list`, `from`, `sender`, `reply-to`. Default: `address-list`.

Returns an object with the following properties:

* `ast` - the full AST of the parse.
* `addresses` - array of addresses found. Each has the following properties:
  * `parts` - components of the AST that make up the address.
  * `type` - The type of the node, e.g. `mailbox`, `address`, `group`.
  * `name` - The extracted name from the email. e.g. parsing `"Bob" <bob@example.com>` will give `Bob` for the `name`.
  * `address` - The full email address. e.g. parsing the above will give `bob@example.com` for the `address`.
  * `local` - The local part. e.g. parsing the above will give `bob` for `local`.
  * `domain` - The domain part. e.g. parsing the above will give `example.com` for `domain`.

Note if `simple` is set, the return will be an array of addresses rather than the object above.

Note that addresses can contain a `group` address, which in contrast to the `address` objects
will simply contain two properties: a `name` and `addresses` which is an array of the addresses in
the group. You can identify groups because they will have a `type` of `group`. A group looks
something like this: `Managing Partners:ben@example.com,carol@example.com;`

`obj = addrs.parseOneAddress(opts)`
===================================

Parse a single email address.

Operates similarly to `addrs(opts)`, with the exception that `rfc6532` and `simple` default to `true`.

Returns a single address object as described above. If you set `simple: false` the returned object
includes a `node` object that contains the AST for the address.

`obj = addrs.parseAddressList(opts)`
====================================

Parse a list of email addresses separated by comma.

Operates similarly to `addrs(opts)`, with the exception that `rfc6532` and `simple` default to `true`.

Returns a list of address objects as described above. If you set `simple: false` each address will
include a `node` object that containst the AST for the address.

`obj = addrs.parseFrom(opts)`
=============================

Parse an email header "From:" address (specified as mailbox-list or address-list).

Operates similarly to `addrs(opts)`, with the exception that `rfc6532` and `simple` default to `true`.

Returns a list of address objects as described above. If you set `simple: false` each address will
include a `node` object that containst the AST for the address.

`obj = addrs.parseSender(opts)`
===============================

Parse an email header "Sender:" address (specified as mailbox or address).

Operates similarly to `addrs(opts)`, with the exception that `rfc6532` and `simple` default to `true`.

Returns a single address object as described above. If you set `simple: false` the returned object
includes a `node` object that contains the AST for the address.

`obj = addrs.parseReplyTo(opts)`
================================

Parse an email header "Reply-To:" address (specified as address-list).

Operates identically to `addrs.parseAddressList(opts)`.

Usage
-----
If you want to simply check whether an address or address list parses, you'll want to call the following functions and check whether the results are null or not: ```parseOneAddress``` for a single address and ```parseAddressList``` for multiple addresses.

If you want to examine the parsed address, for example to extract a name or address, you have some options. The object returned by ```parseOneAddress``` has four helper values on it: ```name```, ```address```, ```local```, and ```domain```. See the example above to understand is actually returned. (These are equivalent to ```parts.name.semantic```, ```parts.address.semantic```, etc.) These values try to be smart about collapsing whitespace, quotations, and excluding RFC 5322 comments. If you desire, you can also obtain the raw parsed tokens or semantic tokens for those fields. The ```parts``` value is an object referencing nodes in the AST generated. Nodes in the AST have two values of interest here, ```tokens``` and ```semantic```.

```
> a = addrs.parseOneAddress('Jack  Bowman  <jack@fogcreek.com >')
> a.parts.name.tokens
'Jack  Bowman  '
> a.name
'Jack Bowman'
> a.parts.name.semantic
'Jack Bowman '
> a.parts.address.tokens
'jack@fogcreek.com '
> a.address
'jack@fogcreek.com'
> a.parts.address.semantic
'jack@fogcreek.com'
```

If you need to, you can inspect the AST directly. The entire AST is returned when calling the module's function.

References
----------
 - http://tools.ietf.org/html/rfc5322
 - https://tools.ietf.org/html/rfc6532
 - https://tools.ietf.org/html/rfc6854
 - http://code.google.com/p/isemail/

Props
-----
Many thanks to [Dominic Sayers](https://github.com/dominicsayers) and his documentation and tests
for the [is_email](https://github.com/dominicsayers/isemail) function which helped greatly in writing this parser.

License
-------
Licensed under the MIT License. See the LICENSE file.
