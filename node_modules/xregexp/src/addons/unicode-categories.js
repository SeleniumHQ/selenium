/*!
 * XRegExp Unicode Categories 4.2.0
 * <xregexp.com>
 * Steven Levithan (c) 2010-present MIT License
 * Unicode data by Mathias Bynens <mathiasbynens.be>
 */

import categories from '../../tools/output/categories';

export default (XRegExp) => {

    /**
     * Adds support for Unicode's general categories. E.g., `\p{Lu}` or `\p{Uppercase Letter}`. See
     * category descriptions in UAX #44 <http://unicode.org/reports/tr44/#GC_Values_Table>. Token
     * names are case insensitive, and any spaces, hyphens, and underscores are ignored.
     *
     * Uses Unicode 11.0.0.
     *
     * @requires XRegExp, Unicode Base
     */

    if (!XRegExp.addUnicodeData) {
        throw new ReferenceError('Unicode Base must be loaded before Unicode Categories');
    }

    XRegExp.addUnicodeData(categories);
};
