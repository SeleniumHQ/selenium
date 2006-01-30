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

package org.petsoar.pets;

import com.mockobjects.constraint.IsEqual;
import com.mockobjects.dynamic.C;
import com.mockobjects.dynamic.Mock;
import junit.framework.TestCase;
import org.petsoar.categories.Category;
import org.petsoar.persistence.PersistenceManager;

import java.util.ArrayList;


public class TestDefaultPetStore extends TestCase {

    private DefaultPetStore petStore;
    private Mock mockPersistenceManager;

    protected void setUp() throws Exception {
        super.setUp();
        petStore = new DefaultPetStore();

        mockPersistenceManager = new Mock(PersistenceManager.class);
        petStore.setPersistenceManager((PersistenceManager) mockPersistenceManager.proxy());
    }

    public void testNoPets() throws Exception {
        ArrayList result = new ArrayList();
        mockPersistenceManager.matchAndReturn("findAllSorted", result);
        mockPersistenceManager.expectAndReturn("findAllSorted", C.args(new IsEqual(Pet.class), new IsEqual("name")), result);

        assertEquals(0, petStore.getPets().size());
        mockPersistenceManager.verify();
    }

    public void testAddSomePets() throws Exception {
        Pet p1 = new Pet();
        Pet p2 = new Pet();
        p1.setName("cow");
        p2.setName("dog");

        mockPersistenceManager.expect("save", p1);
        petStore.savePet(p1);

        mockPersistenceManager.expect("save", p2);
        petStore.savePet(p2);

        mockPersistenceManager.verify();
    }

    public void testGetPetById() {
        Pet p1 = new Pet();
        Pet p2 = new Pet();
        p1.setName("dog");
        p2.setName("cow");

        Long pet1IdLong = new Long(p1.getId());
        mockPersistenceManager.matchAndReturn("getById", pet1IdLong);
        mockPersistenceManager.expectAndReturn("getById", C.args(new IsEqual(Pet.class), new IsEqual(pet1IdLong)), p1);
        assertEquals(p1, petStore.getPet(p1.getId()));

        Long pet2IdLong = new Long(p2.getId());
        mockPersistenceManager.matchAndReturn("getById", pet2IdLong);
        mockPersistenceManager.expectAndReturn("getById", C.args(new IsEqual(Pet.class), new IsEqual(pet2IdLong)), p2);
        assertEquals(p2, petStore.getPet(p2.getId()));

        mockPersistenceManager.verify();
    }

    public void testRemovePet() {
        Pet p1 = new Pet();
        p1.setName("dog");

        mockPersistenceManager.expect("remove", p1);
        petStore.removePet(p1);

        mockPersistenceManager.verify();
    }

    public void testNoRootCategories() throws Exception {
        ArrayList result = new ArrayList();
        mockPersistenceManager.matchAndReturn("find", result);
        mockPersistenceManager.expectAndReturn("find", C.ANY_ARGS, result);

        assertEquals(0, petStore.getRootCategories().size());

        mockPersistenceManager.verify();
    }

    public void testAddSomeCategories() throws Exception {
        Category c1 = new Category("dogs");
        Category c2 = new Category("cats");

        mockPersistenceManager.expect("save", c1);
        petStore.addCategory(c1);

        mockPersistenceManager.expect("save", c2);
        petStore.addCategory(c2);

        mockPersistenceManager.verify();
    }

//    public void testParentChildCategories() throws Exception {
//        Category c1 = new Category("dogs");
//        Category c2 = new Category("poodles");
//
//        c1.addCategory(c2);
//
//        petStore.addCategory(c1);
//        petStore.addCategory(c2);
//
//        // first simply retrieve c2 again, and test the parent is c1!
//        Category newPoodles = petStore.getCategory(c1.getId());
//        assertEquals(1, newPoodles.getCategories().size());
//        assertEquals(c2, newPoodles.getCategories().get(0));
//
//        // now test only one root category
//        List categories = petStore.getRootCategories();
//        assertEquals(c1, categories.get(0));
//        assertEquals(1, categories.size());
//    }

    public void testGetCategoryById() {
        Category c1 = new Category("dogs");
        c1.setId(111);
        Category c2 = new Category("cats");
        c2.setId(222);

        Long cat1IdLong = new Long(c1.getId());
        mockPersistenceManager.matchAndReturn("getById", cat1IdLong);
        mockPersistenceManager.expectAndReturn("getById", C.args(new IsEqual(Category.class), new IsEqual(cat1IdLong)), c1);
        assertEquals(c1, petStore.getCategory(c1.getId()));

        Long cat2IdLong = new Long(c2.getId());
        mockPersistenceManager.matchAndReturn("getById", cat2IdLong);
        mockPersistenceManager.expectAndReturn("getById", C.args(new IsEqual(Category.class), new IsEqual(cat2IdLong)), c2);
        assertEquals(c2, petStore.getCategory(c2.getId()));

        mockPersistenceManager.verify();
    }

    public void testRemoveCategory() {
        Category c1 = new Category("dogs");

        mockPersistenceManager.expect("remove", c1);
        petStore.removeCategory(c1);

        mockPersistenceManager.verify();
    }
}
