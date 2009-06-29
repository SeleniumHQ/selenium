/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/xpcom/io/nsIFile.idl
 */

#ifndef __gen_nsIFile_h__
#define __gen_nsIFile_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
class nsISimpleEnumerator; /* forward declaration */


/* starting interface:    nsIFile */
#define NS_IFILE_IID_STR "c8c0a080-0868-11d3-915f-d9d889d48e3c"

#define NS_IFILE_IID \
  {0xc8c0a080, 0x0868, 0x11d3, \
    { 0x91, 0x5f, 0xd9, 0xd8, 0x89, 0xd4, 0x8e, 0x3c }}

/**
 * This is the only correct cross-platform way to specify a file.
 * Strings are not such a way. If you grew up on windows or unix, you
 * may think they are.  Welcome to reality.
 *
 * All methods with string parameters have two forms.  The preferred
 * form operates on UCS-2 encoded characters strings.  An alternate
 * form operates on characters strings encoded in the "native" charset.
 *
 * A string containing characters encoded in the native charset cannot
 * be safely passed to javascript via xpconnect.  Therefore, the "native
 * methods" are not scriptable. 
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIFile : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IFILE_IID)

  /**
     *  Create Types
     *
     *  NORMAL_FILE_TYPE - A normal file.
     *  DIRECTORY_TYPE   - A directory/folder.
     */
  enum { NORMAL_FILE_TYPE = 0U };

  enum { DIRECTORY_TYPE = 1U };

  /**
     *  append[Native]
     *
     *  This function is used for constructing a descendent of the
     *  current nsIFile.
     *
     *   @param node
     *       A string which is intended to be a child node of the nsIFile.
     *       For the |appendNative| method, the node must be in the native
     *       filesystem charset.
     */
  /* void append (in AString node); */
  NS_SCRIPTABLE NS_IMETHOD Append(const nsAString & node) = 0;

  /* [noscript] void appendNative (in ACString node); */
  NS_IMETHOD AppendNative(const nsACString & node) = 0;

  /**
     *  Normalize the pathName (e.g. removing .. and . components on Unix).
     */
  /* void normalize (); */
  NS_SCRIPTABLE NS_IMETHOD Normalize(void) = 0;

  /**
     *  create
     *
     *  This function will create a new file or directory in the
     *  file system. Any nodes that have not been created or
     *  resolved, will be.  If the file or directory already
     *  exists create() will return NS_ERROR_FILE_ALREADY_EXISTS.
     *
     *   @param type
     *       This specifies the type of file system object
     *       to be made.  The only two types at this time
     *       are file and directory which are defined above.
     *       If the type is unrecongnized, we will return an
     *       error (NS_ERROR_FILE_UNKNOWN_TYPE).
     *
     *   @param permissions
     *       The unix style octal permissions.  This may
     *       be ignored on systems that do not need to do
     *       permissions.
     */
  /* void create (in unsigned long type, in unsigned long permissions); */
  NS_SCRIPTABLE NS_IMETHOD Create(PRUint32 type, PRUint32 permissions) = 0;

  /**
     *  Accessor to the leaf name of the file itself.      
     *  For the |nativeLeafName| method, the nativeLeafName must 
     *  be in the native filesystem charset.
     */
  /* attribute AString leafName; */
  NS_SCRIPTABLE NS_IMETHOD GetLeafName(nsAString & aLeafName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetLeafName(const nsAString & aLeafName) = 0;

  /* [noscript] attribute ACString nativeLeafName; */
  NS_IMETHOD GetNativeLeafName(nsACString & aNativeLeafName) = 0;
  NS_IMETHOD SetNativeLeafName(const nsACString & aNativeLeafName) = 0;

  /**
     *  copyTo[Native]
     *
     *  This will copy this file to the specified newParentDir.
     *  If a newName is specified, the file will be renamed.
     *  If 'this' is not created we will return an error
     *  (NS_ERROR_FILE_TARGET_DOES_NOT_EXIST).
     *
     *  copyTo may fail if the file already exists in the destination 
     *  directory.
     *
     *  copyTo will NOT resolve aliases/shortcuts during the copy.
     *
     *   @param newParentDir
     *       This param is the destination directory. If the
     *       newParentDir is null, copyTo() will use the parent
     *       directory of this file. If the newParentDir is not
     *       empty and is not a directory, an error will be
     *       returned (NS_ERROR_FILE_DESTINATION_NOT_DIR). For the 
     *       |CopyToNative| method, the newName must be in the 
     *       native filesystem charset.
     *
     *   @param newName
     *       This param allows you to specify a new name for
     *       the file to be copied. This param may be empty, in
     *       which case the current leaf name will be used.
     */
  /* void copyTo (in nsIFile newParentDir, in AString newName); */
  NS_SCRIPTABLE NS_IMETHOD CopyTo(nsIFile *newParentDir, const nsAString & newName) = 0;

  /* [noscript] void CopyToNative (in nsIFile newParentDir, in ACString newName); */
  NS_IMETHOD CopyToNative(nsIFile *newParentDir, const nsACString & newName) = 0;

  /**
     *  copyToFollowingLinks[Native]
     *
     *  This function is identical to copyTo with the exception that,
     *  as the name implies, it follows symbolic links.  The XP_UNIX
     *  implementation always follow symbolic links when copying.  For 
     *  the |CopyToFollowingLinks| method, the newName must be in the 
     *  native filesystem charset.
     */
  /* void copyToFollowingLinks (in nsIFile newParentDir, in AString newName); */
  NS_SCRIPTABLE NS_IMETHOD CopyToFollowingLinks(nsIFile *newParentDir, const nsAString & newName) = 0;

  /* [noscript] void copyToFollowingLinksNative (in nsIFile newParentDir, in ACString newName); */
  NS_IMETHOD CopyToFollowingLinksNative(nsIFile *newParentDir, const nsACString & newName) = 0;

  /**
     *  moveTo[Native]
     *
     *  A method to move this file or directory to newParentDir.
     *  If a newName is specified, the file or directory will be renamed.
     *  If 'this' is not created we will return an error
     *  (NS_ERROR_FILE_TARGET_DOES_NOT_EXIST).
     *  If 'this' is a file, and the destination file already exists, moveTo
     *  will replace the old file.
     *
     *  moveTo will NOT resolve aliases/shortcuts during the copy.
     *  moveTo will do the right thing and allow copies across volumes.
     *  moveTo will return an error (NS_ERROR_FILE_DIR_NOT_EMPTY) if 'this' is
     *  a directory and the destination directory is not empty.
     *  moveTo will return an error (NS_ERROR_FILE_ACCESS_DENIED) if 'this' is
     *  a directory and the destination directory is not writable.
     *
     *   @param newParentDir
     *       This param is the destination directory. If the
     *       newParentDir is empty, moveTo() will rename the file
     *       within its current directory. If the newParentDir is
     *       not empty and does not name a directory, an error will
     *       be returned (NS_ERROR_FILE_DESTINATION_NOT_DIR).  For 
     *       the |moveToNative| method, the newName must be in the 
     *       native filesystem charset.
     *
     *   @param newName
     *       This param allows you to specify a new name for
     *       the file to be moved. This param may be empty, in
     *       which case the current leaf name will be used.
     */
  /* void moveTo (in nsIFile newParentDir, in AString newName); */
  NS_SCRIPTABLE NS_IMETHOD MoveTo(nsIFile *newParentDir, const nsAString & newName) = 0;

  /* [noscript] void moveToNative (in nsIFile newParentDir, in ACString newName); */
  NS_IMETHOD MoveToNative(nsIFile *newParentDir, const nsACString & newName) = 0;

  /**
     *  This will try to delete this file.  The 'recursive' flag
     *  must be PR_TRUE to delete directories which are not empty.
     *
     *  This will not resolve any symlinks.
     */
  /* void remove (in boolean recursive); */
  NS_SCRIPTABLE NS_IMETHOD Remove(PRBool recursive) = 0;

  /**
     *  Attributes of nsIFile.
     */
  /* attribute unsigned long permissions; */
  NS_SCRIPTABLE NS_IMETHOD GetPermissions(PRUint32 *aPermissions) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetPermissions(PRUint32 aPermissions) = 0;

  /* attribute unsigned long permissionsOfLink; */
  NS_SCRIPTABLE NS_IMETHOD GetPermissionsOfLink(PRUint32 *aPermissionsOfLink) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetPermissionsOfLink(PRUint32 aPermissionsOfLink) = 0;

  /**
     *  File Times are to be in milliseconds from
     *  midnight (00:00:00), January 1, 1970 Greenwich Mean
     *  Time (GMT).
     */
  /* attribute PRInt64 lastModifiedTime; */
  NS_SCRIPTABLE NS_IMETHOD GetLastModifiedTime(PRInt64 *aLastModifiedTime) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetLastModifiedTime(PRInt64 aLastModifiedTime) = 0;

  /* attribute PRInt64 lastModifiedTimeOfLink; */
  NS_SCRIPTABLE NS_IMETHOD GetLastModifiedTimeOfLink(PRInt64 *aLastModifiedTimeOfLink) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetLastModifiedTimeOfLink(PRInt64 aLastModifiedTimeOfLink) = 0;

  /**
     *  WARNING!  On the Mac, getting/setting the file size with nsIFile
     *  only deals with the size of the data fork.  If you need to
     *  know the size of the combined data and resource forks use the
     *  GetFileSizeWithResFork() method defined on nsILocalFileMac.
     */
  /* attribute PRInt64 fileSize; */
  NS_SCRIPTABLE NS_IMETHOD GetFileSize(PRInt64 *aFileSize) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFileSize(PRInt64 aFileSize) = 0;

  /* readonly attribute PRInt64 fileSizeOfLink; */
  NS_SCRIPTABLE NS_IMETHOD GetFileSizeOfLink(PRInt64 *aFileSizeOfLink) = 0;

  /**
     *  target & path
     *
     *  Accessor to the string path.  The native version of these
     *  strings are not guaranteed to be a usable path to pass to
     *  NSPR or the C stdlib.  There are problems that affect
     *  platforms on which a path does not fully specify a file
     *  because two volumes can have the same name (e.g., mac).
     *  This is solved by holding "private", native data in the
     *  nsIFile implementation.  This native data is lost when
     *  you convert to a string.
     *
     *      DO NOT PASS TO USE WITH NSPR OR STDLIB!
     *
     *  target
     *      Find out what the symlink points at.  Will give error
     *      (NS_ERROR_FILE_INVALID_PATH) if not a symlink.
     *
     *  path
     *      Find out what the nsIFile points at.
     *
     *  Note that the ACString attributes are returned in the 
     *  native filesystem charset.
     *
     */
  /* readonly attribute AString target; */
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) = 0;

  /* [noscript] readonly attribute ACString nativeTarget; */
  NS_IMETHOD GetNativeTarget(nsACString & aNativeTarget) = 0;

  /* readonly attribute AString path; */
  NS_SCRIPTABLE NS_IMETHOD GetPath(nsAString & aPath) = 0;

  /* [noscript] readonly attribute ACString nativePath; */
  NS_IMETHOD GetNativePath(nsACString & aNativePath) = 0;

  /* boolean exists (); */
  NS_SCRIPTABLE NS_IMETHOD Exists(PRBool *_retval) = 0;

  /* boolean isWritable (); */
  NS_SCRIPTABLE NS_IMETHOD IsWritable(PRBool *_retval) = 0;

  /* boolean isReadable (); */
  NS_SCRIPTABLE NS_IMETHOD IsReadable(PRBool *_retval) = 0;

  /* boolean isExecutable (); */
  NS_SCRIPTABLE NS_IMETHOD IsExecutable(PRBool *_retval) = 0;

  /* boolean isHidden (); */
  NS_SCRIPTABLE NS_IMETHOD IsHidden(PRBool *_retval) = 0;

  /* boolean isDirectory (); */
  NS_SCRIPTABLE NS_IMETHOD IsDirectory(PRBool *_retval) = 0;

  /* boolean isFile (); */
  NS_SCRIPTABLE NS_IMETHOD IsFile(PRBool *_retval) = 0;

  /* boolean isSymlink (); */
  NS_SCRIPTABLE NS_IMETHOD IsSymlink(PRBool *_retval) = 0;

  /**
     * Not a regular file, not a directory, not a symlink.
     */
  /* boolean isSpecial (); */
  NS_SCRIPTABLE NS_IMETHOD IsSpecial(PRBool *_retval) = 0;

  /**
     *  createUnique
     *  
     *  This function will create a new file or directory in the
     *  file system. Any nodes that have not been created or
     *  resolved, will be.  If this file already exists, we try
     *  variations on the leaf name "suggestedName" until we find
     *  one that did not already exist.
     *
     *  If the search for nonexistent files takes too long
     *  (thousands of the variants already exist), we give up and
     *  return NS_ERROR_FILE_TOO_BIG.
     *
     *   @param type
     *       This specifies the type of file system object
     *       to be made.  The only two types at this time
     *       are file and directory which are defined above.
     *       If the type is unrecongnized, we will return an
     *       error (NS_ERROR_FILE_UNKNOWN_TYPE).
     *
     *   @param permissions
     *       The unix style octal permissions.  This may
     *       be ignored on systems that do not need to do
     *       permissions.
     */
  /* void createUnique (in unsigned long type, in unsigned long permissions); */
  NS_SCRIPTABLE NS_IMETHOD CreateUnique(PRUint32 type, PRUint32 permissions) = 0;

  /**
      * clone()
      *
      * This function will allocate and initialize a nsIFile object to the
      * exact location of the |this| nsIFile.
      *
      *   @param file
      *          A nsIFile which this object will be initialize
      *          with.
      *
      */
  /* nsIFile clone (); */
  NS_SCRIPTABLE NS_IMETHOD Clone(nsIFile **_retval) = 0;

  /**
     *  Will determine if the inFile equals this.
     */
  /* boolean equals (in nsIFile inFile); */
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIFile *inFile, PRBool *_retval) = 0;

  /**
     *  Will determine if inFile is a descendant of this file
     *  If |recur| is true, look in subdirectories too
     */
  /* boolean contains (in nsIFile inFile, in boolean recur); */
  NS_SCRIPTABLE NS_IMETHOD Contains(nsIFile *inFile, PRBool recur, PRBool *_retval) = 0;

  /**
     *  Parent will be null when this is at the top of the volume.
     */
  /* readonly attribute nsIFile parent; */
  NS_SCRIPTABLE NS_IMETHOD GetParent(nsIFile * *aParent) = 0;

  /**
     *  Returns an enumeration of the elements in a directory. Each
     *  element in the enumeration is an nsIFile.
     *
     *   @return NS_ERROR_FILE_NOT_DIRECTORY if the current nsIFile does
     *           not specify a directory.
     */
  /* readonly attribute nsISimpleEnumerator directoryEntries; */
  NS_SCRIPTABLE NS_IMETHOD GetDirectoryEntries(nsISimpleEnumerator * *aDirectoryEntries) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIFile, NS_IFILE_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIFILE \
  NS_SCRIPTABLE NS_IMETHOD Append(const nsAString & node); \
  NS_IMETHOD AppendNative(const nsACString & node); \
  NS_SCRIPTABLE NS_IMETHOD Normalize(void); \
  NS_SCRIPTABLE NS_IMETHOD Create(PRUint32 type, PRUint32 permissions); \
  NS_SCRIPTABLE NS_IMETHOD GetLeafName(nsAString & aLeafName); \
  NS_SCRIPTABLE NS_IMETHOD SetLeafName(const nsAString & aLeafName); \
  NS_IMETHOD GetNativeLeafName(nsACString & aNativeLeafName); \
  NS_IMETHOD SetNativeLeafName(const nsACString & aNativeLeafName); \
  NS_SCRIPTABLE NS_IMETHOD CopyTo(nsIFile *newParentDir, const nsAString & newName); \
  NS_IMETHOD CopyToNative(nsIFile *newParentDir, const nsACString & newName); \
  NS_SCRIPTABLE NS_IMETHOD CopyToFollowingLinks(nsIFile *newParentDir, const nsAString & newName); \
  NS_IMETHOD CopyToFollowingLinksNative(nsIFile *newParentDir, const nsACString & newName); \
  NS_SCRIPTABLE NS_IMETHOD MoveTo(nsIFile *newParentDir, const nsAString & newName); \
  NS_IMETHOD MoveToNative(nsIFile *newParentDir, const nsACString & newName); \
  NS_SCRIPTABLE NS_IMETHOD Remove(PRBool recursive); \
  NS_SCRIPTABLE NS_IMETHOD GetPermissions(PRUint32 *aPermissions); \
  NS_SCRIPTABLE NS_IMETHOD SetPermissions(PRUint32 aPermissions); \
  NS_SCRIPTABLE NS_IMETHOD GetPermissionsOfLink(PRUint32 *aPermissionsOfLink); \
  NS_SCRIPTABLE NS_IMETHOD SetPermissionsOfLink(PRUint32 aPermissionsOfLink); \
  NS_SCRIPTABLE NS_IMETHOD GetLastModifiedTime(PRInt64 *aLastModifiedTime); \
  NS_SCRIPTABLE NS_IMETHOD SetLastModifiedTime(PRInt64 aLastModifiedTime); \
  NS_SCRIPTABLE NS_IMETHOD GetLastModifiedTimeOfLink(PRInt64 *aLastModifiedTimeOfLink); \
  NS_SCRIPTABLE NS_IMETHOD SetLastModifiedTimeOfLink(PRInt64 aLastModifiedTimeOfLink); \
  NS_SCRIPTABLE NS_IMETHOD GetFileSize(PRInt64 *aFileSize); \
  NS_SCRIPTABLE NS_IMETHOD SetFileSize(PRInt64 aFileSize); \
  NS_SCRIPTABLE NS_IMETHOD GetFileSizeOfLink(PRInt64 *aFileSizeOfLink); \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget); \
  NS_IMETHOD GetNativeTarget(nsACString & aNativeTarget); \
  NS_SCRIPTABLE NS_IMETHOD GetPath(nsAString & aPath); \
  NS_IMETHOD GetNativePath(nsACString & aNativePath); \
  NS_SCRIPTABLE NS_IMETHOD Exists(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsWritable(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsReadable(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsExecutable(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsHidden(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsDirectory(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsFile(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsSymlink(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD IsSpecial(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD CreateUnique(PRUint32 type, PRUint32 permissions); \
  NS_SCRIPTABLE NS_IMETHOD Clone(nsIFile **_retval); \
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIFile *inFile, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD Contains(nsIFile *inFile, PRBool recur, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetParent(nsIFile * *aParent); \
  NS_SCRIPTABLE NS_IMETHOD GetDirectoryEntries(nsISimpleEnumerator * *aDirectoryEntries); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIFILE(_to) \
  NS_SCRIPTABLE NS_IMETHOD Append(const nsAString & node) { return _to Append(node); } \
  NS_IMETHOD AppendNative(const nsACString & node) { return _to AppendNative(node); } \
  NS_SCRIPTABLE NS_IMETHOD Normalize(void) { return _to Normalize(); } \
  NS_SCRIPTABLE NS_IMETHOD Create(PRUint32 type, PRUint32 permissions) { return _to Create(type, permissions); } \
  NS_SCRIPTABLE NS_IMETHOD GetLeafName(nsAString & aLeafName) { return _to GetLeafName(aLeafName); } \
  NS_SCRIPTABLE NS_IMETHOD SetLeafName(const nsAString & aLeafName) { return _to SetLeafName(aLeafName); } \
  NS_IMETHOD GetNativeLeafName(nsACString & aNativeLeafName) { return _to GetNativeLeafName(aNativeLeafName); } \
  NS_IMETHOD SetNativeLeafName(const nsACString & aNativeLeafName) { return _to SetNativeLeafName(aNativeLeafName); } \
  NS_SCRIPTABLE NS_IMETHOD CopyTo(nsIFile *newParentDir, const nsAString & newName) { return _to CopyTo(newParentDir, newName); } \
  NS_IMETHOD CopyToNative(nsIFile *newParentDir, const nsACString & newName) { return _to CopyToNative(newParentDir, newName); } \
  NS_SCRIPTABLE NS_IMETHOD CopyToFollowingLinks(nsIFile *newParentDir, const nsAString & newName) { return _to CopyToFollowingLinks(newParentDir, newName); } \
  NS_IMETHOD CopyToFollowingLinksNative(nsIFile *newParentDir, const nsACString & newName) { return _to CopyToFollowingLinksNative(newParentDir, newName); } \
  NS_SCRIPTABLE NS_IMETHOD MoveTo(nsIFile *newParentDir, const nsAString & newName) { return _to MoveTo(newParentDir, newName); } \
  NS_IMETHOD MoveToNative(nsIFile *newParentDir, const nsACString & newName) { return _to MoveToNative(newParentDir, newName); } \
  NS_SCRIPTABLE NS_IMETHOD Remove(PRBool recursive) { return _to Remove(recursive); } \
  NS_SCRIPTABLE NS_IMETHOD GetPermissions(PRUint32 *aPermissions) { return _to GetPermissions(aPermissions); } \
  NS_SCRIPTABLE NS_IMETHOD SetPermissions(PRUint32 aPermissions) { return _to SetPermissions(aPermissions); } \
  NS_SCRIPTABLE NS_IMETHOD GetPermissionsOfLink(PRUint32 *aPermissionsOfLink) { return _to GetPermissionsOfLink(aPermissionsOfLink); } \
  NS_SCRIPTABLE NS_IMETHOD SetPermissionsOfLink(PRUint32 aPermissionsOfLink) { return _to SetPermissionsOfLink(aPermissionsOfLink); } \
  NS_SCRIPTABLE NS_IMETHOD GetLastModifiedTime(PRInt64 *aLastModifiedTime) { return _to GetLastModifiedTime(aLastModifiedTime); } \
  NS_SCRIPTABLE NS_IMETHOD SetLastModifiedTime(PRInt64 aLastModifiedTime) { return _to SetLastModifiedTime(aLastModifiedTime); } \
  NS_SCRIPTABLE NS_IMETHOD GetLastModifiedTimeOfLink(PRInt64 *aLastModifiedTimeOfLink) { return _to GetLastModifiedTimeOfLink(aLastModifiedTimeOfLink); } \
  NS_SCRIPTABLE NS_IMETHOD SetLastModifiedTimeOfLink(PRInt64 aLastModifiedTimeOfLink) { return _to SetLastModifiedTimeOfLink(aLastModifiedTimeOfLink); } \
  NS_SCRIPTABLE NS_IMETHOD GetFileSize(PRInt64 *aFileSize) { return _to GetFileSize(aFileSize); } \
  NS_SCRIPTABLE NS_IMETHOD SetFileSize(PRInt64 aFileSize) { return _to SetFileSize(aFileSize); } \
  NS_SCRIPTABLE NS_IMETHOD GetFileSizeOfLink(PRInt64 *aFileSizeOfLink) { return _to GetFileSizeOfLink(aFileSizeOfLink); } \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) { return _to GetTarget(aTarget); } \
  NS_IMETHOD GetNativeTarget(nsACString & aNativeTarget) { return _to GetNativeTarget(aNativeTarget); } \
  NS_SCRIPTABLE NS_IMETHOD GetPath(nsAString & aPath) { return _to GetPath(aPath); } \
  NS_IMETHOD GetNativePath(nsACString & aNativePath) { return _to GetNativePath(aNativePath); } \
  NS_SCRIPTABLE NS_IMETHOD Exists(PRBool *_retval) { return _to Exists(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsWritable(PRBool *_retval) { return _to IsWritable(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsReadable(PRBool *_retval) { return _to IsReadable(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsExecutable(PRBool *_retval) { return _to IsExecutable(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsHidden(PRBool *_retval) { return _to IsHidden(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsDirectory(PRBool *_retval) { return _to IsDirectory(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsFile(PRBool *_retval) { return _to IsFile(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsSymlink(PRBool *_retval) { return _to IsSymlink(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsSpecial(PRBool *_retval) { return _to IsSpecial(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateUnique(PRUint32 type, PRUint32 permissions) { return _to CreateUnique(type, permissions); } \
  NS_SCRIPTABLE NS_IMETHOD Clone(nsIFile **_retval) { return _to Clone(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIFile *inFile, PRBool *_retval) { return _to Equals(inFile, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Contains(nsIFile *inFile, PRBool recur, PRBool *_retval) { return _to Contains(inFile, recur, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetParent(nsIFile * *aParent) { return _to GetParent(aParent); } \
  NS_SCRIPTABLE NS_IMETHOD GetDirectoryEntries(nsISimpleEnumerator * *aDirectoryEntries) { return _to GetDirectoryEntries(aDirectoryEntries); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIFILE(_to) \
  NS_SCRIPTABLE NS_IMETHOD Append(const nsAString & node) { return !_to ? NS_ERROR_NULL_POINTER : _to->Append(node); } \
  NS_IMETHOD AppendNative(const nsACString & node) { return !_to ? NS_ERROR_NULL_POINTER : _to->AppendNative(node); } \
  NS_SCRIPTABLE NS_IMETHOD Normalize(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Normalize(); } \
  NS_SCRIPTABLE NS_IMETHOD Create(PRUint32 type, PRUint32 permissions) { return !_to ? NS_ERROR_NULL_POINTER : _to->Create(type, permissions); } \
  NS_SCRIPTABLE NS_IMETHOD GetLeafName(nsAString & aLeafName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLeafName(aLeafName); } \
  NS_SCRIPTABLE NS_IMETHOD SetLeafName(const nsAString & aLeafName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLeafName(aLeafName); } \
  NS_IMETHOD GetNativeLeafName(nsACString & aNativeLeafName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNativeLeafName(aNativeLeafName); } \
  NS_IMETHOD SetNativeLeafName(const nsACString & aNativeLeafName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetNativeLeafName(aNativeLeafName); } \
  NS_SCRIPTABLE NS_IMETHOD CopyTo(nsIFile *newParentDir, const nsAString & newName) { return !_to ? NS_ERROR_NULL_POINTER : _to->CopyTo(newParentDir, newName); } \
  NS_IMETHOD CopyToNative(nsIFile *newParentDir, const nsACString & newName) { return !_to ? NS_ERROR_NULL_POINTER : _to->CopyToNative(newParentDir, newName); } \
  NS_SCRIPTABLE NS_IMETHOD CopyToFollowingLinks(nsIFile *newParentDir, const nsAString & newName) { return !_to ? NS_ERROR_NULL_POINTER : _to->CopyToFollowingLinks(newParentDir, newName); } \
  NS_IMETHOD CopyToFollowingLinksNative(nsIFile *newParentDir, const nsACString & newName) { return !_to ? NS_ERROR_NULL_POINTER : _to->CopyToFollowingLinksNative(newParentDir, newName); } \
  NS_SCRIPTABLE NS_IMETHOD MoveTo(nsIFile *newParentDir, const nsAString & newName) { return !_to ? NS_ERROR_NULL_POINTER : _to->MoveTo(newParentDir, newName); } \
  NS_IMETHOD MoveToNative(nsIFile *newParentDir, const nsACString & newName) { return !_to ? NS_ERROR_NULL_POINTER : _to->MoveToNative(newParentDir, newName); } \
  NS_SCRIPTABLE NS_IMETHOD Remove(PRBool recursive) { return !_to ? NS_ERROR_NULL_POINTER : _to->Remove(recursive); } \
  NS_SCRIPTABLE NS_IMETHOD GetPermissions(PRUint32 *aPermissions) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPermissions(aPermissions); } \
  NS_SCRIPTABLE NS_IMETHOD SetPermissions(PRUint32 aPermissions) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPermissions(aPermissions); } \
  NS_SCRIPTABLE NS_IMETHOD GetPermissionsOfLink(PRUint32 *aPermissionsOfLink) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPermissionsOfLink(aPermissionsOfLink); } \
  NS_SCRIPTABLE NS_IMETHOD SetPermissionsOfLink(PRUint32 aPermissionsOfLink) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPermissionsOfLink(aPermissionsOfLink); } \
  NS_SCRIPTABLE NS_IMETHOD GetLastModifiedTime(PRInt64 *aLastModifiedTime) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLastModifiedTime(aLastModifiedTime); } \
  NS_SCRIPTABLE NS_IMETHOD SetLastModifiedTime(PRInt64 aLastModifiedTime) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLastModifiedTime(aLastModifiedTime); } \
  NS_SCRIPTABLE NS_IMETHOD GetLastModifiedTimeOfLink(PRInt64 *aLastModifiedTimeOfLink) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetLastModifiedTimeOfLink(aLastModifiedTimeOfLink); } \
  NS_SCRIPTABLE NS_IMETHOD SetLastModifiedTimeOfLink(PRInt64 aLastModifiedTimeOfLink) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetLastModifiedTimeOfLink(aLastModifiedTimeOfLink); } \
  NS_SCRIPTABLE NS_IMETHOD GetFileSize(PRInt64 *aFileSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFileSize(aFileSize); } \
  NS_SCRIPTABLE NS_IMETHOD SetFileSize(PRInt64 aFileSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFileSize(aFileSize); } \
  NS_SCRIPTABLE NS_IMETHOD GetFileSizeOfLink(PRInt64 *aFileSizeOfLink) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFileSizeOfLink(aFileSizeOfLink); } \
  NS_SCRIPTABLE NS_IMETHOD GetTarget(nsAString & aTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTarget(aTarget); } \
  NS_IMETHOD GetNativeTarget(nsACString & aNativeTarget) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNativeTarget(aNativeTarget); } \
  NS_SCRIPTABLE NS_IMETHOD GetPath(nsAString & aPath) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPath(aPath); } \
  NS_IMETHOD GetNativePath(nsACString & aNativePath) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetNativePath(aNativePath); } \
  NS_SCRIPTABLE NS_IMETHOD Exists(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Exists(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsWritable(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsWritable(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsReadable(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsReadable(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsExecutable(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsExecutable(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsHidden(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsHidden(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsDirectory(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsDirectory(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsFile(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsFile(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsSymlink(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsSymlink(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD IsSpecial(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsSpecial(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD CreateUnique(PRUint32 type, PRUint32 permissions) { return !_to ? NS_ERROR_NULL_POINTER : _to->CreateUnique(type, permissions); } \
  NS_SCRIPTABLE NS_IMETHOD Clone(nsIFile **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Clone(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD Equals(nsIFile *inFile, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Equals(inFile, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Contains(nsIFile *inFile, PRBool recur, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Contains(inFile, recur, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetParent(nsIFile * *aParent) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetParent(aParent); } \
  NS_SCRIPTABLE NS_IMETHOD GetDirectoryEntries(nsISimpleEnumerator * *aDirectoryEntries) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDirectoryEntries(aDirectoryEntries); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsFile : public nsIFile
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIFILE

  nsFile();

private:
  ~nsFile();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsFile, nsIFile)

nsFile::nsFile()
{
  /* member initializers and constructor code */
}

nsFile::~nsFile()
{
  /* destructor code */
}

/* void append (in AString node); */
NS_IMETHODIMP nsFile::Append(const nsAString & node)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] void appendNative (in ACString node); */
NS_IMETHODIMP nsFile::AppendNative(const nsACString & node)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void normalize (); */
NS_IMETHODIMP nsFile::Normalize()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void create (in unsigned long type, in unsigned long permissions); */
NS_IMETHODIMP nsFile::Create(PRUint32 type, PRUint32 permissions)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString leafName; */
NS_IMETHODIMP nsFile::GetLeafName(nsAString & aLeafName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsFile::SetLeafName(const nsAString & aLeafName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] attribute ACString nativeLeafName; */
NS_IMETHODIMP nsFile::GetNativeLeafName(nsACString & aNativeLeafName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsFile::SetNativeLeafName(const nsACString & aNativeLeafName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void copyTo (in nsIFile newParentDir, in AString newName); */
NS_IMETHODIMP nsFile::CopyTo(nsIFile *newParentDir, const nsAString & newName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] void CopyToNative (in nsIFile newParentDir, in ACString newName); */
NS_IMETHODIMP nsFile::CopyToNative(nsIFile *newParentDir, const nsACString & newName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void copyToFollowingLinks (in nsIFile newParentDir, in AString newName); */
NS_IMETHODIMP nsFile::CopyToFollowingLinks(nsIFile *newParentDir, const nsAString & newName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] void copyToFollowingLinksNative (in nsIFile newParentDir, in ACString newName); */
NS_IMETHODIMP nsFile::CopyToFollowingLinksNative(nsIFile *newParentDir, const nsACString & newName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void moveTo (in nsIFile newParentDir, in AString newName); */
NS_IMETHODIMP nsFile::MoveTo(nsIFile *newParentDir, const nsAString & newName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] void moveToNative (in nsIFile newParentDir, in ACString newName); */
NS_IMETHODIMP nsFile::MoveToNative(nsIFile *newParentDir, const nsACString & newName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void remove (in boolean recursive); */
NS_IMETHODIMP nsFile::Remove(PRBool recursive)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute unsigned long permissions; */
NS_IMETHODIMP nsFile::GetPermissions(PRUint32 *aPermissions)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsFile::SetPermissions(PRUint32 aPermissions)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute unsigned long permissionsOfLink; */
NS_IMETHODIMP nsFile::GetPermissionsOfLink(PRUint32 *aPermissionsOfLink)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsFile::SetPermissionsOfLink(PRUint32 aPermissionsOfLink)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute PRInt64 lastModifiedTime; */
NS_IMETHODIMP nsFile::GetLastModifiedTime(PRInt64 *aLastModifiedTime)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsFile::SetLastModifiedTime(PRInt64 aLastModifiedTime)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute PRInt64 lastModifiedTimeOfLink; */
NS_IMETHODIMP nsFile::GetLastModifiedTimeOfLink(PRInt64 *aLastModifiedTimeOfLink)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsFile::SetLastModifiedTimeOfLink(PRInt64 aLastModifiedTimeOfLink)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute PRInt64 fileSize; */
NS_IMETHODIMP nsFile::GetFileSize(PRInt64 *aFileSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP nsFile::SetFileSize(PRInt64 aFileSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute PRInt64 fileSizeOfLink; */
NS_IMETHODIMP nsFile::GetFileSizeOfLink(PRInt64 *aFileSizeOfLink)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString target; */
NS_IMETHODIMP nsFile::GetTarget(nsAString & aTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] readonly attribute ACString nativeTarget; */
NS_IMETHODIMP nsFile::GetNativeTarget(nsACString & aNativeTarget)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute AString path; */
NS_IMETHODIMP nsFile::GetPath(nsAString & aPath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript] readonly attribute ACString nativePath; */
NS_IMETHODIMP nsFile::GetNativePath(nsACString & aNativePath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean exists (); */
NS_IMETHODIMP nsFile::Exists(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isWritable (); */
NS_IMETHODIMP nsFile::IsWritable(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isReadable (); */
NS_IMETHODIMP nsFile::IsReadable(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isExecutable (); */
NS_IMETHODIMP nsFile::IsExecutable(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isHidden (); */
NS_IMETHODIMP nsFile::IsHidden(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isDirectory (); */
NS_IMETHODIMP nsFile::IsDirectory(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isFile (); */
NS_IMETHODIMP nsFile::IsFile(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isSymlink (); */
NS_IMETHODIMP nsFile::IsSymlink(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isSpecial (); */
NS_IMETHODIMP nsFile::IsSpecial(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void createUnique (in unsigned long type, in unsigned long permissions); */
NS_IMETHODIMP nsFile::CreateUnique(PRUint32 type, PRUint32 permissions)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* nsIFile clone (); */
NS_IMETHODIMP nsFile::Clone(nsIFile **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean equals (in nsIFile inFile); */
NS_IMETHODIMP nsFile::Equals(nsIFile *inFile, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean contains (in nsIFile inFile, in boolean recur); */
NS_IMETHODIMP nsFile::Contains(nsIFile *inFile, PRBool recur, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsIFile parent; */
NS_IMETHODIMP nsFile::GetParent(nsIFile * *aParent)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* readonly attribute nsISimpleEnumerator directoryEntries; */
NS_IMETHODIMP nsFile::GetDirectoryEntries(nsISimpleEnumerator * *aDirectoryEntries)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif

#ifdef MOZILLA_INTERNAL_API
#include "nsDirectoryServiceUtils.h"
#endif

#endif /* __gen_nsIFile_h__ */
