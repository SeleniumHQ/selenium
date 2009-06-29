/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/dom/public/idl/core/nsIDOMProcessingInstruction.idl
 */

#ifndef __gen_nsIDOMProcessingInstruction_h__
#define __gen_nsIDOMProcessingInstruction_h__


#ifndef __gen_nsIDOMNode_h__
#include "nsIDOMNode.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIDOMProcessingInstruction */
#define NS_IDOMPROCESSINGINSTRUCTION_IID_STR "a6cf907f-15b3-11d2-932e-00805f8add32"

#define NS_IDOMPROCESSINGINSTRUCTION_IID \
  {0xa6cf907f, 0x15b3, 0x11d2, \
    { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIDOMProcessingInstruction : public nsIDOMNode {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IDOMPROCESSINGINSTRUCTION_IID)

  /**
 * The nsIDOMProcessingInstruction interface represents a 
 * "processing instruction", used in XML as a way to keep processor-specific 
 * information in the text of the document.
 *
 * For more information on this interface please see 
 * http://www.w3.org/TR/DOM-Level-2-Core/
 *
 * @status FROZEN
 */
  /* readonly attribute DOMString target; */
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) = 0;

  /* attribute DOMString data; */
  NS_SCRIPTABLE NS_IMETHOD GetData(nsAString & aData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsAString & aData) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIDOMProcessingInstruction, NS_IDOMPROCESSINGINSTRUCTION_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIDOMPROCESSINGINSTRUCTION \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget); \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsAString & aData); \
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsAString & aData); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIDOMPROCESSINGINSTRUCTION(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) { return _to GetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsAString & aData) { return _to GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsAString & aData) { return _to SetData(aData); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIDOMPROCESSINGINSTRUCTION(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTarget(aTarget); } \
  NS_SCRIPTABLE NS_IMETHOD GetData(nsAString & aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetData(aData); } \
  NS_SCRIPTABLE NS_IMETHOD SetData(const nsAString & aData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetData(aData); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsDOMProcessingInstruction : public nsIDOMProcessingInstruction
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMPROCESSINGINSTRUCTION

  nsDOMProcessingInstruction();

private:
  ~nsDOMProcessingInstruction();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsDOMProcessingInstruction, nsIDOMProcessingInstruction)

nsDOMProcessingInstruction::nsDOMProcessingInstruction()
{
  /* member initializers and constructor code */
}

nsDOMProcessingInstruction::~nsDOMProcessingInstruction()
{
  /* destructor code */
}

/* readonly attribute DOMString target; */
NS_IMETHODIMP nsDOMProcessingInstruction::GetTarget(nsAString & aTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute DOMString data; */
NS_IMETHODIMP nsDOMProcessingInstruction::GetData(nsAString & aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsDOMProcessingInstruction::SetData(const nsAString & aData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIDOMProcessingInstruction_h__ */
