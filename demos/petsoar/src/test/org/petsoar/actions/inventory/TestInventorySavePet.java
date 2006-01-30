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

import com.mockobjects.constraint.IsEqual;
import com.mockobjects.dynamic.C;
import com.mockobjects.dynamic.Mock;
import com.opensymphony.xwork.Action;
import junit.framework.TestCase;
import org.petsoar.pets.Pet;
import org.petsoar.pets.PetStore;

import java.util.List;

public class TestInventorySavePet extends TestCase {
    private Mock mockPetStore;
    private InventorySavePet action;
    private Pet existingPet;

    protected void setUp() throws Exception {
        mockPetStore = new Mock(PetStore.class);
        PetStore petStore = (PetStore) mockPetStore.proxy();

        action = new InventorySavePet();
        action.setPetStore(petStore);

        existingPet = new Pet();
        existingPet.setName("bob");
        existingPet.setId(1);
    }

    public void testEditPet() throws Exception {
        mockPetStore.expectAndReturn("getPet", C.args(new IsEqual(new Long(1))), existingPet);

        Pet expectedPet = new Pet();
        expectedPet.setName("bill");
        expectedPet.setId(1);

        mockPetStore.expect("savePet", C.args(new IsEqual(expectedPet)));

        action.getPet().setId(1);
        action.getPet().setName("bill");

        String result = action.execute();

        assertEquals(Action.SUCCESS, result);
        mockPetStore.verify();
    }

    public void testEditPetInvalidId() throws Exception {
        String result = action.execute();

        assertEquals(Action.ERROR, result);
        assertEquals(1, action.getFieldErrors().size());
        assertEquals("Name not entered", ((List) action.getFieldErrors().get("pet.name")).get(0));
        assertEquals(new Pet(), action.getPet());
        mockPetStore.verify();
    }
}
