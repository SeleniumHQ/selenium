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

package org.petsoar.actions.inventory;

import com.mockobjects.dynamic.Mock;
import com.opensymphony.xwork.Action;
import junit.framework.TestCase;
import org.petsoar.categories.Category;
import org.petsoar.pets.PetStore;

import java.util.ArrayList;
import java.util.List;

public class TestListCategories extends TestCase {
    ListCategories action;
    Mock mockPs;

    protected void setUp() throws Exception {
        action = new ListCategories();
        mockPs = new Mock(PetStore.class);
        action.setPetStore((PetStore) mockPs.proxy());
    }

    public void testListNoParents() throws Exception {
        List categories = new ArrayList();
        categories.add(new Category("child1"));
        categories.add(new Category("child2"));
        mockPs.matchAndReturn("getRootCategories", categories);

        String result = action.execute();

        assertEquals(Action.SUCCESS, result);
        assertEquals(categories, action.getCategories());
    }

    public void testListWithParent() throws Exception {
        action.setParentId(123);
        List categories = new ArrayList();
        categories.add(new Category("child1"));
        categories.add(new Category("child2"));
        mockPs.matchAndReturn("getCategory", new Long(123), categories);

        String result = action.execute();

        assertEquals(Action.SUCCESS, result);
        assertEquals(categories, action.getCategories());
    }

    protected void tearDown() throws Exception {
        mockPs.verify();
    }
}
