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

import com.opensymphony.xwork.ActionSupport;
import org.petsoar.persistence.PersistenceIndexedAware;
import org.petsoar.persistence.PersistenceManager;
import org.petsoar.persistence.util.LazyLoaderList;

import java.util.Collections;
import java.util.List;

public abstract class AbstractPaginatableAction extends ActionSupport implements PersistenceIndexedAware {
    private List items;
    private PersistenceManager persistenceManager;
    private int startIndex;
    private int endIndex;
    private int PET_COUNT_IN_EACH_PAGE = 5;

    public void setPersistenceManager(PersistenceManager persistenceManager) {
        this.persistenceManager = persistenceManager;
    }

    public List getPets() {
        return items;
    }

    public void setPets(List items) {
        decorateWithLazyLoaderList(items);
    }

    protected void decorateWithLazyLoaderList(List items) {
        this.items = Collections.unmodifiableList(new LazyLoaderList(items, persistenceManager, getType()));
    }

    public int getStartIndex() {
        return startIndex;
    }

    public void setStartIndex(int startIndex) {
        this.startIndex = startIndex;
    }

    public int getEndIndex() {
        try
        {
            if (endIndex == 0) {
                if (items.size() > PET_COUNT_IN_EACH_PAGE) {
                    return PET_COUNT_IN_EACH_PAGE;
                } else {
                    return items.size();
                }
            } else {
                return endIndex;
            }
        }
        catch (Exception e)
        {
            e.printStackTrace();
            return 0;
        }
    }

    public void setEndIndex(int endIndex) {
        this.endIndex = endIndex;
    }

    public int getNextStartIndex() {
        return getEndIndex();
    }

    public int getNextEndIndex() {
        int nextEndIndex = getEndIndex()+PET_COUNT_IN_EACH_PAGE;

        if (nextEndIndex > items.size()) {
            return items.size();
        } else {
            return nextEndIndex;
        }
    }

    public int getPrevStartIndex() {
        int prevStartIndex = getStartIndex()-PET_COUNT_IN_EACH_PAGE;

        if (prevStartIndex > 0) {
            return prevStartIndex;
        } else {
            return 0;
        }
    }

    public int getPrevEndIndex() {
        return getStartIndex();
    }

    protected abstract Class getType();
}
