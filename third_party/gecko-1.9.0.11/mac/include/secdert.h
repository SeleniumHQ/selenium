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

#ifndef _SECDERT_H_
#define _SECDERT_H_
/*
 * secdert.h - public data structures for the DER encoding and
 *	       decoding utilities library
 *
 * $Id: secdert.h,v 1.5 2007/10/12 01:44:51 julien.pierre.boogz%sun.com Exp $
 */

#include "utilrename.h"
#include "seccomon.h"

typedef struct DERTemplateStr DERTemplate;

/*
** An array of these structures defines an encoding for an object using DER.
** The array usually starts with a dummy entry whose kind is DER_SEQUENCE;
** such an array is terminated with an entry where kind == 0.  (An array
** which consists of a single component does not require a second dummy
** entry -- the array is only searched as long as previous component(s)
** instruct it.)
*/
struct DERTemplateStr {
    /*
    ** Kind of item being decoded/encoded, including tags and modifiers.
    */
    unsigned long kind;

    /*
    ** Offset from base of structure to field that holds the value
    ** being decoded/encoded.
    */
    unsigned int offset;

    /*
    ** When kind suggests it (DER_POINTER, DER_INDEFINITE, DER_INLINE),
    ** this points to a sub-template for nested encoding/decoding.
    */
    DERTemplate *sub;

    /*
    ** Argument value, dependent on "kind" and/or template placement
    ** within an array of templates:
    **	- In the first element of a template array, the value is the
    **	  size of the structure to allocate when this template is being
    **	  referenced by another template via DER_POINTER or DER_INDEFINITE.
    **  - In a component of a DER_SET or DER_SEQUENCE which is *not* a
    **	  DER_UNIVERSAL type (that is, it has a class tag for either
    **	  DER_APPLICATION, DER_CONTEXT_SPECIFIC, or DER_PRIVATE), the
    **	  value is the underlying type of item being decoded/encoded.
    */
    unsigned long arg;
};

/************************************************************************/

/* default chunksize for arenas used for DER stuff */
#define DER_DEFAULT_CHUNKSIZE (2048)

/*
** BER/DER values for ASN.1 identifier octets.
*/
#define DER_TAG_MASK		0xff

/*
 * BER/DER universal type tag numbers.
 * The values are defined by the X.208 standard; do not change them!
 * NOTE: if you add anything to this list, you must add code to derdec.c
 * to accept the tag, and probably also to derenc.c to encode it.
 */
#define DER_TAGNUM_MASK		0x1f
#define DER_BOOLEAN		0x01
#define DER_INTEGER		0x02
#define DER_BIT_STRING		0x03
#define DER_OCTET_STRING	0x04
#define DER_NULL		0x05
#define DER_OBJECT_ID		0x06
#define DER_SEQUENCE		0x10
#define DER_SET			0x11
#define DER_PRINTABLE_STRING	0x13
#define DER_T61_STRING		0x14
#define DER_IA5_STRING		0x16
#define DER_UTC_TIME		0x17
#define DER_VISIBLE_STRING	0x1a
#define DER_HIGH_TAG_NUMBER	0x1f

/*
** Modifiers to type tags.  These are also specified by a/the
** standard, and must not be changed.
*/

#define DER_METHOD_MASK		0x20
#define DER_PRIMITIVE		0x00
#define DER_CONSTRUCTED		0x20

#define DER_CLASS_MASK		0xc0
#define DER_UNIVERSAL		0x00
#define DER_APPLICATION		0x40
#define DER_CONTEXT_SPECIFIC	0x80
#define DER_PRIVATE		0xc0

/*
** Our additions, used for templates.
** These are not defined by any standard; the values are used internally only.
** Just be careful to keep them out of the low 8 bits.
*/
#define DER_OPTIONAL		0x00100
#define DER_EXPLICIT		0x00200
#define DER_ANY			0x00400
#define DER_INLINE		0x00800
#define DER_POINTER		0x01000
#define DER_INDEFINITE		0x02000
#define DER_DERPTR		0x04000
#define DER_SKIP		0x08000
#define DER_FORCE		0x10000
#define DER_OUTER		0x40000 /* for DER_DERPTR */

/*
** Macro to convert der decoded bit string into a decoded octet
** string. All it needs to do is fiddle with the length code.
*/
#define DER_ConvertBitString(item)	  \
{					  \
    (item)->len = ((item)->len + 7) >> 3; \
}

#endif /* _SECDERT_H_ */
