/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/dom/public/idl/stylesheets/nsIDOMMediaList.idl
 */

#ifndef __gen_nsIDOMMediaList_h__
#define __gen_nsIDOMMediaList_h__


#ifndef __gen_domstubs_h__
#include "domstubs.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMMediaList */
#define NS_IDOMMEDIALIST_IID_STR "9b0c2ed7-111c-4824-adf9-ef0da6dad371"

#define NS_IDOMMEDIALIST_IID \
  {0x9b0c2ed7, 0x111c, 0x4824, \
    { 0xad, 0xf9, 0xef, 0x0d, 0xa6, 0xda, 0xd3, 0x71 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMMediaList : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMMEDIALIST_IID)

  /**
 * The nsIDOMMediaList interface is a datatype for a list of media
 * types in the Document Object Model.
 *
 * For more information on this interface please see
 * http://www.w3.org/TR/DOM-Level-2-Style
 *
 * @status FROZEN
 */
  /* attribute DOMString mediaText; */
  NS_SCRIPTABLE NS_IMETHOD GetMediaText(nsAString & aMediaText) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetMediaText(const nsAString & aMediaText) = 0;

  /* readonly attribute unsigned long length; */
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) = 0;

  /* DOMString item (in unsigned long index); */
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsAString & _retval) = 0;

  /* void deleteMedium (in DOMString oldMedium)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD DeleteMedium(const nsAString & oldMedium) = 0;

  /* void appendMedium (in DOMString newMedium)  raises (DOMException); */
  NS_SCRIPTABLE NS_IMETHOD AppendMedium(const nsAString & newMedium) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMMediaList, NS_IDOMMEDIALIST_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMMEDIALIST \
  NS_SCRIPTABLE NS_IMETHOD GetMediaText(nsAString & aMediaText); \
  NS_SCRIPTABLE NS_IMETHOD SetMediaText(const nsAString & aMediaText); \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength); \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsAString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD DeleteMedium(const nsAString & oldMedium); \
  NS_SCRIPTABLE NS_IMETHOD AppendMedium(const nsAString & newMedium); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMMEDIALIST(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetMediaText(nsAString & aMediaText) { return _to GetMediaText(aMediaText); } \
  NS_SCRIPTABLE NS_IMETHOD SetMediaText(const nsAString & aMediaText) { return _to SetMediaText(aMediaText); } \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return _to GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsAString & _retval) { return _to Item(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteMedium(const nsAString & oldMedium) { return _to DeleteMedium(oldMedium); } \
  NS_SCRIPTABLE NS_IMETHOD AppendMedium(const nsAString & newMedium) { return _to AppendMedium(newMedium); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMMEDIALIST(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetMediaText(nsAString & aMediaText) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMediaText(aMediaText); } \
  NS_SCRIPTABLE NS_IMETHOD SetMediaText(const nsAString & aMediaText) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetMediaText(aMediaText); } \
  NS_SCRIPTABLE NS_IMETHOD GetLength(PRUint32 *aLength) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLength(aLength); } \
  NS_SCRIPTABLE NS_IMETHOD Item(PRUint32 index, nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Item(index, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteMedium(const nsAString & oldMedium) { return !_to ? NS_ERROR_NULL_POINTER : _to->DeleteMedium(oldMedium); } \
  NS_SCRIPTABLE NS_IMETHOD AppendMedium(const nsAString & newMedium) { return !_to ? NS_ERROR_NULL_POINTER : _to->AppendMedium(newMedium); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMMediaList : public nsIDOMMediaList
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMMEDIALIST

  nsDOMMediaList();

private:
  ~nsDOMMediaList();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMMediaList, nsIDOMMediaList)

nsDOMMediaList::nsDOMMediaList()
{
  /* member initializers and constructor code */
}

nsDOMMediaList::~nsDOMMediaList()
{
  /* destructor code */
}

/* attribute DOMString mediaText; */
NS_IMETHODIMP nsDOMMediaList::GetMediaText(nsAString & aMediaText)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMMediaList::SetMediaText(const nsAString & aMediaText)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute unsigned long length; */
NS_IMETHODIMP nsDOMMediaList::GetLength(PRUint32 *aLength)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* DOMString item (in unsigned long index); */
NS_IMETHODIMP nsDOMMediaList::Item(PRUint32 index, nsAString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void deleteMedium (in DOMString oldMedium)  raises (DOMException); */
NS_IMETHODIMP nsDOMMediaList::DeleteMedium(const nsAString & oldMedium)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void appendMedium (in DOMString newMedium)  raises (DOMException); */
NS_IMETHODIMP nsDOMMediaList::AppendMedium(const nsAString & newMedium)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMMediaList_h__ */
