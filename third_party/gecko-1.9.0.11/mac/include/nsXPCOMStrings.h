/* vim:set ts=2 sw=2 et cindent: */
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
 * The Original Code is Mozilla.
 *
 * The Initial Developer of the Original Code is IBM Corporation.
 * Portions created by IBM Corporation are Copyright (C) 2003
 * IBM Corporation.  All Rights Reserved.
 *
 * Contributor(s):
 *   Darin Fisher <darin@meer.net>
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

#ifndef nsXPCOMStrings_h__
#define nsXPCOMStrings_h__

#include <string.h>
#include "nscore.h"

/**
 * nsXPCOMStrings.h
 *
 * This file describes a minimal API for working with XPCOM's abstract
 * string classes.  It divorces the consumer from having any run-time
 * dependency on the implementation details of the abstract string types.
 */

// Map frozen functions to private symbol names if not using strict API.
#ifdef MOZILLA_INTERNAL_API
# define NS_StringContainerInit           NS_StringContainerInit_P
# define NS_StringContainerInit2          NS_StringContainerInit2_P
# define NS_StringContainerFinish         NS_StringContainerFinish_P
# define NS_StringGetData                 NS_StringGetData_P
# define NS_StringGetMutableData          NS_StringGetMutableData_P
# define NS_StringCloneData               NS_StringCloneData_P
# define NS_StringSetData                 NS_StringSetData_P
# define NS_StringSetDataRange            NS_StringSetDataRange_P
# define NS_StringCopy                    NS_StringCopy_P
# define NS_StringSetIsVoid               NS_StringSetIsVoid_P
# define NS_StringGetIsVoid               NS_StringGetIsVoid_P
# define NS_CStringContainerInit          NS_CStringContainerInit_P
# define NS_CStringContainerInit2         NS_CStringContainerInit2_P
# define NS_CStringContainerFinish        NS_CStringContainerFinish_P
# define NS_CStringGetData                NS_CStringGetData_P
# define NS_CStringGetMutableData         NS_CStringGetMutableData_P
# define NS_CStringCloneData              NS_CStringCloneData_P
# define NS_CStringSetData                NS_CStringSetData_P
# define NS_CStringSetDataRange           NS_CStringSetDataRange_P
# define NS_CStringCopy                   NS_CStringCopy_P
# define NS_CStringSetIsVoid              NS_CStringSetIsVoid_P
# define NS_CStringGetIsVoid              NS_CStringGetIsVoid_P
# define NS_CStringToUTF16                NS_CStringToUTF16_P
# define NS_UTF16ToCString                NS_UTF16ToCString_P
#endif

#include "nscore.h"

/* The base string types */
class nsAString;
class nsACString;

/* ------------------------------------------------------------------------- */

/**
 * nsStringContainer
 *
 * This is an opaque data type that is large enough to hold the canonical
 * implementation of nsAString.  The binary structure of this class is an
 * implementation detail.
 *
 * The string data stored in a string container is always single fragment
 * and may be null-terminated depending on how it is initialized.
 *
 * Typically, string containers are allocated on the stack for temporary
 * use.  However, they can also be malloc'd if necessary.  In either case,
 * a string container is not useful until it has been initialized with a
 * call to NS_StringContainerInit.  The following example shows how to use
 * a string container to call a function that takes a |nsAString &| out-param.
 *
 *   NS_METHOD GetBlah(nsAString &aBlah);
 *
 *   nsresult MyCode()
 *   {
 *     nsresult rv;
 *
 *     nsStringContainer sc;
 *     rv = NS_StringContainerInit(sc);
 *     if (NS_FAILED(rv))
 *       return rv;
 *
 *     rv = GetBlah(sc);
 *     if (NS_SUCCEEDED(rv))
 *     {
 *       const PRUnichar *data;
 *       NS_StringGetData(sc, &data);
 *       //
 *       // |data| now points to the result of the GetBlah function
 *       //
 *     }
 *
 *     NS_StringContainerFinish(sc);
 *     return rv;
 *   }
 *
 * The following example show how to use a string container to pass a string
 * parameter to a function taking a |const nsAString &| in-param.
 *
 *   NS_METHOD SetBlah(const nsAString &aBlah);
 *
 *   nsresult MyCode()
 *   {
 *     nsresult rv;
 *
 *     nsStringContainer sc;
 *     rv = NS_StringContainerInit(sc);
 *     if (NS_FAILED(rv))
 *       return rv;
 *
 *     const PRUnichar kData[] = {'x','y','z','\0'};
 *     rv = NS_StringSetData(sc, kData, sizeof(kData)/2 - 1);
 *     if (NS_SUCCEEDED(rv))
 *       rv = SetBlah(sc);
 *
 *     NS_StringContainerFinish(sc);
 *     return rv;
 *   }
 */
class nsStringContainer;

struct nsStringContainer_base
{
private:
  void *d1;
  PRUint32 d2;
  PRUint32 d3;
};

/**
 * Flags that may be OR'd together to pass to NS_StringContainerInit2:
 */
enum {
  /* Data passed into NS_StringContainerInit2 is not copied; instead, the
   * string references the passed in data pointer directly.  The caller must
   * ensure that the data is valid for the lifetime of the string container.
   * This flag should not be combined with NS_STRING_CONTAINER_INIT_ADOPT. */
  NS_STRING_CONTAINER_INIT_DEPEND    = (1 << 1),

  /* Data passed into NS_StringContainerInit2 is not copied; instead, the
   * string takes ownership over the data pointer.  The caller must have
   * allocated the data array using the XPCOM memory allocator (nsMemory).
   * This flag should not be combined with NS_STRING_CONTAINER_INIT_DEPEND. */
  NS_STRING_CONTAINER_INIT_ADOPT     = (1 << 2),

  /* Data passed into NS_StringContainerInit2 is a substring that is not
   * null-terminated. */
  NS_STRING_CONTAINER_INIT_SUBSTRING = (1 << 3)
};

/**
 * NS_StringContainerInit
 *
 * @param aContainer    string container reference
 * @return              NS_OK if string container successfully initialized
 *
 * This function may allocate additional memory for aContainer.  When
 * aContainer is no longer needed, NS_StringContainerFinish should be called.
 *
 * @status FROZEN
 */
XPCOM_API(nsresult)
NS_StringContainerInit(nsStringContainer &aContainer);

/**
 * NS_StringContainerInit2
 *
 * @param aContainer    string container reference
 * @param aData         character buffer (may be null)
 * @param aDataLength   number of characters stored at aData (may pass
 *                      PR_UINT32_MAX if aData is null-terminated)
 * @param aFlags        flags affecting how the string container is
 *                      initialized.  this parameter is ignored when aData
 *                      is null.  otherwise, if this parameter is 0, then
 *                      aData is copied into the string.
 *
 * This function resembles NS_StringContainerInit but provides further
 * options that permit more efficient memory usage.  When aContainer is
 * no longer needed, NS_StringContainerFinish should be called.
 *
 * NOTE: NS_StringContainerInit2(container, nsnull, 0, 0) is equivalent to
 * NS_StringContainerInit(container).
 *
 * @status FROZEN
 */
XPCOM_API(nsresult)
NS_StringContainerInit2
  (nsStringContainer &aContainer, const PRUnichar *aData = nsnull,
   PRUint32 aDataLength = PR_UINT32_MAX, PRUint32 aFlags = 0);

/**
 * NS_StringContainerFinish
 *
 * @param aContainer    string container reference
 *
 * This function frees any memory owned by aContainer.
 *
 * @status FROZEN
 */
XPCOM_API(void)
NS_StringContainerFinish(nsStringContainer &aContainer);

/* ------------------------------------------------------------------------- */

/**
 * NS_StringGetData
 *
 * This function returns a const character pointer to the string's internal
 * buffer, the length of the string, and a boolean value indicating whether
 * or not the buffer is null-terminated.
 *
 * @param aStr          abstract string reference
 * @param aData         out param that will hold the address of aStr's
 *                      internal buffer
 * @param aTerminated   if non-null, this out param will be set to indicate
 *                      whether or not aStr's internal buffer is null-
 *                      terminated
 * @return              length of aStr's internal buffer
 *
 * @status FROZEN
 */
XPCOM_API(PRUint32)
NS_StringGetData
  (const nsAString &aStr, const PRUnichar **aData,
   PRBool *aTerminated = nsnull);

/**
 * NS_StringGetMutableData
 *
 * This function provides mutable access to a string's internal buffer.  It
 * returns a pointer to an array of characters that may be modified.  The
 * returned pointer remains valid until the string object is passed to some
 * other string function.
 *
 * Optionally, this function may be used to resize the string's internal
 * buffer.  The aDataLength parameter specifies the requested length of the
 * string's internal buffer.  By passing some value other than PR_UINT32_MAX,
 * the caller can request that the buffer be resized to the specified number of
 * characters before returning.  The caller is not responsible for writing a
 * null-terminator.
 *
 * @param aStr          abstract string reference
 * @param aDataLength   number of characters to resize the string's internal
 *                      buffer to or PR_UINT32_MAX if no resizing is needed
 * @param aData         out param that upon return holds the address of aStr's
 *                      internal buffer or null if the function failed
 * @return              number of characters or zero if the function failed
 *
 * This function does not necessarily null-terminate aStr after resizing its
 * internal buffer.  The behavior depends on the implementation of the abstract
 * string, aStr.  If aStr is a reference to a nsStringContainer, then its data
 * will be null-terminated by this function.
 *
 * @status FROZEN
 */
XPCOM_API(PRUint32)
NS_StringGetMutableData
  (nsAString &aStr, PRUint32 aDataLength, PRUnichar **aData);

/**
 * NS_StringCloneData
 *
 * This function returns a null-terminated copy of the string's
 * internal buffer.
 *
 * @param aStr          abstract string reference
 * @return              null-terminated copy of the string's internal buffer
 *                      (it must be free'd using using nsMemory::Free)
 *
 * @status FROZEN
 */
XPCOM_API(PRUnichar *)
NS_StringCloneData
  (const nsAString &aStr);

/**
 * NS_StringSetData
 *
 * This function copies aData into aStr.
 *
 * @param aStr          abstract string reference
 * @param aData         character buffer
 * @param aDataLength   number of characters to copy from source string (pass
 *                      PR_UINT32_MAX to copy until end of aData, designated by
 *                      a null character)
 * @return              NS_OK if function succeeded
 *
 * This function does not necessarily null-terminate aStr after copying data
 * from aData.  The behavior depends on the implementation of the abstract
 * string, aStr.  If aStr is a reference to a nsStringContainer, then its data
 * will be null-terminated by this function.
 *
 * @status FROZEN
 */
XPCOM_API(nsresult)
NS_StringSetData
  (nsAString &aStr, const PRUnichar *aData,
   PRUint32 aDataLength = PR_UINT32_MAX);

/**
 * NS_StringSetDataRange
 *
 * This function copies aData into a section of aStr.  As a result it can be
 * used to insert new characters into the string.
 *
 * @param aStr          abstract string reference
 * @param aCutOffset    starting index where the string's existing data
 *                      is to be overwritten (pass PR_UINT32_MAX to cause
 *                      aData to be appended to the end of aStr, in which
 *                      case the value of aCutLength is ignored).
 * @param aCutLength    number of characters to overwrite starting at
 *                      aCutOffset (pass PR_UINT32_MAX to overwrite until the
 *                      end of aStr).
 * @param aData         character buffer (pass null to cause this function
 *                      to simply remove the "cut" range)
 * @param aDataLength   number of characters to copy from source string (pass
 *                      PR_UINT32_MAX to copy until end of aData, designated by
 *                      a null character)
 * @return              NS_OK if function succeeded
 *
 * This function does not necessarily null-terminate aStr after copying data
 * from aData.  The behavior depends on the implementation of the abstract
 * string, aStr.  If aStr is a reference to a nsStringContainer, then its data
 * will be null-terminated by this function.
 *
 * @status FROZEN
 */
XPCOM_API(nsresult)
NS_StringSetDataRange
  (nsAString &aStr, PRUint32 aCutOffset, PRUint32 aCutLength,
   const PRUnichar *aData, PRUint32 aDataLength = PR_UINT32_MAX);

/**
 * NS_StringCopy
 *
 * This function makes aDestStr have the same value as aSrcStr.  It is
 * provided as an optimization.
 *
 * @param aDestStr      abstract string reference to be modified
 * @param aSrcStr       abstract string reference containing source string
 * @return              NS_OK if function succeeded
 *
 * This function does not necessarily null-terminate aDestStr after copying
 * data from aSrcStr.  The behavior depends on the implementation of the
 * abstract string, aDestStr.  If aDestStr is a reference to a
 * nsStringContainer, then its data will be null-terminated by this function.
 *
 * @status FROZEN
 */
XPCOM_API(nsresult)
NS_StringCopy
  (nsAString &aDestStr, const nsAString &aSrcStr);

/**
 * NS_StringAppendData
 *
 * This function appends data to the existing value of aStr.
 *
 * @param aStr          abstract string reference to be modified
 * @param aData         character buffer
 * @param aDataLength   number of characters to append (pass PR_UINT32_MAX to
 *                      append until a null-character is encountered)
 * @return              NS_OK if function succeeded
 *
 * This function does not necessarily null-terminate aStr upon completion.
 * The behavior depends on the implementation of the abstract string, aStr.
 * If aStr is a reference to a nsStringContainer, then its data will be null-
 * terminated by this function.
 */
inline NS_HIDDEN_(nsresult)
NS_StringAppendData(nsAString &aStr, const PRUnichar *aData,
                    PRUint32 aDataLength = PR_UINT32_MAX)
{
  return NS_StringSetDataRange(aStr, PR_UINT32_MAX, 0, aData, aDataLength);
}

/**
 * NS_StringInsertData
 *
 * This function inserts data into the existing value of aStr at the specified
 * offset.
 *
 * @param aStr          abstract string reference to be modified
 * @param aOffset       specifies where in the string to insert aData
 * @param aData         character buffer
 * @param aDataLength   number of characters to append (pass PR_UINT32_MAX to
 *                      append until a null-character is encountered)
 * @return              NS_OK if function succeeded
 *
 * This function does not necessarily null-terminate aStr upon completion.
 * The behavior depends on the implementation of the abstract string, aStr.
 * If aStr is a reference to a nsStringContainer, then its data will be null-
 * terminated by this function.
 */
inline NS_HIDDEN_(nsresult)
NS_StringInsertData(nsAString &aStr, PRUint32 aOffset, const PRUnichar *aData,
                    PRUint32 aDataLength = PR_UINT32_MAX)
{
  return NS_StringSetDataRange(aStr, aOffset, 0, aData, aDataLength);
}

/**
 * NS_StringCutData
 *
 * This function shortens the existing value of aStr, by removing characters
 * at the specified offset.
 *
 * @param aStr          abstract string reference to be modified
 * @param aCutOffset    specifies where in the string to insert aData
 * @param aCutLength    number of characters to remove
 * @return              NS_OK if function succeeded
 */
inline NS_HIDDEN_(nsresult)
NS_StringCutData(nsAString &aStr, PRUint32 aCutOffset, PRUint32 aCutLength)
{
  return NS_StringSetDataRange(aStr, aCutOffset, aCutLength, nsnull, 0);
}

/**
 * NS_StringSetIsVoid
 *
 * This function marks a string as being a "void string".  Any data in the
 * string will be lost.
 */
XPCOM_API(void)
NS_StringSetIsVoid(nsAString& aStr, const PRBool aIsVoid);

/**
 * NS_StringGetIsVoid
 *
 * This function provides a way to test if a string is a "void string", as
 * marked by NS_StringSetIsVoid.
 */
XPCOM_API(PRBool)
NS_StringGetIsVoid(const nsAString& aStr);

/* ------------------------------------------------------------------------- */

/**
 * nsCStringContainer
 *
 * This is an opaque data type that is large enough to hold the canonical
 * implementation of nsACString.  The binary structure of this class is an
 * implementation detail.
 *
 * The string data stored in a string container is always single fragment
 * and may be null-terminated depending on how it is initialized.
 *
 * @see nsStringContainer for use cases and further documentation.
 */
class nsCStringContainer;

/**
 * Flags that may be OR'd together to pass to NS_StringContainerInit2:
 */
enum {
  /* Data passed into NS_CStringContainerInit2 is not copied; instead, the
   * string references the passed in data pointer directly.  The caller must
   * ensure that the data is valid for the lifetime of the string container.
   * This flag should not be combined with NS_CSTRING_CONTAINER_INIT_ADOPT. */
  NS_CSTRING_CONTAINER_INIT_DEPEND    = (1 << 1),

  /* Data passed into NS_CStringContainerInit2 is not copied; instead, the
   * string takes ownership over the data pointer.  The caller must have
   * allocated the data array using the XPCOM memory allocator (nsMemory).
   * This flag should not be combined with NS_CSTRING_CONTAINER_INIT_DEPEND. */
  NS_CSTRING_CONTAINER_INIT_ADOPT     = (1 << 2),

  /* Data passed into NS_CStringContainerInit2 is a substring that is not
   * null-terminated. */
  NS_CSTRING_CONTAINER_INIT_SUBSTRING = (1 << 3)
};

/**
 * NS_CStringContainerInit
 *
 * @param aContainer    string container reference
 * @return              NS_OK if string container successfully initialized
 *
 * This function may allocate additional memory for aContainer.  When
 * aContainer is no longer needed, NS_CStringContainerFinish should be called.
 *
 * @status FROZEN
 */
XPCOM_API(nsresult)
NS_CStringContainerInit(nsCStringContainer &aContainer);

/**
 * NS_CStringContainerInit2
 *
 * @param aContainer    string container reference
 * @param aData         character buffer (may be null)
 * @param aDataLength   number of characters stored at aData (may pass
 *                      PR_UINT32_MAX if aData is null-terminated)
 * @param aFlags        flags affecting how the string container is
 *                      initialized.  this parameter is ignored when aData
 *                      is null.  otherwise, if this parameter is 0, then
 *                      aData is copied into the string.
 *
 * This function resembles NS_CStringContainerInit but provides further
 * options that permit more efficient memory usage.  When aContainer is
 * no longer needed, NS_CStringContainerFinish should be called.
 *
 * NOTE: NS_CStringContainerInit2(container, nsnull, 0, 0) is equivalent to
 * NS_CStringContainerInit(container).
 *
 * @status FROZEN
 */
XPCOM_API(nsresult)
NS_CStringContainerInit2
  (nsCStringContainer &aContainer, const char *aData = nsnull,
   PRUint32 aDataLength = PR_UINT32_MAX, PRUint32 aFlags = 0);

/**
 * NS_CStringContainerFinish
 *
 * @param aContainer    string container reference
 *
 * This function frees any memory owned by aContainer.
 *
 * @status FROZEN
 */
XPCOM_API(void)
NS_CStringContainerFinish(nsCStringContainer &aContainer);

/* ------------------------------------------------------------------------- */

/**
 * NS_CStringGetData
 *
 * This function returns a const character pointer to the string's internal
 * buffer, the length of the string, and a boolean value indicating whether
 * or not the buffer is null-terminated.
 *
 * @param aStr          abstract string reference
 * @param aData         out param that will hold the address of aStr's
 *                      internal buffer
 * @param aTerminated   if non-null, this out param will be set to indicate
 *                      whether or not aStr's internal buffer is null-
 *                      terminated
 * @return              length of aStr's internal buffer
 *
 * @status FROZEN
 */
XPCOM_API(PRUint32)
NS_CStringGetData
  (const nsACString &aStr, const char **aData,
   PRBool *aTerminated = nsnull);

/**
 * NS_CStringGetMutableData
 *
 * This function provides mutable access to a string's internal buffer.  It
 * returns a pointer to an array of characters that may be modified.  The
 * returned pointer remains valid until the string object is passed to some
 * other string function.
 *
 * Optionally, this function may be used to resize the string's internal
 * buffer.  The aDataLength parameter specifies the requested length of the
 * string's internal buffer.  By passing some value other than PR_UINT32_MAX,
 * the caller can request that the buffer be resized to the specified number of
 * characters before returning.  The caller is not responsible for writing a
 * null-terminator.
 *
 * @param aStr          abstract string reference
 * @param aDataLength   number of characters to resize the string's internal
 *                      buffer to or PR_UINT32_MAX if no resizing is needed
 * @param aData         out param that upon return holds the address of aStr's
 *                      internal buffer or null if the function failed
 * @return              number of characters or zero if the function failed
 *
 * This function does not necessarily null-terminate aStr after resizing its
 * internal buffer.  The behavior depends on the implementation of the abstract
 * string, aStr.  If aStr is a reference to a nsStringContainer, then its data
 * will be null-terminated by this function.
 *
 * @status FROZEN
 */
XPCOM_API(PRUint32)
NS_CStringGetMutableData
  (nsACString &aStr, PRUint32 aDataLength, char **aData);

/**
 * NS_CStringCloneData
 *
 * This function returns a null-terminated copy of the string's
 * internal buffer.
 *
 * @param aStr          abstract string reference
 * @return              null-terminated copy of the string's internal buffer
 *                      (it must be free'd using using nsMemory::Free)
 *
 * @status FROZEN
 */
XPCOM_API(char *)
NS_CStringCloneData
  (const nsACString &aStr);

/**
 * NS_CStringSetData
 *
 * This function copies aData into aStr.
 *
 * @param aStr          abstract string reference
 * @param aData         character buffer
 * @param aDataLength   number of characters to copy from source string (pass
 *                      PR_UINT32_MAX to copy until end of aData, designated by
 *                      a null character)
 * @return              NS_OK if function succeeded
 *
 * This function does not necessarily null-terminate aStr after copying data
 * from aData.  The behavior depends on the implementation of the abstract
 * string, aStr.  If aStr is a reference to a nsStringContainer, then its data
 * will be null-terminated by this function.
 *
 * @status FROZEN
 */
XPCOM_API(nsresult)
NS_CStringSetData
  (nsACString &aStr, const char *aData,
   PRUint32 aDataLength = PR_UINT32_MAX);

/**
 * NS_CStringSetDataRange
 *
 * This function copies aData into a section of aStr.  As a result it can be
 * used to insert new characters into the string.
 *
 * @param aStr          abstract string reference
 * @param aCutOffset    starting index where the string's existing data
 *                      is to be overwritten (pass PR_UINT32_MAX to cause
 *                      aData to be appended to the end of aStr, in which
 *                      case the value of aCutLength is ignored).
 * @param aCutLength    number of characters to overwrite starting at
 *                      aCutOffset (pass PR_UINT32_MAX to overwrite until the
 *                      end of aStr).
 * @param aData         character buffer (pass null to cause this function
 *                      to simply remove the "cut" range)
 * @param aDataLength   number of characters to copy from source string (pass
 *                      PR_UINT32_MAX to copy until end of aData, designated by
 *                      a null character)
 * @return              NS_OK if function succeeded
 *
 * This function does not necessarily null-terminate aStr after copying data
 * from aData.  The behavior depends on the implementation of the abstract
 * string, aStr.  If aStr is a reference to a nsStringContainer, then its data
 * will be null-terminated by this function.
 *
 * @status FROZEN
 */
XPCOM_API(nsresult)
NS_CStringSetDataRange
  (nsACString &aStr, PRUint32 aCutOffset, PRUint32 aCutLength,
   const char *aData, PRUint32 aDataLength = PR_UINT32_MAX);

/**
 * NS_CStringCopy
 *
 * This function makes aDestStr have the same value as aSrcStr.  It is
 * provided as an optimization.
 *
 * @param aDestStr      abstract string reference to be modified
 * @param aSrcStr       abstract string reference containing source string
 * @return              NS_OK if function succeeded
 *
 * This function does not necessarily null-terminate aDestStr after copying
 * data from aSrcStr.  The behavior depends on the implementation of the
 * abstract string, aDestStr.  If aDestStr is a reference to a
 * nsStringContainer, then its data will be null-terminated by this function.
 *
 * @status FROZEN
 */
XPCOM_API(nsresult)
NS_CStringCopy
  (nsACString &aDestStr, const nsACString &aSrcStr);

/**
 * NS_CStringAppendData
 *
 * This function appends data to the existing value of aStr.
 *
 * @param aStr          abstract string reference to be modified
 * @param aData         character buffer
 * @param aDataLength   number of characters to append (pass PR_UINT32_MAX to
 *                      append until a null-character is encountered)
 * @return              NS_OK if function succeeded
 *
 * This function does not necessarily null-terminate aStr upon completion.
 * The behavior depends on the implementation of the abstract string, aStr.
 * If aStr is a reference to a nsStringContainer, then its data will be null-
 * terminated by this function.
 */
inline NS_HIDDEN_(nsresult)
NS_CStringAppendData(nsACString &aStr, const char *aData,
                    PRUint32 aDataLength = PR_UINT32_MAX)
{
  return NS_CStringSetDataRange(aStr, PR_UINT32_MAX, 0, aData, aDataLength);
}

/**
 * NS_CStringInsertData
 *
 * This function inserts data into the existing value of aStr at the specified
 * offset.
 *
 * @param aStr          abstract string reference to be modified
 * @param aOffset       specifies where in the string to insert aData
 * @param aData         character buffer
 * @param aDataLength   number of characters to append (pass PR_UINT32_MAX to
 *                      append until a null-character is encountered)
 * @return              NS_OK if function succeeded
 *
 * This function does not necessarily null-terminate aStr upon completion.
 * The behavior depends on the implementation of the abstract string, aStr.
 * If aStr is a reference to a nsStringContainer, then its data will be null-
 * terminated by this function.
 */
inline NS_HIDDEN_(nsresult)
NS_CStringInsertData(nsACString &aStr, PRUint32 aOffset, const char *aData,
                    PRUint32 aDataLength = PR_UINT32_MAX)
{
  return NS_CStringSetDataRange(aStr, aOffset, 0, aData, aDataLength);
}

/**
 * NS_CStringCutData
 *
 * This function shortens the existing value of aStr, by removing characters
 * at the specified offset.
 *
 * @param aStr          abstract string reference to be modified
 * @param aCutOffset    specifies where in the string to insert aData
 * @param aCutLength    number of characters to remove
 * @return              NS_OK if function succeeded
 */
inline NS_HIDDEN_(nsresult)
NS_CStringCutData(nsACString &aStr, PRUint32 aCutOffset, PRUint32 aCutLength)
{
  return NS_CStringSetDataRange(aStr, aCutOffset, aCutLength, nsnull, 0);
}

/**
 * NS_CStringSetIsVoid
 *
 * This function marks a string as being a "void string".  Any data in the
 * string will be lost.
 */
XPCOM_API(void)
NS_CStringSetIsVoid(nsACString& aStr, const PRBool aIsVoid);

/**
 * NS_CStringGetIsVoid
 *
 * This function provides a way to test if a string is a "void string", as
 * marked by NS_CStringSetIsVoid.
 */
XPCOM_API(PRBool)
NS_CStringGetIsVoid(const nsACString& aStr);

/* ------------------------------------------------------------------------- */

/**
 * Encodings that can be used with the following conversion routines.
 */
enum nsCStringEncoding {
  /* Conversion between ASCII and UTF-16 assumes that all bytes in the source
   * string are 7-bit ASCII and can be inflated to UTF-16 by inserting null
   * bytes.  Reverse conversion is done by truncating every other byte.  The
   * conversion may result in loss and/or corruption of information if the
   * strings do not strictly contain ASCII data. */
  NS_CSTRING_ENCODING_ASCII = 0,

  /* Conversion between UTF-8 and UTF-16 is non-lossy. */
  NS_CSTRING_ENCODING_UTF8 = 1,

  /* Conversion from UTF-16 to the native filesystem charset may result in a
   * loss of information.  No attempt is made to protect against data loss in
   * this case.  The native filesystem charset applies to strings passed to
   * the "Native" method variants on nsIFile and nsILocalFile. */
  NS_CSTRING_ENCODING_NATIVE_FILESYSTEM = 2
};

/**
 * NS_CStringToUTF16
 *
 * This function converts the characters in a nsACString to an array of UTF-16
 * characters, in the platform endianness.  The result is stored in a nsAString
 * object.
 *
 * @param aSource       abstract string reference containing source string
 * @param aSrcEncoding  character encoding of the source string
 * @param aDest         abstract string reference to hold the result
 *
 * @status FROZEN
 */
XPCOM_API(nsresult)
NS_CStringToUTF16(const nsACString &aSource, nsCStringEncoding aSrcEncoding,
                  nsAString &aDest);

/**
 * NS_UTF16ToCString
 *
 * This function converts the UTF-16 characters in a nsAString to a single-byte
 * encoding.  The result is stored in a nsACString object.  In some cases this
 * conversion may be lossy.  In such cases, the conversion may succeed with a
 * return code indicating loss of information.  The exact behavior is not
 * specified at this time.
 *
 * @param aSource       abstract string reference containing source string
 * @param aDestEncoding character encoding of the resulting string
 * @param aDest         abstract string reference to hold the result
 *
 * @status FROZEN
 */
XPCOM_API(nsresult)
NS_UTF16ToCString(const nsAString &aSource, nsCStringEncoding aDestEncoding,
                  nsACString &aDest);

#endif // nsXPCOMStrings_h__
