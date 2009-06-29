/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/security/manager/ssl/public/nsIASN1Sequence.idl
 */

#ifndef __gen_nsIASN1Sequence_h__
#define __gen_nsIASN1Sequence_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

#ifndef __gen_nsIASN1Object_h__
#include "nsIASN1Object.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsIMutableArray; /* forward declaration */


/* starting interface:    nsIASN1Sequence */
#define NS_IASN1SEQUENCE_IID_STR "b6b957e6-1dd1-11b2-89d7-e30624f50b00"

#define NS_IASN1SEQUENCE_IID \
  {0xb6b957e6, 0x1dd1, 0x11b2, \
    { 0x89, 0xd7, 0xe3, 0x06, 0x24, 0xf5, 0x0b, 0x00 }}

/**
 * This represents a sequence of ASN.1 objects,
 * where ASN.1 is "Abstract Syntax Notation number One".
 *
 * Overview of how this ASN1 interface is intended to
 * work.
 *
 * First off, the nsIASN1Sequence is any type in ASN1
 * that consists of sub-elements (ie SEQUENCE, SET)
 * nsIASN1Printable Items are all the other types that
 * can be viewed by themselves without interpreting further.
 * Examples would include INTEGER, UTF-8 STRING, OID.
 * These are not intended to directly reflect the numberous
 * types that exist in ASN1, but merely an interface to ease
 * producing a tree display the ASN1 structure of any DER
 * object.
 *
 * The additional state information carried in this interface
 * makes it fit for being used as the data structure
 * when working with visual reprenstation of ASN.1 objects
 * in a human user interface, like in a tree widget
 * where open/close state of nodes must be remembered.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIASN1Sequence : public nsIASN1Object {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IASN1SEQUENCE_IID)

  /**
   *  The array of objects stored in the sequence.
   */
  /* attribute nsIMutableArray ASN1Objects; */
  NS_SCRIPTABLE NS_IMETHOD GetASN1Objects(nsIMutableArray * *aASN1Objects) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetASN1Objects(nsIMutableArray * aASN1Objects) = 0;

  /**
   *  Whether the node at this position in the ASN.1 data structure
   *  sequence contains sub elements understood by the
   *  application.
   */
  /* attribute boolean isValidContainer; */
  NS_SCRIPTABLE NS_IMETHOD GetIsValidContainer(PRBool *aIsValidContainer) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetIsValidContainer(PRBool aIsValidContainer) = 0;

  /**
   *  Whether the contained objects should be shown or hidden.
   *  A UI implementation can use this flag to store the current
   *  expansion state when shown in a tree widget.
   */
  /* attribute boolean isExpanded; */
  NS_SCRIPTABLE NS_IMETHOD GetIsExpanded(PRBool *aIsExpanded) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetIsExpanded(PRBool aIsExpanded) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIASN1Sequence, NS_IASN1SEQUENCE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIASN1SEQUENCE \
  NS_SCRIPTABLE NS_IMETHOD GetASN1Objects(nsIMutableArray * *aASN1Objects); \
  NS_SCRIPTABLE NS_IMETHOD SetASN1Objects(nsIMutableArray * aASN1Objects); \
  NS_SCRIPTABLE NS_IMETHOD GetIsValidContainer(PRBool *aIsValidContainer); \
  NS_SCRIPTABLE NS_IMETHOD SetIsValidContainer(PRBool aIsValidContainer); \
  NS_SCRIPTABLE NS_IMETHOD GetIsExpanded(PRBool *aIsExpanded); \
  NS_SCRIPTABLE NS_IMETHOD SetIsExpanded(PRBool aIsExpanded); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIASN1SEQUENCE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetASN1Objects(nsIMutableArray * *aASN1Objects) { return _to GetASN1Objects(aASN1Objects); } \
  NS_SCRIPTABLE NS_IMETHOD SetASN1Objects(nsIMutableArray * aASN1Objects) { return _to SetASN1Objects(aASN1Objects); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsValidContainer(PRBool *aIsValidContainer) { return _to GetIsValidContainer(aIsValidContainer); } \
  NS_SCRIPTABLE NS_IMETHOD SetIsValidContainer(PRBool aIsValidContainer) { return _to SetIsValidContainer(aIsValidContainer); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsExpanded(PRBool *aIsExpanded) { return _to GetIsExpanded(aIsExpanded); } \
  NS_SCRIPTABLE NS_IMETHOD SetIsExpanded(PRBool aIsExpanded) { return _to SetIsExpanded(aIsExpanded); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIASN1SEQUENCE(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetASN1Objects(nsIMutableArray * *aASN1Objects) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetASN1Objects(aASN1Objects); } \
  NS_SCRIPTABLE NS_IMETHOD SetASN1Objects(nsIMutableArray * aASN1Objects) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetASN1Objects(aASN1Objects); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsValidContainer(PRBool *aIsValidContainer) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIsValidContainer(aIsValidContainer); } \
  NS_SCRIPTABLE NS_IMETHOD SetIsValidContainer(PRBool aIsValidContainer) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetIsValidContainer(aIsValidContainer); } \
  NS_SCRIPTABLE NS_IMETHOD GetIsExpanded(PRBool *aIsExpanded) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIsExpanded(aIsExpanded); } \
  NS_SCRIPTABLE NS_IMETHOD SetIsExpanded(PRBool aIsExpanded) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetIsExpanded(aIsExpanded); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsASN1Sequence : public nsIASN1Sequence
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIASN1SEQUENCE

  nsASN1Sequence();

private:
  ~nsASN1Sequence();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsASN1Sequence, nsIASN1Sequence)

nsASN1Sequence::nsASN1Sequence()
{
  /* member initializers and constructor code */
}

nsASN1Sequence::~nsASN1Sequence()
{
  /* destructor code */
}

/* attribute nsIMutableArray ASN1Objects; */
NS_IMETHODIMP nsASN1Sequence::GetASN1Objects(nsIMutableArray * *aASN1Objects)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsASN1Sequence::SetASN1Objects(nsIMutableArray * aASN1Objects)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean isValidContainer; */
NS_IMETHODIMP nsASN1Sequence::GetIsValidContainer(PRBool *aIsValidContainer)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsASN1Sequence::SetIsValidContainer(PRBool aIsValidContainer)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean isExpanded; */
NS_IMETHODIMP nsASN1Sequence::GetIsExpanded(PRBool *aIsExpanded)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsASN1Sequence::SetIsExpanded(PRBool aIsExpanded)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIASN1Sequence_h__ */
