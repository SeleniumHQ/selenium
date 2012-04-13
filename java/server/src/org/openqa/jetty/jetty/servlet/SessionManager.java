// ========================================================================
// $Id: SessionManager.java,v 1.18 2005/03/15 10:03:58 gregwilkins Exp $
// Copyright 1996-2004 Mort Bay Consulting Pty. Ltd.
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

import java.io.Serializable;
import java.util.EventListener;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.openqa.jetty.util.LifeCycle;

    
/* --------------------------------------------------------------------- */
/** Session Manager.
 * The API required to manage sessions for a servlet context.
 *
 * @version $Id: SessionManager.java,v 1.18 2005/03/15 10:03:58 gregwilkins Exp $
 * @author Greg Wilkins
 */
public interface SessionManager extends LifeCycle, Serializable
{
    /* ------------------------------------------------------------ */
    /** Session cookie name.
     * Defaults to JSESSIONID, but can be set with the
     * org.openqa.jetty.jetty.servlet.SessionCookie system property.
     */
    public final static String __SessionCookie=
        System.getProperty("org.openqa.jetty.jetty.servlet.SessionCookie","JSESSIONID");
    
    /* ------------------------------------------------------------ */
    /** Session URL parameter name.
     * Defaults to jsessionid, but can be set with the
     * org.openqa.jetty.jetty.servlet.SessionURL system property.
     */
    public final static String __SessionURL = 
        System.getProperty("org.openqa.jetty.jetty.servlet.SessionURL","jsessionid");

    final static String __SessionUrlPrefix=";"+__SessionURL+"=";

    /* ------------------------------------------------------------ */
    /** Session Domain.
     * If this property is set as a ServletContext InitParam, then it is
     * used as the domain for session cookies. If it is not set, then
     * no domain is specified for the session cookie.
     */
    public final static String __SessionDomain=
        "org.openqa.jetty.jetty.servlet.SessionDomain";
    
    /* ------------------------------------------------------------ */
    /** Session Path.
     * If this property is set as a ServletContext InitParam, then it is
     * used as the path for the session cookie.  If it is not set, then
     * the context path is used as the path for the cookie.
     */
    public final static String __SessionPath=
        "org.openqa.jetty.jetty.servlet.SessionPath";
    
    /* ------------------------------------------------------------ */
    /** Session Max Age.
     * If this property is set as a ServletContext InitParam, then it is
     * used as the max age for the session cookie.  If it is not set, then
     * a max age of -1 is used.
     */
    public final static String __MaxAge=
        "org.openqa.jetty.jetty.servlet.MaxAge";
    
    /* ------------------------------------------------------------ */
    public void initialize(ServletHandler handler);
    
    /* ------------------------------------------------------------ */
    public HttpSession getHttpSession(String id);
    
    /* ------------------------------------------------------------ */
    public HttpSession newHttpSession(HttpServletRequest request);

    /* ------------------------------------------------------------ */
    /** @return true if session cookies should be secure
     */
    public boolean getSecureCookies();

    /* ------------------------------------------------------------ */
    /** @return true if session cookies should be httponly (microsoft extension)
     */
    public boolean getHttpOnly();

    /* ------------------------------------------------------------ */
    public int getMaxInactiveInterval();

    /* ------------------------------------------------------------ */
    public void setMaxInactiveInterval(int seconds);

    /* ------------------------------------------------------------ */
    /** Add an event listener.
     * @param listener An Event Listener. Individual SessionManagers
     * implemetations may accept arbitrary listener types, but they
     * are expected to at least handle
     *   HttpSessionActivationListener,
     *   HttpSessionAttributeListener,
     *   HttpSessionBindingListener,
     *   HttpSessionListener
     * @exception IllegalArgumentException If an unsupported listener
     * is passed.
     */
    public void addEventListener(EventListener listener)
        throws IllegalArgumentException;
    
    /* ------------------------------------------------------------ */
    public void removeEventListener(EventListener listener);
    

    /* ------------------------------------------------------------ */
    /** Get a Cookie for a session.
     * @param session
     * @return A Cookie object
     */
    public Cookie getSessionCookie(HttpSession session,boolean requestIsSecure);
    
    
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    public interface Session extends HttpSession
    {
        /* ------------------------------------------------------------ */
        public boolean isValid();

        /* ------------------------------------------------------------ */
        public void access();
    }


}
