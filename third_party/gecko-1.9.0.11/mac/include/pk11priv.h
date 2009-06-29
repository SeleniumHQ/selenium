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
#ifndef _PK11PRIV_H_
#define _PK11PRIV_H_
#include "plarena.h"
#include "seccomon.h"
#include "secoidt.h"
#include "secdert.h"
#include "keyt.h"
#include "certt.h"
#include "pkcs11t.h"
#include "secmodt.h"
#include "seccomon.h"
#include "pkcs7t.h"
#include "cmsreclist.h"

/*
 * These are the private NSS functions. They are not exported by nss.def, and
 * are not callable outside nss3.dll. 
 */

SEC_BEGIN_PROTOS

/************************************************************
 * Generic Slot Lists Management
 ************************************************************/
PK11SlotList * PK11_NewSlotList(void);
PK11SlotList * PK11_GetPrivateKeyTokens(CK_MECHANISM_TYPE type,
						PRBool needRW,void *wincx);
SECStatus PK11_AddSlotToList(PK11SlotList *list,PK11SlotInfo *slot);
SECStatus PK11_DeleteSlotFromList(PK11SlotList *list,PK11SlotListElement *le);
PK11SlotListElement *PK11_FindSlotElement(PK11SlotList *list,
							PK11SlotInfo *slot);
PK11SlotInfo *PK11_FindSlotBySerial(char *serial);
int PK11_GetMaxKeyLength(CK_MECHANISM_TYPE type);

/************************************************************
 * Generic Slot Management
 ************************************************************/
CK_OBJECT_HANDLE PK11_CopyKey(PK11SlotInfo *slot, CK_OBJECT_HANDLE srcObject);
SECStatus PK11_ReadAttribute(PK11SlotInfo *slot, CK_OBJECT_HANDLE id,
         CK_ATTRIBUTE_TYPE type, PLArenaPool *arena, SECItem *result);
CK_ULONG PK11_ReadULongAttribute(PK11SlotInfo *slot, CK_OBJECT_HANDLE id,
         CK_ATTRIBUTE_TYPE type);
char * PK11_MakeString(PLArenaPool *arena,char *space,char *staticSring,
								int stringLen);
int PK11_MapError(CK_RV error);
CK_SESSION_HANDLE PK11_GetRWSession(PK11SlotInfo *slot);
void PK11_RestoreROSession(PK11SlotInfo *slot,CK_SESSION_HANDLE rwsession);
PRBool PK11_RWSessionHasLock(PK11SlotInfo *slot,
					 CK_SESSION_HANDLE session_handle);
PK11SlotInfo *PK11_NewSlotInfo(SECMODModule *mod);
void PK11_EnterSlotMonitor(PK11SlotInfo *);
void PK11_ExitSlotMonitor(PK11SlotInfo *);
void PK11_CleanKeyList(PK11SlotInfo *slot);


/************************************************************
 *  Slot Password Management
 ************************************************************/
SECStatus PK11_DoPassword(PK11SlotInfo *slot, PRBool loadCerts, void *wincx);
SECStatus PK11_VerifyPW(PK11SlotInfo *slot,char *pw);
void PK11_HandlePasswordCheck(PK11SlotInfo *slot,void *wincx);
void PK11_SetVerifyPasswordFunc(PK11VerifyPasswordFunc func);
void PK11_SetIsLoggedInFunc(PK11IsLoggedInFunc func);

/************************************************************
 * Manage the built-In Slot Lists
 ************************************************************/
SECStatus PK11_InitSlotLists(void);
void PK11_DestroySlotLists(void);
PK11SlotList *PK11_GetSlotList(CK_MECHANISM_TYPE type);
void PK11_LoadSlotList(PK11SlotInfo *slot, PK11PreSlotInfo *psi, int count);
void PK11_ClearSlotList(PK11SlotInfo *slot);


/******************************************************************
 *           Slot initialization
 ******************************************************************/
SECStatus PK11_InitToken(PK11SlotInfo *slot, PRBool loadCerts);
void PK11_InitSlot(SECMODModule *mod,CK_SLOT_ID slotID,PK11SlotInfo *slot);
PRBool PK11_NeedPWInitForSlot(PK11SlotInfo *slot);
SECStatus PK11_ReadSlotCerts(PK11SlotInfo *slot);

/*********************************************************************
 *       Mechanism Mapping functions
 *********************************************************************/
void PK11_AddMechanismEntry(CK_MECHANISM_TYPE type, CK_KEY_TYPE key,
	 	CK_MECHANISM_TYPE keygen, CK_MECHANISM_TYPE pad, 
		int ivLen, int blocksize);
CK_MECHANISM_TYPE PK11_GetKeyMechanism(CK_KEY_TYPE type);
CK_MECHANISM_TYPE PK11_GetKeyGenWithSize(CK_MECHANISM_TYPE type, int size);

/**********************************************************************
 *                   Symetric, Public, and Private Keys 
 **********************************************************************/
/* Key Generation specialized for SDR (fixed DES3 key) */
PK11SymKey *PK11_GenDES3TokenKey(PK11SlotInfo *slot, SECItem *keyid, void *cx);
SECKEYPublicKey *PK11_ExtractPublicKey(PK11SlotInfo *slot, KeyType keyType,
					 CK_OBJECT_HANDLE id);
CK_OBJECT_HANDLE PK11_FindObjectForCert(CERTCertificate *cert,
					void *wincx, PK11SlotInfo **pSlot);
PK11SymKey * pk11_CopyToSlot(PK11SlotInfo *slot,CK_MECHANISM_TYPE type,
		 	CK_ATTRIBUTE_TYPE operation, PK11SymKey *symKey);

/**********************************************************************
 *                   Certs
 **********************************************************************/
SECStatus PK11_TraversePrivateKeysInSlot( PK11SlotInfo *slot,
    SECStatus(* callback)(SECKEYPrivateKey*, void*), void *arg);
SECKEYPrivateKey * PK11_FindPrivateKeyFromNickname(char *nickname, void *wincx);
CK_OBJECT_HANDLE * PK11_FindObjectsFromNickname(char *nickname,
	PK11SlotInfo **slotptr, CK_OBJECT_CLASS objclass, int *returnCount, 
								void *wincx);
CK_OBJECT_HANDLE PK11_MatchItem(PK11SlotInfo *slot,CK_OBJECT_HANDLE peer,
						CK_OBJECT_CLASS o_class); 
CK_BBOOL PK11_HasAttributeSet( PK11SlotInfo *slot,
			       CK_OBJECT_HANDLE id,
			       CK_ATTRIBUTE_TYPE type );
CK_RV PK11_GetAttributes(PLArenaPool *arena,PK11SlotInfo *slot,
			 CK_OBJECT_HANDLE obj,CK_ATTRIBUTE *attr, int count);
int PK11_NumberCertsForCertSubject(CERTCertificate *cert);
SECStatus PK11_TraverseCertsForSubject(CERTCertificate *cert, 
	SECStatus(*callback)(CERTCertificate *, void *), void *arg);
SECStatus PK11_GetKEAMatchedCerts(PK11SlotInfo *slot1,
   PK11SlotInfo *slot2, CERTCertificate **cert1, CERTCertificate **cert2);
SECStatus PK11_TraverseCertsInSlot(PK11SlotInfo *slot,
       SECStatus(* callback)(CERTCertificate*, void *), void *arg);
SECStatus PK11_LookupCrls(CERTCrlHeadNode *nodes, int type, void *wincx);


/**********************************************************************
 *                   Crypto Contexts
 **********************************************************************/
PK11Context * PK11_CreateContextByRawKey(PK11SlotInfo *slot, 
    CK_MECHANISM_TYPE type, PK11Origin origin, CK_ATTRIBUTE_TYPE operation,
			 	SECItem *key, SECItem *param, void *wincx);
PRBool PK11_HashOK(SECOidTag hashAlg);


/**********************************************************************
 * Functions which are  deprecated....
 **********************************************************************/

SECItem *
PK11_FindCrlByName(PK11SlotInfo **slot, CK_OBJECT_HANDLE *handle,
					SECItem *derName, int type, char **url);

CK_OBJECT_HANDLE
PK11_PutCrl(PK11SlotInfo *slot, SECItem *crl, 
				SECItem *name, char *url, int type);

SECItem *
PK11_FindSMimeProfile(PK11SlotInfo **slotp, char *emailAddr, SECItem *derSubj,
					SECItem **profileTime);
SECStatus
PK11_SaveSMimeProfile(PK11SlotInfo *slot, char *emailAddr, SECItem *derSubj,
			SECItem *emailProfile, SECItem *profileTime);

PRBool PK11_IsPermObject(PK11SlotInfo *slot, CK_OBJECT_HANDLE handle);

char * PK11_GetObjectNickname(PK11SlotInfo *slot, CK_OBJECT_HANDLE id) ;
SECStatus PK11_SetObjectNickname(PK11SlotInfo *slot, CK_OBJECT_HANDLE id, 
						const char *nickname) ;


/* private */
SECStatus pk11_TraverseAllSlots( SECStatus (*callback)(PK11SlotInfo *,void *),
	void *cbArg, PRBool forceLogin, void *pwArg);

/* fetch multiple CRLs for a specific issuer */
SECStatus pk11_RetrieveCrls(CERTCrlHeadNode *nodes, SECItem* issuer,
                                   void *wincx);

/* set global options for NSS PKCS#11 module loader */
SECStatus pk11_setGlobalOptions(PRBool noSingleThreadedModules,
                                PRBool allowAlreadyInitializedModules,
                                PRBool dontFinalizeModules);

/* return whether NSS is allowed to call C_Finalize */
PRBool pk11_getFinalizeModulesOption(void);

SEC_END_PROTOS

#endif
