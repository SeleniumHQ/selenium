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

package org.petsoar.persistence.hibernate;

import org.petsoar.categories.Category;
import org.petsoar.persistence.AbstractPersistentTest;
import org.petsoar.pets.Pet;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class TestHibernatePersistenceManager extends AbstractPersistentTest {
    protected HibernatePersistenceManager pm;

    protected void setUp() throws Exception {
        super.setUp();

        pm = new HibernatePersistenceManager();
        pm.setHibernateSessionFactory(hs);
        pm.init();
    }

    protected void tearDown() throws Exception {
        pm.endSession();
        pm.dispose();
        super.tearDown();
    }

    public void testAddPetAndGetById() throws Exception {
        // save a new Pet to the db
        Pet pet = new Pet();
        //pet.setCategory();
        pet.setName("spoon");
        pm.save(pet);
        pm.endSession();

        // keep id but lose reference to object
        long id = pet.getId();
        pet = null;

        // look it up again
        Pet newPet = (Pet) pm.getById(Pet.class, id);
        assertEquals("spoon", newPet.getName());
    }

    public void testFindAll() throws Exception {
        assertEquals(0, pm.findAll(Pet.class).size());

        Pet pet1 = new Pet();
        pet1.setName("1");
        Pet pet2 = new Pet();
        pet2.setName("2");

        pm.save(pet1);
        pm.save(pet2);
        pm.endSession();

        List pets = pm.findAll(Pet.class);
        assertEquals(2, pets.size());

        // ensure pets are sorted
        Collections.sort(pets, new Comparator() {
            public int compare(Object o1, Object o2) {
                return ((Pet) o1).getName().compareTo(((Pet) o2).getName());
            }
        });

        assertEquals("1", ((Pet) pets.get(0)).getName());
        assertEquals("2", ((Pet) pets.get(1)).getName());
    }

    public void testFindAllWithSort() {

        Pet pet1 = new Pet();
        pet1.setName("zzz");
        Pet pet2 = new Pet();
        pet2.setName("aaa");
        Pet pet3 = new Pet();
        pet3.setName("BBB");

        pm.save(pet1);
        pm.save(pet2);
        pm.save(pet3);

        List pets = pm.findAllSorted(Pet.class, "name");
        assertEquals("aaa", ((Pet) pets.get(0)).getName());
        assertEquals("BBB", ((Pet) pets.get(1)).getName());
        assertEquals("zzz", ((Pet) pets.get(2)).getName());
    }

    public void testModifyOne() throws Exception {
        Pet pet;

        // save initial pet
        pet = new Pet();
        pet.setName("cat");
        pm.save(pet);
        pm.endSession();

        long id = pet.getId();
        pet = null;

        // look it up and change it
        pet = (Pet) pm.getById(Pet.class, id);
        pet.setName("dog");
        pm.endSession();
        pet = null;

        // check modifications occurred
        pet = (Pet) pm.getById(Pet.class, id);
        assertEquals("dog", pet.getName());
    }

    public void testModifyMultiple() throws Exception {
        Pet p1 = new Pet();
        p1.setName("a.1");
        Pet p2 = new Pet();
        p2.setName("a.2");

        pm.save(p1);
        pm.save(p2);

        List pets = pm.findAll(Pet.class);
        Pet pet1 = (Pet) pets.get(0);
        Pet pet2 = (Pet) pets.get(1);

        pet1.setName("b.1");
        pet2.setName("b.2");

        pets = pm.findAll(Pet.class);

        // ensure pets are sorted
        Collections.sort(pets, new Comparator() {
            public int compare(Object o1, Object o2) {
                return ((Pet) o1).getName().compareTo(((Pet) o2).getName());
            }
        });

        Pet updatedPet1 = (Pet) pets.get(0);
        Pet updatedPet2 = (Pet) pets.get(1);

        assertEquals("b.1", updatedPet1.getName());
        assertEquals("b.2", updatedPet2.getName());
        pm.endSession();
    }

    public void testRemove() throws Exception {
        Pet pet = new Pet();
        pet.setName("cat");
        pm.save(pet);
        pm.endSession();

        assertEquals(1, pm.findAll(Pet.class).size());

        pm.remove(pet);
        pm.endSession();

        assertEquals(0, pm.findAll(Pet.class).size());
    }

    public void testNotFound() throws Exception {
        Pet p = new Pet();
        p.setName("xx");
        pm.save(p);
        pm.endSession();

        long id = p.getId();

        pm.remove(p);
        pm.endSession();

        Object byId = pm.getById(Pet.class, id);
        assertNull(byId);

        byId = pm.getById(Pet.class, 4536536363L);
        assertNull(byId);
    }

    public void testFindUsingHibernateQuery() throws Exception {
        // TODO: Remove this - it violates hibernate encapsulation.

        Pet p = new Pet();
        p.setName("xx");
        pm.save(p);
        pm.endSession();

        List categories = pm.find("FROM pet IN CLASS org.petsoar.pets.Pet WHERE pet.name=?", new Object[]{"xx"}, new Class[]{String.class});

        assertEquals(1, categories.size());
        assertEquals(p, categories.get(0));
    }

    public void testAddPetsToCategory() throws Exception {
        Category category = new Category();
        category.setName("yy");

        pm.save(category);
        pm.endSession();

        Pet pet = new Pet();
        pet.setName("xx");

        category.addPet(pet);

        pm.save(pet);
        pm.endSession();

        assertEquals(1, category.getPets().size());
        assertEquals(category, pet.getCategory());

        category = (Category) pm.getById(Category.class, category.getId());
        pet = (Pet) pm.getById(Pet.class, pet.getId());

        assertEquals(1, category.getPets().size());
        assertEquals(category, pet.getCategory());
    }
}
