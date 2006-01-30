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

package org.petsoar.persistence.hibernate;

import com.opensymphony.xwork.interceptor.component.Disposable;
import com.opensymphony.xwork.interceptor.component.Initializable;
import net.sf.hibernate.*;
import net.sf.hibernate.type.Type;
import org.petsoar.persistence.PersistenceException;
import org.petsoar.persistence.PersistenceManager;

import java.io.Serializable;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HibernatePersistenceManager implements PersistenceManager, HibernateSessionFactoryAware, Initializable, Disposable {

    private static Map classToHibernateTypeMap = new HashMap();

    static {
        classToHibernateTypeMap.put(Boolean.class, Hibernate.BIG_DECIMAL);
        classToHibernateTypeMap.put(Boolean.class, Hibernate.BOOLEAN);
        classToHibernateTypeMap.put(Byte.class, Hibernate.BYTE);
        classToHibernateTypeMap.put(Character.class, Hibernate.CHARACTER);
        classToHibernateTypeMap.put(Date.class, Hibernate.DATE);
        classToHibernateTypeMap.put(Double.class, Hibernate.DOUBLE);
        classToHibernateTypeMap.put(Float.class, Hibernate.FLOAT);
        classToHibernateTypeMap.put(Integer.class, Hibernate.INTEGER);
        classToHibernateTypeMap.put(Long.class, Hibernate.LONG);
        classToHibernateTypeMap.put(Short.class, Hibernate.SHORT);
        classToHibernateTypeMap.put(String.class, Hibernate.STRING);
        classToHibernateTypeMap.put(Timestamp.class, Hibernate.TIMESTAMP);
    }

    private HibernateSessionFactory hibernateSessionFactory;
    private Session session;

    public Session getSession() {
        return session;
    }

    public HibernateSessionFactory getHibernateSessionFactory() {
        return hibernateSessionFactory;
    }

    public void setHibernateSessionFactory(HibernateSessionFactory hsf) {
        this.hibernateSessionFactory = hsf;
    }

    public void init() {
        try {
            session = hibernateSessionFactory.createSession();
        } catch (HibernateException e) {
            throw new PersistenceException("Couldn't init HibernatePersistenceManager", e);
        }
    }

    public void dispose() {
        try {
            endSession();
        } catch (Exception e) {
            throw new PersistenceException("Couldn't dispose HibernatePersistenceManager", e);
        } finally {
            try {
                hibernateSessionFactory.closeSession(session);
            } catch (Exception e) {
                throw new PersistenceException("Couldn't close the session", e);
            }
        }
    }

    public void endSession() throws SQLException, HibernateException {
        hibernateSessionFactory.endSession(session);
    }

    public void save(Object objectToSave) {
        try {
            session.saveOrUpdate(objectToSave);
        } catch (Exception e) {
            throw new PersistenceException(e);
        }
    }

    public void remove(Object objectToRemove) {
        try {
            session.delete(objectToRemove);
        } catch (Exception e) {
            throw new PersistenceException(e);
        }
    }

    public List findAll(Class type) {
        return findAllSorted(type, null);
    }

    public List findAllSorted(Class type, String sortField) {
        try {
            String query = "FROM result IN CLASS " + type.getName();
            if (sortField != null)
                query += " ORDER BY LOWER(result." + sortField + ")";

            return session.find(query);
        } catch (Exception e) {
            throw new PersistenceException(e);
        }
    }

    public Object getByPrimaryKey(Class type, Object pk) {
        try {
            return session.load(type, (Serializable) pk);
        } catch (ObjectNotFoundException e) {
            return null;
        } catch (HibernateException e) {
            throw new PersistenceException(e);
        }
    }

    public Object getById(Class aClass, long id) {
        try {
            return session.load(aClass, new Long(id));
        } catch (ObjectDeletedException e) {
            return null;
        } catch (ObjectNotFoundException e) {
            return null;
        } catch (Exception e) {
            throw new PersistenceException(e);
        }
    }

    public List find(String query, Object[] parameters, Class[] parameterTypes) {
        Session session = null;
        List results = null;

        try {
            session = this.session;

            if ((parameterTypes != null) || (parameters != null)) {
                Type[] hibernate_parameter_types = getHibernatedParameterTypes(parameterTypes);

                results = session.find(query, parameters, hibernate_parameter_types);
            } else {
                results = session.find(query);
            }

            return results;
        } catch (Exception e) {
            throw new PersistenceException(e);
        }
    }

    private static Type[] getHibernatedParameterTypes(Class[] types) {
        if (types == null) {
            return null;
        }

        Type[] hib_types = new Type[types.length];

        for (int i = 0; i < types.length; i++) {
            Class type = types[i];

            hib_types[i] = (Type) classToHibernateTypeMap.get(type);
        }

        return hib_types;
    }

}
