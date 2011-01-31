// ========================================================================
// $Id: SecurityConstraint.java,v 1.44 2005/08/13 00:01:24 gregwilkins Exp $
// Copyright 200-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.http;

import java.io.IOException;
import java.io.Serializable;
import java.security.Principal;
import java.util.Collections;
import java.util.List;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.jetty.servlet.FormAuthenticator;
import org.openqa.jetty.util.LazyList;

/* ------------------------------------------------------------ */
/** Describe an auth and/or data constraint. 
 *
 * @version $Revision: 1.44 $
 * @author Greg Wilkins (gregw)
 */
public class SecurityConstraint implements Cloneable, Serializable
{
    private static Log log= LogFactory.getLog(SecurityConstraint.class);

    /* ------------------------------------------------------------ */
    public final static String __BASIC_AUTH= "BASIC";
    public final static String __FORM_AUTH= "FORM";
    public final static String __DIGEST_AUTH= "DIGEST";
    public final static String __CERT_AUTH= "CLIENT_CERT";
    public final static String __CERT_AUTH2= "CLIENT-CERT";

    /* ------------------------------------------------------------ */
    public final static int DC_UNSET= -1, DC_NONE= 0, DC_INTEGRAL= 1, DC_CONFIDENTIAL= 2;

    /* ------------------------------------------------------------ */
    public final static String NONE= "NONE";
    public final static String ANY_ROLE= "*";

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /** Nobody user.
     * The Nobody UserPrincipal is used to indicate a partial state of
     * authentication. A request with a Nobody UserPrincipal will be allowed
     * past all authentication constraints - but will not be considered an
     * authenticated request.  It can be used by Authenticators such as
     * FormAuthenticator to allow access to logon and error pages within an
     * authenticated URI tree.
     */
    public static class Nobody implements Principal
    
    {
        public String getName()
        {
            return "Nobody";
        }
    }
    public final static Nobody __NOBODY= new Nobody();

    /* ------------------------------------------------------------ */
    private String _name;
    private Object _methods;
    private Object _roles;
    private int _dataConstraint= DC_UNSET;
    private boolean _anyRole= false;
    private boolean _authenticate= false;

    private transient List _umMethods;
    private transient List _umRoles;

    /* ------------------------------------------------------------ */
    /** Constructor. 
     */
    public SecurityConstraint()
    {}

    /* ------------------------------------------------------------ */
    /** Conveniance Constructor. 
     * @param name 
     * @param role 
     */
    public SecurityConstraint(String name, String role)
    {
        setName(name);
        addRole(role);
    }

    /* ------------------------------------------------------------ */
    /**
     * @param name 
     */
    public void setName(String name)
    {
        _name= name;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @param method 
     */
    public synchronized void addMethod(String method)
    {
        _methods= LazyList.add(_methods, method);
    }

    /* ------------------------------------------------------------ */
    public List getMethods()
    {
        if (_umMethods == null && _methods != null)
            _umMethods= Collections.unmodifiableList(LazyList.getList(_methods));
        return _umMethods;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @param method Method name.
     * @return True if this constraint applies to the method. If no
     * method has been set, then the constraint applies to all methods.
     */
    public boolean forMethod(String method)
    {
        if (_methods == null)
            return true;
        for (int i= 0; i < LazyList.size(_methods); i++)
            if (LazyList.get(_methods, i).equals(method))
                return true;
        return false;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @param role The rolename.  If the rolename is '*' all other
     * roles are removed and anyRole is set true and subsequent
     * addRole calls are ignored.
     * Authenticate is forced true by this call.
     */
    public synchronized void addRole(String role)
    {
        _authenticate= true;
        if (ANY_ROLE.equals(role))
        {
            _roles= null;
            _umRoles= null;
            _anyRole= true;
        }
        else if (!_anyRole)
            _roles= LazyList.add(_roles, role);
    }

    /* ------------------------------------------------------------ */
    /** 
     * @return True if any user role is permitted.
     */
    public boolean isAnyRole()
    {
        return _anyRole;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @return List of roles for this constraint.
     */
    public List getRoles()
    {
        if (_umRoles == null && _roles != null)
            _umRoles= Collections.unmodifiableList(LazyList.getList(_roles));
        return _umRoles;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @param role 
     * @return True if the constraint contains the role.
     */
    public boolean hasRole(String role)
    {
        return LazyList.contains(_roles, role);
    }

    /* ------------------------------------------------------------ */
    /** 
     * @param authenticate True if users must be authenticated 
     */
    public void setAuthenticate(boolean authenticate)
    {
        _authenticate= authenticate;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @return True if the constraint requires request authentication
     */
    public boolean getAuthenticate()
    {
        return _authenticate;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @return True if authentication required but no roles set
     */
    public boolean isForbidden()
    {
        return _authenticate && !_anyRole && LazyList.size(_roles) == 0;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @param c 
     */
    public void setDataConstraint(int c)
    {
        if (c < 0 || c > DC_CONFIDENTIAL)
            throw new IllegalArgumentException("Constraint out of range");
        _dataConstraint= c;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @return Data constrain indicator: 0=DC+NONE, 1=DC_INTEGRAL & 2=DC_CONFIDENTIAL
     */
    public int getDataConstraint()
    {
        return _dataConstraint;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @return True if a data constraint has been set.
     */
    public boolean hasDataConstraint()
    {
        return _dataConstraint >= DC_NONE;
    }

    /* ------------------------------------------------------------ */
    public Object clone()
	throws CloneNotSupportedException
    {
	SecurityConstraint sc = (SecurityConstraint) super.clone();
	sc._umMethods=null;
	sc._umRoles=null;
	return sc;
    }

    /* ------------------------------------------------------------ */
    public String toString()
    {
        return "SC{"
            + _name
            + ","
            + _methods
            + ","
            + (_anyRole ? "*" : (_roles == null ? "-" : _roles.toString()))
            + ","
            + (_dataConstraint == DC_NONE
                ? "NONE}"
                : (_dataConstraint == DC_INTEGRAL ? "INTEGRAL}" : "CONFIDENTIAL}"));
    }

    /* ------------------------------------------------------------ */
    /** Check security contraints
     * @param constraints 
     * @param authenticator 
     * @param realm 
     * @param pathInContext 
     * @param request 
     * @param response 
     * @return false if the request has failed a security constraint or the authenticator has already sent a response.
     * @exception HttpException 
     * @exception IOException 
     */
    public static boolean check(
        List constraints,
        Authenticator authenticator,
        UserRealm realm,
        String pathInContext,
        HttpRequest request,
        HttpResponse response)
        throws HttpException, IOException
    {
        // Combine data and auth constraints
        int dataConstraint= DC_NONE;
        Object roles= null;
        boolean unauthenticated= false;
        boolean forbidden= false;

        for (int c= 0; c < constraints.size(); c++)
        {
            SecurityConstraint sc= (SecurityConstraint)constraints.get(c);

            // Check the method applies
            if (!sc.forMethod(request.getMethod()))
                continue;

            // Combine data constraints.
            if (dataConstraint > DC_UNSET && sc.hasDataConstraint())
            {
                if (sc.getDataConstraint() > dataConstraint)
                    dataConstraint= sc.getDataConstraint();
            }
            else
                dataConstraint= DC_UNSET; // ignore all other data constraints

            // Combine auth constraints.
            if (!unauthenticated && !forbidden)
            {
                if (sc.getAuthenticate())
                {
                    if (sc.isAnyRole())
                    {
                        roles= ANY_ROLE;
                    }
                    else
                    {
                        List scr= sc.getRoles();
                        if (scr == null || scr.size() == 0)
                        {
                            forbidden= true;
                            break;
                        }
                        else
                        {
                            if (roles != ANY_ROLE)
                            {
                                roles= LazyList.addCollection(roles, scr);
                            }
                        }
                    }
                }
                else
                    unauthenticated= true;
            }
        }

        // Does this forbid everything?
        if (forbidden && 
            (!(authenticator instanceof FormAuthenticator) || 
            !((FormAuthenticator)authenticator).isLoginOrErrorPage(pathInContext)))
        {
            HttpContext.sendContextError(response,HttpResponse.__403_Forbidden,null);
            return false;
        }

        // Handle data constraint
        if (dataConstraint > DC_NONE)
        {
            HttpConnection connection= request.getHttpConnection();
            HttpListener listener= connection.getListener();

            switch (dataConstraint)
            {
                case SecurityConstraint.DC_INTEGRAL :
                    if (listener.isIntegral(connection))
                        break;

                    if (listener.getIntegralPort() > 0)
                    {
                        String url=
                            listener.getIntegralScheme()
                                + "://"
                                + request.getHost()
                                + ":"
                                + listener.getIntegralPort()
                                + request.getPath();
                        if (request.getQuery() != null)
                            url += "?" + request.getQuery();
                        response.setContentLength(0);
                        response.sendRedirect(url);
                    }
                    else
                        HttpContext.sendContextError(response,HttpResponse.__403_Forbidden,null);
                    return false;

                case SecurityConstraint.DC_CONFIDENTIAL :
                    if (listener.isConfidential(connection))
                        break;

                    if (listener.getConfidentialPort() > 0)
                    {
                        String url=
                            listener.getConfidentialScheme()
                                + "://"
                                + request.getHost()
                                + ":"
                                + listener.getConfidentialPort()
                                + request.getPath();
                        if (request.getQuery() != null)
                            url += "?" + request.getQuery();

                        response.setContentLength(0);
                        response.sendRedirect(url);
                    }
                    else
                        HttpContext.sendContextError(response,HttpResponse.__403_Forbidden,null);
                    return false;

                default :
                    HttpContext.sendContextError(response,HttpResponse.__403_Forbidden,null);
                    return false;
            }
        }

        // Does it fail a role check?
        if (!unauthenticated && roles != null)
        {
            if (realm == null)
            {
                HttpContext.sendContextError(response,HttpResponse.__500_Internal_Server_Error,"Configuration error");
                return false;
            }

            Principal user= null;

            // Handle pre-authenticated request
            if (request.getAuthType() != null && request.getAuthUser() != null)
            {
                // TODO - is this still needed???
                user= request.getUserPrincipal();
                if (user == null)
                    user= realm.authenticate(request.getAuthUser(), null, request);
                if (user == null && authenticator != null)
                    user= authenticator.authenticate(realm, pathInContext, request, response);
            }
            else if (authenticator != null)
            {
                // User authenticator.
                user= authenticator.authenticate(realm, pathInContext, request, response);
            }
            else
            {
                // don't know how authenticate
                log.warn("Mis-configured Authenticator for " + request.getPath());
                HttpContext.sendContextError(response,HttpResponse.__500_Internal_Server_Error,"Configuration error");
            }

            // If we still did not get a user
            if (user == null)
                return false; // Auth challenge or redirection already sent
            else if (user == __NOBODY)
                return true; // The Nobody user indicates authentication in transit.

            if (roles != ANY_ROLE)
            {
                boolean inRole= false;
                for (int r= LazyList.size(roles); r-- > 0;)
                {
                    if (realm.isUserInRole(user, (String)LazyList.get(roles, r)))
                    {
                        inRole= true;
                        break;
                    }
                }

                if (!inRole)
                {
                    log.warn("AUTH FAILURE: role for " + user.getName());
                    if ("BASIC".equalsIgnoreCase(authenticator.getAuthMethod()))
                         ((BasicAuthenticator)authenticator).sendChallenge(realm, response);
                    else
                        HttpContext.sendContextError(response,HttpResponse.__403_Forbidden,"User not in required role");
                    return false; // role failed.
                }
            }
        }
        else
        {
            request.setUserPrincipal(HttpRequest.__NOT_CHECKED);
        }

        return true;
    }
    
}
