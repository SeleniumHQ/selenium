/*
 * Copyright (c) 2003-2005, Wiley & Sons, Joe Walnes,Ara Abrahamian,
 * Mike Cannon-Brookes,Patrick A Lightbody
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the distribution.
 *     * Neither the name of the 'Wiley & Sons', 'Java Open Source
 * Programming' nor the names of the authors may be used to endorse or
 * promote products derived from this software without specific prior
 * written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

package org.petsoar.persistence.util;

import com.mockobjects.constraint.IsEqual;
import com.mockobjects.dynamic.C;
import com.mockobjects.dynamic.Mock;
import junit.framework.TestCase;
import org.petsoar.persistence.PersistenceManager;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class TestLazyLoaderList extends TestCase {
    private Mock mockPersistenceManager;

    protected void setUp() throws Exception {
        super.setUp();
        mockPersistenceManager = new Mock(PersistenceManager.class);
    }

    public void testLazyLoading() throws Exception {
        List idsList = new ArrayList();
        idsList.add(new Long(123));
        idsList.add(new Long(456));

        List lazyList = new LazyLoaderList(idsList, (PersistenceManager) mockPersistenceManager.proxy(), String.class);

        assertEquals(2, lazyList.size());

        mockPersistenceManager.matchAndReturn("getById", "123");
        mockPersistenceManager.expectAndReturn("getById", C.args(new IsEqual(String.class), new IsEqual(new Long(123))), "123");
        assertEquals("123", lazyList.get(0));

        mockPersistenceManager.matchAndReturn("getById", "456");
        mockPersistenceManager.expectAndReturn("getById", C.args(new IsEqual(String.class), new IsEqual(new Long(456))), "456");
        assertEquals("456", lazyList.get(1));

        mockPersistenceManager.matchAndReturn("getById", "123");
        assertEquals("123", lazyList.get(0));

        mockPersistenceManager.matchAndReturn("getById", "456");
        assertEquals("456", lazyList.get(1));

        Iterator iter = lazyList.iterator();

        while (iter.hasNext()) {
            String loaded_obj = (String) iter.next();
        }

        mockPersistenceManager.verify();
    }
}
