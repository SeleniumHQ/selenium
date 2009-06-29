/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
 *
 * ***** BEGIN LICENSE BLOCK *****
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
 * The Original Code is the Mozilla browser.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications, Inc.
 * Portions created by the Initial Developer are Copyright (C) 1999
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Scott Collins <scc@netscape.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

#ifndef nsWeakReference_h__
#define nsWeakReference_h__

// nsWeakReference.h

#include "nsIWeakReference.h"
#include "nsIWeakReferenceUtils.h"

class nsWeakReference;

// Set IMETHOD_VISIBILITY to empty so that the class-level NS_COM declaration
// controls member method visibility.
#undef  IMETHOD_VISIBILITY
#define IMETHOD_VISIBILITY NS_COM_GLUE

class NS_COM_GLUE nsSupportsWeakReference : public nsISupportsWeakReference
  {
    public:
      nsSupportsWeakReference()
          : mProxy(0)
        {
          // nothing else to do here
        }

      NS_DECL_NSISUPPORTSWEAKREFERENCE

    protected:
      inline ~nsSupportsWeakReference();

    private:
      friend class nsWeakReference;

      void
      NoticeProxyDestruction()
          // ...called (only) by an |nsWeakReference| from _its_ dtor.
        {
          mProxy = 0;
        }

      nsWeakReference* mProxy;

		protected:

			void ClearWeakReferences();
			PRBool HasWeakReferences() const {return mProxy != 0;}
  };

#undef  IMETHOD_VISIBILITY
#define IMETHOD_VISIBILITY NS_VISIBILITY_HIDDEN

inline
nsSupportsWeakReference::~nsSupportsWeakReference()
  {
  	ClearWeakReferences();
  }

#endif
