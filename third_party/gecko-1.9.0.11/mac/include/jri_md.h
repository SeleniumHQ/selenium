/* -*- Mode: C; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
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
 * ***** END LICENSE BLOCK ***** */

/*******************************************************************************
 * Java Runtime Interface - Machine Dependent Types
 ******************************************************************************/
 
#ifndef JRI_MD_H
#define JRI_MD_H

#include <assert.h>
#include "prtypes.h" /* Needed for HAS_LONG_LONG ifdefs */

#ifdef __cplusplus
extern "C" {
#endif

/*******************************************************************************
 * WHAT'S UP WITH THIS FILE?
 * 
 * This is where we define the mystical JRI_PUBLIC_API macro that works on all
 * platforms. If you're running with Visual C++, Symantec C, or Borland's 
 * development environment on the PC, you're all set. Or if you're on the Mac
 * with Metrowerks, Symantec or MPW with SC you're ok too. For UNIX it shouldn't
 * matter.
 *
 * On UNIX though you probably care about a couple of other symbols though:
 *	IS_LITTLE_ENDIAN must be defined for little-endian systems
 *	HAVE_LONG_LONG must be defined on systems that have 'long long' integers
 *	HAVE_ALIGNED_LONGLONGS must be defined if long-longs must be 8 byte aligned
 *	HAVE_ALIGNED_DOUBLES must be defined if doubles must be 8 byte aligned
 *	IS_64 must be defined on 64-bit machines (like Dec Alpha)
 ******************************************************************************/

/* DLL Entry modifiers... */

/* Windows */
#if defined(XP_WIN) || defined(_WINDOWS) || defined(WIN32) || defined(_WIN32)
#	include <windows.h>
#	if defined(_MSC_VER) || defined(__GNUC__)
#		if defined(WIN32) || defined(_WIN32)
#			define JRI_PUBLIC_API(ResultType)  __declspec(dllexport) ResultType
#			define JRI_PUBLIC_VAR(VarType)	   VarType
#			define JRI_PUBLIC_VAR_EXP(VarType) __declspec(dllexport) VarType
#			define JRI_PUBLIC_VAR_IMP(VarType) __declspec(dllimport) VarType
#			define JRI_NATIVE_STUB(ResultType) __declspec(dllexport) ResultType
#			define JRI_CALLBACK
#		else /* !_WIN32 */
#		    if defined(_WINDLL)
#			define JRI_PUBLIC_API(ResultType)	ResultType __cdecl __export __loadds 
#			define JRI_PUBLIC_VAR(VarType)		VarType
#			define JRI_PUBLIC_VAR_EXP(VarType)	JRI_PUBLIC_VAR(VarType)
#			define JRI_PUBLIC_VAR_IMP(VarType)	JRI_PUBLIC_VAR(VarType)
#			define JRI_NATIVE_STUB(ResultType)	ResultType __cdecl __loadds
#			define JRI_CALLBACK			__loadds
#		else /* !WINDLL */
#			define JRI_PUBLIC_API(ResultType)	ResultType __cdecl __export
#			define JRI_PUBLIC_VAR(VarType)		VarType
#			define JRI_PUBLIC_VAR_EXP(VarType)	JRI_PUBLIC_VAR(VarType)
#			define JRI_PUBLIC_VAR_IMP(VarType)	JRI_PUBLIC_VAR(VarType)
#			define JRI_NATIVE_STUB(ResultType)	ResultType __cdecl __export
#			define JRI_CALLBACK			__export
#                   endif /* !WINDLL */
#		endif /* !_WIN32 */
#	elif defined(__BORLANDC__)
#		if defined(WIN32) || defined(_WIN32)
#			define JRI_PUBLIC_API(ResultType)	__export ResultType
#			define JRI_PUBLIC_VAR(VarType)		VarType
#			define JRI_PUBLIC_VAR_EXP(VarType)	__export VarType
#			define JRI_PUBLIC_VAR_IMP(VarType)	__import VarType
#			define JRI_NATIVE_STUB(ResultType)	 __export ResultType
#			define JRI_CALLBACK
#		else /* !_WIN32 */
#			define JRI_PUBLIC_API(ResultType)	ResultType _cdecl _export _loadds 
#			define JRI_PUBLIC_VAR(VarType)		VarType
#			define JRI_PUBLIC_VAR_EXP(VarType)	__cdecl __export VarType
#			define JRI_PUBLIC_VAR_IMP(VarType)	__cdecl __import VarType
#			define JRI_NATIVE_STUB(ResultType)	ResultType _cdecl _loadds
#			define JRI_CALLBACK			_loadds
#		endif
#	else
#		error Unsupported PC development environment.	
#	endif
#	ifndef IS_LITTLE_ENDIAN
#		define IS_LITTLE_ENDIAN
#	endif

/* OS/2 */
#elif defined(XP_OS2)
#	ifdef XP_OS2_VACPP
#		define JRI_PUBLIC_API(ResultType)	ResultType _Optlink
#		define JRI_PUBLIC_VAR(VarType)		VarType
#     		define JRI_CALLBACK
#	elif defined(__declspec)
#		define JRI_PUBLIC_API(ResultType)  	__declspec(dllexport) ResultType
#		define JRI_PUBLIC_VAR(VarType)	   	VarType
#		define JRI_PUBLIC_VAR_EXP(VarType) 	__declspec(dllexport) VarType
#		define JRI_PUBLIC_VAR_IMP(VarType) 	__declspec(dllimport) VarType
#		define JRI_NATIVE_STUB(ResultType) 	__declspec(dllexport) ResultType
#		define JRI_CALLBACK
#	else
#		define JRI_PUBLIC_API(ResultType)	ResultType
#		define JRI_PUBLIC_VAR(VarType)		VarType
#		define JRI_CALLBACK
#	endif

/* Mac */
#elif defined (macintosh) || Macintosh || THINK_C
#	if defined(__MWERKS__)				/* Metrowerks */
#		if !__option(enumsalwaysint)
#			error You need to define 'Enums Always Int' for your project.
#		endif
#		if defined(TARGET_CPU_68K) && !TARGET_RT_MAC_CFM 
#			if !__option(fourbyteints) 
#				error You need to define 'Struct Alignment: 68k' for your project.
#			endif
#		endif /* !GENERATINGCFM */
#		define JRI_PUBLIC_API(ResultType)	__declspec(export) ResultType
#		define JRI_PUBLIC_VAR(VarType)		JRI_PUBLIC_API(VarType)
#		define JRI_PUBLIC_VAR_EXP(VarType)	JRI_PUBLIC_API(VarType)
#		define JRI_PUBLIC_VAR_IMP(VarType)	JRI_PUBLIC_API(VarType)
#		define JRI_NATIVE_STUB(ResultType)	JRI_PUBLIC_API(ResultType)
#	elif defined(__SC__)				/* Symantec */
#		error What are the Symantec defines? (warren@netscape.com)
#	elif macintosh && applec			/* MPW */
#		error Please upgrade to the latest MPW compiler (SC).
#	else
#		error Unsupported Mac development environment.
#	endif
#	define JRI_CALLBACK

/* Unix or else */
#else
#	define JRI_PUBLIC_API(ResultType)		ResultType
#   define JRI_PUBLIC_VAR(VarType)          VarType
#   define JRI_PUBLIC_VAR_EXP(VarType)		JRI_PUBLIC_VAR(VarType)
#   define JRI_PUBLIC_VAR_IMP(VarType)		JRI_PUBLIC_VAR(VarType)
#   define JRI_NATIVE_STUB(ResultType)		ResultType
#	define JRI_CALLBACK
#endif

#ifndef FAR		/* for non-Win16 */
#define FAR
#endif

/******************************************************************************/

/* Java Scalar Types */

#if 0	/* now in jni.h */
typedef short			jchar;
typedef short			jshort;
typedef float			jfloat;
typedef double			jdouble;
typedef juint			jsize;
#endif

/* moved from jni.h -- Sun's new jni.h doesn't have this anymore */
#ifdef __cplusplus
typedef class _jobject *jref;
#else
typedef struct _jobject *jref;
#endif

typedef unsigned char	jbool;
typedef signed char	jbyte;
#ifdef IS_64 /* XXX ok for alpha, but not right on all 64-bit architectures */
typedef unsigned int	juint;
typedef int				jint;
#else
typedef unsigned long	juint;
typedef long			jint;
#endif

/*******************************************************************************
 * jlong : long long (64-bit signed integer type) support.
 ******************************************************************************/

/*
** Bit masking macros.  (n must be <= 31 to be portable)
*/
#define JRI_BIT(n)			((juint)1 << (n))
#define JRI_BITMASK(n)		(JRI_BIT(n) - 1)

#ifdef HAVE_LONG_LONG

#ifdef OSF1

/* long is default 64-bit on OSF1, -std1 does not allow long long */
typedef long                  jlong;
typedef unsigned long         julong;
#define jlong_MAXINT          0x7fffffffffffffffL
#define jlong_MININT          0x8000000000000000L
#define jlong_ZERO            0x0L

#elif (defined(WIN32) || defined(_WIN32))

typedef LONGLONG              jlong;
typedef DWORDLONG             julong;
#define jlong_MAXINT          0x7fffffffffffffffi64
#define jlong_MININT          0x8000000000000000i64
#define jlong_ZERO            0x0i64

#else

typedef long long             jlong;
typedef unsigned long long    julong;
#define jlong_MAXINT          0x7fffffffffffffffLL
#define jlong_MININT          0x8000000000000000LL
#define jlong_ZERO            0x0LL

#endif

#define jlong_IS_ZERO(a)	((a) == 0)
#define jlong_EQ(a, b)		((a) == (b))
#define jlong_NE(a, b)		((a) != (b))
#define jlong_GE_ZERO(a)	((a) >= 0)
#define jlong_CMP(a, op, b)	((a) op (b))

#define jlong_AND(r, a, b)	((r) = (a) & (b))
#define jlong_OR(r, a, b)	((r) = (a) | (b))
#define jlong_XOR(r, a, b)	((r) = (a) ^ (b))
#define jlong_OR2(r, a)		((r) = (r) | (a))
#define jlong_NOT(r, a)		((r) = ~(a))

#define jlong_NEG(r, a)		((r) = -(a))
#define jlong_ADD(r, a, b)	((r) = (a) + (b))
#define jlong_SUB(r, a, b)	((r) = (a) - (b))

#define jlong_MUL(r, a, b)	((r) = (a) * (b))
#define jlong_DIV(r, a, b)	((r) = (a) / (b))
#define jlong_MOD(r, a, b)	((r) = (a) % (b))

#define jlong_SHL(r, a, b)	((r) = (a) << (b))
#define jlong_SHR(r, a, b)	((r) = (a) >> (b))
#define jlong_USHR(r, a, b)	((r) = (julong)(a) >> (b))
#define jlong_ISHL(r, a, b)	((r) = ((jlong)(a)) << (b))

#define jlong_L2I(i, l)		((i) = (int)(l))
#define jlong_L2UI(ui, l)	((ui) =(unsigned int)(l))
#define jlong_L2F(f, l)		((f) = (l))
#define jlong_L2D(d, l)		((d) = (l))

#define jlong_I2L(l, i)		((l) = (i))
#define jlong_UI2L(l, ui)	((l) = (ui))
#define jlong_F2L(l, f)		((l) = (f))
#define jlong_D2L(l, d)		((l) = (d))

#define jlong_UDIVMOD(qp, rp, a, b)  \
    (*(qp) = ((julong)(a) / (b)), \
     *(rp) = ((julong)(a) % (b)))

#else  /* !HAVE_LONG_LONG */

typedef struct {
#ifdef IS_LITTLE_ENDIAN
    juint lo, hi;
#else
    juint hi, lo;
#endif
} jlong;
typedef jlong				julong;

extern jlong jlong_MAXINT, jlong_MININT, jlong_ZERO;

#define jlong_IS_ZERO(a)	(((a).hi == 0) && ((a).lo == 0))
#define jlong_EQ(a, b)		(((a).hi == (b).hi) && ((a).lo == (b).lo))
#define jlong_NE(a, b)		(((a).hi != (b).hi) || ((a).lo != (b).lo))
#define jlong_GE_ZERO(a)	(((a).hi >> 31) == 0)

/*
 * NB: jlong_CMP and jlong_UCMP work only for strict relationals (<, >).
 */
#define jlong_CMP(a, op, b)	(((int32)(a).hi op (int32)(b).hi) ||          \
				 (((a).hi == (b).hi) && ((a).lo op (b).lo)))
#define jlong_UCMP(a, op, b)	(((a).hi op (b).hi) ||                    \
				 (((a).hi == (b).hi) && ((a).lo op (b).lo)))

#define jlong_AND(r, a, b)	((r).lo = (a).lo & (b).lo,                    \
				 (r).hi = (a).hi & (b).hi)
#define jlong_OR(r, a, b)	((r).lo = (a).lo | (b).lo,                    \
				 (r).hi = (a).hi | (b).hi)
#define jlong_XOR(r, a, b)	((r).lo = (a).lo ^ (b).lo,                    \
				 (r).hi = (a).hi ^ (b).hi)
#define jlong_OR2(r, a)		((r).lo = (r).lo | (a).lo,                    \
				 (r).hi = (r).hi | (a).hi)
#define jlong_NOT(r, a)		((r).lo = ~(a).lo,	                          \
				 (r).hi = ~(a).hi)

#define jlong_NEG(r, a)		((r).lo = -(int32)(a).lo,                     \
				 (r).hi = -(int32)(a).hi - ((r).lo != 0))
#define jlong_ADD(r, a, b) {                                              \
    jlong _a, _b;                                                         \
    _a = a; _b = b;                                                       \
    (r).lo = _a.lo + _b.lo;                                               \
    (r).hi = _a.hi + _b.hi + ((r).lo < _b.lo);                            \
}

#define jlong_SUB(r, a, b) {                                              \
    jlong _a, _b;                                                         \
    _a = a; _b = b;                                                       \
    (r).lo = _a.lo - _b.lo;                                               \
    (r).hi = _a.hi - _b.hi - (_a.lo < _b.lo);                             \
}                                                                         \

/*
 * Multiply 64-bit operands a and b to get 64-bit result r.
 * First multiply the low 32 bits of a and b to get a 64-bit result in r.
 * Then add the outer and inner products to r.hi.
 */
#define jlong_MUL(r, a, b) {                                              \
    jlong _a, _b;                                                         \
    _a = a; _b = b;                                                       \
    jlong_MUL32(r, _a.lo, _b.lo);                                         \
    (r).hi += _a.hi * _b.lo + _a.lo * _b.hi;                              \
}

/* XXX _jlong_lo16(a) = ((a) << 16 >> 16) is better on some archs (not on mips) */
#define _jlong_lo16(a)		((a) & JRI_BITMASK(16))
#define _jlong_hi16(a)		((a) >> 16)

/*
 * Multiply 32-bit operands a and b to get 64-bit result r.
 * Use polynomial expansion based on primitive field element (1 << 16).
 */
#define jlong_MUL32(r, a, b) {                                            \
     juint _a1, _a0, _b1, _b0, _y0, _y1, _y2, _y3;                        \
     _a1 = _jlong_hi16(a), _a0 = _jlong_lo16(a);                          \
     _b1 = _jlong_hi16(b), _b0 = _jlong_lo16(b);                          \
     _y0 = _a0 * _b0;                                                     \
     _y1 = _a0 * _b1;                                                     \
     _y2 = _a1 * _b0;                                                     \
     _y3 = _a1 * _b1;                                                     \
     _y1 += _jlong_hi16(_y0);                   /* can't carry */         \
     _y1 += _y2;                                /* might carry */         \
     if (_y1 < _y2) _y3 += 1 << 16;             /* propagate */           \
     (r).lo = (_jlong_lo16(_y1) << 16) + _jlong_lo16(_y0);                \
     (r).hi = _y3 + _jlong_hi16(_y1);                                     \
}

/*
 * Divide 64-bit unsigned operand a by 64-bit unsigned operand b, setting *qp
 * to the 64-bit unsigned quotient, and *rp to the 64-bit unsigned remainder.
 * Minimize effort if one of qp and rp is null.
 */
#define jlong_UDIVMOD(qp, rp, a, b)	jlong_udivmod(qp, rp, a, b)

extern JRI_PUBLIC_API(void)
jlong_udivmod(julong *qp, julong *rp, julong a, julong b);

#define jlong_DIV(r, a, b) {                                              \
    jlong _a, _b;                                                         \
    juint _negative = (int32)(a).hi < 0;                                  \
    if (_negative) {                                                      \
	jlong_NEG(_a, a);                                                     \
    } else {                                                              \
	_a = a;                                                               \
    }                                                                     \
    if ((int32)(b).hi < 0) {                                              \
	_negative ^= 1;                                                       \
	jlong_NEG(_b, b);                                                     \
    } else {                                                              \
	_b = b;                                                               \
    }                                                                     \
    jlong_UDIVMOD(&(r), 0, _a, _b);                                       \
    if (_negative)                                                        \
	jlong_NEG(r, r);                                                      \
}

#define jlong_MOD(r, a, b) {                                              \
    jlong _a, _b;                                                         \
    juint _negative = (int32)(a).hi < 0;                                  \
    if (_negative) {                                                      \
	jlong_NEG(_a, a);                                                     \
    } else {                                                              \
	_a = a;                                                               \
    }                                                                     \
    if ((int32)(b).hi < 0) {                                              \
	jlong_NEG(_b, b);                                                     \
    } else {                                                              \
	_b = b;                                                               \
    }                                                                     \
    jlong_UDIVMOD(0, &(r), _a, _b);                                       \
    if (_negative)                                                        \
	jlong_NEG(r, r);                                                      \
}

/*
 * NB: b is a juint, not jlong or julong, for the shift ops.
 */
#define jlong_SHL(r, a, b) {                                              \
    if (b) {                                                              \
	jlong _a;                                                             \
        _a = a;                                                           \
        if ((b) < 32) {                                                   \
	    (r).lo = _a.lo << (b);                                            \
	    (r).hi = (_a.hi << (b)) | (_a.lo >> (32 - (b)));                  \
	} else {                                                              \
	    (r).lo = 0;                                                       \
	    (r).hi = _a.lo << ((b) & 31);                                     \
	}                                                                     \
    } else {                                                              \
	(r) = (a);                                                            \
    }                                                                     \
}

/* a is an int32, b is int32, r is jlong */
#define jlong_ISHL(r, a, b) {                                             \
    if (b) {                                                              \
	jlong _a;                                                             \
	_a.lo = (a);                                                          \
	_a.hi = 0;                                                            \
        if ((b) < 32) {                                                   \
	    (r).lo = (a) << (b);                                              \
	    (r).hi = ((a) >> (32 - (b)));                                     \
	} else {                                                              \
	    (r).lo = 0;                                                       \
	    (r).hi = (a) << ((b) & 31);                                       \
	}                                                                     \
    } else {                                                              \
	(r).lo = (a);                                                         \
	(r).hi = 0;                                                           \
    }                                                                     \
}

#define jlong_SHR(r, a, b) {                                              \
    if (b) {                                                              \
	jlong _a;                                                             \
        _a = a;                                                           \
	if ((b) < 32) {                                                       \
	    (r).lo = (_a.hi << (32 - (b))) | (_a.lo >> (b));                  \
	    (r).hi = (int32)_a.hi >> (b);                                     \
	} else {                                                              \
	    (r).lo = (int32)_a.hi >> ((b) & 31);                              \
	    (r).hi = (int32)_a.hi >> 31;                                      \
	}                                                                     \
    } else {                                                              \
	(r) = (a);                                                            \
    }                                                                     \
}

#define jlong_USHR(r, a, b) {                                             \
    if (b) {                                                              \
	jlong _a;                                                             \
        _a = a;                                                           \
	if ((b) < 32) {                                                       \
	    (r).lo = (_a.hi << (32 - (b))) | (_a.lo >> (b));                  \
	    (r).hi = _a.hi >> (b);                                            \
	} else {                                                              \
	    (r).lo = _a.hi >> ((b) & 31);                                     \
	    (r).hi = 0;                                                       \
	}                                                                     \
    } else {                                                              \
	(r) = (a);                                                            \
    }                                                                     \
}

#define jlong_L2I(i, l)		((i) = (l).lo)
#define jlong_L2UI(ui, l)	((ui) = (l).lo)
#define jlong_L2F(f, l)		{ double _d; jlong_L2D(_d, l); (f) = (float) _d; }

#define jlong_L2D(d, l) {                                                 \
    int32 _negative;                                                      \
    jlong _absval;                                                        \
                                                                          \
    _negative = (l).hi >> 31;                                             \
    if (_negative) {                                                      \
	jlong_NEG(_absval, l);                                                \
    } else {                                                              \
	_absval = l;                                                          \
    }                                                                     \
    (d) = (double)_absval.hi * 4.294967296e9 + _absval.lo;                \
    if (_negative)                                                        \
	(d) = -(d);                                                           \
}

#define jlong_I2L(l, i)		((l).hi = (i) >> 31, (l).lo = (i))
#define jlong_UI2L(l, ui)	((l).hi = 0, (l).lo = (ui))
#define jlong_F2L(l, f)		{ double _d = (double) f; jlong_D2L(l, _d); }

#define jlong_D2L(l, d) {                                                 \
    int _negative;                                                        \
    double _absval, _d_hi;                                                \
    jlong _lo_d;                                                          \
                                                                          \
    _negative = ((d) < 0);                                                \
    _absval = _negative ? -(d) : (d);                                     \
                                                                          \
    (l).hi = (juint)(_absval / 4.294967296e9);                            \
    (l).lo = 0;                                                           \
    jlong_L2D(_d_hi, l);                                                  \
    _absval -= _d_hi;                                                     \
    _lo_d.hi = 0;                                                         \
    if (_absval < 0) {                                                    \
	_lo_d.lo = (juint) -_absval;                                          \
	jlong_SUB(l, l, _lo_d);                                               \
    } else {                                                              \
	_lo_d.lo = (juint) _absval;                                           \
	jlong_ADD(l, l, _lo_d);                                               \
    }                                                                     \
                                                                          \
    if (_negative)                                                        \
	jlong_NEG(l, l);                                                      \
}

#endif /* !HAVE_LONG_LONG */

/******************************************************************************/

#ifdef HAVE_ALIGNED_LONGLONGS
#define JRI_GET_INT64(_t,_addr) ( ((_t).x[0] = ((jint*)(_addr))[0]), \
                              ((_t).x[1] = ((jint*)(_addr))[1]),      \
                              (_t).l )
#define JRI_SET_INT64(_t, _addr, _v) ( (_t).l = (_v),                \
                                   ((jint*)(_addr))[0] = (_t).x[0], \
                                   ((jint*)(_addr))[1] = (_t).x[1] )
#else
#define JRI_GET_INT64(_t,_addr) (*(jlong*)(_addr))
#define JRI_SET_INT64(_t, _addr, _v) (*(jlong*)(_addr) = (_v))
#endif

/* If double's must be aligned on doubleword boundaries then define this */
#ifdef HAVE_ALIGNED_DOUBLES
#define JRI_GET_DOUBLE(_t,_addr) ( ((_t).x[0] = ((jint*)(_addr))[0]), \
                               ((_t).x[1] = ((jint*)(_addr))[1]),      \
                               (_t).d )
#define JRI_SET_DOUBLE(_t, _addr, _v) ( (_t).d = (_v),                \
                                    ((jint*)(_addr))[0] = (_t).x[0], \
                                    ((jint*)(_addr))[1] = (_t).x[1] )
#else
#define JRI_GET_DOUBLE(_t,_addr) (*(jdouble*)(_addr))
#define JRI_SET_DOUBLE(_t, _addr, _v) (*(jdouble*)(_addr) = (_v))
#endif

/******************************************************************************/
#ifdef __cplusplus
}
#endif
#endif /* JRI_MD_H */
/******************************************************************************/
