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

import com.opensymphony.xwork.interceptor.component.Initializable;
import net.sf.hibernate.HibernateException;
import net.sf.hibernate.Session;
import net.sf.hibernate.SessionFactory;
import net.sf.hibernate.cfg.Configuration;
import net.sf.hibernate.tool.hbm2ddl.SchemaUpdate;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.petsoar.persistence.PersistenceException;

import java.sql.SQLException;

/**
 * The default implementation of HibernateSessionFactory. It uses Hibernate's built-in connection pooling mechanism.
 */
public class DefaultHibernateSessionFactory implements HibernateSessionFactory, Initializable {

    private static SessionFactory sessionFactory;

    private Log log = LogFactory.getLog(DefaultHibernateSessionFactory.class);

    public void init() {
        //first request, create a sessionFactory and use it afterwards
        //for creating all sessions
        if (sessionFactory == null) {
            try {
                sessionFactory = buildSessionFactory();
            } catch (HibernateException e) {
                log.fatal("Couldn't init HibernatePersistenceManager", e);
                throw new PersistenceException("Couldn't init DefaultHibernateSessionFactory",
                        e);
            }
        }
    }

    public void destroy() {
        try {
            sessionFactory.close();
        } catch (HibernateException e) {
            throw new RuntimeException("Cannot close hibernate session", e);
        }
        sessionFactory = null;
    }

    public Session createSession() throws HibernateException {
        return sessionFactory.openSession();
    }

    /**
     * This implementation commits the connection too. Another implementation using a JTA connection should not commit
     * the connection itself.
     */
    public void endSession(Session session)
            throws SQLException, HibernateException {
        if ((session != null) && session.isOpen() && session.isConnected()) {
            session.flush();
            session.connection().commit();
        }
    }

    public void closeSession(Session session)
            throws SQLException, HibernateException {
        if ((session != null) && session.isOpen() && session.isConnected()) {
            session.close();
        }
    }

    private SessionFactory buildSessionFactory() throws HibernateException {
        Configuration config = new Configuration();
        config.configure();

        if (System.getProperty("hibernate.connect.url.override") != null)
        {
            config.setProperty("hibernate.connection.url", System.getProperty("hibernate.connect.url.override"));
        }

        // update database schema if required
        try {
            new SchemaUpdate(config).execute(false);
        } catch (HibernateException e) {
            log.fatal("Cannot update schema", e);
            throw new PersistenceException("Cannot update schema", e);
        }

        SessionFactory result = config.buildSessionFactory();

        return result;
    }
}
