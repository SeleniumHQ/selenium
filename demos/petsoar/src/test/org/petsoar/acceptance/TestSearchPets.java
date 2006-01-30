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

package org.petsoar.acceptance;

import com.opensymphony.xwork.Action;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.store.FSDirectory;
import org.petsoar.acceptance.support.CleanOutStoreAction;
import org.petsoar.actions.inventory.InventorySavePet;
import org.petsoar.actions.storefront.StoreFrontListPets;
import org.petsoar.actions.storefront.StoreFrontSearch;
import org.petsoar.pets.Pet;

import java.util.List;

/**
 * Test the search engine works.
 *
 * AS A customer I WOULD LIKE to be able to perform keyword searches
 * on pets that match a specific criteria (such as "Brown Dog")
 * SO THAT it's quicker for me to locate a specfic pet if I know what
 * I want.
 */
public class TestSearchPets extends AbstractAcceptanceTest {
    protected void setUp() throws Exception
    {
        super.setUp();

        // this is a bit of a hack to get the index cleaned everytime :)
        new IndexWriter(FSDirectory.getDirectory("index", true), null, true).close();
    }

    public void testAddSomePets() throws Exception {
        // before running any other tests, clean out the store
        CleanOutStoreAction cleanOutStoreAction = new CleanOutStoreAction();
        init(cleanOutStoreAction);
        cleanOutStoreAction.execute();

        addSomePets();

        // Check there are 5 pets on the store front
        StoreFrontListPets listPetsAction = new StoreFrontListPets();
        init(listPetsAction);
        listPetsAction.execute();
        assertEquals(5, listPetsAction.getPets().size());
    }

    private void addSomePets() throws Exception {
        // Add some pets
        addPet("Billy the Badger", "A friendly little badger.");
        addPet("Molly the Moo", "Stroppy old big cow.");
        addPet("Pete the Penguin", "Clever bird. Can't fly.");
        addPet("Meow the Cat", "Small and molly cat.");
        addPet("Terrence the Tiger", "Technically this is a big cat.");
    }

    public void testGoodSearch() throws Exception {
        addSomePets();

        // Perform a search that returns some results
        StoreFrontSearch searchAction = new StoreFrontSearch();
        init(searchAction);
        searchAction.setQuery("cat");
        String result = searchAction.execute();
        assertEquals(Action.SUCCESS, result);

        List results = searchAction.getPets();
        assertEquals(2, results.size());
        assertEquals("Meow the Cat", ((Pet) results.get(0)).getName());
        assertEquals("Terrence the Tiger", ((Pet) results.get(1)).getName());
    }

    public void testSearchReturnsOneItem() throws Exception {
        addSomePets();

        // Perform a search that returns exactly one result

        StoreFrontSearch searchAction = new StoreFrontSearch();
        init(searchAction);
        searchAction.setQuery("badger");
        String result = searchAction.execute();
        assertEquals("success", result);

        assertEquals("Billy the Badger", searchAction.getPet().getName());

    }

    public void testBadSearch() {
        // Perform a bogus search

        List results = search("kjhkj khg");
        assertTrue(results.isEmpty());
    }

    public void testAdvancedQuery() throws Exception {
        addSomePets();

        // Perform an advanced search

        List results = search("\"big cat\" or cow");
        assertEquals(2, results.size());
        assertEquals("Terrence the Tiger", ((Pet) results.get(0)).getName());
        assertEquals("Molly the Moo", ((Pet) results.get(1)).getName());

    }

    public void testRanking() throws Exception {
        addSomePets();

        // Perform a search and check the results are ranked correctly

        addSomeDogs();

        List results = search("dogs");

        assertEquals(3, results.size());
        assertEquals("only dog", ((Pet) results.get(0)).getName());
        assertEquals("multi dog", ((Pet) results.get(1)).getName());
        assertEquals("slight dog", ((Pet) results.get(2)).getName());
    }

    private void addSomeDogs() throws Exception {
        addPet("slight dog", "I'm a dog and I go woof");
        addPet("only dog", "Dogs!");
        addPet("multi dog", "Doggy dog dog dog");
    }

    public void testModification() throws Exception {
        addPet("slight dog", "I'm a dog and I go woof");
        addPet("only dog", "Dogs!");
        long lastId = addPet("multi dog", "Doggy dog dog dog");

        // update the dog and ensure it the search stays up to date
        InventorySavePet savePetAction = new InventorySavePet();
        init(savePetAction);
        savePetAction.getPet().setId(lastId); // id of one of the dogs
        savePetAction.getPet().setName("mr rabbit");
        savePetAction.getPet().setDescription("rabbit rabbit");
        assertEquals(Action.SUCCESS, savePetAction.execute());

        List results = search("dogs");
        assertEquals(2, results.size());
        assertEquals("only dog", ((Pet) results.get(0)).getName());
        assertEquals("slight dog", ((Pet) results.get(1)).getName());

        results = search("rabbit");
        assertEquals(1, results.size());
        assertEquals("mr rabbit", ((Pet) results.get(0)).getName());

    }

    public void testDeletion() throws Exception {
        addPet("only dog", "Dogs!");
        long lastId = addPet("another dog", "Doggy dog dog rabbit");

        // delete that dog (or is it a rabbit?)
        InventorySavePet savePetAction = new InventorySavePet();
        init(savePetAction);
        savePetAction.getPet().setId(lastId); // id of one of the dogs
        savePetAction.setDelete("pressed"); // button pressed
        assertEquals(Action.SUCCESS, savePetAction.execute());

        List results = search("dog");
        assertEquals(1, results.size());
        assertEquals("only dog", ((Pet) results.get(0)).getName());

        results = search("rabbit");
        assertTrue(results.isEmpty());

    }

    /**
     * Convenience method for adding a pet to the inventory.
     */
    private long addPet(String name, String description) throws Exception {
        InventorySavePet savePetAction = new InventorySavePet();
        init(savePetAction);
        savePetAction.getPet().setName(name);
        savePetAction.getPet().setDescription(description);
        assertEquals(Action.SUCCESS, savePetAction.execute());
        return savePetAction.getPet().getId();
    }

    /**
     * Convenience method for searching the store front.
     */
    private List search(String query) {
        StoreFrontSearch searchAction = new StoreFrontSearch();
        init(searchAction);
        searchAction.setQuery(query);
        searchAction.execute();
        List results = searchAction.getPets();
        return results;
    }

}
