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

package org.petsoar.persistence;

import java.util.List;

/**
 * Interface to access persistence.
 *
 * Components requiring access to persistence must implement PersistenceIndexedAware and have the
 * pm passed in.
 */
public interface PersistenceManager {

    /**
     * Saves an object to the persistence. If the object is not yet added to the persistence store it insert it,
     * otherwise the already persisted record is updated.
     */
    void save(Object objectToSave);

    /**
     * Remove object from persistence.
     */
    void remove(Object objectToRemove);

    /**
     * Look up an object by id.
     */
    Object getById(Class type, long id);

    /**
     * Look up an object by primary key.
     */
    Object getByPrimaryKey(Class type, Object pk);

    /**
     * Find all objects currently persisted of a particular type.
     */
    List findAll(Class type);

    /**
     * Find all objects currently persisted of a particular type and sort results by named property.
     */
    List findAllSorted(Class type, String sortProperty);

    /**
     * Find all objects according to the specified query. The <code>parameters</code> parameter is an array of query
     * parameters. The <code>parameter_types</code> parameter is an array of the Classes of the parameters. These two
     * arrays should have the same length.
     */
    List find(String query, Object[] parameters, Class[] parameter_types);
}
