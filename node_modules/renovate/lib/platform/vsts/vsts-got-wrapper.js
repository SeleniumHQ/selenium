const vsts = require('vso-node-api');
const hostRules = require('../../util/host-rules');

module.exports = {
  vstsObj,
  gitApi,
  getCoreApi,
};

function vstsObj() {
  const config = hostRules.find({ platform: 'vsts' }, {});
  if (!config.token) {
    throw new Error(`No token found for vsts`);
  }
  const authHandler = vsts.getPersonalAccessTokenHandler(config.token);
  return new vsts.WebApi(config.endpoint, authHandler);
}

function gitApi() {
  return vstsObj().getGitApi();
}

function getCoreApi() {
  return vstsObj().getCoreApi();
}
