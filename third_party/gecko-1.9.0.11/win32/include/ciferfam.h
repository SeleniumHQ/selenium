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

/*
 * ciferfam.h - cipher familie IDs used for configuring ciphers for export
 *              control
 *
 * $Id: ciferfam.h,v 1.4 2007/10/12 01:44:50 julien.pierre.boogz%sun.com Exp $
 */

#ifndef _CIFERFAM_H_
#define _CIFERFAM_H_

#include "utilrename.h"
/* Cipher Suite "Families" */
#define CIPHER_FAMILY_PKCS12			"PKCS12"
#define CIPHER_FAMILY_SMIME			"SMIME"
#define CIPHER_FAMILY_SSL2			"SSLv2"
#define CIPHER_FAMILY_SSL3			"SSLv3"
#define CIPHER_FAMILY_SSL			"SSL"
#define CIPHER_FAMILY_ALL			""
#define CIPHER_FAMILY_UNKNOWN			"UNKNOWN"

#define CIPHER_FAMILYID_MASK			0xFFFF0000L
#define CIPHER_FAMILYID_SSL			0x00000000L
#define CIPHER_FAMILYID_SMIME			0x00010000L
#define CIPHER_FAMILYID_PKCS12			0x00020000L

/* SMIME "Cipher Suites" */
/*
 * Note that it is assumed that the cipher number itself can be used
 * as a bit position in a mask, and that mask is currently 32 bits wide.
 * So, if you want to add a cipher that is greater than 0037, secmime.c
 * needs to be made smarter at the same time.
 */
#define	SMIME_RC2_CBC_40		(CIPHER_FAMILYID_SMIME | 0001)
#define	SMIME_RC2_CBC_64		(CIPHER_FAMILYID_SMIME | 0002)
#define	SMIME_RC2_CBC_128		(CIPHER_FAMILYID_SMIME | 0003)
#define	SMIME_DES_CBC_56		(CIPHER_FAMILYID_SMIME | 0011)
#define	SMIME_DES_EDE3_168		(CIPHER_FAMILYID_SMIME | 0012)
#define	SMIME_AES_CBC_128		(CIPHER_FAMILYID_SMIME | 0013)
#define	SMIME_RC5PAD_64_16_40		(CIPHER_FAMILYID_SMIME | 0021)
#define	SMIME_RC5PAD_64_16_64		(CIPHER_FAMILYID_SMIME | 0022)
#define	SMIME_RC5PAD_64_16_128		(CIPHER_FAMILYID_SMIME | 0023)
#define	SMIME_FORTEZZA			(CIPHER_FAMILYID_SMIME | 0031)

/* PKCS12 "Cipher Suites" */

#define	PKCS12_RC2_CBC_40		(CIPHER_FAMILYID_PKCS12 | 0001)
#define	PKCS12_RC2_CBC_128		(CIPHER_FAMILYID_PKCS12 | 0002)
#define	PKCS12_RC4_40			(CIPHER_FAMILYID_PKCS12 | 0011)
#define	PKCS12_RC4_128			(CIPHER_FAMILYID_PKCS12 | 0012)
#define	PKCS12_DES_56			(CIPHER_FAMILYID_PKCS12 | 0021)
#define	PKCS12_DES_EDE3_168		(CIPHER_FAMILYID_PKCS12 | 0022)

/* SMIME version numbers are negative, to avoid colliding with SSL versions */
#define SMIME_LIBRARY_VERSION_1_0			-0x0100

#endif /* _CIFERFAM_H_ */
