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

package org.petsoar.persistence.util;

import org.petsoar.persistence.PersistenceManager;

import java.util.ArrayList;
import java.util.BitSet;
import java.util.List;

public class LazyLoaderList extends ArrayList {
    private List decoratedList;
    private BitSet loadedListBitSet;
    private PersistenceManager persistenceManager;
    private Class type;

    public LazyLoaderList(List decoratedList, PersistenceManager persistenceManager, Class type) {
        this.decoratedList = decoratedList;
        loadedListBitSet = new BitSet(decoratedList.size());
        this.persistenceManager = persistenceManager;
        this.type = type;
    }

    public int size() {
        return decoratedList.size();
    }

    public boolean isEmpty() {
        return decoratedList.isEmpty();
    }

    public Object get(int index) {
        if (loadedListBitSet.get(index) == false) {
            Long id = (Long) decoratedList.get(index);
            Object lazyLoadedObj = persistenceManager.getById(type, id.longValue());

            loadedListBitSet.set(index);
            decoratedList.set(index, lazyLoadedObj);
        }

        return decoratedList.get(index);
    }
}
