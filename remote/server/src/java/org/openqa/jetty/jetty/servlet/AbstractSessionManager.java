// ========================================================================
// $Id: AbstractSessionManager.java,v 1.53 2006/11/22 20:01:10 gregwilkins Exp $
// Copyright 199-2004 Mort Bay Consulting Pty. Ltd.
// ------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at 
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ========================================================================

package org.openqa.jetty.jetty.servlet;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.EventListener;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.ServletContext;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionAttributeListener;
import javax.servlet.http.HttpSessionBindingEvent;
import javax.servlet.http.HttpSessionBindingListener;
import javax.servlet.http.HttpSessionContext;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpOnlyCookie;
import org.openqa.jetty.util.LazyList;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.MultiMap;


/* ------------------------------------------------------------ */
/** An Abstract implementation of SessionManager.
 * The partial implementation of SessionManager interface provides
 * the majority of the handling required to implement a
 * SessionManager.  Concrete implementations of SessionManager based
 * on AbstractSessionManager need only implement the newSession method
 * to return a specialized version of the Session inner class that
 * provides an attribute Map.
 * <p>
 * If the property
 * org.openqa.jetty.jetty.servlet.AbstractSessionManager.23Notifications is set to
 * true, the 2.3 servlet spec notification style will be used.
 * <p>
 * @version $Id: AbstractSessionManager.java,v 1.53 2006/11/22 20:01:10 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public abstract class AbstractSessionManager implements SessionManager
{
    private static Log log = LogFactory.getLog(AbstractSessionManager.class);
    
    /* ------------------------------------------------------------ */
    public final static int __distantFuture = 60*60*24*7*52*20;
    private final static String __NEW_SESSION_ID="org.openqa.jetty.jetty.newSessionId";

    /* ------------------------------------------------------------ */
    /* global Map of ID to session */
    protected static MultiMap __allSessions=new MultiMap();  
    
    /* ------------------------------------------------------------ */
    // Setting of max inactive interval for new sessions
    // -1 means no timeout
    private int _dftMaxIdleSecs = -1;
    private int _scavengePeriodMs = 30000;
    private String _workerName ;
    protected transient ArrayList _sessionListeners=new ArrayList();
    protected transient ArrayList _sessionAttributeListeners=new ArrayList();
    protected transient Map _sessions;
    protected transient Random _random;
    protected transient boolean _weakRandom;
    protected transient ServletHandler _handler;
    protected int _minSessions = 0;
    protected int _maxSessions = 0;
    protected boolean _crossContextSessionIDs=false;
    protected boolean _secureCookies=false;
    protected boolean _httpOnly=false;
    protected boolean _invalidateGlobal=true;
    
    private transient SessionScavenger _scavenger = null;
    
    /* ------------------------------------------------------------ */
    public AbstractSessionManager()
    {
        this(null);
    }
    
    /* ------------------------------------------------------------ */
    public AbstractSessionManager(Random random)
    {
        _random=random;
        _weakRandom=false;
    }
    
    
    
    /* ------------------------------------------------------------ */
    /** 
     * @return True if requested session ID are first considered for new
     * @deprecated use getCrossContextSessionIDs
     * session IDs
     */
    public boolean getUseRequestedId()
    {
        return _crossContextSessionIDs;
    }
    
    /* ------------------------------------------------------------ */
    /** Set Use Requested ID.
     * @param useRequestedId True if requested session ID are first considered for new
     * @deprecated use setCrossContextSessionIDs
     * session IDs
     */
    public void setUseRequestedId(boolean useRequestedId)
    {   
        _crossContextSessionIDs = useRequestedId;
    }
    
    /* ------------------------------------------------------------ */
    /** 
     * @return True if cross context session IDs are first considered for new
     * session IDs
     */
    public boolean getCrossContextSessionIDs()
    {
        return _crossContextSessionIDs;
    }
    
    /* ------------------------------------------------------------ */
    /** Set Cross Context sessions IDs
     * This option activates a mode where a requested session ID can be used to create a 
     * new session. This facilitates the sharing of session cookies when cross context
     * dispatches use sessions.   
     * 
     * @param useRequestedId True if cross context session ID are first considered for new
     * session IDs
     */
    public void setCrossContextSessionIDs(boolean useRequestedId)
    {   
        _crossContextSessionIDs = useRequestedId;
    }
    
    /* ------------------------------------------------------------ */
    public void initialize(ServletHandler handler)
    {
        _handler=handler;
    }
    
    /* ------------------------------------------------------------ */
    public Map getSessionMap()
    {
        return Collections.unmodifiableMap(_sessions);
    }
    
    /* ------------------------------------------------------------ */
    public int getSessions ()
    {
        return _sessions.size ();
    }
    
    /* ------------------------------------------------------------ */
    public int getMinSessions ()
    {
        return _minSessions;
    }
    
    /* ------------------------------------------------------------ */
    public int getMaxSessions ()
    {
        return _maxSessions;
    }
    
    /* ------------------------------------------------------------ */
    public void resetStats ()
    {
        _minSessions =  _sessions.size ();
        _maxSessions = _sessions.size ();
    }
    
    /* ------------------------------------------------------------ */
    /* new Session ID.
     * If the request has a requestedSessionID which is unique, that is used.
     * The session ID is created as a unique random long base 36.
     * If the request has a jvmRoute attribute, that is appended as a
     * worker tag, else any worker tag set on the manager is appended.
     * @param request 
     * @param created 
     * @return Session ID.
     */
    private String newSessionId(HttpServletRequest request,long created)
    {
        synchronized(__allSessions)
        {
            // A requested session ID can only be used if it is in the global map of
            // ID but not in this contexts map.  Ie it is an ID in use by another context
            // in this server and thus we are doing a cross context dispatch.
            if (_crossContextSessionIDs)
            {
                String requested_id=(String)request.getAttribute(__NEW_SESSION_ID);
                if (requested_id==null)
                    requested_id=request.getRequestedSessionId();
                if (requested_id !=null && 
                    requested_id!=null && __allSessions.containsKey(requested_id) && !_sessions.containsKey(requested_id))
                return requested_id;
            }
            
            // pick a new unique ID!
            String id=null;
            while (id==null || id.length()==0 || __allSessions.containsKey(id))
            {
                long r=_weakRandom
                ?(hashCode()^Runtime.getRuntime().freeMemory()^_random.nextInt()^(((long)request.hashCode())<<32))
                :_random.nextLong();
                r^=created;
                if (request!=null && request.getRemoteAddr()!=null)
                    r^=request.getRemoteAddr().hashCode();
                if (r<0)
                    r=-r;
                id=Long.toString(r,36);
                
                String worker = (String)request.getAttribute("org.openqa.jetty.http.ajp.JVMRoute");
                if (worker!=null)
                    id+="."+worker;
                else if (_workerName!=null)
                    id+="."+_workerName;
            }
            return id;
        }
    }
    
    /* ------------------------------------------------------------ */
    public HttpSession getHttpSession(String id)
    {
        synchronized(this)
        {
            return (HttpSession)_sessions.get(id);
        }
    }
    
    /* ------------------------------------------------------------ */
    public HttpSession newHttpSession(HttpServletRequest request)
    {
        Session session = newSession(request);
        session.setMaxInactiveInterval(_dftMaxIdleSecs);
        synchronized(__allSessions)
        {
            synchronized(this)
            {
              _sessions.put(session.getId(),session);
              __allSessions.add(session.getId(), session);
              if (_sessions.size() > this._maxSessions)
                  this._maxSessions = _sessions.size ();
            }
        }
        
        HttpSessionEvent event=new HttpSessionEvent(session);
        
        for(int i=0;i<_sessionListeners.size();i++)
            ((HttpSessionListener)_sessionListeners.get(i))
            .sessionCreated(event);
        
        if (getCrossContextSessionIDs())
            request.setAttribute(__NEW_SESSION_ID, session.getId());
        return session;
    }

    /* ------------------------------------------------------------ */
    public Cookie getSessionCookie(HttpSession session,boolean requestIsSecure)
    {
        if (_handler.isUsingCookies())
        {
            Cookie cookie = _handler.getSessionManager().getHttpOnly()
                ?new HttpOnlyCookie(SessionManager.__SessionCookie,session.getId())
                :new Cookie(SessionManager.__SessionCookie,session.getId());    
            String domain=_handler.getServletContext().getInitParameter(SessionManager.__SessionDomain);
            String maxAge=_handler.getServletContext().getInitParameter(SessionManager.__MaxAge);
            String path=_handler.getServletContext().getInitParameter(SessionManager.__SessionPath);
            if (path==null)
                path=getCrossContextSessionIDs()?"/":_handler.getHttpContext().getContextPath();
            if (path==null || path.length()==0)
                path="/";
            
            if (domain!=null)
                cookie.setDomain(domain);       
            if (maxAge!=null)
                cookie.setMaxAge(Integer.parseInt(maxAge));
            else
                cookie.setMaxAge(-1);
            
            cookie.setSecure(requestIsSecure && getSecureCookies());
            cookie.setPath(path);
            
            return cookie;    
        }
        return null;
    }
    
    /* ------------------------------------------------------------ */
    protected abstract Session newSession(HttpServletRequest request);
    
    /* ------------------------------------------------------------ */
    /** Get the workname.
     * If set, the workername is dot appended to the session ID
     * and can be used to assist session affinity in a load balancer.
     * @return String or null
     */
    public String getWorkerName()
    {
        return _workerName;
    }
    
    /* ------------------------------------------------------------ */
    /** Set the workname.
     * If set, the workername is dot appended to the session ID
     * and can be used to assist session affinity in a load balancer.
     * @param workerName 
     */
    public void setWorkerName(String workerName)
    {
        _workerName = workerName;
    }
    
    /* ------------------------------------------------------------ */
    /** 
     * @return seconds 
     */
    public int getMaxInactiveInterval()
    {
        return _dftMaxIdleSecs;
    }
    
    /* ------------------------------------------------------------ */
    /** 
     * @param seconds 
     */
    public void setMaxInactiveInterval(int seconds)
    {
        _dftMaxIdleSecs = seconds;
        if (_dftMaxIdleSecs>0 && _scavengePeriodMs>_dftMaxIdleSecs*100)
            setScavengePeriod((_dftMaxIdleSecs+9)/10);
    }
    
    
    /* ------------------------------------------------------------ */
    /** 
     * @return seconds 
     */
    public int getScavengePeriod()
    {
        return _scavengePeriodMs/1000;
    }
    
    /* ------------------------------------------------------------ */
    /** 
     * @param seconds 
     */
    public void setScavengePeriod(int seconds)
    {
        if (seconds==0)
            seconds=60;
        
        int old_period=_scavengePeriodMs;
        int period = seconds*1000;
        if (period>60000)
            period=60000;
        if (period<1000)
            period=1000;
        
        if (period!=old_period)
        {
            synchronized(this)
            {
                _scavengePeriodMs=period;
                if (_scavenger!=null)
                    _scavenger.interrupt();
            }
        }
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @return Returns the httpOnly.
     */
    public boolean getHttpOnly()
    {
        return _httpOnly;
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @param httpOnly The httpOnly to set.
     */
    public void setHttpOnly(boolean httpOnly)
    {
        _httpOnly = httpOnly;
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @return Returns the secureCookies.
     */
    public boolean getSecureCookies()
    {
        return _secureCookies;
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @param secureCookies The secureCookies to set.
     */
    public void setSecureCookies(boolean secureCookies)
    {
        _secureCookies = secureCookies;
    }

    /* ------------------------------------------------------------ */
    public boolean isInvalidateGlobal()
    {
        return _invalidateGlobal;
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @param global True if session invalidation should be global.
     * ie Sessions in other contexts with the same ID (linked by cross context dispatch
     * or shared session cookie) are invalidated as a group.
     */
    public void setInvalidateGlobal(boolean global)
    {
        _invalidateGlobal=global;
    }
    
    /* ------------------------------------------------------------ */
    public void addEventListener(EventListener listener)
    throws IllegalArgumentException
    {
        
        if (listener instanceof HttpSessionAttributeListener)
            _sessionAttributeListeners.add(listener);
        if (listener instanceof HttpSessionListener)
            _sessionListeners.add(listener);
    }
    
    /* ------------------------------------------------------------ */
    public void removeEventListener(EventListener listener)
    {
        if (listener instanceof HttpSessionAttributeListener)
            _sessionAttributeListeners.remove(listener);
        if (listener instanceof HttpSessionListener)
            _sessionListeners.remove(listener);
    }
    
    /* ------------------------------------------------------------ */
    public boolean isStarted()
    {
        return _scavenger!=null;
    }
    
    /* ------------------------------------------------------------ */
    public void start()
    throws Exception
    {
        if (_random==null)
        {
            log.debug("New random session seed");
            try 
            {
                _random=SecureRandom.getInstance("SHA1PRNG");
            }
            catch (NoSuchAlgorithmException e)
            {
                log.warn("Could not generate SecureRandom for session-id randomness",e);
                _random=new Random();
                _weakRandom=true;
            }
            _random.setSeed(_random.nextLong()^System.currentTimeMillis()^hashCode()^Runtime.getRuntime().freeMemory());
        }
        
        if (_sessions==null)
            _sessions=new HashMap();
        
        // Start the session scavenger if we haven't already
        if (_scavenger == null)
        {
            _scavenger = new SessionScavenger();
            _scavenger.start();
        }
    }
    
    
    /* ------------------------------------------------------------ */
    public void stop()
    {
        // Invalidate all sessions to cause unbind events
        ArrayList sessions = new ArrayList(_sessions.values());
        for (Iterator i = sessions.iterator(); i.hasNext(); )
        {
            Session session = (Session)i.next();
            session.invalidate();
        }
        _sessions.clear();
        
        // stop the scavenger
        SessionScavenger scavenger = _scavenger;
        _scavenger=null;
        if (scavenger!=null)
            scavenger.interrupt();
    }
    
    /* -------------------------------------------------------------- */
    /** Find sessions that have timed out and invalidate them.
     *  This runs in the SessionScavenger thread.
     */
    private void scavenge()
    {
        Thread thread = Thread.currentThread();
        ClassLoader old_loader = thread.getContextClassLoader();
        try
        {
            if (_handler==null)
                return;
            
            ClassLoader loader = _handler.getClassLoader();
            if (loader!=null)
                thread.setContextClassLoader(loader);
            
            long now = System.currentTimeMillis();
            
            // Since Hashtable enumeration is not safe over deletes,
            // we build a list of stale sessions, then go back and invalidate them
            Object stale=null;
            

            synchronized(AbstractSessionManager.this)
            {
                // For each session
                for (Iterator i = _sessions.values().iterator(); i.hasNext(); )
                {
                    Session session = (Session)i.next();
                    long idleTime = session._maxIdleMs;
                    if (idleTime > 0 && session._accessed + idleTime < now) {
                        // Found a stale session, add it to the list
                        stale=LazyList.add(stale,session);
                    }
                }
            }
            
            // Remove the stale sessions
            for (int i = LazyList.size(stale); i-->0;)
            {
                // check it has not been accessed in the meantime
                Session session=(Session)LazyList.get(stale,i);
                long idleTime = session._maxIdleMs;
                if (idleTime > 0 && session._accessed + idleTime < System.currentTimeMillis())    
                {
                    session.invalidate();
                    int nbsess = this._sessions.size();
                    if (nbsess < this._minSessions)
                        this._minSessions = nbsess;
                }
            }
        }
        finally
        {
            thread.setContextClassLoader(old_loader);
        }
    }


    /* ------------------------------------------------------------ */
    public Random getRandom()
    {
        return _random;
    }

    /* ------------------------------------------------------------ */
    public void setRandom(Random random)
    {
        _random=random;
    }

    
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* -------------------------------------------------------------- */
    /** SessionScavenger is a background thread that kills off old sessions */
    class SessionScavenger extends Thread
    {
        public void run()
        {
            int period=-1;
            try{
                while (isStarted())
                {
                    try {
                        if (period!=_scavengePeriodMs)
                        {
                            if(log.isDebugEnabled())log.debug("Session scavenger period = "+_scavengePeriodMs/1000+"s");
                            period=_scavengePeriodMs;
                        }
                        sleep(period>1000?period:1000);
                        AbstractSessionManager.this.scavenge();
                    }
                    catch (InterruptedException ex){continue;}
                    catch (Error e) {log.warn(LogSupport.EXCEPTION,e);}
                    catch (Exception e) {log.warn(LogSupport.EXCEPTION,e);}
                }
            }
            finally
            {
                AbstractSessionManager.this._scavenger=null;
                log.debug("Session scavenger exited");
            }
        }
        
        SessionScavenger()
        {
            super("SessionScavenger");
            setDaemon(true);
        }
        
    }   // SessionScavenger
    

    
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    public abstract class Session implements SessionManager.Session
    {
        Map _values;
        boolean _invalid=false;
        boolean _newSession=true;
        long _created=System.currentTimeMillis();
        long _accessed=_created;
        long _maxIdleMs = _dftMaxIdleSecs*1000;
        String _id;
        
        /* ------------------------------------------------------------- */
        protected Session(HttpServletRequest request)
        {
            _id=newSessionId(request,_created);
            if (_dftMaxIdleSecs>=0)
                _maxIdleMs=_dftMaxIdleSecs*1000;
        }
        
        /* ------------------------------------------------------------ */
        protected abstract Map newAttributeMap();
        
        /* ------------------------------------------------------------ */
        public void access()
        {
            _newSession=false;
            _accessed=System.currentTimeMillis();
        }
        
        /* ------------------------------------------------------------ */
        public boolean isValid()
        {
            return !_invalid;
        }
        
        /* ------------------------------------------------------------ */
        public ServletContext getServletContext()
        {
            return _handler.getServletContext();
        }
        
        /* ------------------------------------------------------------- */
        public String getId()
        throws IllegalStateException
        {
            return _id;
        }
        
        /* ------------------------------------------------------------- */
        public long getCreationTime()
        throws IllegalStateException
        {
            if (_invalid) throw new IllegalStateException();
            return _created;
        }
        
        /* ------------------------------------------------------------- */
        public long getLastAccessedTime()
        throws IllegalStateException
        {
            if (_invalid) throw new IllegalStateException();
            return _accessed;
        }
        
        /* ------------------------------------------------------------- */
        public int getMaxInactiveInterval()
        {
            if (_invalid) throw new IllegalStateException();
            return (int)(_maxIdleMs / 1000);
        }
        
        /* ------------------------------------------------------------- */
        /**
         * @deprecated
         */
        public HttpSessionContext getSessionContext()
        throws IllegalStateException
        {
            if (_invalid) throw new IllegalStateException();
            return SessionContext.NULL_IMPL;
        }
        
        /* ------------------------------------------------------------- */
        public void setMaxInactiveInterval(int secs)
        {
            _maxIdleMs = (long)secs * 1000;
            if (_maxIdleMs>0 && (_maxIdleMs/10)<_scavengePeriodMs)
                AbstractSessionManager.this.setScavengePeriod((secs+9)/10);
        }
        
        /* ------------------------------------------------------------- */
        public void invalidate() throws IllegalStateException
        {
            if (log.isDebugEnabled()) log.debug("Invalidate session "+getId()+" in "+_handler.getHttpContext());
            try
            {
                // Notify listeners and unbind values
                synchronized (this)
                {
                    if (_invalid)
                        throw new IllegalStateException();

                    if (_sessionListeners!=null)
                    {
                        HttpSessionEvent event=new HttpSessionEvent(this);
                        for (int i=_sessionListeners.size(); i-->0;)
                            ((HttpSessionListener)_sessionListeners.get(i)).sessionDestroyed(event);
                    }

                    if (_values!=null)
                    {
                        Iterator iter=_values.keySet().iterator();
                        while (iter.hasNext())
                        {
                            String key=(String)iter.next();
                            Object value=_values.get(key);
                            iter.remove();
                            unbindValue(key,value);

                            if (_sessionAttributeListeners.size()>0)
                            {
                                HttpSessionBindingEvent event=new HttpSessionBindingEvent(this,key,value);

                                for (int i=0; i<_sessionAttributeListeners.size(); i++)
                                {
                                    ((HttpSessionAttributeListener)_sessionAttributeListeners.get(i)).attributeRemoved(event);
                                }
                            }
                        }
                    }
                }
            }
            finally
            {
                // Remove session from context and global maps
                synchronized (__allSessions)
                {
                    synchronized (_sessions)
                    {
                        _invalid=true;
                        _sessions.remove(getId());
                        __allSessions.removeValue(getId(), this);
                        
                        if (isInvalidateGlobal())
                        {
                            // Don't iterate as other sessions may also be globally invalidating
                            while(__allSessions.containsKey(getId()))
                            {
                                Session session=(Session)__allSessions.getValue(getId(),0);
                                session.invalidate();
                            }
                        }
                    }
                }
            }
        }
        
        /* ------------------------------------------------------------- */
        public boolean isNew()
        throws IllegalStateException
        {
            if (_invalid) throw new IllegalStateException();
            return _newSession;
        }
        
        
        /* ------------------------------------------------------------ */
        public synchronized Object getAttribute(String name)
        {
            if (_invalid) throw new IllegalStateException();
            if (_values==null)
                return null;
            return _values.get(name);
        }
        
        /* ------------------------------------------------------------ */
        public synchronized Enumeration getAttributeNames()
        {
            if (_invalid) throw new IllegalStateException();
            List names = _values==null?Collections.EMPTY_LIST:new ArrayList(_values.keySet());
            return Collections.enumeration(names);
        }
        
        /* ------------------------------------------------------------ */
        public synchronized void setAttribute(String name, Object value)
        {
            if (_invalid) throw new IllegalStateException();
            if (_values==null)
                _values=newAttributeMap();
            Object oldValue = _values.put(name,value);
            
            if (value==null || !value.equals(oldValue))
            {
                unbindValue(name, oldValue);
                bindValue(name, value);
                
                if (_sessionAttributeListeners.size()>0)
                {
                    HttpSessionBindingEvent event =
                        new HttpSessionBindingEvent(this,name,
                                oldValue==null?value:oldValue);
                    
                    for(int i=0;i<_sessionAttributeListeners.size();i++)
                    {
                        HttpSessionAttributeListener l =
                            (HttpSessionAttributeListener)
                            _sessionAttributeListeners.get(i);
                        
                        if (oldValue==null)
                            l.attributeAdded(event);
                        else if (value==null)
                            l.attributeRemoved(event);
                        else
                            l.attributeReplaced(event);
                    }
                }
            }
        }
        
        /* ------------------------------------------------------------ */
        public synchronized void removeAttribute(String name)
        {
            if (_invalid) throw new IllegalStateException();
            if (_values==null)
                return;
            
            Object old=_values.remove(name);
            if (old!=null)
            {
                unbindValue(name, old);
                if (_sessionAttributeListeners.size()>0)
                {
                    HttpSessionBindingEvent event =
                        new HttpSessionBindingEvent(this,name,old);
                    
                    for(int i=0;i<_sessionAttributeListeners.size();i++)
                    {
                        HttpSessionAttributeListener l =
                            (HttpSessionAttributeListener)
                            _sessionAttributeListeners.get(i);
                        l.attributeRemoved(event);
                    }
                }
            }
        }
        
        /* ------------------------------------------------------------- */
        /**
         * @deprecated 	As of Version 2.2, this method is
         * 		replaced by {@link #getAttribute}
         */
        public Object getValue(String name)
        throws IllegalStateException
        {
            return getAttribute(name);
        }
        
        /* ------------------------------------------------------------- */
        /**
         * @deprecated 	As of Version 2.2, this method is
         * 		replaced by {@link #getAttributeNames}
         */
        public synchronized String[] getValueNames()
        throws IllegalStateException
        {
            if (_invalid) throw new IllegalStateException();
            if (_values==null)
                return new String[0];
            String[] a = new String[_values.size()];
            return (String[])_values.keySet().toArray(a);
        }
        
        /* ------------------------------------------------------------- */
        /**
         * @deprecated 	As of Version 2.2, this method is
         * 		replaced by {@link #setAttribute}
         */
        public void putValue(java.lang.String name,
                java.lang.Object value)
        throws IllegalStateException
        {
            setAttribute(name,value);
        }
        
        /* ------------------------------------------------------------- */
        /**
         * @deprecated 	As of Version 2.2, this method is
         * 		replaced by {@link #removeAttribute}
         */
        public void removeValue(java.lang.String name)
        throws IllegalStateException
        {
            removeAttribute(name);
        }
        
        /* ------------------------------------------------------------- */
        /** If value implements HttpSessionBindingListener, call valueBound() */
        private void bindValue(java.lang.String name, Object value)
        {
            if (value!=null && value instanceof HttpSessionBindingListener)
                ((HttpSessionBindingListener)value)
                .valueBound(new HttpSessionBindingEvent(this,name));            
        }
        
        /* ------------------------------------------------------------- */
        /** If value implements HttpSessionBindingListener, call valueUnbound() */
        private void unbindValue(java.lang.String name, Object value)
        {
            if (value!=null && value instanceof HttpSessionBindingListener)
                ((HttpSessionBindingListener)value)
                .valueUnbound(new HttpSessionBindingEvent(this,name));
        }
    }



}
