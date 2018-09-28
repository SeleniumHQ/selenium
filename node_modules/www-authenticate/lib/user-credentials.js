var md5= require('./md5');

/*
 * Hide the password. Uses the password to form authorization strings,
 * but provides no interface for exporting it.
 */
function user_credentials(username,password,options) {
  if (username.is_user_credentials &&
    typeof username.basic === 'function' &&
    typeof username.digest === 'function'
  ) {
    return username;
  }

  var basic_string= options && options.hide_basic ?
    ''
    :
      (!password && password !== '' ?
        new Buffer(username, "ascii").toString("base64")
      :
        new Buffer(username+':'+password, "ascii").toString("base64")
      )
  function Credentials()
  {
    this.username= username;
  }
  Credentials.prototype.basic= function()
  {
    return basic_string;
  }
  Credentials.prototype.digest= function(realm)
  {
    return !password && password !== '' ?
        md5(username+':'+realm)
        :
        md5(username+':'+realm+':'+password)
  }
  Credentials.prototype.is_user_credentials= function()
  {
    return true;
  }

  return new Credentials;
}

module.exports= user_credentials;
