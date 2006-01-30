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

import org.apache.commons.lang.builder.EqualsBuilder;
import org.apache.commons.lang.builder.HashCodeBuilder;
import org.apache.commons.lang.builder.ToStringBuilder;
import org.petsoar.categories.Category;

import java.math.BigDecimal;

/**
 * A creature.
 * @hibernate.class table="PETS"
 */
public class Pet {
    public static final String MALE = "Male";
    public static final String FEMALE = "Female";
    public static final String UNKNOWN = "Unknown";

    private long id;
    private Category category;
    private String name;
    private String image;
    private String gender = UNKNOWN;
    private String description;
    private String personality;
    private BigDecimal price;

    /**
     * @hibernate.id column="PETID" generator-class="increment" unsaved-value="0"
     */
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    /**
     * The category of pet (such as "Ginger Cat").
     * @hibernate.many-to-one cascade="none" column="CATEGORY" not-null="false" update="true" insert="true"
     */
    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    /**
     * Name of creature
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
     * Gender of creature. One of the MALE, FEMALE or UNKNOWN constants.
     * @hibernate.property column="GENDER"
     */
    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        if (gender == null) {
            gender = UNKNOWN;
        }

        if (gender.equals(MALE) || gender.equals(FEMALE) ||
                gender.equals(UNKNOWN)) {
            this.gender = gender;
        } else {
            throw new IllegalArgumentException("Invalid gender");
        }
    }

    /**
     * Descriptiong of how the creature looks
     * @hibernate.property column="DESCRIPTION" length="2000"
     */
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Any behavioral or psychological issues the creature may be dealing with.
     * @hibernate.property column="PERSONALITY" length="2000"
     */
    public String getPersonality() {
        return personality;
    }

    public void setPersonality(String personality) {
        this.personality = personality;
    }

    /**
     * The unit price.
     * @hibernate.property column="PRICE"
     */
    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public boolean equals(Object obj) {
        if (!(obj instanceof Pet)) {
            return false;
        }

        Pet other = (Pet) obj;

        return new EqualsBuilder().append(id, other.id).append(name, other.name).isEquals();
    }

    public int hashCode() {
        return HashCodeBuilder.reflectionHashCode(this);
    }

    public String toString() {
        return ToStringBuilder.reflectionToString(this);
    }
}
