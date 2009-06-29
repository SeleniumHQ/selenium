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

#ifndef nsInterfaceHashtable_h__
#define nsInterfaceHashtable_h__

#include "nsBaseHashtable.h"
#include "nsHashKeys.h"
#include "nsCOMPtr.h"

/**
 * templated hashtable class maps keys to interface pointers.
 * See nsBaseHashtable for complete declaration.
 * @param KeyClass a wrapper-class for the hashtable key, see nsHashKeys.h
 *   for a complete specification.
 * @param Interface the interface-type being wrapped
 * @see nsDataHashtable, nsClassHashtable
 */
template<class KeyClass,class Interface>
class nsInterfaceHashtable :
  public nsBaseHashtable< KeyClass, nsCOMPtr<Interface> , Interface* >
{
public:
  typedef typename KeyClass::KeyType KeyType;
  typedef Interface* UserDataType;

  /**
   * @copydoc nsBaseHashtable::Get
   * @param pData This is an XPCOM getter, so pData is already_addrefed.
   *   If the key doesn't exist, pData will be set to nsnull.
   */
  PRBool Get(KeyType aKey, UserDataType* pData) const;

  /**
   * Gets a weak reference to the hashtable entry.
   * @param aFound If not nsnull, will be set to PR_TRUE if the entry is found,
   *               to PR_FALSE otherwise.
   * @return The entry, or nsnull if not found. Do not release this pointer!
   */
  Interface* GetWeak(KeyType aKey, PRBool* aFound = nsnull) const;
};

/**
 * Thread-safe version of nsInterfaceHashtable
 * @param KeyClass a wrapper-class for the hashtable key, see nsHashKeys.h
 *   for a complete specification.
 * @param Interface the interface-type being wrapped
 */
template<class KeyClass,class Interface>
class nsInterfaceHashtableMT :
  public nsBaseHashtableMT< KeyClass, nsCOMPtr<Interface> , Interface* >
{
public:
  typedef typename KeyClass::KeyType KeyType;
  typedef Interface* UserDataType;

  /**
   * @copydoc nsBaseHashtable::Get
   * @param pData This is an XPCOM getter, so pData is already_addrefed.
   *   If the key doesn't exist, pData will be set to nsnull.
   */
  PRBool Get(KeyType aKey, UserDataType* pData) const;

  // GetWeak does not make sense on a multi-threaded hashtable, where another
  // thread may remove the entry (and hence release it) as soon as GetWeak
  // returns
};


//
// nsInterfaceHashtable definitions
//

template<class KeyClass,class Interface>
PRBool
nsInterfaceHashtable<KeyClass,Interface>::Get
  (KeyType aKey, UserDataType* pInterface) const
{
  typename nsBaseHashtable<KeyClass, nsCOMPtr<Interface>, Interface*>::EntryType* ent =
    GetEntry(aKey);

  if (ent)
  {
    if (pInterface)
    {
      *pInterface = ent->mData;

      NS_IF_ADDREF(*pInterface);
    }

    return PR_TRUE;
  }

  // if the key doesn't exist, set *pInterface to null
  // so that it is a valid XPCOM getter
  if (pInterface)
    *pInterface = nsnull;

  return PR_FALSE;
}

template<class KeyClass,class Interface>
Interface*
nsInterfaceHashtable<KeyClass,Interface>::GetWeak
  (KeyType aKey, PRBool* aFound) const
{
  typename nsBaseHashtable<KeyClass, nsCOMPtr<Interface>, Interface*>::EntryType* ent =
    GetEntry(aKey);

  if (ent)
  {
    if (aFound)
      *aFound = PR_TRUE;

    return ent->mData;
  }

  // Key does not exist, return nsnull and set aFound to PR_FALSE
  if (aFound)
    *aFound = PR_FALSE;
  return nsnull;
}

//
// nsInterfaceHashtableMT definitions
//

template<class KeyClass,class Interface>
PRBool
nsInterfaceHashtableMT<KeyClass,Interface>::Get
  (KeyType aKey, UserDataType* pInterface) const
{
  PR_Lock(this->mLock);

  typename nsBaseHashtableMT<KeyClass, nsCOMPtr<Interface>, Interface*>::EntryType* ent =
    GetEntry(aKey);

  if (ent)
  {
    if (pInterface)
    {
      *pInterface = ent->mData;

      NS_IF_ADDREF(*pInterface);
    }

    PR_Unlock(this->mLock);

    return PR_TRUE;
  }

  // if the key doesn't exist, set *pInterface to null
  // so that it is a valid XPCOM getter
  if (pInterface)
    *pInterface = nsnull;

  PR_Unlock(this->mLock);

  return PR_FALSE;
}

#endif // nsInterfaceHashtable_h__
