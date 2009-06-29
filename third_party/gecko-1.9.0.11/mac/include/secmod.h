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
#ifndef _SECMOD_H_
#define _SEDMOD_H_
#include "seccomon.h"
#include "secmodt.h"
#include "prinrval.h"

/* These mechanisms flags are visible to all other libraries. */
/* They must be converted to internal SECMOD_*_FLAG */
/* if used inside the functions of the security library */
#define PUBLIC_MECH_RSA_FLAG         0x00000001ul
#define PUBLIC_MECH_DSA_FLAG         0x00000002ul
#define PUBLIC_MECH_RC2_FLAG         0x00000004ul
#define PUBLIC_MECH_RC4_FLAG         0x00000008ul
#define PUBLIC_MECH_DES_FLAG         0x00000010ul
#define PUBLIC_MECH_DH_FLAG          0x00000020ul
#define PUBLIC_MECH_FORTEZZA_FLAG    0x00000040ul
#define PUBLIC_MECH_RC5_FLAG         0x00000080ul
#define PUBLIC_MECH_SHA1_FLAG        0x00000100ul
#define PUBLIC_MECH_MD5_FLAG         0x00000200ul
#define PUBLIC_MECH_MD2_FLAG         0x00000400ul
#define PUBLIC_MECH_SSL_FLAG         0x00000800ul
#define PUBLIC_MECH_TLS_FLAG         0x00001000ul
#define PUBLIC_MECH_AES_FLAG         0x00002000ul
#define PUBLIC_MECH_SHA256_FLAG      0x00004000ul
#define PUBLIC_MECH_SHA512_FLAG      0x00008000ul
#define PUBLIC_MECH_CAMELLIA_FLAG    0x00010000ul

#define PUBLIC_MECH_RANDOM_FLAG      0x08000000ul
#define PUBLIC_MECH_FRIENDLY_FLAG    0x10000000ul
#define PUBLIC_OWN_PW_DEFAULTS       0X20000000ul
#define PUBLIC_DISABLE_FLAG          0x40000000ul

/* warning: reserved means reserved */
#define PUBLIC_MECH_RESERVED_FLAGS   0x87FF0000ul

/* These cipher flags are visible to all other libraries, */
/* But they must be converted before used in functions */
/* withing the security module */
#define PUBLIC_CIPHER_FORTEZZA_FLAG  0x00000001ul

/* warning: reserved means reserved */
#define PUBLIC_CIPHER_RESERVED_FLAGS 0xFFFFFFFEul

SEC_BEGIN_PROTOS

/*
 * the following functions are going to be deprecated in NSS 4.0 in
 * favor of the new stan functions.
 */

/* Initialization */
extern SECMODModule *SECMOD_LoadModule(char *moduleSpec,SECMODModule *parent,
							PRBool recurse);

extern SECMODModule *SECMOD_LoadUserModule(char *moduleSpec,SECMODModule *parent,
							PRBool recurse);

SECStatus SECMOD_UnloadUserModule(SECMODModule *mod);

SECMODModule * SECMOD_CreateModule(const char *lib, const char *name,
					const char *param, const char *nss);


/* Module Management */
char **SECMOD_GetModuleSpecList(SECMODModule *module);
SECStatus SECMOD_FreeModuleSpecList(SECMODModule *module,char **moduleSpecList);

 
/* protoypes */
/* Get a list of active PKCS #11 modules */
extern SECMODModuleList *SECMOD_GetDefaultModuleList(void); 
/* Get a list of defined but not loaded PKCS #11 modules */
extern SECMODModuleList *SECMOD_GetDeadModuleList(void);
/* Get a list of Modules which define PKCS #11 modules to load */
extern SECMODModuleList *SECMOD_GetDBModuleList(void);

/* lock to protect all three module lists above */
extern SECMODListLock *SECMOD_GetDefaultModuleListLock(void);

extern SECStatus SECMOD_UpdateModule(SECMODModule *module);

/* lock management */
extern void SECMOD_GetReadLock(SECMODListLock *);
extern void SECMOD_ReleaseReadLock(SECMODListLock *);

/* Operate on modules by name */
extern SECMODModule *SECMOD_FindModule(const char *name);
extern SECStatus SECMOD_DeleteModule(const char *name, int *type);
extern SECStatus SECMOD_DeleteModuleEx(const char * name, 
                                       SECMODModule *mod, 
                                       int *type, 
                                       PRBool permdb);
extern SECStatus SECMOD_DeleteInternalModule(const char *name);
extern PRBool SECMOD_CanDeleteInternalModule(void);
extern SECStatus SECMOD_AddNewModule(const char* moduleName, 
			      const char* dllPath,
                              unsigned long defaultMechanismFlags,
                              unsigned long cipherEnableFlags);
extern SECStatus SECMOD_AddNewModuleEx(const char* moduleName,
			      const char* dllPath,
                              unsigned long defaultMechanismFlags,
                              unsigned long cipherEnableFlags,
                              char* modparms,
                              char* nssparms);

/* database/memory management */
extern SECMODModule *SECMOD_GetInternalModule(void);
extern SECMODModule *SECMOD_ReferenceModule(SECMODModule *module);
extern void SECMOD_DestroyModule(SECMODModule *module);
extern PK11SlotInfo *SECMOD_LookupSlot(SECMODModuleID module,
							unsigned long slotID);
extern PK11SlotInfo *SECMOD_FindSlot(SECMODModule *module,const char *name);

/* Funtion reports true if at least one of the modules */
/* of modType has been installed */
PRBool SECMOD_IsModulePresent( unsigned long int pubCipherEnableFlags );

/* Functions used to convert between internal & public representation
 * of Mechanism Flags and Cipher Enable Flags */
extern unsigned long SECMOD_PubMechFlagstoInternal(unsigned long publicFlags);
extern unsigned long SECMOD_PubCipherFlagstoInternal(unsigned long publicFlags);

PRBool SECMOD_HasRemovableSlots(SECMODModule *mod);
PK11SlotInfo *SECMOD_WaitForAnyTokenEvent(SECMODModule *mod, 
				unsigned long flags, PRIntervalTime latency);
/*
 * Warning: the SECMOD_CancelWait function is highly destructive, potentially 
 * finalizing  the module 'mod' (causing inprogress operations to fail, 
 * and session key material to disappear). It should only be called when 
 * shutting down  the module. 
 */
SECStatus SECMOD_CancelWait(SECMODModule *mod);
/*
 * check to see if the module has added new slots. PKCS 11 v2.20 allows for
 * modules to add new slots, but never remove them. Slots not be added between 
 * a call to C_GetSlotLlist(Flag, NULL, &count) and the corresponding
 * C_GetSlotList(flag, &data, &count) so that the array doesn't accidently
 * grow on the caller. It is permissible for the slots to increase between
 * corresponding calls with NULL to get the size.
 */
SECStatus SECMOD_UpdateSlotList(SECMODModule *mod);
SEC_END_PROTOS

#endif
