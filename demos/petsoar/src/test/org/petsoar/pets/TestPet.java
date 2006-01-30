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

import junit.framework.TestCase;

public class TestPet extends TestCase {

    public void testEquals() throws Exception {
        Pet a = new Pet();
        a.setName("giraffe");
        a.setId(999);

        Pet b = new Pet();
        b.setName("camal");
        b.setId(999);

        Pet c = new Pet();
        c.setName("giraffe");
        c.setId(999);

        Pet d = new Pet();
        d.setName("giraffe");
        d.setId(888);

        assertEquals(a, c);
        assertEquals(c, a);
        assertTrue(!a.equals(b));
        assertTrue(!b.equals(c));
        assertTrue(!a.equals(d));
        assertTrue(!b.equals(null));
        assertTrue(!b.equals(new Object()));
    }

    public void testGender() throws Exception {
        Pet p = new Pet();
        // test default
        assertEquals(Pet.UNKNOWN, p.getGender());

        // valid values
        p.setGender(Pet.MALE);
        p.setGender(Pet.UNKNOWN);
        p.setGender(Pet.FEMALE);

        try {
            p.setGender("something");
            fail("Exception should have been thrown");
        } catch (IllegalArgumentException e) {
            // good
            assertEquals(Pet.FEMALE, p.getGender());
        }

        // test null default
        p.setGender(null);
        assertEquals(Pet.UNKNOWN, p.getGender());

    }

}
