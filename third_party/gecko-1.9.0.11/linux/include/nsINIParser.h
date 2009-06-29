/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
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
 * The Original Code is Mozilla Communicator client code, released
 * March 31, 1998.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Samir Gehani <sgehani@netscape.com>
 *   Benjamin Smedberg <bsmedberg@covad.net>
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

// This file was shamelessly copied from mozilla/xpinstall/wizard/unix/src2

#ifndef nsINIParser_h__
#define nsINIParser_h__

#ifdef MOZILLA_INTERNAL_API
#define nsINIParser nsINIParser_internal
#endif

#include "nscore.h"
#include "nsClassHashtable.h"
#include "nsAutoPtr.h"

#include <stdio.h>

class nsILocalFile;

class NS_COM_GLUE nsINIParser
{
public:
    nsINIParser() { }
    ~nsINIParser() { }

    /**
     * Initialize the INIParser with a nsILocalFile. If this method fails, no
     * other methods should be called. This method reads and parses the file,
     * the class does not hold a file handle open. An instance must only be
     * initialized once.
     */
    nsresult Init(nsILocalFile* aFile);

    /**
     * Initialize the INIParser with a file path. If this method fails, no
     * other methods should be called. This method reads and parses the file,
     * the class does not hold a file handle open. An instance must only
     * be initialized once.
     */
    nsresult Init(const char *aPath);

    /**
     * Callback for GetSections
     * @return PR_FALSE to stop enumeration, or PR_TRUE to continue.
     */
    typedef PRBool
    (* PR_CALLBACK INISectionCallback)(const char *aSection,
                                       void *aClosure);

    /**
     * Enumerate the sections within the INI file.
     */
    nsresult GetSections(INISectionCallback aCB, void *aClosure);

    /**
     * Callback for GetStrings
     * @return PR_FALSE to stop enumeration, or PR_TRUE to continue
     */
    typedef PRBool
    (* PR_CALLBACK INIStringCallback)(const char *aString,
                                      const char *aValue,
                                      void *aClosure);

    /**
     * Enumerate the strings within a section. If the section does
     * not exist, this function will silently return.
     */
    nsresult GetStrings(const char *aSection,
                        INIStringCallback aCB, void *aClosure);

    /**
     * Get the value of the specified key in the specified section
     * of the INI file represented by this instance.
     *
     * @param aSection      section name
     * @param aKey          key name
     * @param aResult       the value found
     * @throws NS_ERROR_FAILURE if the specified section/key could not be
     *                          found.
     */
    nsresult GetString(const char *aSection, const char *aKey, 
                       nsACString &aResult);

    /**
     * Alternate signature of GetString that uses a pre-allocated buffer
     * instead of a nsACString (for use in the standalone glue before
     * the glue is initialized).
     *
     * @throws NS_ERROR_LOSS_OF_SIGNIFICANT_DATA if the aResult buffer is not
     *         large enough for the data. aResult will be filled with as
     *         much data as possible.
     *         
     * @see GetString [1]
     */
    nsresult GetString(const char *aSection, const char* aKey,
                       char *aResult, PRUint32 aResultLen);

private:
    struct INIValue
    {
        INIValue(const char *aKey, const char *aValue)
            : key(aKey), value(aValue) { }

        const char *key;
        const char *value;
        nsAutoPtr<INIValue> next;
    };

    struct GSClosureStruct
    {
        INISectionCallback  usercb;
        void               *userclosure;
    };

    nsClassHashtable<nsDepCharHashKey, INIValue> mSections;
    nsAutoArrayPtr<char> mFileContents;    

    nsresult InitFromFILE(FILE *fd);

    static PLDHashOperator GetSectionsCB(const char *aKey,
                                         INIValue *aData, void *aClosure);
};

#endif /* nsINIParser_h__ */
