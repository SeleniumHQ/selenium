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

package org.petsoar.actions.storefront;

import com.mockobjects.dynamic.C;
import com.mockobjects.dynamic.Mock;
import com.opensymphony.xwork.Action;
import junit.framework.TestCase;
import org.petsoar.persistence.PersistenceManager;
import org.petsoar.pets.Pet;
import org.petsoar.search.Searcher;

import java.util.ArrayList;
import java.util.List;

public class TestStoreFrontSearch extends TestCase {
    private StoreFrontSearch action;
    private Mock mockSearcher;
    private Mock mockPersistenceManager;

    protected void setUp() throws Exception {
        super.setUp();
        mockSearcher = new Mock(Searcher.class);
        mockPersistenceManager = new Mock(PersistenceManager.class);
        action = new StoreFrontSearch();
    }

    public void testSearch() throws Exception {
        // setup
        Pet pet = new Pet();
        pet.setId(123);
        pet.setName("Billy");

        List pets = new ArrayList();
        pets.add(new Long(pet.getId()));

        mockPersistenceManager.expectAndReturn("getById", C.args(C.eq(Pet.class), C.eq(123l)), pet);

        mockSearcher.expectAndReturn("search", "dog", pets);

        action.setSearcher((Searcher) mockSearcher.proxy());
        action.setPersistenceManager((PersistenceManager) mockPersistenceManager.proxy());

        // execute
        action.setQuery("dog");
//      action.setPageOffset(20);
//      action.setPageSize(10);

        String result = action.execute();

        // verify expectation has been met
        mockSearcher.verify();

        assertEquals(Action.SUCCESS, result);
        assertNotNull(action.getPets());
        assertEquals(1, action.getPets().size());
        assertEquals(pet, action.getPets().get(0));
    }
}
