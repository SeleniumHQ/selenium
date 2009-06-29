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
 * secport.h - portability interfaces for security libraries
 *
 * $Id: secport.h,v 1.17 2008/10/05 20:59:26 nelson%bolyard.com Exp $
 */

#ifndef _SECPORT_H_
#define _SECPORT_H_

#include "utilrename.h"

/*
 * define XP_WIN, XP_BEOS, or XP_UNIX, in case they are not defined
 * by anyone else
 */
#ifdef _WINDOWS
# ifndef XP_WIN
# define XP_WIN
# endif
#if defined(_WIN32) || defined(WIN32)
# ifndef XP_WIN32
# define XP_WIN32
# endif
#else
# ifndef XP_WIN16
# define XP_WIN16
# endif
#endif
#endif

#ifdef __BEOS__
# ifndef XP_BEOS
# define XP_BEOS
# endif
#endif

#ifdef unix
# ifndef XP_UNIX
# define XP_UNIX
# endif
#endif

#if defined(__WATCOMC__) || defined(__WATCOM_CPLUSPLUS__)
#include "watcomfx.h"
#endif

#if defined(_WIN32_WCE)
#include <windef.h>
#include <types.h>
#else
#include <sys/types.h>
#endif

#include <ctype.h>
#include <string.h>
#if defined(_WIN32_WCE)
#include <stdlib.h>	/* WinCE puts some stddef symbols here. */
#else
#include <stddef.h>
#endif
#include <stdlib.h>
#include "prtypes.h"
#include "prlog.h"	/* for PR_ASSERT */
#include "plarena.h"
#include "plstr.h"

/*
 * HACK for NSS 2.8 to allow Admin to compile without source changes.
 */
#ifndef SEC_BEGIN_PROTOS
#include "seccomon.h"
#endif

SEC_BEGIN_PROTOS

extern void *PORT_Alloc(size_t len);
extern void *PORT_Realloc(void *old, size_t len);
extern void *PORT_AllocBlock(size_t len);
extern void *PORT_ReallocBlock(void *old, size_t len);
extern void PORT_FreeBlock(void *ptr);
extern void *PORT_ZAlloc(size_t len);
extern void PORT_Free(void *ptr);
extern void PORT_ZFree(void *ptr, size_t len);
extern char *PORT_Strdup(const char *s);
extern time_t PORT_Time(void);
extern void PORT_SetError(int value);
extern int PORT_GetError(void);

extern PLArenaPool *PORT_NewArena(unsigned long chunksize);
extern void *PORT_ArenaAlloc(PLArenaPool *arena, size_t size);
extern void *PORT_ArenaZAlloc(PLArenaPool *arena, size_t size);
extern void PORT_FreeArena(PLArenaPool *arena, PRBool zero);
extern void *PORT_ArenaGrow(PLArenaPool *arena, void *ptr,
			    size_t oldsize, size_t newsize);
extern void *PORT_ArenaMark(PLArenaPool *arena);
extern void PORT_ArenaRelease(PLArenaPool *arena, void *mark);
extern void PORT_ArenaZRelease(PLArenaPool *arena, void *mark);
extern void PORT_ArenaUnmark(PLArenaPool *arena, void *mark);
extern char *PORT_ArenaStrdup(PLArenaPool *arena, const char *str);

SEC_END_PROTOS

#define PORT_Assert PR_ASSERT
#define PORT_ZNew(type) (type*)PORT_ZAlloc(sizeof(type))
#define PORT_New(type) (type*)PORT_Alloc(sizeof(type))
#define PORT_ArenaNew(poolp, type)	\
		(type*) PORT_ArenaAlloc(poolp, sizeof(type))
#define PORT_ArenaZNew(poolp, type)	\
		(type*) PORT_ArenaZAlloc(poolp, sizeof(type))
#define PORT_NewArray(type, num)	\
		(type*) PORT_Alloc (sizeof(type)*(num))
#define PORT_ZNewArray(type, num)	\
		(type*) PORT_ZAlloc (sizeof(type)*(num))
#define PORT_ArenaNewArray(poolp, type, num)	\
		(type*) PORT_ArenaAlloc (poolp, sizeof(type)*(num))
#define PORT_ArenaZNewArray(poolp, type, num)	\
		(type*) PORT_ArenaZAlloc (poolp, sizeof(type)*(num))

/* Please, keep these defines sorted alphabetically.  Thanks! */

#define PORT_Atoi 	atoi

#define PORT_Memcmp 	memcmp
#define PORT_Memcpy 	memcpy
#ifndef SUNOS4
#define PORT_Memmove 	memmove
#else /*SUNOS4*/
#define PORT_Memmove(s,ct,n)    bcopy ((ct), (s), (n))
#endif/*SUNOS4*/
#define PORT_Memset 	memset

#define PORT_Strcasecmp PL_strcasecmp
#define PORT_Strcat 	strcat
#define PORT_Strchr 	strchr
#define PORT_Strrchr    strrchr
#define PORT_Strcmp 	strcmp
#define PORT_Strcpy 	strcpy
#define PORT_Strlen(s) 	strlen(s)
#define PORT_Strncasecmp PL_strncasecmp
#define PORT_Strncat 	strncat
#define PORT_Strncmp 	strncmp
#define PORT_Strncpy 	strncpy
#define PORT_Strpbrk    strpbrk
#define PORT_Strstr 	strstr
#define PORT_Strtok 	strtok

#define PORT_Tolower 	tolower

typedef PRBool (PR_CALLBACK * PORTCharConversionWSwapFunc) (PRBool toUnicode,
			unsigned char *inBuf, unsigned int inBufLen,
			unsigned char *outBuf, unsigned int maxOutBufLen,
			unsigned int *outBufLen, PRBool swapBytes);

typedef PRBool (PR_CALLBACK * PORTCharConversionFunc) (PRBool toUnicode,
			unsigned char *inBuf, unsigned int inBufLen,
			unsigned char *outBuf, unsigned int maxOutBufLen,
			unsigned int *outBufLen);

SEC_BEGIN_PROTOS

void PORT_SetUCS4_UTF8ConversionFunction(PORTCharConversionFunc convFunc);
void PORT_SetUCS2_ASCIIConversionFunction(PORTCharConversionWSwapFunc convFunc);
PRBool PORT_UCS4_UTF8Conversion(PRBool toUnicode, unsigned char *inBuf,
			unsigned int inBufLen, unsigned char *outBuf,
			unsigned int maxOutBufLen, unsigned int *outBufLen);
PRBool PORT_UCS2_ASCIIConversion(PRBool toUnicode, unsigned char *inBuf,
			unsigned int inBufLen, unsigned char *outBuf,
			unsigned int maxOutBufLen, unsigned int *outBufLen,
			PRBool swapBytes);
void PORT_SetUCS2_UTF8ConversionFunction(PORTCharConversionFunc convFunc);
PRBool PORT_UCS2_UTF8Conversion(PRBool toUnicode, unsigned char *inBuf,
			unsigned int inBufLen, unsigned char *outBuf,
			unsigned int maxOutBufLen, unsigned int *outBufLen);

/* One-way conversion from ISO-8859-1 to UTF-8 */
PRBool PORT_ISO88591_UTF8Conversion(const unsigned char *inBuf,
			unsigned int inBufLen, unsigned char *outBuf,
			unsigned int maxOutBufLen, unsigned int *outBufLen);

extern PRBool
sec_port_ucs4_utf8_conversion_function
(
  PRBool toUnicode,
  unsigned char *inBuf,
  unsigned int inBufLen,
  unsigned char *outBuf,
  unsigned int maxOutBufLen,
  unsigned int *outBufLen
);

extern PRBool
sec_port_ucs2_utf8_conversion_function
(
  PRBool toUnicode,
  unsigned char *inBuf,
  unsigned int inBufLen,
  unsigned char *outBuf,
  unsigned int maxOutBufLen,
  unsigned int *outBufLen
);

/* One-way conversion from ISO-8859-1 to UTF-8 */
extern PRBool
sec_port_iso88591_utf8_conversion_function
(
  const unsigned char *inBuf,
  unsigned int inBufLen,
  unsigned char *outBuf,
  unsigned int maxOutBufLen,
  unsigned int *outBufLen
);

extern int NSS_PutEnv(const char * envVarName, const char * envValue);

SEC_END_PROTOS

#endif /* _SECPORT_H_ */
