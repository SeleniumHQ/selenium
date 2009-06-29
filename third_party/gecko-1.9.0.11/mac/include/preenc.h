/* -*- Mode: C; tab-width: 4; indent-tabs-mode: nil -*- */

/*
 * Fortezza support is removed.
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
/* $Id: preenc.h,v 1.6 2005/08/16 03:42:26 nelsonb%netscape.com Exp $ */

/* Fortezza support is removed.
 * This file remains so that old programs will continue to compile,
 * But this functionality is no longer supported or implemented.
 */

#include "seccomon.h"
#include "prio.h"

typedef struct PEHeaderStr PEHeader;

#define PE_MIME_TYPE "application/pre-encrypted"

typedef struct PEFortezzaHeaderStr PEFortezzaHeader;
typedef struct PEFortezzaGeneratedHeaderStr PEFortezzaGeneratedHeader;
typedef struct PEFixedKeyHeaderStr PEFixedKeyHeader;
typedef struct PERSAKeyHeaderStr PERSAKeyHeader;

struct PEFortezzaHeaderStr {
    unsigned char key[12];      
    unsigned char iv[24];       
    unsigned char hash[20];     
    unsigned char serial[8];    
};

struct PEFortezzaGeneratedHeaderStr {
    unsigned char key[12];      
    unsigned char iv[24];       
    unsigned char hash[20];     
    unsigned char Ra[128];      
    unsigned char Y[128];       
};

struct PEFixedKeyHeaderStr {
    unsigned char pkcs11Mech[4];  
    unsigned char labelLen[2];	  
    unsigned char keyIDLen[2];	  
    unsigned char ivLen[2];	  
    unsigned char keyLen[2];	  
    unsigned char data[1];	  
};

struct PERSAKeyHeaderStr {
    unsigned char pkcs11Mech[4];  
    unsigned char issuerLen[2];	  
    unsigned char serialLen[2];	  
    unsigned char ivLen[2];	  
    unsigned char keyLen[2];	  
    unsigned char data[1];	  
};

#define PEFIXED_Label(header) (header->data)
#define PEFIXED_KeyID(header) (&header->data[GetInt2(header->labelLen)])
#define PEFIXED_IV(header) (&header->data[GetInt2(header->labelLen)\
						+GetInt2(header->keyIDLen)])
#define PEFIXED_Key(header) (&header->data[GetInt2(header->labelLen)\
			+GetInt2(header->keyIDLen)+GetInt2(header->keyLen)])
#define PERSA_Issuer(header) (header->data)
#define PERSA_Serial(header) (&header->data[GetInt2(header->issuerLen)])
#define PERSA_IV(header) (&header->data[GetInt2(header->issuerLen)\
						+GetInt2(header->serialLen)])
#define PERSA_Key(header) (&header->data[GetInt2(header->issuerLen)\
			+GetInt2(header->serialLen)+GetInt2(header->keyLen)])
struct PEHeaderStr {
    unsigned char magic  [2];		
    unsigned char len    [2];		
    unsigned char type   [2];		
    unsigned char version[2];		
    union {
        PEFortezzaHeader          fortezza;
        PEFortezzaGeneratedHeader g_fortezza;
	PEFixedKeyHeader          fixed;
	PERSAKeyHeader            rsa;
    } u;
};

#define PE_CRYPT_INTRO_LEN 8
#define PE_INTRO_LEN 4
#define PE_BASE_HEADER_LEN  8

#define PRE_BLOCK_SIZE 8         


#define GetInt2(c) ((c[0] << 8) | c[1])
#define GetInt4(c) (((unsigned long)c[0] << 24)|((unsigned long)c[1] << 16)\
			|((unsigned long)c[2] << 8)| ((unsigned long)c[3]))
#define PutInt2(c,i) ((c[1] = (i) & 0xff), (c[0] = ((i) >> 8) & 0xff))
#define PutInt4(c,i) ((c[0]=((i) >> 24) & 0xff),(c[1]=((i) >> 16) & 0xff),\
			(c[2] = ((i) >> 8) & 0xff), (c[3] = (i) & 0xff))

#define PRE_MAGIC		0xc0de
#define PRE_VERSION		0x1010
#define PRE_FORTEZZA_FILE	0x00ff  
#define PRE_FORTEZZA_STREAM	0x00f5  
#define PRE_FORTEZZA_GEN_STREAM	0x00f6  
#define PRE_FIXED_FILE		0x000f  
#define PRE_RSA_FILE		0x001f  
#define PRE_FIXED_STREAM	0x0005  

PEHeader *SSL_PreencryptedStreamToFile(PRFileDesc *fd, PEHeader *,
				       int *headerSize);

PEHeader *SSL_PreencryptedFileToStream(PRFileDesc *fd, PEHeader *,
				       int *headerSize);

