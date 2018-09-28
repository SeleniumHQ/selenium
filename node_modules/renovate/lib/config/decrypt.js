const is = require('@sindresorhus/is');
const crypto = require('crypto');
const { maskToken } = require('../datasource/npm');

module.exports = {
  decryptConfig,
};

function decryptConfig(config, privateKey) {
  logger.trace({ config }, 'decryptConfig()');
  const decryptedConfig = { ...config };
  for (const [key, val] of Object.entries(config)) {
    if (key === 'encrypted' && is.object(val)) {
      logger.debug({ config: val }, 'Found encrypted config');
      if (privateKey) {
        for (const [eKey, eVal] of Object.entries(val)) {
          try {
            let decryptedStr;
            try {
              logger.debug('Trying default padding');
              decryptedStr = crypto
                .privateDecrypt(privateKey, Buffer.from(eVal, 'base64'))
                .toString();
            } catch (err) {
              logger.debug('Trying RSA_PKCS1_PADDING');
              decryptedStr = crypto
                .privateDecrypt(
                  {
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_PADDING,
                  },
                  Buffer.from(eVal, 'base64')
                )
                .toString();
              // let it throw if the above fails
            }
            logger.info(`Decrypted ${eKey}`);
            if (eKey === 'npmToken') {
              const token = decryptedStr.replace(/\n$/, '');
              logger.info(
                { token: maskToken(token) },
                'Migrating npmToken to npmrc'
              );
              if (decryptedConfig.npmrc) {
                /* eslint-disable no-template-curly-in-string */
                if (decryptedConfig.npmrc.includes('${NPM_TOKEN}')) {
                  logger.debug('Replacing ${NPM_TOKEN} with decrypted token');
                  decryptedConfig.npmrc = decryptedConfig.npmrc.replace(
                    '${NPM_TOKEN}',
                    token
                  );
                } else {
                  logger.debug(
                    'Appending _authToken= to end of existing npmrc'
                  );
                  decryptedConfig.npmrc = decryptedConfig.npmrc.replace(
                    /\n?$/,
                    `\n_authToken=${token}\n`
                  );
                }
                /* eslint-enable no-template-curly-in-string */
              } else {
                logger.debug('Adding npmrc to config');
                decryptedConfig.npmrc = `//registry.npmjs.org/:_authToken=${token}\n`;
              }
            } else {
              decryptedConfig[eKey] = decryptedStr;
            }
          } catch (err) {
            logger.warn({ err }, `Error decrypting ${eKey}`);
          }
        }
      } else {
        logger.error('Found encrypted data but no privateKey');
      }
      delete decryptedConfig.encrypted;
    } else if (is.array(val)) {
      decryptedConfig[key] = [];
      val.forEach(item => {
        if (is.object(item) && !is.array(item)) {
          decryptedConfig[key].push(decryptConfig(item, privateKey));
        } else {
          decryptedConfig[key].push(item);
        }
      });
    } else if (is.object(val) && key !== 'content') {
      decryptedConfig[key] = decryptConfig(val, privateKey);
    }
  }
  delete decryptedConfig.encrypted;
  logger.trace({ config: decryptedConfig }, 'decryptedConfig');
  return decryptedConfig;
}
