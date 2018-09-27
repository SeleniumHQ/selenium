const { explain, parse, stringify } = require('./version');

// those notation are borrowed from semver
module.exports = {
    major,
    minor,
    patch,
    inc,
};

function major(input) {
    const version = explain(input);
    if (!version) {
        throw new TypeError('Invalid Version: ' + input);
    }
    return version.release[0];
};

function minor(input) {
    const version = explain(input);
    if (!version) {
        throw new TypeError('Invalid Version: ' + input);
    }
    if (version.release.length < 2) {
        return 0;
    }
    return version.release[1];
};

function patch(input) {
    const version = explain(input);
    if (!version) {
        throw new TypeError('Invalid Version: ' + input);
    }
    if (version.release.length < 3) {
        return 0;
    }
    return version.release[2];
};

function inc(input, release) {
    const version = parse(input);

    if (!version) {
        return null;
    }

    switch(release) {
        case 'major':
            if (version.release.slice(1).some(value => value !== 0) || (version.pre === null)) {
                const [majorVersion] = version.release;
                version.release.fill(0);
                version.release[0] = majorVersion + 1;
            }
            delete version.pre;
            delete version.post;
            delete version.dev;
            delete version.local;
            break;
        case 'minor':
            if (version.release.slice(2).some(value => value !== 0) || (version.pre === null)) {
                const [majorVersion, minorVersion=0] = version.release;
                version.release.fill(0);
                version.release[0] = majorVersion;
                version.release[1] = minorVersion + 1;
            }
            delete version.pre;
            delete version.post;
            delete version.dev;
            delete version.local;
            break;
        case 'patch':
            if (version.release.slice(3).some(value => value !== 0) || (version.pre === null)) {
                const [majorVersion, minorVersion=0, patchVersion=0] = version.release;
                version.release.fill(0);
                version.release[0] = majorVersion;
                version.release[1] = minorVersion;
                version.release[2] = patchVersion + 1;
            }
            delete version.pre;
            delete version.post;
            delete version.dev;
            delete version.local;
            break;
        default:
            return null;
    }

    return stringify(version);
}
