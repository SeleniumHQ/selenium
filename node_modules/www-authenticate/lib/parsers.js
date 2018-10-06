var ParseAuth= /(\w+)\s+(.*)/  // -> scheme, params
  , Separators= /([",=])/
  ;

parse_params= function (header) {
  // This parser will definitely fail if there is more than one challenge
  var tok, last_tok, _i, _len, key, value;
  var state= 0;   //0: token,
  m= header.split(Separators)
  for (_i = 0, _len = m.length; _i < _len; _i++) {
    last_tok= tok;
    tok = m[_i];
    if (!tok.length) continue;
    switch (state) {
      case 0: // token
        key= tok.trim();
        state= 1; // expect equals
        continue;
      case 1: // expect equals
        if ('=' != tok) return 'Equal sign was expected after '+key;
        state= 2;
        continue;
      case 2: // expect value
        if ('"' == tok) {
          value= '';
          state= 3; // expect quoted
          continue;
        }
        else {
          this.parms[key]= value= tok.trim();
          state= 9; // expect comma or end
          continue;
        }
      case 3: // handling quoted string
        if ('"' == tok) {
          state= 8; // end quoted
          continue;
        }
        else {
          value+= tok;
          state= 3; // continue accumulating quoted string
          continue;
        }
      case 8: // end quote encountered
        if ('"' == tok) {
          // double quoted
          value+= '"';
          state= 3; // back to quoted string
          continue;
        }
        if (',' == tok) {
          this.parms[key]= value;
          state= 0;
          continue;
        }
        else {
          return 'Unexpected token ('+tok+') after '+value+'"';
        }
        continue;
      case 9: // expect commma
        if (',' != tok) return 'Comma expected after '+value;
        state= 0;
        continue;
    }
  }
  switch (state) {  // terminal state
    case 0:   // Empty or ignoring terminal comma
    case 9:   // Expecting comma or end of header
      return;
    case 8:   // Last token was end quote
      this.parms[key]= value;
      return;
    default:
      return 'Unexpected end of www-authenticate value.';
  }
}

function Parse_WWW_Authenticate(to_parse)
{
  var m= to_parse.match(ParseAuth);
  this.scheme= m[1];
  this.parms= {};
  var err= this.parse_params(m[2]);
  if (err) {
    this.scheme= '';
    this.parms= {};
    this.err= err;
  }
}

Parse_Authentication_Info.prototype.parse_params= parse_params;

function Parse_Authentication_Info(to_parse)
{
  this.scheme= 'Digest';
  this.parms= {};
  var err= this.parse_params(to_parse);
  if (err) {
    this.scheme= '';
    this.parms= {};
    this.err= err;
  }
}

Parse_WWW_Authenticate.prototype.parse_params= parse_params;

module.exports = {
  WWW_Authenticate: Parse_WWW_Authenticate,
  Authentication_Info: Parse_Authentication_Info
};
