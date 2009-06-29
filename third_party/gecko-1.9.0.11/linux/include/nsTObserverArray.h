/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
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
 * The Original Code is Mozilla.org code.
 *
 * The Initial Developer of the Original Code is Mozilla Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Jonas Sicking <jonas@sicking.cc> (Original Author)
 *   Daniel Witte <dwitte@stanford.edu>
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

#ifndef nsTObserverArray_h___
#define nsTObserverArray_h___

#include "nsTArray.h"

class NS_COM_GLUE nsTObserverArray_base {
  public:
    typedef PRUint32 index_type;
    typedef PRUint32 size_type;
    typedef PRInt32  diff_type;

  protected:
    class Iterator_base {
      protected:
        friend class nsTObserverArray_base;

        Iterator_base(index_type aPosition, Iterator_base* aNext)
          : mPosition(aPosition),
            mNext(aNext) {
        }

        // The current position of the iterator. Its exact meaning differs
        // depending on iterator. See nsTObserverArray<T>::ForwardIterator.
        index_type mPosition;

        // The next iterator currently iterating the same array
        Iterator_base* mNext;
    };

    nsTObserverArray_base()
      : mIterators(nsnull) {
    }

    ~nsTObserverArray_base() {
      NS_ASSERTION(mIterators == nsnull, "iterators outlasting array");
    }

    /**
     * Adjusts iterators after an element has been inserted or removed
     * from the array.
     * @param modPos     Position where elements were added or removed.
     * @param adjustment -1 if an element was removed, 1 if an element was
     *                   added.
     */
    void AdjustIterators(index_type aModPos, diff_type aAdjustment);

    /**
     * Clears iterators when the array is destroyed.
     */
    void ClearIterators();

    mutable Iterator_base* mIterators;
};

/**
 * An array of observers. Like a normal array, but supports iterators that are
 * stable even if the array is modified during iteration.
 * The template parameter T is the observer type the array will hold;
 * N is the number of built-in storage slots that come with the array.
 * NOTE: You probably want to use nsTObserverArray, unless you specifically
 * want built-in storage. See below.
 * @see nsTObserverArray, nsTArray
 */

template<class T, PRUint32 N>
class nsAutoTObserverArray : protected nsTObserverArray_base {
  public:
    typedef T           elem_type;
    typedef nsTArray<T> array_type;

    nsAutoTObserverArray() {
    }

    //
    // Accessor methods
    //

    // @return The number of elements in the array.
    size_type Length() const {
      return mArray.Length();
    }

    // @return True if the array is empty or false otherwise.
    PRBool IsEmpty() const {
      return mArray.IsEmpty();
    }

    // This method provides direct access to the i'th element of the array.
    // The given index must be within the array bounds.
    // @param i  The index of an element in the array.
    // @return   A reference to the i'th element of the array.
    elem_type& ElementAt(index_type i) {
      return mArray.ElementAt(i);
    }

    // Same as above, but readonly.
    const elem_type& ElementAt(index_type i) const {
      return mArray.ElementAt(i);
    }

    // This method provides direct access to the i'th element of the array in
    // a bounds safe manner. If the requested index is out of bounds the
    // provided default value is returned.
    // @param i  The index of an element in the array.
    // @param def The value to return if the index is out of bounds.
    elem_type& SafeElementAt(index_type i, elem_type& def) {
      return mArray.SafeElementAt(i, def);
    }

    // Same as above, but readonly.
    const elem_type& SafeElementAt(index_type i, const elem_type& def) const {
      return mArray.SafeElementAt(i, def);
    }

    //
    // Search methods
    //

    // This method searches, starting from the beginning of the array,
    // for the first element in this array that is equal to the given element.
    // 'operator==' must be defined for elem_type.
    // @param item   The item to search for.
    // @return       PR_TRUE if the element was found.
    template<class Item>
    PRBool Contains(const Item& item) const {
      return IndexOf(item) != array_type::NoIndex;
    }

    // This method searches for the offset of the first element in this
    // array that is equal to the given element.
    // 'operator==' must be defined for elem_type.
    // @param item   The item to search for.
    // @param start  The index to start from.
    // @return       The index of the found element or NoIndex if not found.
    template<class Item>
    index_type IndexOf(const Item& item, index_type start = 0) const {
      return mArray.IndexOf(item, start);
    }

    //
    // Mutation methods
    //

    // Prepend an element to the array unless it already exists in the array.
    // 'operator==' must be defined for elem_type.
    // @param item   The item to prepend.
    // @return       PR_TRUE if the element was found, or inserted successfully.
    template<class Item>
    PRBool PrependElementUnlessExists(const Item& item) {
      return Contains(item) || mArray.InsertElementAt(0, item) != nsnull;
    }

    // Append an element to the array.
    // @param item   The item to append.
    // @return A pointer to the newly appended element, or null on OOM.
    template<class Item>
    elem_type* AppendElement(const Item& item) {
      return mArray.AppendElement(item);
    }

    // Same as above, but without copy-constructing. This is useful to avoid
    // temporaries.
    elem_type* AppendElement() {
      return mArray.AppendElement();
    }

    // Append an element to the array unless it already exists in the array.
    // 'operator==' must be defined for elem_type.
    // @param item   The item to append.
    // @return       PR_TRUE if the element was found, or inserted successfully.
    template<class Item>
    PRBool AppendElementUnlessExists(const Item& item) {
      return Contains(item) || AppendElement(item) != nsnull;
    }

    // Remove an element from the array.
    // @param index  The index of the item to remove.
    void RemoveElementAt(index_type index) {
      NS_ASSERTION(index < mArray.Length(), "invalid index");
      mArray.RemoveElementAt(index);
      AdjustIterators(index, -1);
    }

    // This helper function combines IndexOf with RemoveElementAt to "search
    // and destroy" the first element that is equal to the given element.
    // 'operator==' must be defined for elem_type.
    // @param item  The item to search for.
    // @return PR_TRUE if the element was found and removed.
    template<class Item>
    PRBool RemoveElement(const Item& item) {
      index_type index = mArray.IndexOf(item, 0);
      if (index == array_type::NoIndex)
        return PR_FALSE;

      mArray.RemoveElementAt(index);
      AdjustIterators(index, -1);
      return PR_TRUE;
    }

    // Removes all observers and collapses all iterators to the beginning of
    // the array. The result is that forward iterators will see all elements
    // in the array.
    void Clear() {
      mArray.Clear();
      ClearIterators();
    }

    //
    // Iterators
    //

    // Base class for iterators. Do not use this directly.
    class Iterator : public Iterator_base {
      protected:
        friend class nsAutoTObserverArray;
        typedef nsAutoTObserverArray<T, N> array_type;

        Iterator(index_type aPosition, const array_type& aArray)
          : Iterator_base(aPosition, aArray.mIterators),
            mArray(const_cast<array_type&>(aArray)) {
          aArray.mIterators = this;
        }

        ~Iterator() {
          NS_ASSERTION(mArray.mIterators == this,
                       "Iterators must currently be destroyed in opposite order "
                       "from the construction order. It is suggested that you "
                       "simply put them on the stack");
          mArray.mIterators = mNext;
        }

        // The array we're iterating
        array_type& mArray;
    };

    // Iterates the array forward from beginning to end. mPosition points
    // to the element that will be returned on next call to GetNext.
    // Elements:
    // - prepended to the array during iteration *will not* be traversed
    // - appended during iteration *will* be traversed
    // - removed during iteration *will not* be traversed.
    // @see EndLimitedIterator
    class ForwardIterator : protected Iterator {
      public:
        typedef nsAutoTObserverArray<T, N> array_type;
        typedef Iterator                   base_type;

        ForwardIterator(const array_type& aArray)
          : Iterator(0, aArray) {
        }

        ForwardIterator(const array_type& aArray, index_type aPos)
          : Iterator(aPos, aArray) {
        }

        PRBool operator <(const ForwardIterator& aOther) const {
          NS_ASSERTION(&this->mArray == &aOther.mArray,
                       "not iterating the same array");
          return base_type::mPosition < aOther.mPosition;
        }

        // Returns PR_TRUE if there are more elements to iterate.
        // This must precede a call to GetNext(). If PR_FALSE is
        // returned, GetNext() must not be called.
        PRBool HasMore() const {
          return base_type::mPosition < base_type::mArray.Length();
        }

        // Returns the next element and steps one step. This must
        // be preceded by a call to HasMore().
        // @return The next observer.
        elem_type& GetNext() {
          NS_ASSERTION(HasMore(), "iterating beyond end of array");
          return base_type::mArray.ElementAt(base_type::mPosition++);
        }
    };

    // EndLimitedIterator works like ForwardIterator, but will not iterate new
    // observers appended to the array after the iterator was created.
    class EndLimitedIterator : protected ForwardIterator {
      public:
        typedef nsAutoTObserverArray<T, N> array_type;
        typedef Iterator                   base_type;

        EndLimitedIterator(const array_type& aArray)
          : ForwardIterator(aArray),
            mEnd(aArray, aArray.Length()) {
        }

        // Returns PR_TRUE if there are more elements to iterate.
        // This must precede a call to GetNext(). If PR_FALSE is
        // returned, GetNext() must not be called.
        PRBool HasMore() const {
          return *this < mEnd;
        }

        // Returns the next element and steps one step. This must
        // be preceded by a call to HasMore().
        // @return The next observer.
        elem_type& GetNext() {
          NS_ASSERTION(HasMore(), "iterating beyond end of array");
          return base_type::mArray.ElementAt(base_type::mPosition++);
        }

      private:
        ForwardIterator mEnd;
    };

  protected:
    nsAutoTArray<T, N> mArray;
};

template<class T>
class nsTObserverArray : public nsAutoTObserverArray<T, 0> {
  public:
    typedef nsAutoTObserverArray<T, 0>       base_type;
    typedef nsTObserverArray_base::size_type size_type;

    //
    // Initialization methods
    //

    nsTObserverArray() {}

    // Initialize this array and pre-allocate some number of elements.
    explicit nsTObserverArray(size_type capacity) {
      base_type::mArray.SetCapacity(capacity);
    }
};

// XXXbz I wish I didn't have to pass in the observer type, but I
// don't see a way to get it out of array_.
// Note that this macro only works if the array holds pointers to XPCOM objects.
#define NS_OBSERVER_ARRAY_NOTIFY_OBSERVERS(array_, obstype_, func_, params_) \
  PR_BEGIN_MACRO                                                             \
    nsTObserverArray<obstype_ *>::ForwardIterator iter_(array_);             \
    nsCOMPtr<obstype_> obs_;                                                 \
    while (iter_.HasMore()) {                                                 \
      obs_ = iter_.GetNext();                                                \
      obs_ -> func_ params_ ;                                                \
    }                                                                        \
  PR_END_MACRO

#endif // nsTObserverArray_h___
