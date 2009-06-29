/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim:set ts=2 sw=2 sts=2 et cindent: */
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
 * The Original Code is C++ pointer array template.
 *
 * The Initial Developer of the Original Code is Mozilla Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Jonas Sicking <jonas@sicking.cc>
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


#ifndef nsTPtrArray_h__
#define nsTPtrArray_h__

#include "nsTArray.h"

//
// The templatized array class for storing pointers. The class is based on
// nsTArray and has all the features of that class, in addition to an
// implementation of SafeElementAt that returns null for out of bounds access
//
template<class E>
class nsTPtrArray : public nsTArray<E*> {
  public:
    typedef nsTPtrArray<E> self_type;
    typedef nsTArray<E*> base_type;
    typedef typename base_type::size_type size_type;
    typedef typename base_type::elem_type elem_type;
    typedef typename base_type::index_type index_type;

    //
    // Initialization methods
    //

    nsTPtrArray() {}

    // Initialize this array and pre-allocate some number of elements.
    explicit nsTPtrArray(size_type capacity) {
      SetCapacity(capacity);
    }
    
    // The array's copy-constructor performs a 'deep' copy of the given array.
    // @param other  The array object to copy.
    nsTPtrArray(const self_type& other) {
      AppendElements(other);
    }

    //
    // Accessor methods
    //

    // Forward SafeElementAt to avoid shadowing (and warnings thereof)
    elem_type& SafeElementAt(index_type i, elem_type& def) {
      return base_type::SafeElementAt(i, def);
    }
    const elem_type& SafeElementAt(index_type i, const elem_type& def) const {
      return base_type::SafeElementAt(i, def);
    }

    // This method provides direct access to the i'th element of the array in
    // a bounds safe manner. If the requested index is out of bounds null is
    // returned.
    // @param i  The index of an element in the array.
    elem_type SafeElementAt(index_type i) const {
      return SafeElementAt(i, nsnull);
    }
};

template<class E, PRUint32 N>
class nsAutoTPtrArray : public nsTPtrArray<E> {
  public:
    typedef nsTPtrArray<E> base_type;
    typedef typename base_type::Header Header;
    typedef typename base_type::elem_type elem_type;

    nsAutoTPtrArray() {
      base_type::mHdr = reinterpret_cast<Header*>(&mAutoBuf);
      base_type::mHdr->mLength = 0;
      base_type::mHdr->mCapacity = N;
      base_type::mHdr->mIsAutoArray = 1;

      NS_ASSERTION(base_type::GetAutoArrayBuffer() ==
                   reinterpret_cast<Header*>(&mAutoBuf),
                   "GetAutoArrayBuffer needs to be fixed");
    }

  protected:
    char mAutoBuf[sizeof(Header) + N * sizeof(elem_type)];
};

#endif  // nsTPtrArray_h__
