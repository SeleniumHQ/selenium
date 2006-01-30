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

package org.petsoar.categories;

import org.apache.commons.lang.builder.EqualsBuilder;
import org.apache.commons.lang.builder.HashCodeBuilder;
import org.apache.commons.lang.builder.ToStringBuilder;
import org.petsoar.pets.Pet;

import java.util.ArrayList;
import java.util.List;

/**
 * A category.
 * @hibernate.class table="CATEGORIES" proxy="org.petsoar.categories.Category"
 */
public class Category {

    private long id;
    private String name;
    private String image;
    private Category parent;
    private List categories = new ArrayList();
    private List pets = new ArrayList();

    public Category() {
    }

    public Category(String name) {
        this.name = name;
    }

    /**
     * @hibernate.id column="CATID" generator-class="increment" unsaved-value="0"
     */
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    /**
     * The parent category of this category.
     * @hibernate.many-to-one cascade="none" column="PARENTID"
     */
    public Category getParent() {
        return parent;
    }

    public void setParent(Category category) {
        this.parent = category;
    }

    /**
     * Name of category
     * @hibernate.property column="NAME"
     */
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    /**
     * The path to the image.
     * @hibernate.property column="IMAGE"
     */
    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    /**
     * @hibernate.bag table="CATEGORY" lazy="true" cascade="delete" inverse="true"
     * @hibernate.collection-one-to-many class="org.petsoar.categories.Category"
     * @hibernate.collection-key column="PARENTID"
     */
    public List getCategories() {
        return categories;
    }

    public void setCategories(List categories) {
        this.categories = categories;
    }

    public void addCategory(Category category) {
        getCategories().add(category);
    }

    public void removeCategory(Category category) {
        getCategories().remove(category);
    }

    /**
     * @hibernate.bag table="PET" lazy="true" cascade="delete" inverse="true"
     * @hibernate.collection-one-to-many class="org.petsoar.pets.Pet"
     * @hibernate.collection-key column="CATEGORY"
     */
    public List getPets() {
        return pets;
    }

    public void setPets(List pets) {
        this.pets = pets;
    }

    public void addPet(Pet pet) {
        getPets().add(pet);
        pet.setCategory(this);
    }

    public void removePet(Pet pet) {
        getPets().remove(pet);
    }

    public boolean equals(Object obj) {
        // custom equalsbuilder used (instead of using reflection) as cyclical dependency
        // causes stack overflow.
        if (!(obj instanceof Category)) {
            return false;
        }

        Category other = (Category) obj;

        return new EqualsBuilder().append(id, other.id).append(name, other.name)
                .isEquals();
    }

    public int hashCode() {
        // custom hashcodebuilder used (instead of using reflection) as cyclical dependency
        // causes stack overflow.
        return new HashCodeBuilder(17, 37).append(id).toHashCode();
    }

    public String toString() {
        // custom tostringbuilder used (instead of using reflection) as cyclical dependency
        // causes stack overflow.
        return new ToStringBuilder(this).append("id", id).append("name", name)
                .toString();
    }
}
