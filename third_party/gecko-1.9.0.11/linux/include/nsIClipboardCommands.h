/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/webshell/public/nsIClipboardCommands.idl
 */

#ifndef __gen_nsIClipboardCommands_h__
#define __gen_nsIClipboardCommands_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIClipboardCommands */
#define NS_ICLIPBOARDCOMMANDS_IID_STR "b8100c90-73be-11d2-92a5-00105a1b0d64"

#define NS_ICLIPBOARDCOMMANDS_IID \
  {0xb8100c90, 0x73be, 0x11d2, \
    { 0x92, 0xa5, 0x00, 0x10, 0x5a, 0x1b, 0x0d, 0x64 }}

/**
 * An interface for embedding clients who wish to interact with
 * the system-wide OS clipboard. Mozilla does not use a private
 * clipboard, instead it places its data directly onto the system 
 * clipboard. The webshell implements this interface.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIClipboardCommands : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ICLIPBOARDCOMMANDS_IID)

  /**
   * Returns whether there is a selection and it is not read-only.
   *
   * @return <code>true</code> if the current selection can be cut,
   *          <code>false</code> otherwise.
   */
  /* boolean canCutSelection (); */
  NS_SCRIPTABLE NS_IMETHOD CanCutSelection(PRBool *_retval) = 0;

  /**
   * Returns whether there is a selection and it is copyable.
   *
   * @return <code>true</code> if there is a selection,
   *          <code>false</code> otherwise.
   */
  /* boolean canCopySelection (); */
  NS_SCRIPTABLE NS_IMETHOD CanCopySelection(PRBool *_retval) = 0;

  /**
   * Returns whether we can copy a link location.
   *
   * @return <code>true</code> if a link is selected,
   *           <code>false</code> otherwise.
   */
  /* boolean canCopyLinkLocation (); */
  NS_SCRIPTABLE NS_IMETHOD CanCopyLinkLocation(PRBool *_retval) = 0;

  /**
   * Returns whether we can copy an image location.
   *
   * @return <code>true</code> if an image is selected,
              <code>false</code> otherwise.
   */
  /* boolean canCopyImageLocation (); */
  NS_SCRIPTABLE NS_IMETHOD CanCopyImageLocation(PRBool *_retval) = 0;

  /**
   * Returns whether we can copy an image's contents.
   *
   * @return <code>true</code> if an image is selected,
   *          <code>false</code> otherwise
   */
  /* boolean canCopyImageContents (); */
  NS_SCRIPTABLE NS_IMETHOD CanCopyImageContents(PRBool *_retval) = 0;

  /**
   * Returns whether the current contents of the clipboard can be
   * pasted and if the current selection is not read-only.
   *
   * @return <code>true</code> there is data to paste on the clipboard
   *          and the current selection is not read-only,
   *          <code>false</code> otherwise
   */
  /* boolean canPaste (); */
  NS_SCRIPTABLE NS_IMETHOD CanPaste(PRBool *_retval) = 0;

  /**
   * Cut the current selection onto the clipboard.
   */
  /* void cutSelection (); */
  NS_SCRIPTABLE NS_IMETHOD CutSelection(void) = 0;

  /**
   * Copy the current selection onto the clipboard.
   */
  /* void copySelection (); */
  NS_SCRIPTABLE NS_IMETHOD CopySelection(void) = 0;

  /**
   * Copy the link location of the current selection (e.g.,
   * the |href| attribute of a selected |a| tag).
   */
  /* void copyLinkLocation (); */
  NS_SCRIPTABLE NS_IMETHOD CopyLinkLocation(void) = 0;

  /**
   * Copy the location of the selected image.
   */
  /* void copyImageLocation (); */
  NS_SCRIPTABLE NS_IMETHOD CopyImageLocation(void) = 0;

  /**
   * Copy the contents of the selected image.
   */
  /* void copyImageContents (); */
  NS_SCRIPTABLE NS_IMETHOD CopyImageContents(void) = 0;

  /**
   * Paste the contents of the clipboard into the current selection.
   */
  /* void paste (); */
  NS_SCRIPTABLE NS_IMETHOD Paste(void) = 0;

  /**
   * Select the entire contents.
   */
  /* void selectAll (); */
  NS_SCRIPTABLE NS_IMETHOD SelectAll(void) = 0;

  /**
   * Clear the current selection (if any). Insertion point ends up
   * at beginning of current selection.
   */
  /* void selectNone (); */
  NS_SCRIPTABLE NS_IMETHOD SelectNone(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIClipboardCommands, NS_ICLIPBOARDCOMMANDS_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSICLIPBOARDCOMMANDS \
  NS_SCRIPTABLE NS_IMETHOD CanCutSelection(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD CanCopySelection(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD CanCopyLinkLocation(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD CanCopyImageLocation(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD CanCopyImageContents(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD CanPaste(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD CutSelection(void); \
  NS_SCRIPTABLE NS_IMETHOD CopySelection(void); \
  NS_SCRIPTABLE NS_IMETHOD CopyLinkLocation(void); \
  NS_SCRIPTABLE NS_IMETHOD CopyImageLocation(void); \
  NS_SCRIPTABLE NS_IMETHOD CopyImageContents(void); \
  NS_SCRIPTABLE NS_IMETHOD Paste(void); \
  NS_SCRIPTABLE NS_IMETHOD SelectAll(void); \
  NS_SCRIPTABLE NS_IMETHOD SelectNone(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSICLIPBOARDCOMMANDS(_to) \
  NS_SCRIPTABLE NS_IMETHOD CanCutSelection(PRBool *_retval) { return _to CanCutSelection(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CanCopySelection(PRBool *_retval) { return _to CanCopySelection(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CanCopyLinkLocation(PRBool *_retval) { return _to CanCopyLinkLocation(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CanCopyImageLocation(PRBool *_retval) { return _to CanCopyImageLocation(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CanCopyImageContents(PRBool *_retval) { return _to CanCopyImageContents(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CanPaste(PRBool *_retval) { return _to CanPaste(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CutSelection(void) { return _to CutSelection(); } \
  NS_SCRIPTABLE NS_IMETHOD CopySelection(void) { return _to CopySelection(); } \
  NS_SCRIPTABLE NS_IMETHOD CopyLinkLocation(void) { return _to CopyLinkLocation(); } \
  NS_SCRIPTABLE NS_IMETHOD CopyImageLocation(void) { return _to CopyImageLocation(); } \
  NS_SCRIPTABLE NS_IMETHOD CopyImageContents(void) { return _to CopyImageContents(); } \
  NS_SCRIPTABLE NS_IMETHOD Paste(void) { return _to Paste(); } \
  NS_SCRIPTABLE NS_IMETHOD SelectAll(void) { return _to SelectAll(); } \
  NS_SCRIPTABLE NS_IMETHOD SelectNone(void) { return _to SelectNone(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSICLIPBOARDCOMMANDS(_to) \
  NS_SCRIPTABLE NS_IMETHOD CanCutSelection(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CanCutSelection(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CanCopySelection(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CanCopySelection(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CanCopyLinkLocation(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CanCopyLinkLocation(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CanCopyImageLocation(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CanCopyImageLocation(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CanCopyImageContents(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CanCopyImageContents(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CanPaste(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CanPaste(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CutSelection(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->CutSelection(); } \
  NS_SCRIPTABLE NS_IMETHOD CopySelection(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->CopySelection(); } \
  NS_SCRIPTABLE NS_IMETHOD CopyLinkLocation(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->CopyLinkLocation(); } \
  NS_SCRIPTABLE NS_IMETHOD CopyImageLocation(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->CopyImageLocation(); } \
  NS_SCRIPTABLE NS_IMETHOD CopyImageContents(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->CopyImageContents(); } \
  NS_SCRIPTABLE NS_IMETHOD Paste(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Paste(); } \
  NS_SCRIPTABLE NS_IMETHOD SelectAll(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->SelectAll(); } \
  NS_SCRIPTABLE NS_IMETHOD SelectNone(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->SelectNone(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsClipboardCommands : public nsIClipboardCommands
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSICLIPBOARDCOMMANDS

  nsClipboardCommands();

private:
  ~nsClipboardCommands();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsClipboardCommands, nsIClipboardCommands)

nsClipboardCommands::nsClipboardCommands()
{
  /* member initializers and constructor code */
}

nsClipboardCommands::~nsClipboardCommands()
{
  /* destructor code */
}

/* boolean canCutSelection (); */
NS_IMETHODIMP nsClipboardCommands::CanCutSelection(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean canCopySelection (); */
NS_IMETHODIMP nsClipboardCommands::CanCopySelection(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean canCopyLinkLocation (); */
NS_IMETHODIMP nsClipboardCommands::CanCopyLinkLocation(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean canCopyImageLocation (); */
NS_IMETHODIMP nsClipboardCommands::CanCopyImageLocation(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean canCopyImageContents (); */
NS_IMETHODIMP nsClipboardCommands::CanCopyImageContents(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean canPaste (); */
NS_IMETHODIMP nsClipboardCommands::CanPaste(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void cutSelection (); */
NS_IMETHODIMP nsClipboardCommands::CutSelection()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void copySelection (); */
NS_IMETHODIMP nsClipboardCommands::CopySelection()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void copyLinkLocation (); */
NS_IMETHODIMP nsClipboardCommands::CopyLinkLocation()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void copyImageLocation (); */
NS_IMETHODIMP nsClipboardCommands::CopyImageLocation()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void copyImageContents (); */
NS_IMETHODIMP nsClipboardCommands::CopyImageContents()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void paste (); */
NS_IMETHODIMP nsClipboardCommands::Paste()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void selectAll (); */
NS_IMETHODIMP nsClipboardCommands::SelectAll()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void selectNone (); */
NS_IMETHODIMP nsClipboardCommands::SelectNone()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIClipboardCommands_h__ */
