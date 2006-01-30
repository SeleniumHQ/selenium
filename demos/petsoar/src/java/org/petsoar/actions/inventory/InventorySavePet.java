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

import com.opensymphony.xwork.ActionSupport;
import org.petsoar.pets.Pet;
import org.petsoar.pets.PetStore;
import org.petsoar.pets.PetStoreAware;

public class InventorySavePet extends ActionSupport implements PetStoreAware {

    private Pet pet = new Pet();
    private PetStore petStore;
    private boolean delete, cancel;
    private long id;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public void setPetStore(PetStore petStore) {
        this.petStore = petStore;
    }

    public Pet getPet() {
        return pet;
    }

    public void setDelete(String delete) {
        // delete button pressed
        this.delete = true;
    }

    public void setCancel(String cancel) {
        // cancel button pressed
        this.cancel = true;
    }

    public String execute() throws Exception {
        boolean skip = false;
        if (cancel || delete) {
            // skip validation if user has pressed cancel or delete
            skip = true;
        }

        if (!skip && (pet.getName() == null || pet.getName().trim().length() == 0)) {
            addFieldError("pet.name", "Name not entered");
        }

        if (hasErrors())
            return ERROR;

        if (!cancel) {
            if (pet.getId() == 0) {
                petStore.savePet(pet);
            } else {
                Pet existingPet = petStore.getPet(pet.getId());
                if (delete) {
                    petStore.removePet(existingPet);
                } else {
                    existingPet.setName(pet.getName());
                    existingPet.setGender(pet.getGender());
                    existingPet.setDescription(pet.getDescription());
                    existingPet.setPersonality(pet.getPersonality());
                    existingPet.setPrice(pet.getPrice());
                    existingPet.setCategory(pet.getCategory());
                    petStore.savePet(existingPet);
                }
            }
        }

        return SUCCESS;
    }

}
