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

import org.apache.lucene.index.IndexReader;
import org.petsoar.persistence.hibernate.DefaultHibernateSessionFactory;
import org.petsoar.persistence.hibernate.HibernatePersistenceManager;
import org.petsoar.pets.DefaultPetStore;
import org.petsoar.pets.Pet;
import org.petsoar.pets.PetStore;

import java.io.File;
import java.util.List;

public class OfflineLuceneIndexer {

    private static final String INDEX_FILE = "index";

    public static void main(String[] args) throws Exception {
        deleteIndexFile();

        HibernatePersistenceManager hpm = new HibernatePersistenceManager();
        DefaultHibernateSessionFactory hsf = new DefaultHibernateSessionFactory();
        hpm.setHibernateSessionFactory(hsf);
        hsf.init();
        hpm.init();

        DefaultPetStore petStore = new DefaultPetStore();
        petStore.setPersistenceManager(hpm);

        LuceneIndexStore indexStore = new LuceneIndexStore(INDEX_FILE);

        LuceneIndexer luceneIndexer = new LuceneIndexer();
        luceneIndexer.setIndexStore(indexStore);
        luceneIndexer.setLuceneDocumentFactory(new DefaultLuceneDocumentFactory());

        indexPets(petStore, luceneIndexer, indexStore);

        hpm.dispose();
        hsf.destroy();
    }

    private static void indexPets(PetStore petStore, LuceneIndexer luceneIndexer, LuceneIndexStore indexStore)
            throws Exception {
        List pets = petStore.getPets();

        for (int i = 0; i < pets.size(); i++) {
            Pet pet = (Pet) pets.get(i);

            luceneIndexer.index(pet);
            System.out.println("Indexing pet:" + pet.getName());
        }

        IndexReader indexReader = indexStore.createReader();
        System.out.println("Indexed " + indexReader.numDocs() + " pets.");
        indexReader.close();

    }

    private static void deleteIndexFile() {
        File indexFile = new File(INDEX_FILE);

        if (indexFile.exists()) {
            indexFile.delete();
        }
    }
}
