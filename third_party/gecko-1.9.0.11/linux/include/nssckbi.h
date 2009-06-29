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
 * The Original Code is the Netscape security libraries.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1994-2000
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
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

#ifndef NSSCKBI_H
#define NSSCKBI_H

/*
 * NSS BUILTINS Version numbers.
 *
 * These are the version numbers for the builtins module packaged with
 * this release on NSS. To determine the version numbers of the builtin
 * module you are using, use the appropriate PKCS #11 calls.
 *
 * These version numbers detail changes to the PKCS #11 interface. They map
 * to the PKCS #11 spec versions.
 */
#define NSS_BUILTINS_CRYPTOKI_VERSION_MAJOR 2
#define NSS_BUILTINS_CRYPTOKI_VERSION_MINOR 20

/* These version numbers detail the changes 
 * to the list of trusted certificates.
 *
 * The NSS_BUILTINS_LIBRARY_VERSION_MINOR macro needs to be bumped
 * for each NSS minor release AND whenever we change the list of
 * trusted certificates.  10 minor versions are allocated for each
 * NSS 3.x branch as follows, allowing us to change the list of
 * trusted certificates up to 9 times on each branch.
 *   - NSS 3.5 branch:  3-9
 *   - NSS 3.6 branch:  10-19
 *   - NSS 3.7 branch:  20-29
 *   - NSS 3.8 branch:  30-39
 *   - NSS 3.9 branch:  40-49
 *   - NSS 3.10 branch: 50-59
 *   - NSS 3.11 branch: 60-69
 *     ...
 *   - NSS 3.14 branch: 90-99
 *     ...
 *   - NSS 3.30 branch: 250-255
 *
 * NSS_BUILTINS_LIBRARY_VERSION_MINOR is a CK_BYTE.  It's not clear
 * whether we may use its full range (0-255) or only 0-99 because
 * of the comment in the CK_VERSION type definition.
 */
#define NSS_BUILTINS_LIBRARY_VERSION_MAJOR 1
#define NSS_BUILTINS_LIBRARY_VERSION_MINOR 73
#define NSS_BUILTINS_LIBRARY_VERSION "1.73"

/* These version numbers detail the semantic changes to the ckfw engine. */
#define NSS_BUILTINS_HARDWARE_VERSION_MAJOR 1
#define NSS_BUILTINS_HARDWARE_VERSION_MINOR 0

/* These version numbers detail the semantic changes to ckbi itself 
 * (new PKCS #11 objects), etc. */
#define NSS_BUILTINS_FIRMWARE_VERSION_MAJOR 1
#define NSS_BUILTINS_FIRMWARE_VERSION_MINOR 0

#endif /* NSSCKBI_H */
