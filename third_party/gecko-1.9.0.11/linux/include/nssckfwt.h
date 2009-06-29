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

#ifndef NSSCKFWT_H
#define NSSCKFWT_H

#ifdef DEBUG
static const char NSSCKFWT_CVS_ID[] = "@(#) $RCSfile: nssckfwt.h,v $ $Revision: 1.5 $ $Date: 2005/12/16 00:48:01 $";
#endif /* DEBUG */

/*
 * nssckfwt.h
 *
 * This file declares the public types used by the NSS Cryptoki Framework.
 */

/*
 * NSSCKFWInstance
 *
 */

struct NSSCKFWInstanceStr;
typedef struct NSSCKFWInstanceStr NSSCKFWInstance;

/*
 * NSSCKFWSlot
 *
 */

struct NSSCKFWSlotStr;
typedef struct NSSCKFWSlotStr NSSCKFWSlot;

/*
 * NSSCKFWToken
 *
 */

struct NSSCKFWTokenStr;
typedef struct NSSCKFWTokenStr NSSCKFWToken;

/*
 * NSSCKFWMechanism
 *
 */

struct NSSCKFWMechanismStr;
typedef struct NSSCKFWMechanismStr NSSCKFWMechanism;

/*
 * NSSCKFWCryptoOperation
 *
 */

struct NSSCKFWCryptoOperationStr;
typedef struct NSSCKFWCryptoOperationStr NSSCKFWCryptoOperation;


/*
 * NSSCKFWSession
 *
 */

struct NSSCKFWSessionStr;
typedef struct NSSCKFWSessionStr NSSCKFWSession;

/*
 * NSSCKFWObject
 *
 */

struct NSSCKFWObjectStr;
typedef struct NSSCKFWObjectStr NSSCKFWObject;

/*
 * NSSCKFWFindObjects
 *
 */

struct NSSCKFWFindObjectsStr;
typedef struct NSSCKFWFindObjectsStr NSSCKFWFindObjects;

/*
 * NSSCKFWMutex
 *
 */

struct NSSCKFWMutexStr;
typedef struct NSSCKFWMutexStr NSSCKFWMutex;

typedef enum {
    SingleThreaded,
    MultiThreaded
} CryptokiLockingState ;

/* used as an index into an array, make sure it starts at '0' */
typedef enum {
    NSSCKFWCryptoOperationState_EncryptDecrypt = 0,
    NSSCKFWCryptoOperationState_SignVerify,
    NSSCKFWCryptoOperationState_Digest,
    NSSCKFWCryptoOperationState_Max
} NSSCKFWCryptoOperationState;

typedef enum {
    NSSCKFWCryptoOperationType_Encrypt,
    NSSCKFWCryptoOperationType_Decrypt,
    NSSCKFWCryptoOperationType_Digest,
    NSSCKFWCryptoOperationType_Sign,
    NSSCKFWCryptoOperationType_Verify,
    NSSCKFWCryptoOperationType_SignRecover,
    NSSCKFWCryptoOperationType_VerifyRecover
} NSSCKFWCryptoOperationType;

#endif /* NSSCKFWT_H */
