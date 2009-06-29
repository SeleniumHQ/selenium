/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/xpcom/io/nsILocalFile.idl
 */

#ifndef __gen_nsILocalFile_h__
#define __gen_nsILocalFile_h__


#ifndef __gen_nsIFile_h__
#include "nsIFile.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
#include "prio.h"
#include "prlink.h"
#include <stdio.h>

/* starting interface:    nsILocalFile */
#define NS_ILOCALFILE_IID_STR "aa610f20-a889-11d3-8c81-000064657374"

#define NS_ILOCALFILE_IID \
  {0xaa610f20, 0xa889, 0x11d3, \
    { 0x8c, 0x81, 0x00, 0x00, 0x64, 0x65, 0x73, 0x74 }}

/**
 * This interface adds methods to nsIFile that are particular to a file
 * that is accessible via the local file system.
 *
 * It follows the same string conventions as nsIFile.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsILocalFile : public nsIFile {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ILOCALFILE_IID)

  /**
     *  initWith[Native]Path
     *
     *  This function will initialize the nsILocalFile object.  Any
     *  internal state information will be reset.  
     *
     *  NOTE: This function has a known bug on the macintosh and
     *  other OSes which do not represent file locations as paths.
     *  If you do use this function, be very aware of this problem!
     *
     *   @param filePath       
     *       A string which specifies a full file path to a 
     *       location.  Relative paths will be treated as an
     *       error (NS_ERROR_FILE_UNRECOGNIZED_PATH).  For 
     *       initWithNativePath, the filePath must be in the native
     *       filesystem charset.
     */
  /* void initWithPath (in AString filePath); */
  NS_SCRIPTABLE NS_IMETHOD InitWithPath(const nsAString & filePath) = 0;

  /* [noscript] void initWithNativePath (in ACString filePath); */
  NS_IMETHOD InitWithNativePath(const nsACString & filePath) = 0;

  /**
     *  initWithFile
     *
     *  Initialize this object with another file
     *
     *   @param aFile
     *       the file this becomes equivalent to
     */
  /* void initWithFile (in nsILocalFile aFile); */
  NS_SCRIPTABLE NS_IMETHOD InitWithFile(nsILocalFile *aFile) = 0;

  /**
     *  followLinks
     *
     *  This attribute will determine if the nsLocalFile will auto
     *  resolve symbolic links.  By default, this value will be false
     *  on all non unix systems.  On unix, this attribute is effectively
     *  a noop.  
     */
  /* attribute PRBool followLinks; */
  NS_SCRIPTABLE NS_IMETHOD GetFollowLinks(PRBool *aFollowLinks) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFollowLinks(PRBool aFollowLinks) = 0;

  /**
     * Return the result of PR_Open on the file.  The caller is
     * responsible for calling PR_Close on the result.
     */
  /* [noscript] PRFileDescStar openNSPRFileDesc (in long flags, in long mode); */
  NS_IMETHOD OpenNSPRFileDesc(PRInt32 flags, PRInt32 mode, PRFileDesc * *_retval) = 0;

  /**
     * Return the result of fopen on the file.  The caller is
     * responsible for calling fclose on the result.
     */
  /* [noscript] FILE openANSIFileDesc (in string mode); */
  NS_IMETHOD OpenANSIFileDesc(const char *mode, FILE * *_retval) = 0;

  /**
     * Return the result of PR_LoadLibrary on the file.  The caller is
     * responsible for calling PR_UnloadLibrary on the result.
     */
  /* [noscript] PRLibraryStar load (); */
  NS_IMETHOD Load(PRLibrary * *_retval) = 0;

  /* readonly attribute PRInt64 diskSpaceAvailable; */
  NS_SCRIPTABLE NS_IMETHOD GetDiskSpaceAvailable(PRInt64 *aDiskSpaceAvailable) = 0;

  /**
     *  appendRelative[Native]Path
     *
     *  Append a relative path to the current path of the nsILocalFile object.
     *
     *   @param relativeFilePath
     *       relativeFilePath is a native relative path. For security reasons,
     *       this cannot contain .. or cannot start with a directory separator.
     *       For the |appendRelativeNativePath| method, the relativeFilePath 
     *       must be in the native filesystem charset.
     */
  /* void appendRelativePath (in AString relativeFilePath); */
  NS_SCRIPTABLE NS_IMETHOD AppendRelativePath(const nsAString & relativeFilePath) = 0;

  /* [noscript] void appendRelativeNativePath (in ACString relativeFilePath); */
  NS_IMETHOD AppendRelativeNativePath(const nsACString & relativeFilePath) = 0;

  /**
     *  Accessor to a null terminated string which will specify
     *  the file in a persistent manner for disk storage.
     *
     *  The character set of this attribute is undefined.  DO NOT TRY TO
     *  INTERPRET IT AS HUMAN READABLE TEXT!
     */
  /* attribute ACString persistentDescriptor; */
  NS_SCRIPTABLE NS_IMETHOD GetPersistentDescriptor(nsACString & aPersistentDescriptor) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetPersistentDescriptor(const nsACString & aPersistentDescriptor) = 0;

  /** 
     *  reveal
     *
     *  Ask the operating system to open the folder which contains
     *  this file or folder. This routine only works on platforms which 
     *  support the ability to open a folder...
     */
  /* void reveal (); */
  NS_SCRIPTABLE NS_IMETHOD Reveal(void) = 0;

  /** 
     *  launch
     *
     *  Ask the operating system to attempt to open the file. 
     *  this really just simulates "double clicking" the file on your platform.
     *  This routine only works on platforms which support this functionality.
     */
  /* void launch (); */
  NS_SCRIPTABLE NS_IMETHOD Launch(void) = 0;

  /**
     *  getRelativeDescriptor
     *
     *  Returns a relative file path in an opaque, XP format. It is therefore
     *  not a native path.
     *
     *  The character set of the string returned from this function is
     *  undefined.  DO NOT TRY TO INTERPRET IT AS HUMAN READABLE TEXT!
     *
     *   @param fromFile
     *       the file from which the descriptor is relative.
     *       There is no defined result if this param is null.
     */
  /* ACString getRelativeDescriptor (in nsILocalFile fromFile); */
  NS_SCRIPTABLE NS_IMETHOD GetRelativeDescriptor(nsILocalFile *fromFile, nsACString & _retval) = 0;

  /**
     *  setRelativeDescriptor
     *
     *  Initializes the file to the location relative to fromFile using
     *  a string returned by getRelativeDescriptor.
     *
     *   @param fromFile
     *       the file to which the descriptor is relative
     *   @param relative
     *       the relative descriptor obtained from getRelativeDescriptor
     */
  /* void setRelativeDescriptor (in nsILocalFile fromFile, in ACString relativeDesc); */
  NS_SCRIPTABLE NS_IMETHOD SetRelativeDescriptor(nsILocalFile *fromFile, const nsACString & relativeDesc) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsILocalFile, NS_ILOCALFILE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSILOCALFILE \
  NS_SCRIPTABLE NS_IMETHOD InitWithPath(const nsAString & filePath); \
  NS_IMETHOD InitWithNativePath(const nsACString & filePath); \
  NS_SCRIPTABLE NS_IMETHOD InitWithFile(nsILocalFile *aFile); \
  NS_SCRIPTABLE NS_IMETHOD GetFollowLinks(PRBool *aFollowLinks); \
  NS_SCRIPTABLE NS_IMETHOD SetFollowLinks(PRBool aFollowLinks); \
  NS_IMETHOD OpenNSPRFileDesc(PRInt32 flags, PRInt32 mode, PRFileDesc * *_retval); \
  NS_IMETHOD OpenANSIFileDesc(const char *mode, FILE * *_retval); \
  NS_IMETHOD Load(PRLibrary * *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetDiskSpaceAvailable(PRInt64 *aDiskSpaceAvailable); \
  NS_SCRIPTABLE NS_IMETHOD AppendRelativePath(const nsAString & relativeFilePath); \
  NS_IMETHOD AppendRelativeNativePath(const nsACString & relativeFilePath); \
  NS_SCRIPTABLE NS_IMETHOD GetPersistentDescriptor(nsACString & aPersistentDescriptor); \
  NS_SCRIPTABLE NS_IMETHOD SetPersistentDescriptor(const nsACString & aPersistentDescriptor); \
  NS_SCRIPTABLE NS_IMETHOD Reveal(void); \
  NS_SCRIPTABLE NS_IMETHOD Launch(void); \
  NS_SCRIPTABLE NS_IMETHOD GetRelativeDescriptor(nsILocalFile *fromFile, nsACString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD SetRelativeDescriptor(nsILocalFile *fromFile, const nsACString & relativeDesc); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSILOCALFILE(_to) \
  NS_SCRIPTABLE NS_IMETHOD InitWithPath(const nsAString & filePath) { return _to InitWithPath(filePath); } \
  NS_IMETHOD InitWithNativePath(const nsACString & filePath) { return _to InitWithNativePath(filePath); } \
  NS_SCRIPTABLE NS_IMETHOD InitWithFile(nsILocalFile *aFile) { return _to InitWithFile(aFile); } \
  NS_SCRIPTABLE NS_IMETHOD GetFollowLinks(PRBool *aFollowLinks) { return _to GetFollowLinks(aFollowLinks); } \
  NS_SCRIPTABLE NS_IMETHOD SetFollowLinks(PRBool aFollowLinks) { return _to SetFollowLinks(aFollowLinks); } \
  NS_IMETHOD OpenNSPRFileDesc(PRInt32 flags, PRInt32 mode, PRFileDesc * *_retval) { return _to OpenNSPRFileDesc(flags, mode, _retval); } \
  NS_IMETHOD OpenANSIFileDesc(const char *mode, FILE * *_retval) { return _to OpenANSIFileDesc(mode, _retval); } \
  NS_IMETHOD Load(PRLibrary * *_retval) { return _to Load(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetDiskSpaceAvailable(PRInt64 *aDiskSpaceAvailable) { return _to GetDiskSpaceAvailable(aDiskSpaceAvailable); } \
  NS_SCRIPTABLE NS_IMETHOD AppendRelativePath(const nsAString & relativeFilePath) { return _to AppendRelativePath(relativeFilePath); } \
  NS_IMETHOD AppendRelativeNativePath(const nsACString & relativeFilePath) { return _to AppendRelativeNativePath(relativeFilePath); } \
  NS_SCRIPTABLE NS_IMETHOD GetPersistentDescriptor(nsACString & aPersistentDescriptor) { return _to GetPersistentDescriptor(aPersistentDescriptor); } \
  NS_SCRIPTABLE NS_IMETHOD SetPersistentDescriptor(const nsACString & aPersistentDescriptor) { return _to SetPersistentDescriptor(aPersistentDescriptor); } \
  NS_SCRIPTABLE NS_IMETHOD Reveal(void) { return _to Reveal(); } \
  NS_SCRIPTABLE NS_IMETHOD Launch(void) { return _to Launch(); } \
  NS_SCRIPTABLE NS_IMETHOD GetRelativeDescriptor(nsILocalFile *fromFile, nsACString & _retval) { return _to GetRelativeDescriptor(fromFile, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetRelativeDescriptor(nsILocalFile *fromFile, const nsACString & relativeDesc) { return _to SetRelativeDescriptor(fromFile, relativeDesc); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSILOCALFILE(_to) \
  NS_SCRIPTABLE NS_IMETHOD InitWithPath(const nsAString & filePath) { return !_to ? NS_ERROR_NULL_POINTER : _to->InitWithPath(filePath); } \
  NS_IMETHOD InitWithNativePath(const nsACString & filePath) { return !_to ? NS_ERROR_NULL_POINTER : _to->InitWithNativePath(filePath); } \
  NS_SCRIPTABLE NS_IMETHOD InitWithFile(nsILocalFile *aFile) { return !_to ? NS_ERROR_NULL_POINTER : _to->InitWithFile(aFile); } \
  NS_SCRIPTABLE NS_IMETHOD GetFollowLinks(PRBool *aFollowLinks) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFollowLinks(aFollowLinks); } \
  NS_SCRIPTABLE NS_IMETHOD SetFollowLinks(PRBool aFollowLinks) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFollowLinks(aFollowLinks); } \
  NS_IMETHOD OpenNSPRFileDesc(PRInt32 flags, PRInt32 mode, PRFileDesc * *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->OpenNSPRFileDesc(flags, mode, _retval); } \
  NS_IMETHOD OpenANSIFileDesc(const char *mode, FILE * *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->OpenANSIFileDesc(mode, _retval); } \
  NS_IMETHOD Load(PRLibrary * *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Load(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetDiskSpaceAvailable(PRInt64 *aDiskSpaceAvailable) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDiskSpaceAvailable(aDiskSpaceAvailable); } \
  NS_SCRIPTABLE NS_IMETHOD AppendRelativePath(const nsAString & relativeFilePath) { return !_to ? NS_ERROR_NULL_POINTER : _to->AppendRelativePath(relativeFilePath); } \
  NS_IMETHOD AppendRelativeNativePath(const nsACString & relativeFilePath) { return !_to ? NS_ERROR_NULL_POINTER : _to->AppendRelativeNativePath(relativeFilePath); } \
  NS_SCRIPTABLE NS_IMETHOD GetPersistentDescriptor(nsACString & aPersistentDescriptor) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPersistentDescriptor(aPersistentDescriptor); } \
  NS_SCRIPTABLE NS_IMETHOD SetPersistentDescriptor(const nsACString & aPersistentDescriptor) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPersistentDescriptor(aPersistentDescriptor); } \
  NS_SCRIPTABLE NS_IMETHOD Reveal(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Reveal(); } \
  NS_SCRIPTABLE NS_IMETHOD Launch(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Launch(); } \
  NS_SCRIPTABLE NS_IMETHOD GetRelativeDescriptor(nsILocalFile *fromFile, nsACString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRelativeDescriptor(fromFile, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetRelativeDescriptor(nsILocalFile *fromFile, const nsACString & relativeDesc) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetRelativeDescriptor(fromFile, relativeDesc); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsLocalFile : public nsILocalFile
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSILOCALFILE

  nsLocalFile();

private:
  ~nsLocalFile();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsLocalFile, nsILocalFile)

nsLocalFile::nsLocalFile()
{
  /* member initializers and constructor code */
}

nsLocalFile::~nsLocalFile()
{
  /* destructor code */
}

/* void initWithPath (in AString filePath); */
NS_IMETHODIMP nsLocalFile::InitWithPath(const nsAString & filePath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] void initWithNativePath (in ACString filePath); */
NS_IMETHODIMP nsLocalFile::InitWithNativePath(const nsACString & filePath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void initWithFile (in nsILocalFile aFile); */
NS_IMETHODIMP nsLocalFile::InitWithFile(nsILocalFile *aFile)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute PRBool followLinks; */
NS_IMETHODIMP nsLocalFile::GetFollowLinks(PRBool *aFollowLinks)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsLocalFile::SetFollowLinks(PRBool aFollowLinks)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] PRFileDescStar openNSPRFileDesc (in long flags, in long mode); */
NS_IMETHODIMP nsLocalFile::OpenNSPRFileDesc(PRInt32 flags, PRInt32 mode, PRFileDesc * *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] FILE openANSIFileDesc (in string mode); */
NS_IMETHODIMP nsLocalFile::OpenANSIFileDesc(const char *mode, FILE * *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] PRLibraryStar load (); */
NS_IMETHODIMP nsLocalFile::Load(PRLibrary * *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute PRInt64 diskSpaceAvailable; */
NS_IMETHODIMP nsLocalFile::GetDiskSpaceAvailable(PRInt64 *aDiskSpaceAvailable)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void appendRelativePath (in AString relativeFilePath); */
NS_IMETHODIMP nsLocalFile::AppendRelativePath(const nsAString & relativeFilePath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] void appendRelativeNativePath (in ACString relativeFilePath); */
NS_IMETHODIMP nsLocalFile::AppendRelativeNativePath(const nsACString & relativeFilePath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute ACString persistentDescriptor; */
NS_IMETHODIMP nsLocalFile::GetPersistentDescriptor(nsACString & aPersistentDescriptor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsLocalFile::SetPersistentDescriptor(const nsACString & aPersistentDescriptor)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void reveal (); */
NS_IMETHODIMP nsLocalFile::Reveal()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void launch (); */
NS_IMETHODIMP nsLocalFile::Launch()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* ACString getRelativeDescriptor (in nsILocalFile fromFile); */
NS_IMETHODIMP nsLocalFile::GetRelativeDescriptor(nsILocalFile *fromFile, nsACString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void setRelativeDescriptor (in nsILocalFile fromFile, in ACString relativeDesc); */
NS_IMETHODIMP nsLocalFile::SetRelativeDescriptor(nsILocalFile *fromFile, const nsACString & relativeDesc)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsILocalFile_h__ */
