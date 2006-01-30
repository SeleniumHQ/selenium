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

package org.petsoar.actions.cart;

import com.mockobjects.dynamic.Mock;
import junit.framework.TestCase;
import org.petsoar.cart.ShoppingCart;
import org.petsoar.categories.Category;
import org.petsoar.pets.Pet;

import java.util.ArrayList;
import java.util.List;

public class TestListCart extends TestCase {
    private ListCart action;
    private Mock mockShoppingCart;
    private Pet pet1;
    private Pet pet2;
    private Category category1;
    private Category category2;

    protected void setUp() throws Exception {
        mockShoppingCart = new Mock(ShoppingCart.class);

        action = new ListCart();
        action.setShoppingCart((ShoppingCart) mockShoppingCart.proxy());

        pet1 = new Pet();
        pet1.setId(123);
        pet1.setName("Bill");
        pet1.setDescription("Bill is a cat");
        pet1.setGender(Pet.MALE);
        pet1.setPersonality("timid");
        pet1.setImage("cats/bill.gif");

        category1 = new Category();
        category1.setId(456);
        category1.setName("Cats");
        category1.setImage("/cats.gif");

        category1.addPet(pet1);

        pet2 = new Pet();
        pet2.setId(2);
        pet2.setName("Janet");
        pet2.setDescription("Janet is a dog");
        pet2.setGender(Pet.FEMALE);
        pet2.setPersonality("pissed off");
        pet2.setImage("dogs/janet.gif");

        category2 = new Category();
        category2.setId(654);
        category2.setName("Dogs");
        category2.setImage("/dogs.gif");

        category2.addPet(pet2);
    }

    public void testList() {
        List pets = new ArrayList(2);
        pets.add(pet1);
        pets.add(pet2);
        mockShoppingCart.expectAndReturn("getPets", pets);

        try {
            assertEquals("success", action.execute());
        } catch (Exception e) {
            fail();
        }
    }
}
