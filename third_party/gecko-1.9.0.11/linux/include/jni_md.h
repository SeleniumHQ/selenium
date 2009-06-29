/* -*- Mode: C; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
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
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
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
 * ***** END LICENSE BLOCK *****
 *
 *
 * This Original Code has been modified by IBM Corporation.
 * Modifications made by IBM described herein are
 * Copyright (c) International Business Machines
 * Corporation, 2000
 *
 * Modifications to Mozilla code or documentation
 * identified per MPL Section 3.3
 *
 * Date         Modified by     Description of modification
 * 03/27/2000   IBM Corp.       Set JNICALL to Optlink for
 *                               use in OS2
 */

/*******************************************************************************
 * Netscape version of jni_md.h -- depends on jri_md.h
 ******************************************************************************/

#ifndef JNI_MD_H
#define JNI_MD_H

#include "prtypes.h" /* needed for _declspec */

/*******************************************************************************
 * WHAT'S UP WITH THIS FILE?
 * 
 * This is where we define the mystical JNI_PUBLIC_API macro that works on all
 * platforms. If you're running with Visual C++, Symantec C, or Borland's 
 * development environment on the PC, you're all set. Or if you're on the Mac
 * with Metrowerks, Symantec or MPW with SC you're ok too. For UNIX it shouldn't
 * matter.

 * Changes by sailesh on 9/26 

 * There are two symbols used in the declaration of the JNI functions
 * and native code that uses the JNI:
 * JNICALL - specifies the calling convention 
 * JNIEXPORT - specifies export status of the function 
 * 
 * The syntax to specify calling conventions is different in Win16 and
 * Win32 - the brains at Micro$oft at work here. JavaSoft in their
 * infinite wisdom cares for no platform other than Win32, and so they
 * just define these two symbols as:

 #define JNIEXPORT __declspec(dllexport)
 #define JNICALL __stdcall

 * We deal with this, in the way JRI defines the JRI_PUBLIC_API, by
 * defining a macro called JNI_PUBLIC_API. Any of our developers who
 * wish to use code for Win16 and Win32, _must_ use JNI_PUBLIC_API to
 * be able to export functions properly.

 * Since we must also maintain compatibility with JavaSoft, we
 * continue to define the symbol JNIEXPORT. However, use of this
 * internally is deprecated, since it will cause a mess on Win16.

 * We _do not_ need a new symbol called JNICALL. Instead we
 * redefine JNICALL in the same way JRI_CALLBACK was defined.

 ******************************************************************************/

/* DLL Entry modifiers... */
/* Win32 */
#if defined(XP_WIN) || defined(_WINDOWS) || defined(WIN32) || defined(_WIN32)
#	include <windows.h>
#	if defined(_MSC_VER) || defined(__GNUC__)
#		if defined(WIN32) || defined(_WIN32)
#			define JNI_PUBLIC_API(ResultType)	_declspec(dllexport) ResultType __stdcall
#			define JNI_PUBLIC_VAR(VarType)		VarType
#			define JNI_NATIVE_STUB(ResultType)	_declspec(dllexport) ResultType
#			define JNICALL                          __stdcall
#		else /* !_WIN32 */
#		    if defined(_WINDLL)
#			define JNI_PUBLIC_API(ResultType)	ResultType __cdecl __export __loadds 
#			define JNI_PUBLIC_VAR(VarType)		VarType
#			define JNI_NATIVE_STUB(ResultType)	ResultType __cdecl __loadds
#			define JNICALL			        __loadds
#		    else /* !WINDLL */
#			define JNI_PUBLIC_API(ResultType)	ResultType __cdecl __export
#			define JNI_PUBLIC_VAR(VarType)		VarType
#			define JNI_NATIVE_STUB(ResultType)	ResultType __cdecl __export
#			define JNICALL			        __export
#                   endif /* !WINDLL */
#		endif /* !_WIN32 */
#	elif defined(__BORLANDC__)
#		if defined(WIN32) || defined(_WIN32)
#			define JNI_PUBLIC_API(ResultType)	__export ResultType
#			define JNI_PUBLIC_VAR(VarType)		VarType
#			define JNI_NATIVE_STUB(ResultType)	 __export ResultType
#			define JNICALL
#		else /* !_WIN32 */
#			define JNI_PUBLIC_API(ResultType)	ResultType _cdecl _export _loadds 
#			define JNI_PUBLIC_VAR(VarType)		VarType
#			define JNI_NATIVE_STUB(ResultType)	ResultType _cdecl _loadds
#			define JNICALL			_loadds
#		endif
#	else
#		error Unsupported PC development environment.	
#	endif
#	ifndef IS_LITTLE_ENDIAN
#		define IS_LITTLE_ENDIAN
#	endif
	/*  This is the stuff inherited from JavaSoft .. */
#	define JNIEXPORT __declspec(dllexport)
#	define JNIIMPORT __declspec(dllimport)

/* OS/2 */
#elif defined(XP_OS2)
#	ifdef XP_OS2_VACPP
#		define JNI_PUBLIC_API(ResultType)	ResultType _System
#		define JNI_PUBLIC_VAR(VarType)		VarType
#		define JNICALL				_Optlink
#		define JNIEXPORT
#		define JNIIMPORT
#	elif defined(__declspec)
#		define JNI_PUBLIC_API(ResultType)	__declspec(dllexport) ResultType
#		define JNI_PUBLIC_VAR(VarType)		VarType
#		define JNI_NATIVE_STUB(ResultType)	__declspec(dllexport) ResultType
#		define JNICALL
#		define JNIEXPORT
#		define JNIIMPORT
#	else
#		define JNI_PUBLIC_API(ResultType)	ResultType
#		define JNI_PUBLIC_VAR(VarType)		VarType
#		define JNICALL
#		define JNIEXPORT
#		define JNIIMPORT
#	endif
#	ifndef IS_LITTLE_ENDIAN
#		define IS_LITTLE_ENDIAN
#	endif

/* Mac */
#elif macintosh || Macintosh || THINK_C
#	if defined(__MWERKS__)				/* Metrowerks */
#		if !__option(enumsalwaysint)
#			error You need to define 'Enums Always Int' for your project.
#		endif
#		if defined(TARGET_CPU_68K) && !TARGET_RT_MAC_CFM 
#			if !__option(fourbyteints) 
#				error You need to define 'Struct Alignment: 68k' for your project.
#			endif
#		endif /* !GENERATINGCFM */
#		define JNI_PUBLIC_API(ResultType)	__declspec(export) ResultType 
#		define JNI_PUBLIC_VAR(VarType)		JNI_PUBLIC_API(VarType)
#		define JNI_NATIVE_STUB(ResultType)	JNI_PUBLIC_API(ResultType)
#	elif defined(__SC__)				/* Symantec */
#		error What are the Symantec defines? (warren@netscape.com)
#	elif macintosh && applec			/* MPW */
#		error Please upgrade to the latest MPW compiler (SC).
#	else
#		error Unsupported Mac development environment.
#	endif
#	define JNICALL
	/*  This is the stuff inherited from JavaSoft .. */
#	define JNIEXPORT
#	define JNIIMPORT

/* Unix or else */
#else
#	define JNI_PUBLIC_API(ResultType)		ResultType
#       define JNI_PUBLIC_VAR(VarType)                  VarType
#       define JNI_NATIVE_STUB(ResultType)              ResultType
#	define JNICALL
	/*  This is the stuff inherited from JavaSoft .. */
#	define JNIEXPORT
#	define JNIIMPORT
#endif

#ifndef FAR		/* for non-Win16 */
#define FAR
#endif

/* Get the rest of the stuff from jri_md.h */
#include "jri_md.h"

#endif /* JNI_MD_H */
