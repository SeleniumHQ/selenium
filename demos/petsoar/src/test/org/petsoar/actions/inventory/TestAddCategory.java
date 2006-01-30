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

public class TestAddCategory extends TestCase {
    AddCategory action;
    Mock mockPs;

    protected void setUp() throws Exception {
        action = new AddCategory();
        mockPs = new Mock(PetStore.class);
        action.setPetStore((PetStore) mockPs.proxy());

    }

    public void testNoParent() throws Exception {
        action.setName("blah");
        Category category = new Category("blah");
        mockPs.expect("addCategory", category);

        String result = action.execute();

        assertEquals(Action.SUCCESS, result);
    }

    public void testExistingParent() throws Exception {
        action.setName("blah");
        action.setParentId(123);
        Category parent = new Category("blahParent");
        parent.setId(123);
        Category category = new Category("blah");
        category.setParent(parent);
        mockPs.matchAndReturn("getCategory", new Long(123), parent);
        mockPs.expect("addCategory", category);

        String result = action.execute();

        assertEquals(Action.SUCCESS, result);
        assertEquals(parent, action.getCategory().getParent());
    }

    protected void tearDown() throws Exception {
        mockPs.verify();
    }
}
