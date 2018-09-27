var globals = ["document", "window", "later"],
    globalValues = {};

globals.forEach(function(g) {
  if (g in global) globalValues[g] = global[g];
});

require(process.env['LATER_COV'] ? "./later-cov" : "./later");

module.exports = later;

globals.forEach(function(g) {
  if (g in globalValues) global[g] = globalValues[g];
  else delete global[g];
});