// ========================================================================
// $Id: Dispatcher.java,v 1.92 2005/12/12 18:03:31 gregwilkins Exp $
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

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;
import javax.servlet.http.HttpSession;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpConnection;
import org.openqa.jetty.http.PathMap;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.MultiMap;
import org.openqa.jetty.util.StringMap;
import org.openqa.jetty.util.URI;
import org.openqa.jetty.util.UrlEncoded;
import org.openqa.jetty.util.WriterOutputStream;

/* ------------------------------------------------------------ */
/** Servlet RequestDispatcher.
 * 
 * @version $Id: Dispatcher.java,v 1.92 2005/12/12 18:03:31 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class Dispatcher implements RequestDispatcher
{
    static Log log = LogFactory.getLog(Dispatcher.class);


    /* ------------------------------------------------------------ */
    /** Dispatch types */
    public static final int __DEFAULT=0;
    public static final int __REQUEST=1;
    public static final int __FORWARD=2;
    public static final int __INCLUDE=4;
    public static final int __ERROR=8;
    public static final int __ALL=15;
    
    /** Dispatch include attribute names */
    public final static String __INCLUDE_REQUEST_URI= "javax.servlet.include.request_uri";
    public final static String __INCLUDE_CONTEXT_PATH= "javax.servlet.include.context_path";
    public final static String __INCLUDE_SERVLET_PATH= "javax.servlet.include.servlet_path";
    public final static String __INCLUDE_PATH_INFO= "javax.servlet.include.path_info";
    public final static String __INCLUDE_QUERY_STRING= "javax.servlet.include.query_string";

    /** Dispatch include attribute names */
    public final static String __FORWARD_REQUEST_URI= "javax.servlet.forward.request_uri";
    public final static String __FORWARD_CONTEXT_PATH= "javax.servlet.forward.context_path";
    public final static String __FORWARD_SERVLET_PATH= "javax.servlet.forward.servlet_path";
    public final static String __FORWARD_PATH_INFO= "javax.servlet.forward.path_info";
    public final static String __FORWARD_QUERY_STRING= "javax.servlet.forward.query_string";

    
    public final static StringMap __managedAttributes = new StringMap();
    static
    {
        __managedAttributes.put(__INCLUDE_REQUEST_URI,__INCLUDE_REQUEST_URI);
        __managedAttributes.put(__INCLUDE_CONTEXT_PATH,__INCLUDE_CONTEXT_PATH);
        __managedAttributes.put(__INCLUDE_SERVLET_PATH,__INCLUDE_SERVLET_PATH);
        __managedAttributes.put(__INCLUDE_PATH_INFO,__INCLUDE_PATH_INFO);
        __managedAttributes.put(__INCLUDE_QUERY_STRING,__INCLUDE_QUERY_STRING);
        
        __managedAttributes.put(__FORWARD_REQUEST_URI,__FORWARD_REQUEST_URI);
        __managedAttributes.put(__FORWARD_CONTEXT_PATH,__FORWARD_CONTEXT_PATH);
        __managedAttributes.put(__FORWARD_SERVLET_PATH,__FORWARD_SERVLET_PATH);
        __managedAttributes.put(__FORWARD_PATH_INFO,__FORWARD_PATH_INFO);
        __managedAttributes.put(__FORWARD_QUERY_STRING,__FORWARD_QUERY_STRING);
    }
    
    ServletHandler _servletHandler;
    ServletHolder _holder=null;
    String _pathSpec;
    String _uriInContext;
    String _pathInContext;
    String _query;

    
    /* ------------------------------------------------------------ */
    /** Constructor. 
    /** Constructor. 
     * @param servletHandler 
     * @param uriInContext Encoded uriInContext
     * @param pathInContext Encoded pathInContext
     * @param query
     * @exception IllegalStateException 
     */
    Dispatcher(ServletHandler servletHandler,
               String uriInContext,
               String pathInContext,
               String query,
               Map.Entry entry)
        throws IllegalStateException
    {
        if(log.isDebugEnabled())log.debug("Dispatcher for "+servletHandler+","+uriInContext+","+query);
        
        _servletHandler=servletHandler;
        _uriInContext=uriInContext;
        _pathInContext=pathInContext;        
        _query=query;
        _pathSpec=(String)entry.getKey();
        _holder = (ServletHolder)entry.getValue();
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param servletHandler
     * @param name
     */
    Dispatcher(ServletHandler servletHandler,String name)
        throws IllegalStateException
    {
        _servletHandler=servletHandler;
        _holder=_servletHandler.getServletHolder(name);
        if (_holder==null)
            throw new IllegalStateException("No named servlet handler in context");
    }

    /* ------------------------------------------------------------ */
    public boolean isNamed()
    {
        return _pathInContext==null;
    }
    
    /* ------------------------------------------------------------ */
    public void include(ServletRequest servletRequest,
                        ServletResponse servletResponse)
        throws ServletException, IOException     
    {
        dispatch(servletRequest,servletResponse,Dispatcher.__INCLUDE);
    }
    
    /* ------------------------------------------------------------ */
    public void forward(ServletRequest servletRequest,
                        ServletResponse servletResponse)
        throws ServletException,IOException
    {
        dispatch(servletRequest,servletResponse,Dispatcher.__FORWARD);
    }
    
    /* ------------------------------------------------------------ */
    void error(ServletRequest servletRequest,
                        ServletResponse servletResponse)
        throws ServletException,IOException
    {
        dispatch(servletRequest,servletResponse,Dispatcher.__ERROR);
    }
    
    /* ------------------------------------------------------------ */
    void dispatch(ServletRequest servletRequest,
                  ServletResponse servletResponse,
                  int type)
        throws ServletException,IOException
    {
        HttpServletRequest httpServletRequest=(HttpServletRequest)servletRequest;
        HttpServletResponse httpServletResponse=(HttpServletResponse)servletResponse;

        HttpConnection httpConnection=
            _servletHandler.getHttpContext().getHttpConnection();
        ServletHttpRequest servletHttpRequest=
            (ServletHttpRequest)httpConnection.getRequest().getWrapper();
        
        // wrap the request and response
        DispatcherRequest request = new DispatcherRequest(httpServletRequest,
                                                          servletHttpRequest,
                                                          type);
        DispatcherResponse response = new DispatcherResponse(request,
                                                             httpServletResponse);        
        
        if (type==Dispatcher.__FORWARD)
            servletResponse.resetBuffer();
        
        // Merge parameters
        String query=_query;
        MultiMap parameters=null;
        if (query!=null)
        {
            Map old_params = httpServletRequest.getParameterMap();
            
            // Add the parameters
            parameters=new MultiMap();
            UrlEncoded.decodeTo(query,parameters,request.getCharacterEncoding());
            
            if (old_params!=null && old_params.size()>0)
            {
                // Merge old parameters.
                Iterator iter = old_params.entrySet().iterator();
                while (iter.hasNext())
                {
                    Map.Entry entry = (Map.Entry)iter.next();
                    String name=(String)entry.getKey();
                    String[] values=(String[])entry.getValue();
                    for (int i=0;i<values.length;i++)
                        parameters.add(name, values[i]);
                }
            }

            request.setParameters(parameters);
            
            String old_query=httpServletRequest.getQueryString();
            if (old_query!=null)
                request.setQuery(query+"&"+old_query);
            else
                request.setQuery(query);
        }
        
        Object old_scope = null;
        try
        {
            if (request.crossContext())
            {
                // Setup new _context
                old_scope=
                    _servletHandler.getHttpContext()
                    .enterContextScope(httpConnection.getRequest(),httpConnection.getResponse());
            }
        
            if (isNamed())
            {
                // No further modifications required.
                if (_servletHandler instanceof WebApplicationHandler)
                {
                    JSR154Filter filter = ((WebApplicationHandler)_servletHandler).getJsr154Filter();
                    if (filter!=null && filter.isUnwrappedDispatchSupported())
                    {
                        filter.setDispatch(request, response);
                        _servletHandler.dispatch(null,httpServletRequest,httpServletResponse,_holder, type);
                    }
                    else
                        _servletHandler.dispatch(null,request,response,_holder, type);
                }
                else
                	_servletHandler.dispatch(null,request,response,_holder, type);
            }
            else
            {   
                // Adjust servlet paths
                request.setPaths(_servletHandler.getHttpContext().getContextPath(),
                                 PathMap.pathMatch(_pathSpec,_pathInContext),
                                 PathMap.pathInfo(_pathSpec,_pathInContext));
        

                // are we wrap over or wrap under
                if (_servletHandler instanceof WebApplicationHandler)
                {
                    JSR154Filter filter = ((WebApplicationHandler)_servletHandler).getJsr154Filter();
                    if (filter!=null && filter.isUnwrappedDispatchSupported())
                    {
                        filter.setDispatch(request, response);
                        _servletHandler.dispatch(_pathInContext,httpServletRequest,httpServletResponse,_holder, type);
                    }
                    else
                        _servletHandler.dispatch(_pathInContext,request,response,_holder, type);
                }
                else
                    _servletHandler.dispatch(_pathInContext,request,response,_holder, type);
                
                
                if (type!=Dispatcher.__INCLUDE)
                    response.close();
                else if (response.isFlushNeeded())
                    response.flushBuffer();
            }
        }
        finally
        {
            // restore _context
            if (request.crossContext())
                _servletHandler.getHttpContext()
                    .leaveContextScope(httpConnection.getRequest(),
                                       httpConnection.getResponse(),
                                       old_scope);
        }   
    }

    /* ------------------------------------------------------------ */
    public String toString()
    {
        return "Dispatcher["+_pathSpec+","+_holder+"]";
    }
        

    /* ------------------------------------------------------------ */
    /** Dispatch type from name
     */
    public static int type(String type)
    {
        if ("request".equalsIgnoreCase(type))
            return __REQUEST;
        if ("forward".equalsIgnoreCase(type))
            return __FORWARD;
        if ("include".equalsIgnoreCase(type))
            return __INCLUDE;
        if ("error".equalsIgnoreCase(type))
            return __ERROR;
        throw new IllegalArgumentException(type);
    }


    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    class DispatcherRequest extends HttpServletRequestWrapper
    {   
        DispatcherResponse _response;
        int _filterType;
        String _contextPath;
        String _servletPath;
        String _pathInfo;
        MultiMap _parameters;
        HashMap _attributes;
        boolean _xContext;
        HttpSession _xSession;
        ServletHttpRequest _servletHttpRequest;
        String _query;
        
        /* ------------------------------------------------------------ */
        DispatcherRequest(HttpServletRequest httpServletRequest,
                          ServletHttpRequest servletHttpRequest,
                          int filterType)
        {
            super(httpServletRequest);
            _servletHttpRequest=servletHttpRequest;
            _filterType=filterType;
            
            // Is this being dispatched to a different context?
            _xContext=
                servletHttpRequest.getServletHandler()!=_servletHandler;
            if (_xContext)
            {
                // Look for an existing or requested session ID.
                HttpSession session=httpServletRequest.getSession(false);
                String session_id=(session==null)
                    ?httpServletRequest.getRequestedSessionId()
                    :session.getId();

                // Look for that session in new context to access it.
                if (session_id!=null)
                {
                    _xSession=_servletHandler.getHttpSession(session_id);
                    if (_xSession!=null)
                        ((SessionManager.Session)_xSession).access(); 
                }
            }
        }

        /* ------------------------------------------------------------ */
        boolean crossContext()
        {
            return _xContext;
        }
        
        /* ------------------------------------------------------------ */
        void setPaths(String cp,String sp, String pi)
        {
            _contextPath = (cp.length()==1 && cp.charAt(0)=='/')?"":cp;
            _servletPath=sp;
            _pathInfo=pi;
        }

        /* ------------------------------------------------------------ */
        void setQuery(String q)
        {
            this._query=q;
        }
        
        /* ------------------------------------------------------------ */
        int getFilterType()
        {
            return _filterType;
        }

        /* ------------------------------------------------------------ */
        String getPathInContext()
        {
            if (_pathInContext!=null)
                return _pathInContext;
            else
                return URI.addPaths(getServletPath(),getPathInfo());
        }
        
        /* ------------------------------------------------------------ */
        public String getRequestURI()
        {
            if (_filterType==Dispatcher.__INCLUDE || isNamed())
                return super.getRequestURI();
            return URI.addPaths(_contextPath,_uriInContext);
        }
        
        /* ------------------------------------------------------------ */
        public StringBuffer getRequestURL()
        {
            if (_filterType==Dispatcher.__INCLUDE || isNamed())
                return super.getRequestURL();
            StringBuffer buf = getRootURL();
            if (_contextPath.length()>0)
                buf.append(_contextPath);
            buf.append(_uriInContext);
            return buf;
        }

        
        /* ------------------------------------------------------------ */
        public String getPathTranslated()
        {
            String info=getPathInfo();
            if (info==null)
                return null;
            return getRealPath(info);
        }
        
        /* ------------------------------------------------------------ */
        StringBuffer getRootURL()
        {
            StringBuffer buf = super.getRequestURL();
            int d=3;
            for (int i=0;i<buf.length();i++)
            {
                if (buf.charAt(i)=='/' && --d==0)
                {
                    buf.setLength(i);
                    break;
                }
            }
            return buf;
        }
        
        /* ------------------------------------------------------------ */
        public String getContextPath()
        {
            return(_filterType==Dispatcher.__INCLUDE||isNamed())?super.getContextPath():_contextPath;
        }
        
        /* ------------------------------------------------------------ */
        public String getServletPath()
        {
            return(_filterType==Dispatcher.__INCLUDE||isNamed())?super.getServletPath():_servletPath;
        }
        
        /* ------------------------------------------------------------ */
        public String getPathInfo()
        {
            return(_filterType==Dispatcher.__INCLUDE||isNamed())?super.getPathInfo():_pathInfo;
        }
        
        /* ------------------------------------------------------------ */
        public String getQueryString()
        {
            if (this._query==null)
                return super.getQueryString();
            return this._query;
        }

        /* ------------------------------------------------------------ */
        void setParameters(MultiMap parameters)
        {
            _parameters=parameters;
        }
        
        /* -------------------------------------------------------------- */
        public Enumeration getParameterNames()
        {
            if (_parameters==null)
                return super.getParameterNames();

            return Collections.enumeration(_parameters.keySet());
        }
        
        /* -------------------------------------------------------------- */
        public String getParameter(String name)
        {
            if (_parameters==null)
                return super.getParameter(name);
            return (String)_parameters.getValue(name,0);
        }
        
        /* -------------------------------------------------------------- */
        public String[] getParameterValues(String name)
        {
            if (_parameters==null)
                return super.getParameterValues(name);
            List l =_parameters.getValues(name);
            if (l==null)
                return null;
            return (String[])l.toArray(new String[l.size()]);
        }
        
        /* -------------------------------------------------------------- */
        public Map getParameterMap()
        {       
            if (_parameters==null)
                return super.getParameterMap();
            
            return _parameters.toStringArrayMap();
        }

        /* ------------------------------------------------------------ */
        public void setAttribute(String name, Object value)
        {
            if (__managedAttributes.containsKey(name))
            {
                if (_attributes==null)
                    _attributes=new HashMap(3);
                _attributes.put(name,value);
            }
            else
                super.setAttribute(name,value);
        }
        
        /* ------------------------------------------------------------ */
        public Object getAttribute(String name)
        {
            if (_attributes!=null && _attributes.containsKey(name))
                return _attributes.get(name);
                
            if (_filterType==Dispatcher.__INCLUDE && !isNamed())
            {
                if (name.equals(__INCLUDE_PATH_INFO))    return _pathInfo;
                if (name.equals(__INCLUDE_REQUEST_URI))  return URI.addPaths(_contextPath,_uriInContext);
                if (name.equals(__INCLUDE_SERVLET_PATH)) return _servletPath;
                if (name.equals(__INCLUDE_CONTEXT_PATH)) return _contextPath;
                if (name.equals(__INCLUDE_QUERY_STRING)) return Dispatcher.this._query;
            }
            else
            {
                if (name.equals(__INCLUDE_PATH_INFO))    return null;
                if (name.equals(__INCLUDE_REQUEST_URI))  return null;
                if (name.equals(__INCLUDE_SERVLET_PATH)) return null;
                if (name.equals(__INCLUDE_CONTEXT_PATH)) return null;
                if (name.equals(__INCLUDE_QUERY_STRING)) return null;
            }

            if (_filterType!=Dispatcher.__INCLUDE && !isNamed())
            {
                if (name.equals(__FORWARD_PATH_INFO))
                    return _servletHttpRequest.getPathInfo();
                if (name.equals(__FORWARD_REQUEST_URI))
                    return _servletHttpRequest.getRequestURI();
                if (name.equals(__FORWARD_SERVLET_PATH))
                    return _servletHttpRequest.getServletPath();
                if (name.equals(__FORWARD_CONTEXT_PATH))
                    return _servletHttpRequest.getContextPath();
                if (name.equals(__FORWARD_QUERY_STRING))
                    return _servletHttpRequest.getQueryString();
            }
            
            return super.getAttribute(name);
        }
        
        /* ------------------------------------------------------------ */
        public Enumeration getAttributeNames()
        {
            HashSet set=new HashSet();
            Enumeration e=super.getAttributeNames();
            while (e.hasMoreElements())
                set.add(e.nextElement());
            
            if (_filterType==Dispatcher.__INCLUDE && !isNamed())
            {
                if (_pathInfo!=null)
                    set.add(__INCLUDE_PATH_INFO);
                else
                    set.remove(__INCLUDE_PATH_INFO);
                set.add(__INCLUDE_REQUEST_URI);
                set.add(__INCLUDE_SERVLET_PATH);
                set.add(__INCLUDE_CONTEXT_PATH);
                if (Dispatcher.this._query!=null)
                    set.add(__INCLUDE_QUERY_STRING);
                else
                    set.remove(__INCLUDE_QUERY_STRING);
                    
            }
            else
            {
                set.remove(__INCLUDE_PATH_INFO);
                set.remove(__INCLUDE_REQUEST_URI);
                set.remove(__INCLUDE_SERVLET_PATH);
                set.remove(__INCLUDE_CONTEXT_PATH);
                set.remove(__INCLUDE_QUERY_STRING);
            }

            if (_filterType!=Dispatcher.__INCLUDE && !isNamed())
            {
                if (_servletHttpRequest.getPathInfo()!=null)
                    set.add(__FORWARD_PATH_INFO);
                else
                    set.remove(__FORWARD_PATH_INFO);
                    
                set.add(__FORWARD_REQUEST_URI);
                set.add(__FORWARD_SERVLET_PATH);
                set.add(__FORWARD_CONTEXT_PATH);
                if (_servletHttpRequest.getQueryString()!=null)
                    set.add(__FORWARD_QUERY_STRING);
                else
                    set.remove(__FORWARD_QUERY_STRING);
            }
            
            if (_attributes!=null)
                set.addAll(_attributes.keySet());
            
            return Collections.enumeration(set);
        }
        
        /* ------------------------------------------------------------ */
        /**
         *  If the request attribute "org.openqa.jetty.jetty.servlet.Dispatcher.shared_session" is set, then 
         * sessions are shared in cross context dispatch.  Watch out for class loading issues!
         */
        public HttpSession getSession(boolean create)
        {
            if (_xContext)
            {
                if (_xSession==null)
                {	    
                    if (getAttribute("org.openqa.jetty.jetty.servlet.Dispatcher.shared_session") != null)
                        _xSession= super.getSession(create);
                    else
                    {
                        log.debug("Ctx dispatch session");
                        
                        String rsid=getRequestedSessionId();
                        if (rsid==null)
                        {
                            HttpSession session=super.getSession(false);
                            if (session!=null)
                                rsid=session.getId();
                        }
                        _xSession=_servletHandler.getHttpSession(rsid);
                        if (create && _xSession==null)
                        {
                            _xSession=_servletHandler.newHttpSession(this);
                            Cookie cookie = _servletHandler.getSessionManager().getSessionCookie(_xSession, isSecure());
                            if (cookie!=null)
                                _servletHttpRequest.getHttpRequest().getHttpResponse().addSetCookie(cookie);
                        }
                    }
                    
                }
                return _xSession;
            }
            else
                return super.getSession(create);
        }

        /* ------------------------------------------------------------ */
        public boolean isRequestedSessionIdValid()
        {
            if (_xContext)
            {
                String requestedSessionid = super.getRequestedSessionId();
                if (requestedSessionid != null)
                {
                    HttpSession session = getSession(false);
                    if (session != null)
                    {
                        return ((AbstractSessionManager.Session)session).isValid() && requestedSessionid.equals(session.getId());
                    }
            }
            return false;
            }
            else
            {
                return super.isRequestedSessionIdValid();
            }
        }

        /* ------------------------------------------------------------ */
        public HttpSession getSession()
        {
            return getSession(true);
        }
        
        /* ------------------------------------------------------------ */
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
                String relTo=URI.addPaths(getServletPath(),getPathInfo());
                int slash=relTo.lastIndexOf("/");
                if (slash>1)
                    relTo=relTo.substring(0,slash+1);
                else
                    relTo="/";
                url=URI.addPaths(relTo,url);
            }
            
            return _servletHandler.getServletContext().getRequestDispatcher(url);
        }
        
        public String getMethod()
        {
            if (this._filterType==Dispatcher.__ERROR)
                return org.openqa.jetty.http.HttpRequest.__GET;
            return super.getMethod();
        }
    }
    
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    class DispatcherResponse extends HttpServletResponseWrapper
    {
        DispatcherRequest _request;
        private ServletOutputStream _out=null;
        private PrintWriter _writer=null;
        private boolean _flushNeeded=false;
        private boolean _include;
        
        /* ------------------------------------------------------------ */
        DispatcherResponse(DispatcherRequest request, HttpServletResponse response)
        {
            super(response);
            _request=request;
            request._response=this;
            _include=_request._filterType==Dispatcher.__INCLUDE;
            
        }

        /* ------------------------------------------------------------ */
        public ServletOutputStream getOutputStream()
            throws IOException
        {
            if (_writer!=null)
                throw new IllegalStateException("getWriter called");

            if (_out==null)
            {
                try {_out=super.getOutputStream();}
                catch(IllegalStateException e)
                {
                    LogSupport.ignore(log,e);
                    _flushNeeded=true;
                    _out=new ServletOut(new WriterOutputStream(super.getWriter()));
                }
            }

            if (_include)
                _out=new DontCloseServletOut(_out);
            
            return _out;
        }  
      
        /* ------------------------------------------------------------ */
        public PrintWriter getWriter()
            throws IOException
        {
            if (_out!=null)
                throw new IllegalStateException("getOutputStream called");

            if (_writer==null)
            {                
                try{_writer=super.getWriter();}
                catch(IllegalStateException e)
                {
                    LogSupport.ignore(log, e);
                    _flushNeeded=true;
                    _writer = new ServletWriter(super.getOutputStream(),
                                                getCharacterEncoding());
                }
            }

            if (_include)
                _writer=new DontCloseWriter(_writer);
            return _writer;
        }

        /* ------------------------------------------------------------ */
        boolean isFlushNeeded()
        {
            return _flushNeeded;
        }
        
        /* ------------------------------------------------------------ */
        public void flushBuffer()
            throws IOException
        {
            if (_writer!=null)
                _writer.flush();
            if (_out!=null)
                _out.flush();
            super.flushBuffer();
        }
        
        /* ------------------------------------------------------------ */
        public void close()
            throws IOException
        {
            if (_writer!=null)
                _writer.close();
            if (_out!=null)
                _out.close();
        }
        
        /* ------------------------------------------------------------ */
        public void setLocale(Locale locale)
        {
            if (!_include) super.setLocale(locale);
        }
        
        /* ------------------------------------------------------------ */
        public void sendError(int status, String message)
            throws IOException
        {
            if (_request._filterType!=Dispatcher.__ERROR && !_include)
                super.sendError(status,message);
        }
        
        /* ------------------------------------------------------------ */
        public void sendError(int status)
            throws IOException
        {
            if (_request._filterType!=Dispatcher.__ERROR && !_include)
                super.sendError(status);
        }
        
        /* ------------------------------------------------------------ */
        public void sendRedirect(String url)
            throws IOException
        {
            if (!_include)
            {
                if (!url.startsWith("http:/")&&!url.startsWith("https:/"))
                {
                    StringBuffer buf = _request.getRootURL();
                    
                    if (url.startsWith("/"))
                        buf.append(URI.canonicalPath(url));
                    else
                        buf.append(URI.canonicalPath(URI.addPaths(URI.parentPath(_request.getRequestURI()),url)));
                    url=buf.toString();
                }
                
                super.sendRedirect(url);
            }
        }
        
        /* ------------------------------------------------------------ */
        public void setDateHeader(String name, long value)
        {
            if (!_include) super.setDateHeader(name,value);
        }
        
        /* ------------------------------------------------------------ */
        public void setHeader(String name, String value)
        {
            if (!_include) super.setHeader(name,value);
        }
        
        /* ------------------------------------------------------------ */
        public void setIntHeader(String name, int value)
        {
            if (!_include) super.setIntHeader(name,value);
        }
        
        /* ------------------------------------------------------------ */
        public void addHeader(String name, String value)
        {
            if (!_include) super.addHeader(name,value);
        }
        
        /* ------------------------------------------------------------ */
        public void addDateHeader(String name, long value)
        {
            if (!_include) super.addDateHeader(name,value);
        }
        
        /* ------------------------------------------------------------ */
        public void addIntHeader(String name, int value)
        {
            if (!_include) super.addIntHeader(name,value);
        }
        
        /* ------------------------------------------------------------ */
        public void setStatus(int status)
        {
            if (_request._filterType!=Dispatcher.__ERROR && !_include)
                super.setStatus(status);
        }
        
        /* ------------------------------------------------------------ */
        /**
        * The default behavior of this method is to call setStatus(int sc, String sm)
        * on the wrapped response object.
        * 
        * @deprecated As of version 2.1 of the Servlet spec.
        * To set a status code 
        * use <code>setStatus(int)</code>, to send an error with a description
        * use <code>sendError(int, String)</code>.
        * 
        * @param status the status code
        * @param message the status message
        */
        public void setStatus(int status, String message)
        {
            if (_request._filterType!=Dispatcher.__ERROR && !_include)
                super.setStatus(status,message);
        }
        
        /* ------------------------------------------------------------ */
        public void setContentLength(int len)
        {
            if (!_include) super.setContentLength(len);
        }
        
        /* ------------------------------------------------------------ */
        public void setContentType(String contentType)
        {
            if (!_include) super.setContentType(contentType);
        }

        /* ------------------------------------------------------------ */
        public void addCookie(Cookie cookie)
        {
            if (!_include) super.addCookie(cookie);
        }
    }


    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class DontCloseWriter extends PrintWriter
    {
        DontCloseWriter(PrintWriter writer)
        {
            super(writer);
        }

        public void close()
        {}
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class DontCloseServletOut extends ServletOut
    {
        DontCloseServletOut(ServletOutputStream output)
        {
            super(output);
        }

        public void close()
            throws IOException
        {}
    }
};
