
/*
 * www-authenticate
 * https://github.com/randymized/www-authenticate
 *
 * Copyright (c) 2013 Randy McLaughlin
 * Licensed under the MIT license.
 */

'use strict';

var crypto= require('crypto')
  , md5sum = crypto.createHash('md5')
  , parsers= require('./parsers')
  , md5= require('./md5')
  , user_credentials= require('./user-credentials')
  , basic_challenge= {
      statusCode: 401,
      headers: {
        'www-authenticate': 'Basic realm="sample"'
      }
    }
  ;

function hex8(num)
{
  return ("00000000" + num.toString(16)).slice(-8);
}

var www_authenticator = function(username,password,options)
{
  if (2 == arguments.length && toString.call(password) != '[object String]') {
    options= password;
    password= null;
  }
  var credentials= user_credentials(username,password)
  var cnonce;
  if (options) {
    if (toString.call(options.cnonce) == '[object String]')
      cnonce= options.cnonce;
  }
  if (cnonce === void 0) cnonce= crypto.pseudoRandomBytes(8).toString('hex');
  var parse_header= function(www_authenticate)
  {
    function Authenticator()
    {
      function note_error(err)
      {
        this.err= err
      }
      var nc= 0;

      var parsed= new parsers.WWW_Authenticate(www_authenticate);
      if (parsed.err) return note_error(parsed.err);
      var auth_parms= this.parms= parsed.parms;
      this.cnonce= cnonce;

      switch(parsed.scheme) {
        case 'Basic':
          var auth_string= 'Basic '+credentials.basic();
          this.authorize= function() {
            return auth_string;
          };
          return;
        case 'Digest':
          var realm= auth_parms.realm;
          if (!realm) {
            return note_error("Realm not found in www-authenticate header.");
          }

          var ha1=
            credentials.digest(realm);
          var nonce= auth_parms.nonce;
          if (!nonce) {
            return note_error("Nonce not found in www-authenticate header.");
          }

          var fixed= 'Digest username="'+credentials.username+'",'+
              ' realm="'+realm+'",'+
              ' nonce="'+nonce+'",';
          var qop= auth_parms.qop;
          if (!qop) {
              this.authorize= function(method,digestURI) {
                var ha2= md5(method+':'+digestURI);
                return fixed+
                  ' uri="'+digestURI+'",'+
                  ' response="'+md5(ha1+':'+nonce+':'+ha2)+'",';
              };
              return;
          }
          else {
            var qopa= qop.split(',');
            var q, x, _i, _len;
            for (_i = 0, _len = qopa.length; _i < _len; _i++) {
              if ('auth' === qopa[_i]) {
                var opaque= auth_parms.opaque;
                var algorithm= auth_parms.algorithm;
                if (algorithm) {
                  fixed+= ' algorithm="'+algorithm+'",';
                }
                else {
                  algorithm= 'MD5';
                }
                var a1= 'MD5-sess' == algorithm ?
                  md5(ha1+':'+nonce+':'+cnonce)
                  :
                  ha1;
                this.authorize= function(method,digestURI) {
                  var ha2= md5(method+':'+digestURI);
                  nc= nc+1;
                  var hexed_nc= hex8(nc);
                  var s= fixed+
                    ' uri="'+digestURI+'",'+
                    ' qop=auth,'+
                    ' nc='+hexed_nc+','+
                    ' cnonce="'+cnonce+'",'+
                    ' response="'+md5(a1+':'+nonce+':'+hexed_nc+':'+cnonce+':auth:'+ha2)+'"';
                  if (opaque) {
                    s+= ', opaque="'+opaque+'"';
                  }
                  return s;
                };
                return;
              }
              return note_error('Server does not accept any supported quality of protection techniques.');
            }
          }
          break;
        default:
          return note_error("Unknown scheme");
      }
    }

    return new Authenticator();
  };

  parse_header.authenticator= new HigherLevel(credentials,options); // deprecated
  return parse_header;
};


function HigherLevel(credentials,options)
{
  this.credentials= credentials
  this.options= options
  if (options && options.sendImmediately) {
    this.sendImmediately= true;
  }
}
HigherLevel.prototype.get_challenge= function(request) {
  if (401 == request.statusCode && 'www-authenticate' in request.headers) {
    if (!this.parse_header) {
      this.parse_header= www_authenticator(this.credentials,this.options)
    }
    this.challenge= this.parse_header(request.headers['www-authenticate'])
    return this.challenge.err;
  }
}
HigherLevel.prototype._challenge= function() {
  if (!this.challenge) {
    if (this.sendImmediately) {
      // simulate receipt of a basic challenge
      this.get_challenge(basic_challenge)
      return this.challenge
    }
    else return;   // simply won't produce an 'Authorization' header
  }
  return this.challenge;
}
HigherLevel.prototype.authentication_string= function(method,digestURI) {
  var challenge= this._challenge();
  if (!challenge) return;   // simply won't produce an 'Authorization' header
  if (challenge.err) return challenge.err;
  return challenge.authorize(method,digestURI);
}
HigherLevel.prototype.authenticate_headers= function(headers,method,digestURI) {
  var challenge= this._challenge();
  if (!challenge) return;   // simply won't produce an 'Authorization' header
  if (challenge.err) return challenge.err;
  headers.authorization= challenge.authorize(method,digestURI);
}
HigherLevel.prototype.authenticate_request_options= function(request_options) {
  var challenge= this._challenge();
  if (!challenge) return;   // simply won't produce an 'Authorization' header
  if (challenge.err) return challenge.err;
  if (!request_options.headers) request_options.headers= {};
  request_options.headers.authorization= challenge.authorize(request_options.method,request_options.path);
}

module.exports = www_authenticator;
module.exports.parsers= parsers;
module.exports.user_credentials= user_credentials;
module.exports.basic_challenge= basic_challenge;
module.exports.authenticator= function(username,password,options)
{
  if (2 == arguments.length && toString.call(password) != '[object String]') {
    options= password;
    password= null;
  }
  var credentials= user_credentials(username,password)
  return new HigherLevel(credentials,options);
}