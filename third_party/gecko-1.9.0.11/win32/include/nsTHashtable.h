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

#ifndef nsTHashtable_h__
#define nsTHashtable_h__

#include "nscore.h"
#include "pldhash.h"
#include "nsDebug.h"
#include NEW_H

// helper function for nsTHashtable::Clear()
NS_COM_GLUE PLDHashOperator
PL_DHashStubEnumRemove(PLDHashTable    *table,
                       PLDHashEntryHdr *entry,
                       PRUint32         ordinal,
                       void            *userArg);


/**
 * a base class for templated hashtables.
 *
 * Clients will rarely need to use this class directly. Check the derived
 * classes first, to see if they will meet your needs.
 *
 * @param EntryType  the templated entry-type class that is managed by the
 *   hashtable. <code>EntryType</code> must extend the following declaration,
 *   and <strong>must not declare any virtual functions or derive from classes
 *   with virtual functions.</strong>  Any vtable pointer would break the
 *   PLDHashTable code.
 *<pre>   class EntryType : public PLDHashEntryHdr
 *   {
 *   public: or friend nsTHashtable<EntryType>;
 *     // KeyType is what we use when Get()ing or Put()ing this entry
 *     // this should either be a simple datatype (PRUint32, nsISupports*) or
 *     // a const reference (const nsAString&)
 *     typedef something KeyType;
 *     // KeyTypePointer is the pointer-version of KeyType, because pldhash.h
 *     // requires keys to cast to <code>const void*</code>
 *     typedef const something* KeyTypePointer;
 *
 *     EntryType(KeyTypePointer aKey);
 *
 *     // the copy constructor must be defined, even if AllowMemMove() == true
 *     // or you will cause link errors!
 *     EntryType(const EntryType& aEnt);
 *
 *     // the destructor must be defined... or you will cause link errors!
 *     ~EntryType();
 *
 *     // KeyEquals(): does this entry match this key?
 *     PRBool KeyEquals(KeyTypePointer aKey) const;
 *
 *     // KeyToPointer(): Convert KeyType to KeyTypePointer
 *     static KeyTypePointer KeyToPointer(KeyType aKey);
 *
 *     // HashKey(): calculate the hash number
 *     static PLDHashNumber HashKey(KeyTypePointer aKey);
 *
 *     // ALLOW_MEMMOVE can we move this class with memmove(), or do we have
 *     // to use the copy constructor?
 *     enum { ALLOW_MEMMOVE = PR_(TRUE or FALSE) };
 *   }</pre>
 *
 * @see nsInterfaceHashtable
 * @see nsDataHashtable
 * @see nsClassHashtable
 * @author "Benjamin Smedberg <bsmedberg@covad.net>"
 */

template<class EntryType>
class nsTHashtable
{
public:
  /**
   * A dummy constructor; you must call Init() before using this class.
   */
  nsTHashtable();

  /**
   * destructor, cleans up and deallocates
   */
  ~nsTHashtable();

  /**
   * Initialize the table.  This function must be called before any other
   * class operations.  This can fail due to OOM conditions.
   * @param initSize the initial number of buckets in the hashtable, default 16
   * @return PR_TRUE if the class was initialized properly.
   */
  PRBool Init(PRUint32 initSize = PL_DHASH_MIN_SIZE);

  /**
   * Check whether the table has been initialized. This can be useful for static hashtables.
   * @return the initialization state of the class.
   */
  PRBool IsInitialized() const { return !!mTable.entrySize; }

  /**
   * KeyType is typedef'ed for ease of use.
   */
  typedef typename EntryType::KeyType KeyType;

  /**
   * KeyTypePointer is typedef'ed for ease of use.
   */
  typedef typename EntryType::KeyTypePointer KeyTypePointer;

  /**
   * Return the number of entries in the table.
   * @return    number of entries
   */
  PRUint32 Count() const { return mTable.entryCount; }

  /**
   * Get the entry associated with a key.
   * @param     aKey the key to retrieve
   * @return    pointer to the entry class, if the key exists; nsnull if the
   *            key doesn't exist
   */
  EntryType* GetEntry(KeyType aKey) const
  {
    NS_ASSERTION(mTable.entrySize, "nsTHashtable was not initialized properly.");
  
    EntryType* entry =
      reinterpret_cast<EntryType*>
                      (PL_DHashTableOperate(
                            const_cast<PLDHashTable*>(&mTable),
                            EntryType::KeyToPointer(aKey),
                            PL_DHASH_LOOKUP));
    return PL_DHASH_ENTRY_IS_BUSY(entry) ? entry : nsnull;
  }

  /**
   * Get the entry associated with a key, or create a new entry,
   * @param     aKey the key to retrieve
   * @return    pointer to the entry class retreived; nsnull only if memory
                can't be allocated
   */
  EntryType* PutEntry(KeyType aKey)
  {
    NS_ASSERTION(mTable.entrySize, "nsTHashtable was not initialized properly.");
    
    return static_cast<EntryType*>
                      (PL_DHashTableOperate(
                            &mTable,
                            EntryType::KeyToPointer(aKey),
                            PL_DHASH_ADD));
  }

  /**
   * Remove the entry associated with a key.
   * @param     aKey of the entry to remove
   */
  void RemoveEntry(KeyType aKey)
  {
    NS_ASSERTION(mTable.entrySize, "nsTHashtable was not initialized properly.");

    PL_DHashTableOperate(&mTable,
                         EntryType::KeyToPointer(aKey),
                         PL_DHASH_REMOVE);
  }

  /**
   * Remove the entry associated with a key, but don't resize the hashtable.
   * This is a low-level method, and is not recommended unless you know what
   * you're doing and you need the extra performance. This method can be used
   * during enumeration, while RemoveEntry() cannot.
   * @param aEntry   the entry-pointer to remove (obtained from GetEntry or
   *                 the enumerator
   */
  void RawRemoveEntry(EntryType* aEntry)
  {
    PL_DHashTableRawRemove(&mTable, aEntry);
  }

  /**
   * client must provide an <code>Enumerator</code> function for
   *   EnumerateEntries
   * @param     aEntry the entry being enumerated
   * @param     userArg passed unchanged from <code>EnumerateEntries</code>
   * @return    combination of flags
   *            @link PLDHashOperator::PL_DHASH_NEXT PL_DHASH_NEXT @endlink ,
   *            @link PLDHashOperator::PL_DHASH_STOP PL_DHASH_STOP @endlink ,
   *            @link PLDHashOperator::PL_DHASH_REMOVE PL_DHASH_REMOVE @endlink
   */
  typedef PLDHashOperator (*PR_CALLBACK Enumerator)(EntryType* aEntry, void* userArg);

  /**
   * Enumerate all the entries of the function.
   * @param     enumFunc the <code>Enumerator</code> function to call
   * @param     userArg a pointer to pass to the
   *            <code>Enumerator</code> function
   * @return    the number of entries actually enumerated
   */
  PRUint32 EnumerateEntries(Enumerator enumFunc, void* userArg)
  {
    NS_ASSERTION(mTable.entrySize, "nsTHashtable was not initialized properly.");
    
    s_EnumArgs args = { enumFunc, userArg };
    return PL_DHashTableEnumerate(&mTable, s_EnumStub, &args);
  }

  /**
   * remove all entries, return hashtable to "pristine" state ;)
   */
  void Clear()
  {
    NS_ASSERTION(mTable.entrySize, "nsTHashtable was not initialized properly.");

    PL_DHashTableEnumerate(&mTable, PL_DHashStubEnumRemove, nsnull);
  }

protected:
  PLDHashTable mTable;

  static const void* PR_CALLBACK s_GetKey(PLDHashTable    *table,
                                          PLDHashEntryHdr *entry);

  static PLDHashNumber PR_CALLBACK s_HashKey(PLDHashTable *table,
                                             const void   *key);

  static PRBool PR_CALLBACK s_MatchEntry(PLDHashTable           *table,
                                         const PLDHashEntryHdr  *entry,
                                         const void             *key);
  
  static void PR_CALLBACK s_CopyEntry(PLDHashTable          *table,
                                      const PLDHashEntryHdr *from,
                                      PLDHashEntryHdr       *to);
  
  static void PR_CALLBACK s_ClearEntry(PLDHashTable *table,
                                       PLDHashEntryHdr *entry);

  static PRBool PR_CALLBACK s_InitEntry(PLDHashTable     *table,
                                        PLDHashEntryHdr  *entry,
                                        const void       *key);

  /**
   * passed internally during enumeration.  Allocated on the stack.
   *
   * @param userFunc the Enumerator function passed to
   *   EnumerateEntries by the client
   * @param userArg the userArg passed unaltered
   */
  struct s_EnumArgs
  {
    Enumerator userFunc;
    void* userArg;
  };
  
  static PLDHashOperator PR_CALLBACK s_EnumStub(PLDHashTable    *table,
                                                PLDHashEntryHdr *entry,
                                                PRUint32         number,
                                                void            *arg);
private:
  // copy constructor, not implemented
  nsTHashtable(nsTHashtable<EntryType>& toCopy);

  // assignment operator, not implemented
  nsTHashtable<EntryType>& operator= (nsTHashtable<EntryType>& toEqual);
};

//
// template definitions
//

template<class EntryType>
nsTHashtable<EntryType>::nsTHashtable()
{
  // entrySize is our "I'm initialized" indicator
  mTable.entrySize = 0;
}

template<class EntryType>
nsTHashtable<EntryType>::~nsTHashtable()
{
  if (mTable.entrySize)
    PL_DHashTableFinish(&mTable);
}

template<class EntryType>
PRBool
nsTHashtable<EntryType>::Init(PRUint32 initSize)
{
  if (mTable.entrySize)
  {
    NS_ERROR("nsTHashtable::Init() should not be called twice.");
    return PR_TRUE;
  }

  static PLDHashTableOps sOps = 
  {
    ::PL_DHashAllocTable,
    ::PL_DHashFreeTable,
    s_HashKey,
    s_MatchEntry,
    ::PL_DHashMoveEntryStub,
    s_ClearEntry,
    ::PL_DHashFinalizeStub,
    s_InitEntry
  };

  if (!EntryType::ALLOW_MEMMOVE)
  {
    sOps.moveEntry = s_CopyEntry;
  }
  
  if (!PL_DHashTableInit(&mTable, &sOps, nsnull, sizeof(EntryType), initSize))
  {
    // if failed, reset "flag"
    mTable.entrySize = 0;
    return PR_FALSE;
  }

  return PR_TRUE;
}

// static definitions

template<class EntryType>
PLDHashNumber
nsTHashtable<EntryType>::s_HashKey(PLDHashTable  *table,
                                   const void    *key)
{
  return EntryType::HashKey(reinterpret_cast<const KeyTypePointer>(key));
}

template<class EntryType>
PRBool
nsTHashtable<EntryType>::s_MatchEntry(PLDHashTable          *table,
                                      const PLDHashEntryHdr *entry,
                                      const void            *key)
{
  return ((const EntryType*) entry)->KeyEquals(
    reinterpret_cast<const KeyTypePointer>(key));
}

template<class EntryType>
void
nsTHashtable<EntryType>::s_CopyEntry(PLDHashTable          *table,
                                     const PLDHashEntryHdr *from,
                                     PLDHashEntryHdr       *to)
{
  EntryType* fromEntry =
    const_cast<EntryType*>(reinterpret_cast<const EntryType*>(from));

  new(to) EntryType(*fromEntry);

  fromEntry->~EntryType();
}

template<class EntryType>
void
nsTHashtable<EntryType>::s_ClearEntry(PLDHashTable    *table,
                                      PLDHashEntryHdr *entry)
{
  reinterpret_cast<EntryType*>(entry)->~EntryType();
}

template<class EntryType>
PRBool
nsTHashtable<EntryType>::s_InitEntry(PLDHashTable    *table,
                                     PLDHashEntryHdr *entry,
                                     const void      *key)
{
  new(entry) EntryType(reinterpret_cast<KeyTypePointer>(key));
  return PR_TRUE;
}

template<class EntryType>
PLDHashOperator
nsTHashtable<EntryType>::s_EnumStub(PLDHashTable    *table,
                                    PLDHashEntryHdr *entry,
                                    PRUint32         number,
                                    void            *arg)
{
  // dereferences the function-pointer to the user's enumeration function
  return (* reinterpret_cast<s_EnumArgs*>(arg)->userFunc)(
    reinterpret_cast<EntryType*>(entry),
    reinterpret_cast<s_EnumArgs*>(arg)->userArg);
}

#endif // nsTHashtable_h__
