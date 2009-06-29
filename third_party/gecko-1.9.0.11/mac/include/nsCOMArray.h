/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
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
 * The Original Code is a COM aware array class.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corp.
 * Portions created by the Initial Developer are Copyright (C) 2002
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Alec Flett <alecf@netscape.com>
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

#ifndef nsCOMArray_h__
#define nsCOMArray_h__

#include "nsVoidArray.h"
#include "nsISupports.h"

// See below for the definition of nsCOMArray<T>

// a class that's nsISupports-specific, so that we can contain the
// work of this class in the XPCOM dll
class NS_COM_GLUE nsCOMArray_base
{
    friend class nsArray;
protected:
    nsCOMArray_base() {}
    nsCOMArray_base(PRInt32 aCount) : mArray(aCount) {}
    nsCOMArray_base(const nsCOMArray_base& other);
    ~nsCOMArray_base();

    PRInt32 IndexOf(nsISupports* aObject) const {
        return mArray.IndexOf(aObject);
    }

    PRInt32 IndexOfObject(nsISupports* aObject) const;

    PRBool EnumerateForwards(nsVoidArrayEnumFunc aFunc, void* aData) {
        return mArray.EnumerateForwards(aFunc, aData);
    }
    
    PRBool EnumerateBackwards(nsVoidArrayEnumFunc aFunc, void* aData) {
        return mArray.EnumerateBackwards(aFunc, aData);
    }
    
    void Sort(nsVoidArrayComparatorFunc aFunc, void* aData) {
        mArray.Sort(aFunc, aData);
    }
    
    // any method which is not a direct forward to mArray should
    // avoid inline bodies, so that the compiler doesn't inline them
    // all over the place
    void Clear();
    PRBool InsertObjectAt(nsISupports* aObject, PRInt32 aIndex);
    PRBool InsertObjectsAt(const nsCOMArray_base& aObjects, PRInt32 aIndex);
    PRBool ReplaceObjectAt(nsISupports* aObject, PRInt32 aIndex);
    PRBool AppendObject(nsISupports *aObject) {
        return InsertObjectAt(aObject, Count());
    }
    PRBool AppendObjects(const nsCOMArray_base& aObjects) {
        return InsertObjectsAt(aObjects, Count());
    }
    PRBool RemoveObject(nsISupports *aObject);
    PRBool RemoveObjectAt(PRInt32 aIndex);

public:
    // override nsVoidArray stuff so that they can be accessed by
    // consumers of nsCOMArray
    PRInt32 Count() const {
        return mArray.Count();
    }

    nsISupports* ObjectAt(PRInt32 aIndex) const {
        return static_cast<nsISupports*>(mArray.FastElementAt(aIndex));
    }
    
    nsISupports* SafeObjectAt(PRInt32 aIndex) const {
        return static_cast<nsISupports*>(mArray.SafeElementAt(aIndex));
    }

    nsISupports* operator[](PRInt32 aIndex) const {
        return ObjectAt(aIndex);
    }

    // Ensures there is enough space to store a total of aCapacity objects.
    // This method never deletes any objects.
    PRBool SetCapacity(PRUint32 aCapacity) {
      return aCapacity > 0 ? mArray.SizeTo(static_cast<PRInt32>(aCapacity))
                           : PR_TRUE;
    }

private:
    
    // the actual storage
    nsVoidArray mArray;

    // don't implement these, defaults will muck with refcounts!
    nsCOMArray_base& operator=(const nsCOMArray_base& other);
};

// a non-XPCOM, refcounting array of XPCOM objects
// used as a member variable or stack variable - this object is NOT
// refcounted, but the objects that it holds are
//
// most of the read-only accessors like ObjectAt()/etc do NOT refcount
// on the way out. This means that you can do one of two things:
//
// * does an addref, but holds onto a reference
// nsCOMPtr<T> foo = array[i];
//
// * avoids the refcount, but foo might go stale if array[i] is ever
// * modified/removed. Be careful not to NS_RELEASE(foo)!
// T* foo = array[i];
//
// This array will accept null as an argument for any object, and will
// store null in the array, just like nsVoidArray. But that also means
// that methods like ObjectAt() may return null when referring to an
// existing, but null entry in the array.
template <class T>
class nsCOMArray : public nsCOMArray_base
{
 public:
    nsCOMArray() {}
    nsCOMArray(PRInt32 aCount) : nsCOMArray_base(aCount) {}
    
    // only to be used by trusted classes who are going to pass us the
    // right type!
    nsCOMArray(const nsCOMArray<T>& aOther) : nsCOMArray_base(aOther) { }

    ~nsCOMArray() {}

    // these do NOT refcount on the way out, for speed
    T* ObjectAt(PRInt32 aIndex) const {
        return static_cast<T*>(nsCOMArray_base::ObjectAt(aIndex));
    }

    // these do NOT refcount on the way out, for speed
    T* SafeObjectAt(PRInt32 aIndex) const {
        return static_cast<T*>(nsCOMArray_base::SafeObjectAt(aIndex));
    }

    // indexing operator for syntactic sugar
    T* operator[](PRInt32 aIndex) const {
        return ObjectAt(aIndex);
    }

    // index of the element in question.. does NOT refcount
    // note: this does not check COM object identity. Use
    // IndexOfObject() for that purpose
    PRInt32 IndexOf(T* aObject) const {
        return nsCOMArray_base::IndexOf(static_cast<nsISupports*>(aObject));
    }

    // index of the element in question.. be careful!
    // this is much slower than IndexOf() because it uses
    // QueryInterface to determine actual COM identity of the object
    // if you need to do this frequently then consider enforcing
    // COM object identity before adding/comparing elements
    PRInt32 IndexOfObject(T* aObject) const {
        return nsCOMArray_base::IndexOfObject(static_cast<nsISupports*>(aObject));
    }

    // inserts aObject at aIndex, shifting the objects at aIndex and
    // later to make space
    PRBool InsertObjectAt(T* aObject, PRInt32 aIndex) {
        return nsCOMArray_base::InsertObjectAt(static_cast<nsISupports*>(aObject), aIndex);
    }

    // inserts the objects from aObject at aIndex, shifting the
    // objects at aIndex and later to make space
    PRBool InsertObjectsAt(const nsCOMArray<T>& aObjects, PRInt32 aIndex) {
        return nsCOMArray_base::InsertObjectsAt(aObjects, aIndex);
    }

    // replaces an existing element. Warning: if the array grows,
    // the newly created entries will all be null
    PRBool ReplaceObjectAt(T* aObject, PRInt32 aIndex) {
        return nsCOMArray_base::ReplaceObjectAt(static_cast<nsISupports*>(aObject), aIndex);
    }

    // override nsVoidArray stuff so that they can be accessed by
    // other methods

    // elements in the array (including null elements!)
    PRInt32 Count() const {
        return nsCOMArray_base::Count();
    }

    // remove all elements in the array, and call NS_RELEASE on each one
    void Clear() {
        nsCOMArray_base::Clear();
    }

    // Enumerator callback function. Return PR_FALSE to stop
    // Here's a more readable form:
    // PRBool PR_CALLBACK enumerate(T* aElement, void* aData)
    typedef PRBool (* PR_CALLBACK nsCOMArrayEnumFunc)
        (T* aElement, void *aData);
    
    // enumerate through the array with a callback. 
    PRBool EnumerateForwards(nsCOMArrayEnumFunc aFunc, void* aData) {
        return nsCOMArray_base::EnumerateForwards(nsVoidArrayEnumFunc(aFunc),
                                                  aData);
    }

    PRBool EnumerateBackwards(nsCOMArrayEnumFunc aFunc, void* aData) {
        return nsCOMArray_base::EnumerateBackwards(nsVoidArrayEnumFunc(aFunc),
                                                  aData);
    }
    
    typedef int (* PR_CALLBACK nsCOMArrayComparatorFunc)
        (T* aElement1, T* aElement2, void* aData);
        
    void Sort(nsCOMArrayComparatorFunc aFunc, void* aData) {
        nsCOMArray_base::Sort(nsVoidArrayComparatorFunc(aFunc), aData);
    }

    // append an object, growing the array as necessary
    PRBool AppendObject(T *aObject) {
        return nsCOMArray_base::AppendObject(static_cast<nsISupports*>(aObject));
    }

    // append objects, growing the array as necessary
    PRBool AppendObjects(const nsCOMArray<T>& aObjects) {
        return nsCOMArray_base::AppendObjects(aObjects);
    }
    
    // remove the first instance of the given object and shrink the
    // array as necessary
    // Warning: if you pass null here, it will remove the first null element
    PRBool RemoveObject(T *aObject) {
        return nsCOMArray_base::RemoveObject(static_cast<nsISupports*>(aObject));
    }

    // remove an element at a specific position, shrinking the array
    // as necessary
    PRBool RemoveObjectAt(PRInt32 aIndex) {
        return nsCOMArray_base::RemoveObjectAt(aIndex);
    }

private:

    // don't implement these!
    nsCOMArray<T>& operator=(const nsCOMArray<T>& other);
};


#endif
