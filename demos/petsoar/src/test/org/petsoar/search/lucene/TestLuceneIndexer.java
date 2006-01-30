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

package org.petsoar.search.lucene;

import org.apache.lucene.document.Document;
import org.apache.lucene.index.IndexReader;
import org.petsoar.categories.Category;
import org.petsoar.pets.Pet;

public class TestLuceneIndexer extends LuceneTestCase {

    public void testIndexNewObject() throws Exception {
        Pet pet = createDog();
        luceneIndexer.index(pet);

        IndexReader indexReader = indexStore.createReader();
        assertEquals(1, indexReader.numDocs());

        Document doc = indexReader.document(0);
        assertEquals("124", doc.get("handle"));
        assertEquals("dog", doc.get("name"));
        assertEquals("dog", doc.get("description"));
        assertEquals("", doc.get("image"));

        indexReader.close();
    }

    public void testIndexNewCategoryObject() throws Exception {
        Category category = createCategory();
        luceneIndexer.index(category);

        IndexReader indexReader = indexStore.createReader();
        assertEquals(1, indexReader.numDocs());

        Document doc = indexReader.document(0);
        assertEquals("456", doc.get("handle"));
        assertEquals("dogs", doc.get("name"));
        assertEquals("", doc.get("image"));

        indexReader.close();
    }

    public void testReIndexNewObject() throws Exception {
        Pet pet = createCat();
        luceneIndexer.index(pet);

        assertEquals(1, indexStore.getNumDocs());
    }

    public void testReIndexTwoObjects() throws Exception {
        Pet cat = createCat();
        luceneIndexer.index(cat);

        Pet dog = createDog();
        luceneIndexer.index(dog);

        assertEquals(2, indexStore.getNumDocs());
    }

    public void testReIndexIndexedObject() throws Exception {
        Pet pet = createCat();
        luceneIndexer.index(pet);

        pet.setName("Kitty Cat");
        luceneIndexer.index(pet);

        assertEquals(1, indexStore.getNumDocs());
    }

    public void testUnIndexIndexedObject() throws Exception {
        Pet pet = createCat();
        luceneIndexer.index(pet);

        luceneIndexer.unIndex(pet);

        assertEquals(0, indexStore.getNumDocs());
    }

    private static Pet createCat() {
        Pet pet = new Pet();

        pet.setId(123);
        pet.setName("Catty");
        pet.setPersonality("Mew mew");
        pet.setDescription("She loves milk");

        return pet;
    }

    private static Pet createDog() {
        Pet pet = new Pet();

        pet.setId(124);
        pet.setName("dog");
        pet.setPersonality("dog");
        pet.setDescription("dog");

        return pet;
    }

    private static Category createCategory() {
        Category category = new Category();

        category.setId(456);
        category.setName("dogs");

        return category;
    }
}
