/*
 * NSS utility functions
 *
 * ***** BEGIN LICENSE BLOCK *****
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
/* $Id: nss.h,v 1.61 2008/10/21 03:58:14 kaie%kuix.de Exp $ */

#ifndef __nss_h_
#define __nss_h_

#include "seccomon.h"

SEC_BEGIN_PROTOS

/* The private macro _NSS_ECC_STRING is for NSS internal use only. */
#ifdef NSS_ENABLE_ECC
#ifdef NSS_ECC_MORE_THAN_SUITE_B
#define _NSS_ECC_STRING " Extended ECC"
#else
#define _NSS_ECC_STRING " Basic ECC"
#endif
#else
#define _NSS_ECC_STRING ""
#endif

/* The private macro _NSS_CUSTOMIZED is for NSS internal use only. */
#if defined(NSS_ALLOW_UNSUPPORTED_CRITICAL)
#define _NSS_CUSTOMIZED " (Customized build)"
#else
#define _NSS_CUSTOMIZED 
#endif

/*
 * NSS's major version, minor version, patch level, and whether
 * this is a beta release.
 *
 * The format of the version string should be
 *     "<major version>.<minor version>[.<patch level>][ <ECC>][ <Beta>]"
 */
#define NSS_VERSION  "3.12.2.0" _NSS_ECC_STRING _NSS_CUSTOMIZED
#define NSS_VMAJOR   3
#define NSS_VMINOR   12
#define NSS_VPATCH   2
#define NSS_BETA     PR_FALSE

/*
 * Return a boolean that indicates whether the underlying library
 * will perform as the caller expects.
 *
 * The only argument is a string, which should be the verson
 * identifier of the NSS library. That string will be compared
 * against a string that represents the actual build version of
 * the NSS library.  It also invokes the version checking functions
 * of the dependent libraries such as NSPR.
 */
extern PRBool NSS_VersionCheck(const char *importedVersion);

/*
 * Open the Cert, Key, and Security Module databases, read only.
 * Initialize the Random Number Generator.
 * Does not initialize the cipher policies or enables.
 * Default policy settings disallow all ciphers.
 */
extern SECStatus NSS_Init(const char *configdir);

/*
 * Returns whether NSS has already been initialized or not.
 */
extern PRBool NSS_IsInitialized(void);

/*
 * Open the Cert, Key, and Security Module databases, read/write.
 * Initialize the Random Number Generator.
 * Does not initialize the cipher policies or enables.
 * Default policy settings disallow all ciphers.
 */
extern SECStatus NSS_InitReadWrite(const char *configdir);

/*
 * Open the Cert, Key, and Security Module databases, read/write.
 * Initialize the Random Number Generator.
 * Does not initialize the cipher policies or enables.
 * Default policy settings disallow all ciphers.
 *
 * This allows using application defined prefixes for the cert and key db's
 * and an alternate name for the secmod database. NOTE: In future releases,
 * the database prefixes my not necessarily map to database names.
 *
 * configdir - base directory where all the cert, key, and module datbases live.
 * certPrefix - prefix added to the beginning of the cert database example: "
 * 			"https-server1-"
 * keyPrefix - prefix added to the beginning of the key database example: "
 * 			"https-server1-"
 * secmodName - name of the security module database (usually "secmod.db").
 * flags - change the open options of NSS_Initialize as follows:
 * 	NSS_INIT_READONLY - Open the databases read only.
 * 	NSS_INIT_NOCERTDB - Don't open the cert DB and key DB's, just 
 * 			initialize the volatile certdb.
 * 	NSS_INIT_NOMODDB  - Don't open the security module DB, just 
 *			initialize the 	PKCS #11 module.
 *      NSS_INIT_FORCEOPEN - Continue to force initializations even if the 
 * 			databases cannot be opened.
 *      NSS_INIT_NOROOTINIT - Don't try to look for the root certs module
 *			automatically.
 *      NSS_INIT_OPTIMIZESPACE - Use smaller tables and caches.
 *      NSS_INIT_PK11THREADSAFE - only load PKCS#11 modules that are
 *                      thread-safe, ie. that support locking - either OS
 *                      locking or NSS-provided locks . If a PKCS#11
 *                      module isn't thread-safe, don't serialize its
 *                      calls; just don't load it instead. This is necessary
 *                      if another piece of code is using the same PKCS#11
 *                      modules that NSS is accessing without going through
 *                      NSS, for example the Java SunPKCS11 provider.
 *      NSS_INIT_PK11RELOAD - ignore the CKR_CRYPTOKI_ALREADY_INITIALIZED
 *                      error when loading PKCS#11 modules. This is necessary
 *                      if another piece of code is using the same PKCS#11
 *                      modules that NSS is accessing without going through
 *                      NSS, for example Java SunPKCS11 provider.
 *      NSS_INIT_NOPK11FINALIZE - never call C_Finalize on any
 *                      PKCS#11 module. This may be necessary in order to
 *                      ensure continuous operation and proper shutdown
 *                      sequence if another piece of code is using the same
 *                      PKCS#11 modules that NSS is accessing without going
 *                      through NSS, for example Java SunPKCS11 provider.
 *                      The following limitation applies when this is set :
 *                      SECMOD_WaitForAnyTokenEvent will not use
 *                      C_WaitForSlotEvent, in order to prevent the need for
 *                      C_Finalize. This call will be emulated instead.
 *      NSS_INIT_RESERVED - Currently has no effect, but may be used in the
 *                      future to trigger better cooperation between PKCS#11
 *                      modules used by both NSS and the Java SunPKCS11
 *                      provider. This should occur after a new flag is defined
 *                      for C_Initialize by the PKCS#11 working group.
 *      NSS_INIT_COOPERATE - Sets 4 recommended options for applications that
 *                      use both NSS and the Java SunPKCS11 provider.
 *
 * Also NOTE: This is not the recommended method for initializing NSS. 
 * The prefered method is NSS_init().
 */
#define NSS_INIT_READONLY	0x1
#define NSS_INIT_NOCERTDB	0x2
#define NSS_INIT_NOMODDB	0x4
#define NSS_INIT_FORCEOPEN	0x8
#define NSS_INIT_NOROOTINIT     0x10
#define NSS_INIT_OPTIMIZESPACE  0x20
#define NSS_INIT_PK11THREADSAFE   0x40
#define NSS_INIT_PK11RELOAD       0x80
#define NSS_INIT_NOPK11FINALIZE   0x100
#define NSS_INIT_RESERVED         0x200

#define NSS_INIT_COOPERATE NSS_INIT_PK11THREADSAFE | \
        NSS_INIT_PK11RELOAD | \
        NSS_INIT_NOPK11FINALIZE | \
        NSS_INIT_RESERVED

#ifdef macintosh
#define SECMOD_DB "Security Modules"
#else
#define SECMOD_DB "secmod.db"
#endif

extern SECStatus NSS_Initialize(const char *configdir, 
	const char *certPrefix, const char *keyPrefix, 
	const char *secmodName, PRUint32 flags);

/*
 * same as NSS_Init, but checks to see if we need to merge an
 * old database in.
 *   updatedir is the directory where the old database lives.
 *   updCertPrefix is the certPrefix for the old database.
 *   updKeyPrefix is the keyPrefix for the old database.
 *   updateID is a unique identifier chosen by the application for
 *      the specific database.
 *   updatName is the name the user will be prompted for when
 *      asking to authenticate to the old database  */
extern SECStatus NSS_InitWithMerge(const char *configdir, 
	const char *certPrefix, const char *keyPrefix, const char *secmodName,
	const char *updatedir,  const char *updCertPrefix, 
	const char *updKeyPrefix, const char *updateID, 
	const char *updateName, PRUint32 flags);
/*
 * initialize NSS without a creating cert db's, key db's, or secmod db's.
 */
SECStatus NSS_NoDB_Init(const char *configdir);

/*
 * Allow applications and libraries to register with NSS so that they are called
 * when NSS shuts down.
 *
 * void *appData application specific data passed in by the application at 
 * NSS_RegisterShutdown() time.
 * void *nssData is NULL in this release, but is reserved for future versions of 
 * NSS to pass some future status information * back to the shutdown function. 
 *
 * If the shutdown function returns SECFailure,
 * Shutdown will still complete, but NSS_Shutdown() will return SECFailure.
 */
typedef SECStatus (*NSS_ShutdownFunc)(void *appData, void *nssData);

/*
 * Register a shutdown function.
 */
SECStatus NSS_RegisterShutdown(NSS_ShutdownFunc sFunc, void *appData);

/*
 * Remove an existing shutdown function (you may do this if your library is
 * complete and going away, but NSS is still running).
 */
SECStatus NSS_UnregisterShutdown(NSS_ShutdownFunc sFunc, void *appData);

/* 
 * Close the Cert, Key databases.
 */
extern SECStatus NSS_Shutdown(void);

/*
 * set the PKCS #11 strings for the internal token.
 */
void PK11_ConfigurePKCS11(const char *man, const char *libdes, 
	const char *tokdes, const char *ptokdes, const char *slotdes, 
	const char *pslotdes, const char *fslotdes, const char *fpslotdes,
        int minPwd, int pwRequired);

/*
 * Dump the contents of the certificate cache and the temporary cert store.
 * Use to detect leaked references of certs at shutdown time.
 */
void nss_DumpCertificateCacheInfo(void);

SEC_END_PROTOS

#endif /* __nss_h_ */
