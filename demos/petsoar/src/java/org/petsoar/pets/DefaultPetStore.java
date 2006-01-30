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

import org.petsoar.categories.Category;
import org.petsoar.persistence.PersistenceIndexedAware;
import org.petsoar.persistence.PersistenceManager;

import java.util.List;

/**
 * Default PetStore implementation. It uses the specified persistenceManager to store the pets and categories.
 */
public class DefaultPetStore implements PetStore, PersistenceIndexedAware {

    private PersistenceManager persistenceManager;

    public void setPersistenceManager(PersistenceManager persistenceManager) {
        this.persistenceManager = persistenceManager;
    }

    public void savePet(Pet pet) {
        persistenceManager.save(pet);
    }

    public void removePet(Pet pet) {
        persistenceManager.remove(pet);
    }

    public List getPets() {
        return persistenceManager.findAllSorted(Pet.class, "name");
    }

    public List getUncategorizedPets() {
        return persistenceManager.find("FROM p IN " + Pet.class + " WHERE p.category IS NULL", null, null);
    }

    public Pet getPet(long id) {
        return (Pet) persistenceManager.getById(Pet.class, id);
    }

    public List getRootCategories() {
        String query = "FROM c IN " + Category.class + " WHERE c.parent IS NULL";
        return persistenceManager.find(query, null, null);
    }

    public void addCategory(Category category) {
        persistenceManager.save(category);
    }

    public Category getCategory(long id) {
        return (Category) persistenceManager.getById(Category.class, id);
    }

    public void removeCategory(Category category) {
        persistenceManager.remove(category);
    }
}
