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
 * The Original Code is C++ hashtable templates.
 *
 * The Initial Developer of the Original Code is
 * Benjamin Smedberg.
 * Portions created by the Initial Developer are Copyright (C) 2002
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
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

#ifndef nsTHashKeys_h__
#define nsTHashKeys_h__

#include "nsID.h"
#include "nsISupports.h"
#include "nsIHashable.h"
#include "nsCOMPtr.h"
#include "pldhash.h"
#include NEW_H

#include "nsStringGlue.h"
#include "nsCRTGlue.h"

#include <stdlib.h>
#include <string.h>

/** @file nsHashKeys.h
 * standard HashKey classes for nsBaseHashtable and relatives. Each of these
 * classes follows the nsTHashtable::EntryType specification
 *
 * Lightweight keytypes provided here:
 * nsStringHashKey
 * nsCStringHashKey
 * nsUint32HashKey
 * nsVoidPtrHashKey
 * nsClearingVoidPtrHashKey
 * nsISupportsHashKey
 * nsIDHashKey
 * nsDepCharHashKey
 * nsCharPtrHashKey
 * nsUnicharPtrHashKey
 * nsHashableHashKey
 */

NS_COM_GLUE PRUint32 HashString(const nsAString& aStr);
NS_COM_GLUE PRUint32 HashString(const nsACString& aStr);
NS_COM_GLUE PRUint32 HashString(const char* aKey);
NS_COM_GLUE PRUint32 HashString(const PRUnichar* aKey);

/**
 * hashkey wrapper using nsAString KeyType
 *
 * @see nsTHashtable::EntryType for specification
 */
class nsStringHashKey : public PLDHashEntryHdr
{
public:
  typedef const nsAString& KeyType;
  typedef const nsAString* KeyTypePointer;

  nsStringHashKey(KeyTypePointer aStr) : mStr(*aStr) { }
  nsStringHashKey(const nsStringHashKey& toCopy) : mStr(toCopy.mStr) { }
  ~nsStringHashKey() { }

  KeyType GetKey() const { return mStr; }
  PRBool KeyEquals(const KeyTypePointer aKey) const
  {
    return mStr.Equals(*aKey);
  }

  static KeyTypePointer KeyToPointer(KeyType aKey) { return &aKey; }
  static PLDHashNumber HashKey(const KeyTypePointer aKey)
  {
    return HashString(*aKey);
  }
  enum { ALLOW_MEMMOVE = PR_TRUE };

private:
  const nsString mStr;
};

/**
 * hashkey wrapper using nsACString KeyType
 *
 * @see nsTHashtable::EntryType for specification
 */
class nsCStringHashKey : public PLDHashEntryHdr
{
public:
  typedef const nsACString& KeyType;
  typedef const nsACString* KeyTypePointer;
  
  nsCStringHashKey(const nsACString* aStr) : mStr(*aStr) { }
  nsCStringHashKey(const nsCStringHashKey& toCopy) : mStr(toCopy.mStr) { }
  ~nsCStringHashKey() { }

  KeyType GetKey() const { return mStr; }

  PRBool KeyEquals(KeyTypePointer aKey) const { return mStr.Equals(*aKey); }

  static KeyTypePointer KeyToPointer(KeyType aKey) { return &aKey; }
  static PLDHashNumber HashKey(KeyTypePointer aKey)
  {
    return HashString(*aKey);
  }
  enum { ALLOW_MEMMOVE = PR_TRUE };

private:
  const nsCString mStr;
};

/**
 * hashkey wrapper using PRUint32 KeyType
 *
 * @see nsTHashtable::EntryType for specification
 */
class nsUint32HashKey : public PLDHashEntryHdr
{
public:
  typedef const PRUint32& KeyType;
  typedef const PRUint32* KeyTypePointer;
  
  nsUint32HashKey(KeyTypePointer aKey) : mValue(*aKey) { }
  nsUint32HashKey(const nsUint32HashKey& toCopy) : mValue(toCopy.mValue) { }
  ~nsUint32HashKey() { }

  KeyType GetKey() const { return mValue; }
  PRBool KeyEquals(KeyTypePointer aKey) const { return *aKey == mValue; }

  static KeyTypePointer KeyToPointer(KeyType aKey) { return &aKey; }
  static PLDHashNumber HashKey(KeyTypePointer aKey) { return *aKey; }
  enum { ALLOW_MEMMOVE = PR_TRUE };

private:
  const PRUint32 mValue;
};

/**
 * hashkey wrapper using nsISupports* KeyType
 *
 * @see nsTHashtable::EntryType for specification
 */
class nsISupportsHashKey : public PLDHashEntryHdr
{
public:
  typedef nsISupports* KeyType;
  typedef const nsISupports* KeyTypePointer;

  nsISupportsHashKey(const nsISupports* key) :
    mSupports(const_cast<nsISupports*>(key)) { }
  nsISupportsHashKey(const nsISupportsHashKey& toCopy) :
    mSupports(toCopy.mSupports) { }
  ~nsISupportsHashKey() { }

  KeyType GetKey() const { return mSupports; }
  
  PRBool KeyEquals(KeyTypePointer aKey) const { return aKey == mSupports; }

  static KeyTypePointer KeyToPointer(KeyType aKey) { return aKey; }
  static PLDHashNumber HashKey(KeyTypePointer aKey)
  {
    return NS_PTR_TO_INT32(aKey) >>2;
  }
  enum { ALLOW_MEMMOVE = PR_TRUE };

private:
  nsCOMPtr<nsISupports> mSupports;
};

/**
 * hashkey wrapper using void* KeyType
 *
 * @see nsTHashtable::EntryType for specification
 */
class nsVoidPtrHashKey : public PLDHashEntryHdr
{
public:
  typedef const void* KeyType;
  typedef const void* KeyTypePointer;

  nsVoidPtrHashKey(const void* key) :
    mKey(key) { }
  nsVoidPtrHashKey(const nsVoidPtrHashKey& toCopy) :
    mKey(toCopy.mKey) { }
  ~nsVoidPtrHashKey() { }

  KeyType GetKey() const { return mKey; }
  
  PRBool KeyEquals(KeyTypePointer aKey) const { return aKey == mKey; }

  static KeyTypePointer KeyToPointer(KeyType aKey) { return aKey; }
  static PLDHashNumber HashKey(KeyTypePointer aKey)
  {
    return NS_PTR_TO_INT32(aKey) >>2;
  }
  enum { ALLOW_MEMMOVE = PR_TRUE };

private:
  const void* mKey;
};

/**
 * hashkey wrapper using void* KeyType, that sets key to NULL upon
 * destruction. Relevant only in cases where a memory pointer-scanner
 * like valgrind might get confused about stale references.
 *
 * @see nsTHashtable::EntryType for specification
 */

class nsClearingVoidPtrHashKey : public PLDHashEntryHdr
{
public:
  typedef const void* KeyType;
  typedef const void* KeyTypePointer;

  nsClearingVoidPtrHashKey(const void* key) :
    mKey(key) { }
  nsClearingVoidPtrHashKey(const nsClearingVoidPtrHashKey& toCopy) :
    mKey(toCopy.mKey) { }
  ~nsClearingVoidPtrHashKey() { mKey = NULL; }

  KeyType GetKey() const { return mKey; }
  
  PRBool KeyEquals(KeyTypePointer aKey) const { return aKey == mKey; }

  static KeyTypePointer KeyToPointer(KeyType aKey) { return aKey; }
  static PLDHashNumber HashKey(KeyTypePointer aKey)
  {
    return NS_PTR_TO_INT32(aKey) >>2;
  }
  enum { ALLOW_MEMMOVE = PR_TRUE };

private:
  const void* mKey;
};

/**
 * hashkey wrapper using nsID KeyType
 *
 * @see nsTHashtable::EntryType for specification
 */
class nsIDHashKey : public PLDHashEntryHdr
{
public:
  typedef const nsID& KeyType;
  typedef const nsID* KeyTypePointer;
  
  nsIDHashKey(const nsID* inID) : mID(*inID) { }
  nsIDHashKey(const nsIDHashKey& toCopy) : mID(toCopy.mID) { }
  ~nsIDHashKey() { }

  KeyType GetKey() const { return mID; }

  PRBool KeyEquals(KeyTypePointer aKey) const { return aKey->Equals(mID); }

  static KeyTypePointer KeyToPointer(KeyType aKey) { return &aKey; }
  static PLDHashNumber HashKey(KeyTypePointer aKey);
  enum { ALLOW_MEMMOVE = PR_TRUE };

private:
  const nsID mID;
};

/**
 * hashkey wrapper for "dependent" const char*; this class does not "own"
 * its string pointer.
 *
 * This class must only be used if the strings have a lifetime longer than
 * the hashtable they occupy. This normally occurs only for static
 * strings or strings that have been arena-allocated.
 *
 * @see nsTHashtable::EntryType for specification
 */
class nsDepCharHashKey : public PLDHashEntryHdr
{
public:
  typedef const char* KeyType;
  typedef const char* KeyTypePointer;

  nsDepCharHashKey(const char* aKey) { mKey = aKey; }
  nsDepCharHashKey(const nsDepCharHashKey& toCopy) { mKey = toCopy.mKey; }
  ~nsDepCharHashKey() { }

  const char* GetKey() const { return mKey; }
  PRBool KeyEquals(const char* aKey) const
  {
    return !strcmp(mKey, aKey);
  }

  static const char* KeyToPointer(const char* aKey) { return aKey; }
  static PLDHashNumber HashKey(const char* aKey) { return HashString(aKey); }
  enum { ALLOW_MEMMOVE = PR_TRUE };

private:
  const char* mKey;
};

/**
 * hashkey wrapper for const char*; at construction, this class duplicates
 * a string pointed to by the pointer so that it doesn't matter whether or not
 * the string lives longer than the hash table.
 */
class nsCharPtrHashKey : public PLDHashEntryHdr
{
public:
  typedef const char* KeyType;
  typedef const char* KeyTypePointer;

  nsCharPtrHashKey(const char* aKey) : mKey(strdup(aKey)) { }
  nsCharPtrHashKey(const nsCharPtrHashKey& toCopy) : mKey(strdup(toCopy.mKey)) { }
  ~nsCharPtrHashKey() { if (mKey) free(const_cast<char *>(mKey)); }

  const char* GetKey() const { return mKey; }
  PRBool KeyEquals(KeyTypePointer aKey) const
  {
    return !strcmp(mKey, aKey);
  }

  static KeyTypePointer KeyToPointer(KeyType aKey) { return aKey; }
  static PLDHashNumber HashKey(KeyTypePointer aKey) { return HashString(aKey); }

  enum { ALLOW_MEMMOVE = PR_TRUE };

private:
  const char* mKey;
};

/**
 * hashkey wrapper for const PRUnichar*; at construction, this class duplicates
 * a string pointed to by the pointer so that it doesn't matter whether or not
 * the string lives longer than the hash table.
 */
class nsUnicharPtrHashKey : public PLDHashEntryHdr
{
public:
  typedef const PRUnichar* KeyType;
  typedef const PRUnichar* KeyTypePointer;

  nsUnicharPtrHashKey(const PRUnichar* aKey) : mKey(NS_strdup(aKey)) { }
  nsUnicharPtrHashKey(const nsUnicharPtrHashKey& toCopy) : mKey(NS_strdup(toCopy.mKey)) { }
  ~nsUnicharPtrHashKey() { if (mKey) NS_Free(const_cast<PRUnichar *>(mKey)); }

  const PRUnichar* GetKey() const { return mKey; }
  PRBool KeyEquals(KeyTypePointer aKey) const
  {
    return !NS_strcmp(mKey, aKey);
  }

  static KeyTypePointer KeyToPointer(KeyType aKey) { return aKey; }
  static PLDHashNumber HashKey(KeyTypePointer aKey) { return HashString(aKey); }

  enum { ALLOW_MEMMOVE = PR_TRUE };

private:
  const PRUnichar* mKey;
};

/**
 * Hashtable key class to use with objects that support nsIHashable
 */
class nsHashableHashKey : public PLDHashEntryHdr
{
public:
    typedef nsIHashable* KeyType;
    typedef const nsIHashable* KeyTypePointer;

    nsHashableHashKey(const nsIHashable* aKey) :
        mKey(const_cast<nsIHashable*>(aKey)) { }
    nsHashableHashKey(const nsHashableHashKey& toCopy) :
        mKey(toCopy.mKey) { }
    ~nsHashableHashKey() { }

    nsIHashable* GetKey() const { return mKey; }

    PRBool KeyEquals(const nsIHashable* aKey) const {
        PRBool eq;
        if (NS_SUCCEEDED(mKey->Equals(const_cast<nsIHashable*>(aKey), &eq))) {
            return eq;
        }
        return PR_FALSE;
    }

    static const nsIHashable* KeyToPointer(nsIHashable* aKey) { return aKey; }
    static PLDHashNumber HashKey(const nsIHashable* aKey) {
        PRUint32 code = 8888; // magic number if GetHashCode fails :-(
#ifdef NS_DEBUG
        nsresult rv =
#endif
        const_cast<nsIHashable*>(aKey)->GetHashCode(&code);
        NS_ASSERTION(NS_SUCCEEDED(rv), "GetHashCode should not throw!");
        return code;
    }
    
    enum { ALLOW_MEMMOVE = PR_TRUE };

private:
    nsCOMPtr<nsIHashable> mKey;
};

#endif // nsTHashKeys_h__
