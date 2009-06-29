/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
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
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

#ifndef nsID_h__
#define nsID_h__

#include <string.h>

#ifndef nscore_h___
#include "nscore.h"
#endif

#define NSID_LENGTH 39

/**
 * A "unique identifier". This is modeled after OSF DCE UUIDs.
 * @status FROZEN
 */

struct nsID {
  /**
   * @name Identifier values
   */

  //@{
  PRUint32 m0;
  PRUint16 m1;
  PRUint16 m2;
  PRUint8 m3[8];
  //@}

  /**
   * @name Methods
   */

  //@{
  /**
   * Equivalency method. Compares this nsID with another.
   * @return <b>PR_TRUE</b> if they are the same, <b>PR_FALSE</b> if not.
   */

  inline PRBool Equals(const nsID& other) const {
    // One would think that this could be done faster with a really
    // efficient implementation of memcmp(), but evidently no
    // memcmp()'s out there are better than this code.
    //
    // See bug http://bugzilla.mozilla.org/show_bug.cgi?id=164580 for
    // details.

    return
      ((((PRUint32*) &m0)[0] == ((PRUint32*) &other.m0)[0]) &&
       (((PRUint32*) &m0)[1] == ((PRUint32*) &other.m0)[1]) &&
       (((PRUint32*) &m0)[2] == ((PRUint32*) &other.m0)[2]) &&
       (((PRUint32*) &m0)[3] == ((PRUint32*) &other.m0)[3]));
  }

  /**
   * nsID Parsing method. Turns a {xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}
   * string into an nsID
   */
  NS_COM_GLUE PRBool Parse(const char *aIDStr);

#ifndef XPCOM_GLUE_AVOID_NSPR
  /**
   * nsID string encoder. Returns an allocated string in 
   * {xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx} format. Caller should free string.
   * YOU SHOULD ONLY USE THIS IF YOU CANNOT USE ToProvidedString() BELOW.
   */
  NS_COM_GLUE char* ToString() const;

  /**
   * nsID string encoder. Builds a string in 
   * {xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx} format, into a char[NSID_LENGTH]
   * buffer provided by the caller (for instance, on the stack).
   */
  NS_COM_GLUE void ToProvidedString(char (&dest)[NSID_LENGTH]) const;

#endif // XPCOM_GLUE_AVOID_NSPR

  //@}
};

/*
 * Class IDs
 */

typedef nsID nsCID;

// Define an CID
#define NS_DEFINE_CID(_name, _cidspec) \
  const nsCID _name = _cidspec

#define REFNSCID const nsCID&

/**
 * An "interface id" which can be used to uniquely identify a given
 * interface.
 */

typedef nsID nsIID;

/**
 * A macro shorthand for <tt>const nsIID&<tt>
 */

#define REFNSIID const nsIID&

/**
 * Define an IID
 * obsolete - do not use this macro
 */
 
#define NS_DEFINE_IID(_name, _iidspec) \
  const nsIID _name = _iidspec

/**
 * A macro to build the static const IID accessor method. The Dummy
 * template parameter only exists so that the kIID symbol will be linked
 * properly (weak symbol on linux, gnu_linkonce on mac, multiple-definitions
 * merged on windows). Dummy should always be instantiated as "int".
 */

#define NS_DECLARE_STATIC_IID_ACCESSOR(the_iid)                         \
  template <class Dummy>                                                \
  struct COMTypeInfo                                                    \
  {                                                                     \
    static const nsIID kIID NS_HIDDEN;                                  \
  };                                                                    \
  static const nsIID& GetIID() {return COMTypeInfo<int>::kIID;}

#define NS_DEFINE_STATIC_IID_ACCESSOR(the_interface, the_iid)           \
  template <class Dummy>                                                \
  const nsIID the_interface::COMTypeInfo<Dummy>::kIID NS_HIDDEN = the_iid;

/**
 * A macro to build the static const CID accessor method
 */

#define NS_DEFINE_STATIC_CID_ACCESSOR(the_cid) \
  static const nsID& GetCID() {static const nsID cid = the_cid; return cid;}

#define NS_GET_IID(T) (::T::COMTypeInfo<int>::kIID)
#define NS_GET_TEMPLATE_IID(T) (T::template COMTypeInfo<int>::kIID)

#endif
