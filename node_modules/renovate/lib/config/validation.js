const is = require('@sindresorhus/is');
const safe = require('safe-regex');
const options = require('./definitions').getOptions();
const { resolveConfigPresets } = require('./presets');
const {
  hasValidSchedule,
  hasValidTimezone,
} = require('../workers/branch/schedule');

let optionTypes;

module.exports = {
  validateConfig,
};

async function validateConfig(config, isPreset, parentPath) {
  if (!optionTypes) {
    optionTypes = {};
    options.forEach(option => {
      optionTypes[option.name] = option.type;
    });
  }
  let errors = [];
  let warnings = [];

  function getDeprecationMessage(option) {
    const deprecatedOptions = {
      branchName: `Direct editing of branchName is now deprecated. Please edit branchPrefix, managerBranchPrefix, or branchTopic instead`,
      commitMessage: `Direct editing of commitMessage is now deprecated. Please edit commitMessage's subcomponents instead.`,
      prTitle: `Direct editing of prTitle is now deprecated. Please edit commitMessage subcomponents instead as they will be passed through to prTitle.`,
    };
    return deprecatedOptions[option];
  }

  function isIgnored(key) {
    const ignoredNodes = [
      '$schema',
      'prBanner',
      'depType',
      'npmToken',
      'packageFile',
      'forkToken',
      'repository',
      'vulnerabilityAlertsOnly',
      'copyLocalLibs', // deprecated - functinoality is now enabled by default
      'prBody', // deprecated
    ];
    return ignoredNodes.includes(key);
  }

  for (const [key, val] of Object.entries(config)) {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    if (
      !isIgnored(key) && // We need to ignore some reserved keys
      !is.function(val) // Ignore all functions
    ) {
      if (getDeprecationMessage(key)) {
        warnings.push({
          depName: 'Deprecation Warning',
          message: getDeprecationMessage(key),
        });
      }
      if (!optionTypes[key]) {
        errors.push({
          depName: 'Configuration Error',
          message: `Invalid configuration option: \`${currentPath}\``,
        });
      } else if (key === 'schedule') {
        const [validSchedule, errorMessage] = hasValidSchedule(val);
        if (!validSchedule) {
          errors.push({
            depName: 'Configuration Error',
            message: `Invalid ${currentPath}: \`${errorMessage}\``,
          });
        }
      } else if (key === 'timezone' && val !== null) {
        const [validTimezone, errorMessage] = hasValidTimezone(val);
        if (!validTimezone) {
          errors.push({
            depName: 'Configuration Error',
            message: `${currentPath}: ${errorMessage}`,
          });
        }
      } else if (val != null) {
        const type = optionTypes[key];
        if (type === 'boolean') {
          if (val !== true && val !== false) {
            errors.push({
              depName: 'Configuration Error',
              message: `Configuration option \`${currentPath}\` should be boolean. Found: ${JSON.stringify(
                val
              )} (${typeof val})`,
            });
          }
        } else if (type === 'list' && val) {
          if (!is.array(val)) {
            errors.push({
              depName: 'Configuration Error',
              message: `Configuration option \`${currentPath}\` should be a list (Array)`,
            });
          } else {
            for (const [subIndex, subval] of val.entries()) {
              if (is.object(subval)) {
                const subValidation = await module.exports.validateConfig(
                  subval,
                  isPreset,
                  `${currentPath}[${subIndex}]`
                );
                warnings = warnings.concat(subValidation.warnings);
                errors = errors.concat(subValidation.errors);
              }
            }
            if (key === 'extends') {
              for (const subval of val) {
                if (is.string(subval) && subval.match(/^:timezone(.+)$/)) {
                  const [, timezone] = subval.match(/^:timezone\((.+)\)$/);
                  const [validTimezone, errorMessage] = hasValidTimezone(
                    timezone
                  );
                  if (!validTimezone) {
                    errors.push({
                      depName: 'Configuration Error',
                      message: `${currentPath}: ${errorMessage}`,
                    });
                  }
                }
              }
            }

            const selectors = [
              'paths',
              'depTypeList',
              'packageNames',
              'packagePatterns',
              'excludePackageNames',
              'excludePackagePatterns',
              'updateTypes',
            ];
            if (key === 'packageRules') {
              for (const packageRule of val) {
                let hasSelector = false;
                if (is.object(packageRule)) {
                  const resolvedRule = await resolveConfigPresets(packageRule);
                  for (const pKey of Object.keys(resolvedRule)) {
                    if (selectors.includes(pKey)) {
                      hasSelector = true;
                    }
                  }
                  if (!hasSelector) {
                    const message = `${currentPath}: Each packageRule must contain at least one selector (${selectors.join(
                      ', '
                    )}). If you wish for configuration to apply to all packages, it is not necessary to place it inside a packageRule at all.`;
                    errors.push({
                      depName: 'Configuration Error',
                      message,
                    });
                  }
                } else {
                  errors.push({
                    depName: 'Configuration Error',
                    message: `${currentPath} must contain JSON objects`,
                  });
                }
              }
            }
            if (
              (key === 'packagePatterns' || key === 'excludePackagePatterns') &&
              !(val && val.length === 1 && val[0] === '*')
            ) {
              try {
                RegExp(val);
                if (!safe(val)) {
                  errors.push({
                    depName: 'Configuration Error',
                    message: `Unsafe regExp for ${currentPath}: \`${val}\``,
                  });
                }
              } catch (e) {
                errors.push({
                  depName: 'Configuration Error',
                  message: `Invalid regExp for ${currentPath}: \`${val}\``,
                });
              }
            }
            if (key === 'fileMatch') {
              try {
                for (const fileMatch of val) {
                  RegExp(fileMatch);
                  if (!safe(fileMatch)) {
                    errors.push({
                      depName: 'Configuration Error',
                      message: `Unsafe regExp for ${currentPath}: \`${fileMatch}\``,
                    });
                  }
                }
              } catch (e) {
                errors.push({
                  depName: 'Configuration Error',
                  message: `Invalid regExp for ${currentPath}: \`${val}\``,
                });
              }
            }
            if (
              (selectors.includes(key) || key === 'matchCurrentVersion') &&
              !(parentPath && parentPath.match(/p.*Rules\[\d+\]$/)) && // Inside a packageRule
              (parentPath || !isPreset) // top level in a preset
            ) {
              errors.push({
                depName: 'Configuration Error',
                message: `${currentPath}: ${key} should be inside a \`packageRule\` only`,
              });
            }
          }
        } else if (type === 'string') {
          if (!is.string(val)) {
            errors.push({
              depName: 'Configuration Error',
              message: `Configuration option \`${currentPath}\` should be a string`,
            });
          }
        } else if (type === 'json') {
          if (is.object(val)) {
            const subValidation = await module.exports.validateConfig(
              val,
              isPreset,
              currentPath
            );
            warnings = warnings.concat(subValidation.warnings);
            errors = errors.concat(subValidation.errors);
          } else {
            errors.push({
              depName: 'Configuration Error',
              message: `Configuration option \`${currentPath}\` should be a json object`,
            });
          }
        }
      }
    }
  }
  function sortAll(a, b) {
    if (a.depName === b.depName) {
      return a.message > b.message;
    }
    // istanbul ignore next
    return a.depName > b.depName;
  }
  errors.sort(sortAll);
  warnings.sort(sortAll);
  return { errors, warnings };
}
