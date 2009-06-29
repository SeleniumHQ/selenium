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

#if defined(__WATCOMC__) || defined(__WATCOM_CPLUSPLUS__)
#ifndef __WATCOM_FIX_H__
#define __WATCOM_FIX_H__ 1
/*
 * WATCOM's C compiler doesn't default to "__cdecl" conventions for external
 * symbols and functions.  Rather than adding an explicit __cdecl modifier to 
 * every external symbol and function declaration and definition, we use the 
 * following pragma to (attempt to) change WATCOM c's default to __cdecl.
 * These pragmas were taken from pages 180-181, 266 & 269 of the 
 * Watcom C/C++ version 11 User's Guide, 3rd edition.
 */
#if defined(XP_WIN16) || defined(WIN16) 
#pragma aux default "_*" \
	parm caller [] \
	value struct float struct routine [ax] \
	modify [ax bx cx dx es]
#else
#pragma aux default "_*" \
	parm caller [] \
	value struct float struct routine [eax] \
	modify [eax ecx edx]
#endif
#pragma aux default far

#endif /* once */
#endif /* WATCOM compiler */
