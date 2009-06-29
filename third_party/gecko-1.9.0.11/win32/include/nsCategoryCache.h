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
 * The Original Code is a cache for services in a category.
 *
 * The Initial Developer of the Original Code is
 * Christian Biesinger <cbiesinger@web.de>.
 * Portions created by the Initial Developer are Copyright (C) 2005
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

#ifndef nsCategoryCache_h_
#define nsCategoryCache_h_

#include "nsICategoryManager.h"
#include "nsIObserver.h"
#include "nsISimpleEnumerator.h"
#include "nsISupportsPrimitives.h"

#include "nsServiceManagerUtils.h"

#include "nsAutoPtr.h"
#include "nsCOMArray.h"
#include "nsDataHashtable.h"

#include "nsXPCOM.h"

class NS_NO_VTABLE nsCategoryListener {
  protected:
    // no virtual destructor (people shouldn't delete through an
    // nsCategoryListener pointer)
    ~nsCategoryListener() {}

  public:
    virtual void EntryAdded(const nsCString& aValue) = 0;
    virtual void EntryRemoved(const nsCString& aValue) = 0;
    virtual void CategoryCleared() = 0;
};

class NS_COM_GLUE nsCategoryObserver : public nsIObserver {
  public:
    nsCategoryObserver(const char* aCategory,
                       nsCategoryListener* aCategoryListener);
    ~nsCategoryObserver();

    void ListenerDied();

    NS_DECL_ISUPPORTS
    NS_DECL_NSIOBSERVER
  private:
    nsDataHashtable<nsCStringHashKey, nsCString> mHash;
    nsCategoryListener*                          mListener;
    nsCString                                    mCategory;
};

/**
 * This is a helper class that caches services that are registered in a certain
 * category. The intended usage is that a service stores a variable of type
 * nsCategoryCache<nsIFoo> in a member variable, where nsIFoo is the interface
 * that these services should implement. The constructor of this class should
 * then get the name of the category.
 */
template<class T>
class nsCategoryCache : protected nsCategoryListener {
  public:
    explicit nsCategoryCache(const char* aCategory);
    ~nsCategoryCache() { if (mObserver) mObserver->ListenerDied(); }

    const nsCOMArray<T>& GetEntries() {
      // Lazy initialization, so that services in this category can't
      // cause reentrant getService (bug 386376)
      if (!mObserver)
        mObserver = new nsCategoryObserver(mCategoryName.get(), this);
      return mEntries;
    }
  protected:
    virtual void EntryAdded(const nsCString& aValue);
    virtual void EntryRemoved(const nsCString& aValue);
    virtual void CategoryCleared();
  private:
    friend class CategoryObserver;

    // Not to be implemented
    nsCategoryCache(const nsCategoryCache<T>&);

    nsCString mCategoryName;
    nsCOMArray<T> mEntries;
    nsRefPtr<nsCategoryObserver> mObserver;
};

// -----------------------------------
// Implementation

template<class T>
nsCategoryCache<T>::nsCategoryCache(const char* aCategory)
: mCategoryName(aCategory)
{
}

template<class T>
void nsCategoryCache<T>::EntryAdded(const nsCString& aValue) {
  nsCOMPtr<T> catEntry = do_GetService(aValue.get());
  if (catEntry)
    mEntries.AppendObject(catEntry);
}

template<class T>
void nsCategoryCache<T>::EntryRemoved(const nsCString& aValue) {
  nsCOMPtr<T> catEntry = do_GetService(aValue.get());
  if (catEntry)
    mEntries.RemoveObject(catEntry);
}

template<class T>
void nsCategoryCache<T>::CategoryCleared() {
  mEntries.Clear();
}

#endif
