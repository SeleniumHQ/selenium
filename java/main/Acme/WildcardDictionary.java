// WildcardDictionary - a dictionary with wildcard lookups
//
// Copyright (C) 1996 by Jef Poskanzer <jef@acme.com>.  All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
// OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
// OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// Visit the ACME Labs Java page for up-to-date versions of this and other

/*
Copyright (c) 2003 ThoughtWorks, Inc. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

   3. The end-user documentation included with the redistribution, if any, must
      include the following acknowledgment:

          This product includes software developed by ThoughtWorks, Inc.
          (http://www.thoughtworks.com/).

      Alternately, this acknowledgment may appear in the software itself, if and
      wherever such third-party acknowledgments normally appear.

   4. The names "CruiseControl", "CruiseControl.NET", "CCNET", and
      "ThoughtWorks, Inc." must not be used to endorse or promote products derived
      from this software without prior written permission. For written permission,
      please contact opensource@thoughtworks.com.

   5. Products derived from this software may not be called "Selenium" or
      "ThoughtWorks", nor may "Selenium" or "ThoughtWorks" appear in their name,
      without prior written permission of ThoughtWorks, Inc.


THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THOUGHTWORKS
INC OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
*/
package Acme;

import java.util.*;

public class WildcardDictionary extends Dictionary
    {

    private Vector keys;
    private Vector elements;

    /// Constructor.
    public WildcardDictionary()
	{
	keys = new Vector();
	elements = new Vector();
	}

    /// Returns the number of elements contained within the dictionary.
    public int size()
	{
	return elements.size();
	}

    /// Returns true if the dictionary contains no elements.
    public boolean isEmpty()
	{
	return size() == 0;
	}

    /// Returns an enumeration of the dictionary's keys.
    public Enumeration keys()
	{
	return keys.elements();
	}

    /// Returns an enumeration of the elements. Use the Enumeration methods
    // on the returned object to fetch the elements sequentially.
    public Enumeration elements()
	{
	return elements.elements();
	}

    /// Gets the object associated with the specified key in the dictionary.
    // The key is assumed to be a String, which is matched against
    // the wildcard-pattern keys in the dictionary.
    // @param key the string to match
    // @returns the element for the key, or null if there's no match
    // @see Acme.Utils#match
    public synchronized Object get( Object key )
    {
        String sKey = (String) key;
        int matching_len = 0, found = -1;
        // to optimize speed, keys should be sorted by length
        // TODO: above
        for ( int i = keys.size()-1; i > -1 ; i-- )
        {
            String thisKey = (String) keys.elementAt( i );
            int current = Acme.Utils.matchSpan( thisKey, sKey );
            if (current > matching_len)
            {
                found = i;
                matching_len = current;
            }
        }
        if (found > -1)
            return elements.elementAt( found );
        return null;
    }

    public static String trimPathSeparators(String src) {
        StringBuffer result = new StringBuffer(src.length());
        boolean ms = false;
        for (int i=0; i<src.length(); i++) {
            char c = src.charAt(i);
            if (c == '/' || c == '\\') {
                if (!ms) {
                    result.append(c);
                    ms = true;
                }
            } else {
                result.append(c);
                ms = false;
            }
        }
        return result.toString();
    }

    /// Puts the specified element into the Dictionary, using the specified
    // key.  The element may be retrieved by doing a get() with the same
    // key.  The key and the element cannot be null.
    // @param key the specified wildcard-pattern key
    // @param value the specified element
    // @return the old value of the key, or null if it did not have one.
    // @exception NullPointerException If the value of the specified
    // element is null.
    public synchronized Object put( Object key, Object element )
	{
	int i = keys.indexOf( key );
	if ( i != -1 )
	    {
	    Object oldElement = elements.elementAt( i );
	    elements.setElementAt( element, i );
	    return oldElement;
	    }
	else
	    {
	    keys.addElement( key );
	    elements.addElement( element );
	    return null;
	    }
	}

    /// Removes the element corresponding to the key. Does nothing if the
    // key is not present.
    // @param key the key that needs to be removed
    // @return the value of key, or null if the key was not found.
    public synchronized Object remove( Object key )
	{
	int i = keys.indexOf( key );
	if ( i != -1 )
	    {
	    Object oldElement = elements.elementAt( i );
	    keys.removeElementAt( i );
	    elements.removeElementAt( i );
	    return oldElement;
	    }
	else
	    return null;
	}
    }
