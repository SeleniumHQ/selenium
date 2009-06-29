/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla XPCOM Glue.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation <http://www.mozilla.org/>.
 *
 * Portions created by the Initial Developer are Copyright (C) 2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Benjamin Smedberg <benjamin@smedbergs.us>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

#ifndef nsCRTGlue_h__
#define nsCRTGlue_h__

#include "nscore.h"

/**
 * Scan a string for the first character that is *not* in a set of
 * delimiters.  If the string is only delimiter characters, the end of the
 * string is returned.
 *
 * @param delims The set of delimiters (null-terminated)
 * @param str    The string to search (null-terminated)
 */
NS_COM_GLUE const char*
NS_strspnp(const char *delims, const char *str);

/**
 * Tokenize a string. This function is similar to the strtok function in the
 * C standard library, but it does not use static variables to maintain state
 * and is therefore thread and reentrancy-safe.
 *
 * Any leading delimiters in str are skipped. Then the string is scanned
 * until an additional delimiter or end-of-string is found. The final
 * delimiter is set to '\0'.
 *
 * @param delims The set of delimiters.
 * @param str    The string to search. This is an in-out parameter; it is
 *               reset to the end of the found token + 1, or to the
 *               end-of-string if there are no more tokens.
 * @return       The token. If no token is found (the string is only
 *               delimiter characters), NULL is returned.
 */
NS_COM_GLUE char*
NS_strtok(const char *delims, char **str);

/**
 * "strlen" for PRUnichar strings
 */
NS_COM_GLUE PRUint32
NS_strlen(const PRUnichar *aString);

/**
 * "strcmp" for PRUnichar strings
 */
NS_COM_GLUE int
NS_strcmp(const PRUnichar *a, const PRUnichar *b);

/**
 * "strdup" for PRUnichar strings, uses the NS_Alloc allocator.
 */
NS_COM_GLUE PRUnichar*
NS_strdup(const PRUnichar *aString);

/**
 * "strdup", but using the NS_Alloc allocator.
 */
NS_COM_GLUE char*
NS_strdup(const char *aString);

/**
 * strndup for PRUnichar strings... this function will ensure that the
 * new string is null-terminated. Uses the NS_Alloc allocator.
 */
NS_COM_GLUE PRUnichar*
NS_strndup(const PRUnichar *aString, PRUint32 aLen);

// The following case-conversion methods only deal in the ascii repertoire
// A-Z and a-z

// semi-private data declarations... don't use these directly.
class NS_COM_GLUE nsLowerUpperUtils {
public:
  static const unsigned char kLower2Upper[256];
  static const unsigned char kUpper2Lower[256];
};

inline char NS_ToUpper(char aChar)
{
  return (char)nsLowerUpperUtils::kLower2Upper[(unsigned char)aChar];
}

inline char NS_ToLower(char aChar)
{
  return (char)nsLowerUpperUtils::kUpper2Lower[(unsigned char)aChar];
}
  
NS_COM_GLUE PRBool NS_IsUpper(char aChar);
NS_COM_GLUE PRBool NS_IsLower(char aChar);

NS_COM_GLUE PRBool NS_IsAscii(PRUnichar aChar);
NS_COM_GLUE PRBool NS_IsAscii(const PRUnichar* aString);
NS_COM_GLUE PRBool NS_IsAsciiAlpha(PRUnichar aChar);
NS_COM_GLUE PRBool NS_IsAsciiDigit(PRUnichar aChar);
NS_COM_GLUE PRBool NS_IsAsciiWhitespace(PRUnichar aChar);
NS_COM_GLUE PRBool NS_IsAscii(const char* aString);
NS_COM_GLUE PRBool NS_IsAscii(const char* aString, PRUint32 aLength);

#endif // nsCRTGlue_h__
