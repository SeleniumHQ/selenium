/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/xpcom/ds/nsIMutableArray.idl
 */

#ifndef __gen_nsIMutableArray_h__
#define __gen_nsIMutableArray_h__


#ifndef __gen_nsIArray_h__
#include "nsIArray.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIMutableArray */
#define NS_IMUTABLEARRAY_IID_STR "af059da0-c85b-40ec-af07-ae4bfdc192cc"

#define NS_IMUTABLEARRAY_IID \
  {0xaf059da0, 0xc85b, 0x40ec, \
    { 0xaf, 0x07, 0xae, 0x4b, 0xfd, 0xc1, 0x92, 0xcc }}

/**
 * nsIMutableArray
 * A separate set of methods that will act on the array. Consumers of
 * nsIArray should not QueryInterface to nsIMutableArray unless they
 * own the array.
 *
 * As above, it is legal to add null elements to the array. Note also
 * that null elements can be created as a side effect of
 * insertElementAt(). Conversely, if insertElementAt() is never used,
 * and null elements are never explicitly added to the array, then it
 * is guaranteed that queryElementAt() will never return a null value.
 *
 * Any of these methods may throw NS_ERROR_OUT_OF_MEMORY when the
 * array must grow to complete the call, but the allocation fails.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIMutableArray : public nsIArray {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IMUTABLEARRAY_IID)

  /**
     * appendElement()
     * 
     * Append an element at the end of the array.
     *
     * @param element The element to append.
     * @param weak    Whether or not to store the element using a weak
     *                reference.
     * @throws NS_ERROR_FAILURE when a weak reference is requested,
     *                          but the element does not support
     *                          nsIWeakReference.
     */
  /* void appendElement (in nsISupports element, in boolean weak); */
  NS_SCRIPTABLE NS_IMETHOD AppendElement(nsISupports *element, PRBool weak) = 0;

  /**
     * removeElementAt()
     * 
     * Remove an element at a specific position, moving all elements
     * stored at a higher position down one.
     * To remove a specific element, use indexOf() to find the index
     * first, then call removeElementAt().
     *
     * @param index the position of the item
     *
     */
  /* void removeElementAt (in unsigned long index); */
  NS_SCRIPTABLE NS_IMETHOD RemoveElementAt(PRUint32 index) = 0;

  /**
     * insertElementAt()
     *
     * Insert an element at the given position, moving the element 
     * currently located in that position, and all elements in higher
     * position, up by one.
     *
     * @param element The element to insert
     * @param index   The position in the array:
     *                If the position is lower than the current length
     *                of the array, the elements at that position and
     *                onwards are bumped one position up.
     *                If the position is equal to the current length
     *                of the array, the new element is appended.
     *                An index lower than 0 or higher than the current
     *                length of the array is invalid and will be ignored.
     *
     * @throws NS_ERROR_FAILURE when a weak reference is requested,
     *                          but the element does not support
     *                          nsIWeakReference.
     */
  /* void insertElementAt (in nsISupports element, in unsigned long index, in boolean weak); */
  NS_SCRIPTABLE NS_IMETHOD InsertElementAt(nsISupports *element, PRUint32 index, PRBool weak) = 0;

  /**
     * replaceElementAt()
     *
     * Replace the element at the given position.
     *
     * @param element The new element to insert
     * @param index   The position in the array
     *                If the position is lower than the current length
     *                of the array, an existing element will be replaced.
     *                If the position is equal to the current length
     *                of the array, the new element is appended.
     *                If the position is higher than the current length
     *                of the array, empty elements are appended followed
     *                by the new element at the specified position.
     *                An index lower than 0 is invalid and will be ignored.
     *
     * @param weak    Whether or not to store the new element using a weak
     *                reference.
     *
     * @throws NS_ERROR_FAILURE when a weak reference is requested,
     *                          but the element does not support
     *                          nsIWeakReference.
     */
  /* void replaceElementAt (in nsISupports element, in unsigned long index, in boolean weak); */
  NS_SCRIPTABLE NS_IMETHOD ReplaceElementAt(nsISupports *element, PRUint32 index, PRBool weak) = 0;

  /**
     * clear()
     *
     * clear the entire array, releasing all stored objects
     */
  /* void clear (); */
  NS_SCRIPTABLE NS_IMETHOD Clear(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIMutableArray, NS_IMUTABLEARRAY_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIMUTABLEARRAY \
  NS_SCRIPTABLE NS_IMETHOD AppendElement(nsISupports *element, PRBool weak); \
  NS_SCRIPTABLE NS_IMETHOD RemoveElementAt(PRUint32 index); \
  NS_SCRIPTABLE NS_IMETHOD InsertElementAt(nsISupports *element, PRUint32 index, PRBool weak); \
  NS_SCRIPTABLE NS_IMETHOD ReplaceElementAt(nsISupports *element, PRUint32 index, PRBool weak); \
  NS_SCRIPTABLE NS_IMETHOD Clear(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIMUTABLEARRAY(_to) \
  NS_SCRIPTABLE NS_IMETHOD AppendElement(nsISupports *element, PRBool weak) { return _to AppendElement(element, weak); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveElementAt(PRUint32 index) { return _to RemoveElementAt(index); } \
  NS_SCRIPTABLE NS_IMETHOD InsertElementAt(nsISupports *element, PRUint32 index, PRBool weak) { return _to InsertElementAt(element, index, weak); } \
  NS_SCRIPTABLE NS_IMETHOD ReplaceElementAt(nsISupports *element, PRUint32 index, PRBool weak) { return _to ReplaceElementAt(element, index, weak); } \
  NS_SCRIPTABLE NS_IMETHOD Clear(void) { return _to Clear(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIMUTABLEARRAY(_to) \
  NS_SCRIPTABLE NS_IMETHOD AppendElement(nsISupports *element, PRBool weak) { return !_to ? NS_ERROR_NULL_POINTER : _to->AppendElement(element, weak); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveElementAt(PRUint32 index) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveElementAt(index); } \
  NS_SCRIPTABLE NS_IMETHOD InsertElementAt(nsISupports *element, PRUint32 index, PRBool weak) { return !_to ? NS_ERROR_NULL_POINTER : _to->InsertElementAt(element, index, weak); } \
  NS_SCRIPTABLE NS_IMETHOD ReplaceElementAt(nsISupports *element, PRUint32 index, PRBool weak) { return !_to ? NS_ERROR_NULL_POINTER : _to->ReplaceElementAt(element, index, weak); } \
  NS_SCRIPTABLE NS_IMETHOD Clear(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Clear(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsMutableArray : public nsIMutableArray
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIMUTABLEARRAY

  nsMutableArray();

private:
  ~nsMutableArray();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsMutableArray, nsIMutableArray)

nsMutableArray::nsMutableArray()
{
  /* member initializers and constructor code */
}

nsMutableArray::~nsMutableArray()
{
  /* destructor code */
}

/* void appendElement (in nsISupports element, in boolean weak); */
NS_IMETHODIMP nsMutableArray::AppendElement(nsISupports *element, PRBool weak)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void removeElementAt (in unsigned long index); */
NS_IMETHODIMP nsMutableArray::RemoveElementAt(PRUint32 index)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void insertElementAt (in nsISupports element, in unsigned long index, in boolean weak); */
NS_IMETHODIMP nsMutableArray::InsertElementAt(nsISupports *element, PRUint32 index, PRBool weak)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void replaceElementAt (in nsISupports element, in unsigned long index, in boolean weak); */
NS_IMETHODIMP nsMutableArray::ReplaceElementAt(nsISupports *element, PRUint32 index, PRBool weak)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void clear (); */
NS_IMETHODIMP nsMutableArray::Clear()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIMutableArray_h__ */
