
const XRegExp = require('xregexp');

const VERSION_PATTERN = [
    'v?',
    '(?:',
    /* */'(?:(?<epoch>[0-9]+)!)?',                           // epoch
    /* */'(?<release>[0-9]+(?:\\.[0-9]+)*)',                  // release segment
    /* */'(?<pre>',                                          // pre-release
    /*    */'[-_\\.]?',
    /*    */'(?<pre_l>(a|b|c|rc|alpha|beta|pre|preview))',
    /*    */'[-_\\.]?',
    /*    */'(?<pre_n>[0-9]+)?',
    /* */')?',
    /* */'(?<post>',                                         // post release
    /*    */'(?:-(?<post_n1>[0-9]+))',
    /*    */'|',
    /*    */'(?:',
    /*        */'[-_\\.]?',
    /*        */'(?<post_l>post|rev|r)',
    /*        */'[-_\\.]?',
    /*        */'(?<post_n2>[0-9]+)?',
    /*    */')',
    /* */')?',
    /* */'(?<dev>',                                          // dev release
    /*    */'[-_\\.]?',
    /*    */'(?<dev_l>dev)',
    /*    */'[-_\\.]?',
    /*    */'(?<dev_n>[0-9]+)?',
    /* */')?',
    ')',
    '(?:\\+(?<local>[a-z0-9]+(?:[-_\\.][a-z0-9]+)*))?',       // local version
].join('');

module.exports = {
    VERSION_PATTERN,
    valid,
    clean,
    explain,
    parse,
    stringify,
}

const validRegex = new XRegExp('^' + VERSION_PATTERN + '$', 'i');

function valid(version) {
    return validRegex.test(version) ? version : null;
}

const cleanRegex = new XRegExp('^\\s*' + VERSION_PATTERN + '\\s*$', 'i');
function clean(version) {
    return stringify(parse(version, cleanRegex));
}

function parse(version, regex) {

    // Validate the version and parse it into pieces
    const groups = XRegExp.exec(version, regex || validRegex);
    if (!groups) {
        return null;
    }

    // Store the parsed out pieces of the version
    const parsed = {
        epoch: Number(groups.epoch ? groups.epoch : 0),
        release: groups.release.split(".").map(Number),
        pre: normalize_letter_version(
            groups.pre_l,
            groups.pre_n,
        ),
        post: normalize_letter_version(
            groups.post_l,
            groups.post_n1 || groups.post_n2,
        ),
        dev: normalize_letter_version(
            groups.dev_l,
            groups.dev_n,
        ),
        local: parse_local_version(groups.local),
    }

    return parsed;

}

function stringify(parsed) {
    if (!parsed) {
        return null;
    }
    const { epoch, release, pre, post, dev, local } = parsed;
    const parts = []

    // Epoch
    if (epoch !== 0) {
        parts.push(`${epoch}!`)
    }
    // Release segment
    parts.push(release.join('.'))

    // Pre-release
    if (pre) {
        parts.push(pre.join(''))
    }
    // Post-release
    if (post) {
        parts.push('.' + post.join(''))
    }
    // Development release
    if (dev) {
        parts.push('.' + dev.join(''))
    }
    // Local version segment
    if (local) {
        parts.push(`+${local}`)
    }
    return parts.join('')
}

function normalize_letter_version(letter, number) {
    if (letter) {
        // We consider there to be an implicit 0 in a pre-release if there is
        // not a numeral associated with it.
        if (!number) {
            number = 0
        }
        // We normalize any letters to their lower case form
        letter = letter.toLowerCase()

        // We consider some words to be alternate spellings of other words and
        // in those cases we want to normalize the spellings to our preferred
        // spelling.
        if (letter === "alpha") {
            letter = "a"
        } else if (letter === "beta") {
            letter = "b"
        } else if (["c", "pre", "preview"].includes(letter)) {
            letter = "rc"
        } else if (["rev", "r"].includes(letter)) {
            letter = "post"
        }
        return [letter, Number(number)]
    }
    if (!letter && number) {
        // We assume if we are given a number, but we are not given a letter
        // then this is using the implicit post release syntax (e.g. 1.0-1)
        letter = "post"

        return [letter, Number(number)]
    }
    return null;
}

function parse_local_version(local) {
    /*
    Takes a string like abc.1.twelve and turns it into("abc", 1, "twelve").
    */
    if (local) {
        return local.split(/[._-]/).map((part) => Number.isNaN(Number(part)) ? part.toLowerCase() : Number(part));
    }
    return null;
}

function explain(version) {
    const parsed = parse(version);
    if (!parsed) {
        return parsed;
    }
    const { epoch, release, pre, post, dev, local } = parsed;

    let base_version = '';
    if (epoch !== 0) {
        base_version += epoch + "!";
    }
    base_version += release.join(".");

    const is_prerelease = Boolean(dev || pre);
    const is_devrelease = Boolean(dev);
    const is_postrelease = Boolean(post);

    // return

    return {
        epoch,
        release,
        pre,
        post: post ? post[1] : post,
        dev: dev ? dev[1] : dev,
        local: local ? local.join(".") : local,
        public: stringify(parsed).split("+", 1)[0],
        base_version,
        is_prerelease,
        is_devrelease,
        is_postrelease,
    };
}
