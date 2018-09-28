const _ = require('lodash');
const semver = require('semver');

module.exports = {
  updateDependency,
  bumpPackageVersion,
};

function updateDependency(fileContent, upgrade) {
  const { depType, depName } = upgrade;
  let { newValue } = upgrade;
  if (upgrade.currentRawValue) {
    if (upgrade.currentDigest) {
      logger.info('Updating package.json git digest');
      newValue = upgrade.currentRawValue.replace(
        upgrade.currentDigest,
        upgrade.newDigest.substring(0, upgrade.currentDigest.length)
      );
    } else {
      logger.info('Updating package.json git version tag');
      newValue = upgrade.currentRawValue.replace(
        upgrade.currentValue,
        upgrade.newValue
      );
    }
  }
  logger.debug(`npm.updateDependency(): ${depType}.${depName} = ${newValue}`);
  try {
    const parsedContents = JSON.parse(fileContent);
    // Save the old version
    const oldVersion = parsedContents[depType][depName];
    if (oldVersion === newValue) {
      logger.debug('Version is already updated');
      return bumpPackageVersion(
        fileContent,
        upgrade.packageJsonVersion,
        upgrade.bumpVersion
      );
    }
    // Update the file = this is what we want
    parsedContents[depType][depName] = newValue;
    // Look for the old version number
    const searchString = `"${oldVersion}"`;
    const newString = `"${newValue}"`;
    let newFileContent = null;
    // Skip ahead to depType section
    let searchIndex = fileContent.indexOf(`"${depType}"`) + depType.length;
    logger.trace(`Starting search at index ${searchIndex}`);
    // Iterate through the rest of the file
    for (; searchIndex < fileContent.length; searchIndex += 1) {
      // First check if we have a hit for the old version
      if (matchAt(fileContent, searchIndex, searchString)) {
        logger.trace(`Found match at index ${searchIndex}`);
        // Now test if the result matches
        const testContent = replaceAt(
          fileContent,
          searchIndex,
          searchString,
          newString
        );
        // Compare the parsed JSON structure of old and new
        if (_.isEqual(parsedContents, JSON.parse(testContent))) {
          newFileContent = testContent;
          break;
        }
      }
    }
    // istanbul ignore if
    if (!newFileContent) {
      logger.info(
        { fileContent, parsedContents, depType, depName, newValue },
        'Warning: updateDependency error'
      );
      return fileContent;
    }
    if (
      parsedContents &&
      parsedContents.resolutions &&
      parsedContents.resolutions[depName]
    ) {
      // istanbul ignore if
      if (parsedContents.resolutions[depName] !== oldVersion) {
        logger.info(
          {
            depName,
            oldVersion,
            resolutionsVersion: parsedContents.resolutions[depName],
          },
          'Upgraded dependency exists in yarn resolutions but is different version'
        );
      }
      // Look for the old version number
      const oldResolution = `"${parsedContents.resolutions[depName]}"`;
      const newResolution = `"${newValue}"`;
      // Update the file = this is what we want
      parsedContents.resolutions[depName] = newValue;
      // Skip ahead to depType section
      searchIndex = newFileContent.indexOf(`"resolutions"`);
      logger.trace(`Starting search at index ${searchIndex}`);
      // Iterate through the rest of the file
      for (; searchIndex < newFileContent.length; searchIndex += 1) {
        // First check if we have a hit for the old version
        if (matchAt(newFileContent, searchIndex, oldResolution)) {
          logger.trace(`Found match at index ${searchIndex}`);
          // Now test if the result matches
          const testContent = replaceAt(
            newFileContent,
            searchIndex,
            oldResolution,
            newResolution
          );
          // Compare the parsed JSON structure of old and new
          if (_.isEqual(parsedContents, JSON.parse(testContent))) {
            newFileContent = testContent;
            break;
          }
        }
      }
    }
    return bumpPackageVersion(
      newFileContent,
      upgrade.packageJsonVersion,
      upgrade.bumpVersion
    );
  } catch (err) {
    logger.info({ err }, 'updateDependency error');
    return null;
  }
}

// Return true if the match string is found at index in content
function matchAt(content, index, match) {
  return content.substring(index, index + match.length) === match;
}

// Replace oldString with newString at location index of content
function replaceAt(content, index, oldString, newString) {
  logger.debug(`Replacing ${oldString} with ${newString} at index ${index}`);
  return (
    content.substr(0, index) +
    newString +
    content.substr(index + oldString.length)
  );
}

function bumpPackageVersion(content, currentValue, bumpVersion) {
  logger.debug('bumpVersion()');
  if (!bumpVersion) {
    return content;
  }
  logger.debug(
    { bumpVersion, currentValue },
    'Checking if we should bump package.json version'
  );
  let newPjVersion;
  try {
    if (bumpVersion.startsWith('mirror:')) {
      const mirrorPackage = bumpVersion.replace('mirror:', '');
      const parsedContent = JSON.parse(content);
      newPjVersion =
        (parsedContent.dependencies || {})[mirrorPackage] ||
        (parsedContent.devDependencies || {})[mirrorPackage] ||
        (parsedContent.optionalDependencies || {})[mirrorPackage] ||
        (parsedContent.peerDependencies || {})[mirrorPackage];
      if (!newPjVersion) {
        logger.warn('bumpVersion mirror package not found: ', mirrorPackage);
        return content;
      }
    } else {
      newPjVersion = semver.inc(currentValue, bumpVersion);
    }
    logger.debug({ newPjVersion });
    const bumpedContent = content.replace(
      /("version":\s*")[^"]*/,
      `$1${newPjVersion}`
    );
    if (bumpedContent === content) {
      logger.debug('Version was already bumped');
    } else {
      logger.info('Bumped package.json version');
    }
    return bumpedContent;
  } catch (err) {
    logger.warn(
      {
        content,
        currentValue,
        bumpVersion,
      },
      'Failed to bumpVersion'
    );
    return content;
  }
}
