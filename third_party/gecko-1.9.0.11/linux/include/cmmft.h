/* -*- Mode: C; tab-width: 8 -*-*/
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

#ifndef _CMMFT_H_
#define _CMMFT_H_

#include "secasn1.h"

/*
 * These are the enumerations used to distinguish between the different
 * choices available for the CMMFCertOrEncCert structure.
 */
typedef enum {
    cmmfNoCertOrEncCert = 0,
    cmmfCertificate = 1,
    cmmfEncryptedCert = 2
} CMMFCertOrEncCertChoice;

/*
 * This is the enumeration and the corresponding values used to 
 * represent the CMMF type PKIStatus
 */
typedef enum {
    cmmfNoPKIStatus = -1,
    cmmfGranted = 0,
    cmmfGrantedWithMods = 1,
    cmmfRejection = 2,
    cmmfWaiting = 3,
    cmmfRevocationWarning = 4,
    cmmfRevocationNotification = 5,
    cmmfKeyUpdateWarning = 6,
    cmmfNumPKIStatus
} CMMFPKIStatus;

/*
 * These enumerations are used to represent the corresponding values
 * in PKIFailureInfo defined in CMMF.
 */
typedef enum {
    cmmfBadAlg = 0,
    cmmfBadMessageCheck = 1,
    cmmfBadRequest = 2,
    cmmfBadTime = 3,
    cmmfBadCertId = 4,
    cmmfBadDataFormat = 5,
    cmmfWrongAuthority = 6,
    cmmfIncorrectData = 7,
    cmmfMissingTimeStamp = 8,
    cmmfNoFailureInfo = 9
} CMMFPKIFailureInfo;

typedef struct CMMFPKIStatusInfoStr          CMMFPKIStatusInfo;
typedef struct CMMFCertOrEncCertStr          CMMFCertOrEncCert;
typedef struct CMMFCertifiedKeyPairStr       CMMFCertifiedKeyPair;
typedef struct CMMFCertResponseStr           CMMFCertResponse;
typedef struct CMMFCertResponseSeqStr        CMMFCertResponseSeq;
typedef struct CMMFPOPODecKeyChallContentStr CMMFPOPODecKeyChallContent;
typedef struct CMMFChallengeStr              CMMFChallenge;
typedef struct CMMFRandStr                   CMMFRand;
typedef struct CMMFPOPODecKeyRespContentStr  CMMFPOPODecKeyRespContent;
typedef struct CMMFKeyRecRepContentStr       CMMFKeyRecRepContent;
typedef struct CMMFCertRepContentStr         CMMFCertRepContent;

/* Export this so people can call SEC_ASN1EncodeItem instead of having to 
 * write callbacks that are passed in to the high level encode function
 * for CMMFCertRepContent.
 */
extern const SEC_ASN1Template CMMFCertRepContentTemplate[];
extern const SEC_ASN1Template CMMFPOPODecKeyChallContentTemplate[];

#endif /*_CMMFT_H_*/
