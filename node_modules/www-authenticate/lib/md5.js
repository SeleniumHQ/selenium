var crypto= require('crypto')
  , md5sum = crypto.createHash('md5')
  ;

function md5(s) {
  return crypto.createHash('md5').update(s).digest('hex');
}

module.exports= md5;