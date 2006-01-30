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
package org.petsoar.actions.storefront;

import com.opensymphony.xwork.Action;
import org.petsoar.categories.Category;
import org.petsoar.pets.PetStore;
import org.petsoar.pets.PetStoreAware;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class StoreFrontListCategories implements Action, PetStoreAware {

    private List categories;
    private long categoryId;
    private PetStore petStore;
    private Category category;
    private List hierarchy;
    private List pets;

    public List getCategories() {
        return categories;
    }

    public void setCategories(List categories) {
        this.categories = categories;
    }

    public void setPetStore(PetStore petStore) {
        this.petStore = petStore;
    }

    public long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(long categoryId) {
        this.categoryId = categoryId;
    }

    public List getHierarchy() {
        return hierarchy;
    }

    public Category getCategory() {
        return category;
    }

    public List getPets() {
        return pets;
    }

    public String execute() {
        if (categoryId == 0) {
            categories = petStore.getRootCategories();
            hierarchy = Collections.EMPTY_LIST;
            pets = petStore.getUncategorizedPets();
        } else {
            category = petStore.getCategory(categoryId);
            categories = category.getCategories();
            pets = category.getPets();
            hierarchy = new ArrayList();
            hierarchy.add(category);

            Category tempCat = category;
            while (tempCat.getParent() != null) {
                tempCat = tempCat.getParent();
                hierarchy.add(0, tempCat);
            }
        }

        return SUCCESS;
    }
}
