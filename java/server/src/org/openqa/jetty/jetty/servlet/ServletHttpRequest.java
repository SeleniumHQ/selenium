// ========================================================================
// $Id: ServletHttpRequest.java,v 1.65 2005/08/13 00:01:27 gregwilkins Exp $
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


package org.openqa.jetty.jetty.servlet;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.security.Principal;
import java.util.Collection;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletInputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletRequestWrapper;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpConnection;
import org.openqa.jetty.http.HttpFields;
import org.openqa.jetty.http.HttpInputStream;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.SecurityConstraint;
import org.openqa.jetty.util.LazyList;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.Resource;
import org.openqa.jetty.util.StringUtil;
import org.openqa.jetty.util.URI;


/* ------------------------------------------------------------ */
/** Servlet Request Wrapper.
 * This class wraps a Jetty HTTP request as a 2.2 Servlet
 * request.
 * <P>
 * Note that this wrapper is not synchronized and if a request is to
 * be operated on by multiple threads, then higher level
 * synchronizations may be required.
 * 
 * @version $Id: ServletHttpRequest.java,v 1.65 2005/08/13 00:01:27 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class ServletHttpRequest
    implements HttpServletRequest
{
    private static Log log = LogFactory.getLog(ServletHttpRequest.class);

    /* -------------------------------------------------------------- */
    public static final String
        __SESSIONID_NOT_CHECKED = "not checked",
        __SESSIONID_URL = "url",
        __SESSIONID_COOKIE = "cookie",
        __SESSIONID_NONE = "none";

    private static final Enumeration __emptyEnum =  
        Collections.enumeration(Collections.EMPTY_LIST);
    private static final Collection __defaultLocale =
        Collections.singleton(Locale.getDefault());

    private ServletHandler _servletHandler;    
    private HttpRequest _httpRequest;
    private ServletHttpResponse _servletHttpResponse;

    private String _contextPath=null;
    private String _servletPath=null;
    private String _pathInfo=null;
    private String _query=null;
    private String _pathTranslated=null;
    private String _requestedSessionId=null;
    private HttpSession _session=null;
    private String _sessionIdState=__SESSIONID_NOT_CHECKED;
    private ServletIn _in =null;
    private BufferedReader _reader=null;
    private int _inputState=0;
    private ServletHolder _servletHolder;
    private String _pathInContext;
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     */
    public ServletHttpRequest(ServletHandler servletHandler,
                       String pathInContext,
                       HttpRequest request)
    {
        _servletHandler=servletHandler;
        _pathInContext=pathInContext;
        _contextPath=_servletHandler.getHttpContext().getContextPath();
        if (_contextPath.length()<=1)
            _contextPath="";

        _httpRequest=request;
    }

    /* ------------------------------------------------------------ */
    void recycle(ServletHandler servletHandler,String pathInContext)
    {
        _servletHandler=servletHandler;
        _pathInContext=pathInContext;
        _servletPath=null;
        _pathInfo=null;
        _query=null;
        _pathTranslated=null;
        _requestedSessionId=null;
        _session=null;
        _sessionIdState=__SESSIONID_NOT_CHECKED;
        _in=null;
        _reader=null;
        _inputState=0;
        _servletHolder=null;

        if (servletHandler!=null)
            _contextPath=_servletHandler.getHttpContext().getContextPath();
        if (_contextPath!=null&&_contextPath.length()<=1)
                _contextPath="";
    }
    
    
    /* ------------------------------------------------------------ */
    ServletHandler getServletHandler()
    {
        return _servletHandler;
    }

    /* ------------------------------------------------------------ */
    void setServletHandler(ServletHandler servletHandler)
    {
        _servletHandler=servletHandler;
    }
    
    /* ------------------------------------------------------------ */
    /** Set servletpath and pathInfo.
     * Called by the RestishHandler before passing a request to a particular
     * holder to split the context path into a servlet path and path info.
     * @param servletPath 
     * @param pathInfo 
     */
    void setServletPaths(String servletPath,
                         String pathInfo,
                         ServletHolder holder)
    {
        _servletPath=servletPath;
        _pathInfo=pathInfo;
        _servletHolder=holder;
    }
    
    /* ------------------------------------------------------------ */
    ServletHolder getServletHolder()
    {
        return _servletHolder;
    }
    
    /* ------------------------------------------------------------ */
    String getPathInContext()
    {
        return _pathInContext;
    }
    
    /* ------------------------------------------------------------ */
    HttpRequest getHttpRequest()
    {
        return _httpRequest;
    }
    
    /* ------------------------------------------------------------ */
    public ServletHttpResponse getServletHttpResponse()
    {
        return _servletHttpResponse;
    }
    
    /* ------------------------------------------------------------ */
    void setServletHttpResponse(ServletHttpResponse response)
    {
        _servletHttpResponse = response;
    }

    /* ------------------------------------------------------------ */
    public Locale getLocale()
    {
        Enumeration enm = _httpRequest.getFieldValues(HttpFields.__AcceptLanguage,
                                                       HttpFields.__separators);

        // handle no locale
        if (enm == null || !enm.hasMoreElements())
            return Locale.getDefault();
        
        // sort the list in quality order
        List acceptLanguage = HttpFields.qualityList(enm);
        if (acceptLanguage.size()==0)
            return  Locale.getDefault();

        int size=acceptLanguage.size();
        
        // convert to locals
        for (int i=0; i<size; i++)
        {
            String language = (String)acceptLanguage.get(i);
            language=HttpFields.valueParameters(language,null);
            String country = "";
            int dash = language.indexOf('-');
            if (dash > -1)
            {
                country = language.substring(dash + 1).trim();
                language = language.substring(0,dash).trim();
            }
            return new Locale(language,country);
        }

        return  Locale.getDefault();
    }
    
    /* ------------------------------------------------------------ */
    public Enumeration getLocales()
    {
        Enumeration enm = _httpRequest.getFieldValues(HttpFields.__AcceptLanguage,
                                                       HttpFields.__separators);

        // handle no locale
        if (enm == null || !enm.hasMoreElements())
            return Collections.enumeration(__defaultLocale);
        
        // sort the list in quality order
        List acceptLanguage = HttpFields.qualityList(enm);
        
        if (acceptLanguage.size()==0)
            return
                Collections.enumeration(__defaultLocale);

        Object langs = null;
        int size=acceptLanguage.size();
        
        // convert to locals
        for (int i=0; i<size; i++)
        {
            String language = (String)acceptLanguage.get(i);
            language=HttpFields.valueParameters(language,null);
            String country = "";
            int dash = language.indexOf('-');
            if (dash > -1)
            {
                country = language.substring(dash + 1).trim();
                language = language.substring(0,dash).trim();
            }
            langs=LazyList.ensureSize(langs,size);
            langs=LazyList.add(langs,new Locale(language,country));
        }

        if (LazyList.size(langs)==0)
            return Collections.enumeration(__defaultLocale);
            
        return Collections.enumeration(LazyList.getList(langs));
    }
    
    /* ------------------------------------------------------------ */
    public boolean isSecure()
    {
        return _httpRequest.isConfidential();
    }
    
    /* ------------------------------------------------------------ */
    public Cookie[] getCookies()
    {
        Cookie[] cookies = _httpRequest.getCookies();
        if (cookies.length==0)
            return null;
        return cookies;
    }
    
    /* ------------------------------------------------------------ */
    public long getDateHeader(String name)
    {
        return _httpRequest.getDateField(name);
    }
    
    /* ------------------------------------------------------------ */
    public Enumeration getHeaderNames()
    {
        return _httpRequest.getFieldNames();
    }
    
    /* ------------------------------------------------------------ */
    public String getHeader(String name)
    {
        return _httpRequest.getField(name);
    }
    
    /* ------------------------------------------------------------ */
    public Enumeration getHeaders(String s)
    {
        Enumeration enm=_httpRequest.getFieldValues(s);
        if (enm==null)
            return __emptyEnum;
        return enm;
    }
    
    /* ------------------------------------------------------------ */
    public int getIntHeader(String name)
        throws NumberFormatException
    {
        return _httpRequest.getIntField(name);
    }
    
    /* ------------------------------------------------------------ */
    public String getMethod()
    {
        return _httpRequest.getMethod();
    }
    
    /* ------------------------------------------------------------ */
    public String getContextPath()
    {
        return _contextPath;
    }
    
    /* ------------------------------------------------------------ */
    public String getPathInfo()
    {
        if (_servletPath==null)
            return null; 
        return _pathInfo;
    }
    
    /* ------------------------------------------------------------ */
    public String getPathTranslated()
    {
        if (_pathInfo==null || _pathInfo.length()==0)
            return null;
        if (_pathTranslated==null)
        {
            Resource resource =
                _servletHandler.getHttpContext().getBaseResource();

            if (resource==null)
                return null;

            try
            {
                resource=resource.addPath(_pathInfo);
                File file = resource.getFile();
                if (file==null)
                    return null;
                _pathTranslated=file.getAbsolutePath();
            }
            catch(Exception e)
            {
                log.debug(LogSupport.EXCEPTION,e);
            }
        }
        
        return _pathTranslated;
    }
    
    /* ------------------------------------------------------------ */
    public String getQueryString()
    {
        if (_query==null)
            _query =_httpRequest.getQuery();
        return _query;
    }
    
    /* ------------------------------------------------------------ */
    public String getAuthType()
    {
        String at= _httpRequest.getAuthType();
        if (at==SecurityConstraint.__BASIC_AUTH)
            return HttpServletRequest.BASIC_AUTH;
        if (at==SecurityConstraint.__FORM_AUTH)
            return HttpServletRequest.FORM_AUTH;
        if (at==SecurityConstraint.__DIGEST_AUTH)
            return HttpServletRequest.DIGEST_AUTH;
        if (at==SecurityConstraint.__CERT_AUTH)
            return HttpServletRequest.CLIENT_CERT_AUTH;
        if (at==SecurityConstraint.__CERT_AUTH2)
            return HttpServletRequest.CLIENT_CERT_AUTH;
        return at;
    }

    /* ------------------------------------------------------------ */
    public String getRemoteUser()
    {
        return _httpRequest.getAuthUser();
    }

    /* ------------------------------------------------------------ */
    public boolean isUserInRole(String role)
    {
        if (_servletHolder!=null)
            role=_servletHolder.getUserRoleLink(role);
        return _httpRequest.isUserInRole(role);
    }

    /* ------------------------------------------------------------ */
    public Principal getUserPrincipal()
    {
        return _httpRequest.getUserPrincipal();
    }
    
    /* ------------------------------------------------------------ */
    void setRequestedSessionId(String pathParams)
    {
        _requestedSessionId=null;
        
        // try cookies first
        if (_servletHandler.isUsingCookies())
        {
            Cookie[] cookies=_httpRequest.getCookies();
            if (cookies!=null && cookies.length>0)
            {
                for (int i=0;i<cookies.length;i++)
                {
                    if (SessionManager.__SessionCookie.equalsIgnoreCase(cookies[i].getName()))
                    {
                        if (_requestedSessionId!=null)
                        {
                            // Multiple jsessionid cookies. Probably due to
                            // multiple paths and/or domains. Pick the first
                            // known session or the last defined cookie.
                            SessionManager manager = _servletHandler.getSessionManager();
                            if (manager!=null && manager.getHttpSession(_requestedSessionId)!=null)
                                break;
                            log.debug("multiple session cookies");
                        }
                        
                        _requestedSessionId=cookies[i].getValue();
                        _sessionIdState = __SESSIONID_COOKIE;
                        if(log.isDebugEnabled())log.debug("Got Session "+_requestedSessionId+" from cookie");
                    }
                }
            }
        }
            
        // check if there is a url encoded session param.
        if (pathParams!=null && pathParams.startsWith(SessionManager.__SessionURL))
        {
            String id =
                pathParams.substring(SessionManager.__SessionURL.length()+1);
            if(log.isDebugEnabled())log.debug("Got Session "+id+" from URL");
            
            if (_requestedSessionId==null)
            {
                _requestedSessionId=id;
                _sessionIdState = __SESSIONID_URL;
            }
            else if (!id.equals(_requestedSessionId))
                log.debug("Mismatched session IDs");
        }
        
        if (_requestedSessionId == null)
            _sessionIdState = __SESSIONID_NONE;        
    }
    
    /* ------------------------------------------------------------ */
    public String getRequestedSessionId()
    {
        return _requestedSessionId;
    }
    
    /* ------------------------------------------------------------ */
    public String getRequestURI()
    {
        return _httpRequest.getEncodedPath();
    }
    
    /* ------------------------------------------------------------ */
    public StringBuffer getRequestURL()
    {
        StringBuffer buf = _httpRequest.getRootURL();
        buf.append(getRequestURI());
        return buf;
    }
    
    /* ------------------------------------------------------------ */
    public String getServletPath()
    {
        if (_servletPath==null)
            return _pathInContext;
        return _servletPath;
    }
    
    /* ------------------------------------------------------------ */
    public HttpSession getSession(boolean create)
    {        
        if (_session != null && ((SessionManager.Session)_session).isValid())
            return _session;
        
        _session=null;
        
        String id = getRequestedSessionId();
        
        if (id != null)
        {
            _session=_servletHandler.getHttpSession(id);
            if (_session == null && !create)
                return null;
        }
        
        if (_session == null && create)
        {
            _session=newSession();
        }
        
        return _session;
    }

    /* ------------------------------------------------------------ */
    /* Create a new HttpSession.
     * If cookies are being used a set cookie is added to the response.
     */
    HttpSession newSession()
    {
        HttpSession session=_servletHandler.newHttpSession(this);
        Cookie cookie=_servletHandler.getSessionManager().getSessionCookie(session,isSecure());
        if (cookie!=null)
            _servletHttpResponse.getHttpResponse().addSetCookie(cookie);
        return session;
    }
    
    /* ------------------------------------------------------------ */
    public HttpSession getSession()
    {
        HttpSession session = getSession(true);
        return session;
    }
    
    /* ------------------------------------------------------------ */
    public boolean isRequestedSessionIdValid()
    {
        return _requestedSessionId != null && getSession(false) != null;
    }
    
    /* -------------------------------------------------------------- */
    public boolean isRequestedSessionIdFromCookie()
    {
        return _sessionIdState == __SESSIONID_COOKIE;
    }
    
    /* -------------------------------------------------------------- */
    public boolean isRequestedSessionIdFromURL()
    {
        return _sessionIdState == __SESSIONID_URL;
    }
    
    /* -------------------------------------------------------------- */
    /**
     * @deprecated
     */
    public boolean isRequestedSessionIdFromUrl()
    {
        return isRequestedSessionIdFromURL();
    }
    
    /* -------------------------------------------------------------- */
    public Enumeration getAttributeNames()
    {
        return _httpRequest.getAttributeNames();
    }
    
    /* -------------------------------------------------------------- */
    public Object getAttribute(String name)
    {
        return _httpRequest.getAttribute(name);
    }
    
    /* -------------------------------------------------------------- */
    public void setAttribute(String name, Object value)
    {
        _httpRequest.setAttribute(name,value);
    }
    
    /* -------------------------------------------------------------- */
    public void removeAttribute(String name)
    {
        _httpRequest.removeAttribute(name);
    }
    
    /* -------------------------------------------------------------- */
    public void setCharacterEncoding(String encoding)
        throws UnsupportedEncodingException
    {
        if (_inputState!=0)
            throw new IllegalStateException("getReader() or getInputStream() called");
        "".getBytes(encoding);
        _httpRequest.setCharacterEncoding(encoding,false);
    }
    
    /* -------------------------------------------------------------- */
    public String getCharacterEncoding()
    {
        return _httpRequest.getCharacterEncoding();
    }
    
    /* -------------------------------------------------------------- */
    public int getContentLength()
    {
        return _httpRequest.getContentLength();
    }
    
    /* -------------------------------------------------------------- */
    public String getContentType()
    {
        return _httpRequest.getContentType();
    }
    
    /* -------------------------------------------------------------- */
    public ServletInputStream getInputStream()
    {
        if (_inputState!=0 && _inputState!=1)
            throw new IllegalStateException();
        if (_in==null)
            _in = new ServletIn((HttpInputStream)_httpRequest.getInputStream());  
        _inputState=1;
        _reader=null;
        return _in;
    }
    
    /* -------------------------------------------------------------- */
    /**
     * This method is not recommended as it forces the generation of a
     * non-optimal data structure.
     */
    public Map getParameterMap()
    {
        return Collections.unmodifiableMap(_httpRequest.getParameterStringArrayMap());
    }
    
    /* -------------------------------------------------------------- */
    public String getParameter(String name)
    {
        return _httpRequest.getParameter(name);
    }
    
    /* -------------------------------------------------------------- */
    public Enumeration getParameterNames()
    {
        return Collections.enumeration(_httpRequest.getParameterNames());
    }
    
    /* -------------------------------------------------------------- */
    public String[] getParameterValues(String name)
    {
        List v=_httpRequest.getParameterValues(name);
        if (v==null)
            return null;
        String[]a=new String[v.size()];
        return (String[])v.toArray(a);
    }
    
    /* -------------------------------------------------------------- */
    public String getProtocol()
    {
        return _httpRequest.getVersion();
    }
    
    /* -------------------------------------------------------------- */
    public String getScheme()
    {
        return _httpRequest.getScheme();
    }
    
    /* -------------------------------------------------------------- */
    public String getServerName()
    {
        return _httpRequest.getHost();
    }
    
    /* -------------------------------------------------------------- */
    public int getServerPort()
    {
        int port = _httpRequest.getPort();
        if (port==0)
        {
            if (getScheme().equalsIgnoreCase("https"))
                return 443;
            return 80;
        }
        return port;
    }

    /* -------------------------------------------------------------- */
    public int getRemotePort()
    {
        HttpConnection connection= _httpRequest.getHttpConnection();
        if (connection!=null)
            return connection.getRemotePort();
        return 0;
    }
    
    /* -------------------------------------------------------------- */
    public String getLocalName()
    {
        HttpConnection connection= _httpRequest.getHttpConnection();
        if (connection!=null)
            return connection.getServerName();
        return null;
    }
    
    /* -------------------------------------------------------------- */
    public String getLocalAddr()
    {
        HttpConnection connection= _httpRequest.getHttpConnection();
        if (connection!=null)
            return connection.getServerAddr();
        return null;
    }
    
    /* -------------------------------------------------------------- */
    public int getLocalPort()
    {
        HttpConnection connection= _httpRequest.getHttpConnection();
        if (connection!=null)
            return connection.getServerPort();
        return 0;
    }
    
    /* -------------------------------------------------------------- */
    public BufferedReader getReader()
    	throws UnsupportedEncodingException
    {
        if (_inputState!=0 && _inputState!=2)
            throw new IllegalStateException();
        if (_reader==null)
        {
            String encoding=getCharacterEncoding();
            if (encoding==null)
                encoding=StringUtil.__ISO_8859_1;
            _reader=new BufferedReader(new InputStreamReader(getInputStream(),encoding));
            
        }
        _inputState=2;
        return _reader;
    }
    
    /* -------------------------------------------------------------- */
    public String getRemoteAddr()
    {
        return _httpRequest.getRemoteAddr();
    }
    
    /* -------------------------------------------------------------- */
    public String getRemoteHost()
    {
        if (_httpRequest.getHttpConnection()==null)
            return null;
        return _httpRequest.getRemoteHost();
    }

    /* -------------------------------------------------------------- */
    /**
     * @deprecated  As of Version 2.1 of the Java Servlet API,
     * 			use {@link javax.servlet.ServletContext#getRealPath} instead.
     */
    public String getRealPath(String path)
    {
        return _servletHandler.getServletContext().getRealPath(path);
    }

    /* ------------------------------------------------------------ */
    public RequestDispatcher getRequestDispatcher(String url)
    {
        if (url == null)
            return null;

        if (!url.startsWith("/"))
        {
            String relTo=URI.addPaths(_servletPath,_pathInfo);
            int slash=relTo.lastIndexOf("/");
            if (slash>1)
                relTo=relTo.substring(0,slash+1);
            else
                relTo="/";
            url=URI.addPaths(relTo,url);
        }
    
        return _servletHandler.getServletContext().getRequestDispatcher(url);
    }

    /* ------------------------------------------------------------ */
    public String toString()
    {
        return
            getContextPath()+"+"+getServletPath()+"+"+getPathInfo()+"\n"+
            _httpRequest.toString();
    }

    
    /* ------------------------------------------------------------ */
    /** Unwrap a ServletRequest.
     *
     * @see javax.servlet.ServletRequestWrapper
     * @see javax.servlet.http.HttpServletRequestWrapper
     * @param request 
     * @return The core ServletHttpRequest which must be the
     * underlying request object 
     */
    public static ServletHttpRequest unwrap(ServletRequest request)
    {
        while (!(request instanceof ServletHttpRequest))
        {
            if (request instanceof ServletRequestWrapper)
            {
                ServletRequestWrapper wrapper =
                    (ServletRequestWrapper)request;
                request=wrapper.getRequest();
            }
            else
                throw new IllegalArgumentException("Does not wrap ServletHttpRequest");
        }

        return (ServletHttpRequest)request;
    }
}






