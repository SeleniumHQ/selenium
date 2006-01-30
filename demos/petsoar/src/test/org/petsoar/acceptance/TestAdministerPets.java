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
import org.petsoar.acceptance.support.CleanOutStoreAction;
import org.petsoar.actions.inventory.InventorySavePet;
import org.petsoar.actions.storefront.StoreFrontListPets;
import org.petsoar.pets.Pet;

/**
 * Test for the first story of the application:
 *
 * Story: AS A store owner I WOULD LIKE TO be able to modify the pets
 * that I have in stock which are displayed to customers on the
 * main site SO THAT a customer can determine if I have what they
 * want in stock.
 */
public class TestAdministerPets extends AbstractAcceptanceTest {

    private static long lastId;
    private String result;

    public void testCleanOutStore() throws Exception {
        // before running any other tests, clean out the store
        CleanOutStoreAction cleanOutStoreAction = new CleanOutStoreAction();
        init(cleanOutStoreAction);
        cleanOutStoreAction.execute();
    }

    public void testAddSomePets() throws Exception {

        // Store front should be empty
        StoreFrontListPets listPets = new StoreFrontListPets();
        init(listPets);
        listPets.execute();
        assertTrue(listPets.getPets().isEmpty());

        // Add a new pet to the inventory
        InventorySavePet savePet = new InventorySavePet();
        init(savePet);
        savePet.getPet().setName("Bertie");
        savePet.getPet().setGender(Pet.MALE);
        result = savePet.execute();
        assertEquals(Action.SUCCESS, result);

        // Add another
        savePet = new InventorySavePet();
        init(savePet);
        savePet.getPet().setName("Chloe");
        savePet.getPet().setGender(Pet.FEMALE);
        result = savePet.execute();
        assertEquals(Action.SUCCESS, result);

        // make note of id for next test....
        lastId = savePet.getPet().getId();

        // Store front should now contain some pets
        listPets = new StoreFrontListPets();
        init(listPets);
        listPets.execute();
        assertEquals(2, listPets.getPets().size());
        assertEquals("Bertie", ((Pet) listPets.getPets().get(0)).getName());
        assertEquals("Chloe", ((Pet) listPets.getPets().get(1)).getName());

    }

    public void testEditAPet() throws Exception {
        // Add a pet
        InventorySavePet savePet = new InventorySavePet();
        init(savePet);
        savePet.getPet().setName("Chloe");
        savePet.getPet().setGender(Pet.FEMALE);
        result = savePet.execute();
        assertEquals(Action.SUCCESS, result);

        // make note of id for further on...
        lastId = savePet.getPet().getId();

        // save a pet with an existing id
        savePet = new InventorySavePet();
        init(savePet);
        savePet.getPet().setId(lastId);
        savePet.getPet().setName("Chump");
        savePet.getPet().setGender(Pet.MALE);
        result = savePet.execute();
        assertEquals(Action.SUCCESS, result);

        // Store front should now be updated
        StoreFrontListPets listPets = new StoreFrontListPets();
        init(listPets);
        listPets.execute();
        assertEquals(1, listPets.getPets().size());
        assertEquals("Chump", ((Pet) listPets.getPets().get(0)).getName());
        assertEquals(Pet.MALE, ((Pet) listPets.getPets().get(0)).getGender());
    }

    public void testDeleteAPet() throws Exception {
        // Add a pet
        InventorySavePet savePet = new InventorySavePet();
        init(savePet);
        savePet.getPet().setName("Chloe");
        savePet.getPet().setGender(Pet.FEMALE);
        result = savePet.execute();
        assertEquals(Action.SUCCESS, result);

        // make note of id for further on...
        lastId = savePet.getPet().getId();

        // Store front should now contain just 1 pet
        StoreFrontListPets listPets = new StoreFrontListPets();
        init(listPets);
        listPets.execute();
        assertEquals(1, listPets.getPets().size());
        assertEquals("Chloe", ((Pet) listPets.getPets().get(0)).getName());

        // Save a pet with an existing id
        savePet = new InventorySavePet();
        init(savePet);
        savePet.getPet().setId(lastId);
        savePet.setDelete("press me"); // button pressed
        result = savePet.execute();
        assertEquals(Action.SUCCESS, result);

        // Store front should now contain just no pets
        listPets = new StoreFrontListPets();
        init(listPets);
        listPets.execute();
        assertEquals(0, listPets.getPets().size());
    }
}
