
const {
    parse,
} = require('./version');

module.exports = {
    compare,
    rcompare,
    lt,
    le,
    eq,
    ne,
    ge,
    gt,
    '<': lt,
    '<=': le,
    '==': eq,
    '!=': ne,
    '>=': ge,
    '>': gt,
    '===': arbitrary,
}

function lt(version, other) {
    return compare(version, other) < 0;
}

function le(version, other) {
    return compare(version, other) <= 0;
}

function eq(version, other) {
    return compare(version, other) === 0;
}

function ne(version, other) {
    return compare(version, other) !== 0;
}

function ge(version, other) {
    return compare(version, other) >= 0;
}

function gt(version, other) {
    return compare(version, other) > 0;
}

function arbitrary(version, other) {
    return version.toLowerCase() === other.toLowerCase();
}

function compare(version, other) {

    const parsedVersion = parse(version);
    const parsedOther = parse(other);

    const keyVersion = calculateKey(parsedVersion);
    const keyOther = calculateKey(parsedOther);

    return pyCompare(keyVersion, keyOther);

}

function rcompare(version, other) {
    return -compare(version, other);
}

// this logic is buitin in python, but we need to port it to js
// see https://stackoverflow.com/a/5292332/1438522
function pyCompare(elem, other) {
    if (elem === other) {
        return 0;
    }
    if (Array.isArray(elem) !== Array.isArray(other)) {
        elem = Array.isArray(elem) ? elem : [elem];
        other = Array.isArray(other) ? other : [other];
    }
    if (Array.isArray(elem)) {
        const len = Math.min(elem.length, other.length);
        for (let i = 0; i < len; i+=1) {
            const res = pyCompare(elem[i], other[i]);
            if (res !== 0) {
                return res;
            }
        }
        return elem.length - other.length;
    }
    if (elem === -Infinity || other === Infinity) {
        return -1;
    }
    if (elem === Infinity || other === -Infinity) {
        return 1;
    }
    return elem < other ? -1 : 1;
}

function calculateKey({ epoch, release, pre, post, dev, local }) {

    // When we compare a release version, we want to compare it with all of the
    // trailing zeros removed. So we'll use a reverse the list, drop all the now
    // leading zeros until we come to something non zero, then take the rest
    // re-reverse it back into the correct order and make it a tuple and use
    // that for our sorting key.
    release = release.concat();
    release.reverse();
    while (release.length && release[0] === 0) {
        release.shift();
    }
    release.reverse();

    // We need to "trick" the sorting algorithm to put 1.0.dev0 before 1.0a0.
    // We'll do this by abusing the pre segment, but we _only_ want to do this
    // if there is !a pre or a post segment. If we have one of those then
    // the normal sorting rules will handle this case correctly.
    if (!pre && !post && dev)
        pre = -Infinity
    // Versions without a pre-release (except as noted above) should sort after
    // those with one.
    else if (!pre)
        pre = Infinity

    // Versions without a post segment should sort before those with one.
    if (!post)
        post = -Infinity

    // Versions without a development segment should sort after those with one.
    if (!dev)
        dev = Infinity

    if (!local) {
        // Versions without a local segment should sort before those with one.
        local = -Infinity
    } else {
        // Versions with a local segment need that segment parsed to implement
        // the sorting rules in PEP440.
        // - Alpha numeric segments sort before numeric segments
        // - Alpha numeric segments sort lexicographically
        // - Numeric segments sort numerically
        // - Shorter versions sort before longer versions when the prefixes
        //   match exactly
        local = local.map(i => Number.isNaN(Number(i)) ? [-Infinity, i] : [Number(i), ""]);
    }

    return [epoch, release, pre, post, dev, local];
}
