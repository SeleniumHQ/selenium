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

package org.petsoar.cart;

import junit.framework.TestCase;
import org.petsoar.pets.Pet;

import java.math.BigDecimal;

public class TestShoppingCart extends TestCase {
    public void testAddAndRemovePet() {
        Pet pet = new Pet();
        pet.setId(1);
        pet.setName("Bill");
        pet.setDescription("Bill is a cat");
        pet.setGender(Pet.MALE);
        pet.setPersonality("timid");
        pet.setPrice(new BigDecimal(10.0));

        ShoppingCart cart = new SimpleShoppingCart();
        assertTrue(cart.isEmpty());
        assertEquals(0, cart.getPets().size());

        cart.addPet(pet);
        assertFalse(cart.isEmpty());
        assertEquals(1, cart.size());
        assertEquals(1, cart.getPets().size());
        assertEquals(new BigDecimal(10.0), cart.getTotalPrice());
        assertTrue(cart.getPets().contains(pet));

        cart.removePet(pet);
        assertTrue(cart.isEmpty());
        assertEquals(0, cart.size());
        assertEquals(0, cart.getPets().size());
        assertEquals(new BigDecimal(0), cart.getTotalPrice());
    }

    public void testTotalPrice() {
        Pet pet = new Pet();
        pet.setPrice(new BigDecimal(10.0));

        Pet pet2 = new Pet();
        pet2.setPrice(new BigDecimal(15.0));

        ShoppingCart cart = new SimpleShoppingCart();
        cart.addPet(pet);
        cart.addPet(pet2);

        assertEquals(new BigDecimal(25.00), cart.getTotalPrice());
    }
}
