// ========================================================================
// $Id: WebApplicationHandler.java,v 1.62 2006/01/04 13:55:31 gregwilkins Exp $
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

import java.io.IOException;
import java.util.ArrayList;
import java.util.EventListener;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletContextAttributeEvent;
import javax.servlet.ServletContextAttributeListener;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletRequestAttributeListener;
import javax.servlet.ServletRequestListener;
import javax.servlet.ServletResponse;
import javax.servlet.UnavailableException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSessionActivationListener;
import javax.servlet.http.HttpSessionAttributeListener;
import javax.servlet.http.HttpSessionBindingListener;
import javax.servlet.http.HttpSessionListener;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.http.PathMap;
import org.openqa.jetty.util.LazyList;
import org.openqa.jetty.util.MultiException;
import org.openqa.jetty.util.MultiMap;
import org.openqa.jetty.util.StringUtil;
import org.openqa.jetty.util.TypeUtil;

/* --------------------------------------------------------------------- */
/** WebApp HttpHandler.
 * This handler extends the ServletHandler with security, filter and resource
 * capabilities to provide full J2EE web container support.
 * <p>
 * @since Jetty 4.1
 * @see org.openqa.jetty.jetty.servlet.WebApplicationContext
 * @version $Id: WebApplicationHandler.java,v 1.62 2006/01/04 13:55:31 gregwilkins Exp $
 * @author Greg Wilkins
 */
public class WebApplicationHandler extends ServletHandler
{
    private static Log log= LogFactory.getLog(WebApplicationHandler.class);

    private Map _filterMap= new HashMap();
    private List _pathFilters= new ArrayList();
    private List _filters= new ArrayList();
    private MultiMap _servletFilterMap= new MultiMap();
    private boolean _acceptRanges= true;
    private boolean _filterChainsCached=true;

    private transient WebApplicationContext _webApplicationContext;

    protected transient Object _requestListeners;
    protected transient Object _requestAttributeListeners;
    protected transient Object _sessionListeners;
    protected transient Object _contextAttributeListeners;
    protected transient FilterHolder jsr154FilterHolder;
    protected transient JSR154Filter jsr154Filter;
    protected transient HashMap _chainCache[];
    protected transient HashMap _namedChainCache[];

    /* ------------------------------------------------------------ */
    public boolean isAcceptRanges()
    {
        return _acceptRanges;
    }

    /* ------------------------------------------------------------ */
    /** Set if the handler accepts range requests.
     * Default is false;
     * @param ar True if the handler should accept ranges
     */
    public void setAcceptRanges(boolean ar)
    {
        _acceptRanges= ar;
    }

    /* ------------------------------------------------------------ */
    /**
     * @return Returns the jsr154Filter.
     */
    public JSR154Filter getJsr154Filter()
    {
        return jsr154Filter;
    }
    
    /* ------------------------------------------------------------ */
    public FilterHolder defineFilter(String name, String className)
    {
        FilterHolder holder= newFilterHolder(name,className);
        addFilterHolder(holder);
        return holder;
    }
    
    /* ------------------------------------------------------------ */
    protected FilterHolder newFilterHolder(String name, String className)
    {
        return new FilterHolder(this, name, className);
    }

    /* ------------------------------------------------------------ */
    public void addFilterHolder(FilterHolder holder) 
    {
        _filterMap.put(holder.getName(), holder);
        _filters.add(holder);
        addComponent(holder);
    }

    /* ------------------------------------------------------------ */
    public FilterHolder getFilter(String name)
    {
        return (FilterHolder)_filterMap.get(name);
    }

    /* ------------------------------------------------------------ */
    /** Add a mapping from a pathSpec to a Filter.
     * @param pathSpec The path specification
     * @param filterName The name of the filter (must already be added or defined)
     * @param dispatches An integer formed by the logical OR of FilterHolder.__REQUEST,
     *  FilterHolder.__FORWARD,FilterHolder.__INCLUDE and/or FilterHolder.__ERROR.
     * @return The holder of the filter instance.
     */
    public FilterHolder addFilterPathMapping(String pathSpec, String filterName, int dispatches)
    {
        FilterHolder holder = (FilterHolder)_filterMap.get(filterName);
        if (holder==null)
            throw new IllegalArgumentException("unknown filter: "+filterName);
        
        FilterMapping mapping = new FilterMapping(pathSpec,holder,dispatches);
        _pathFilters.add(mapping);
        return holder;
    }


    /* ------------------------------------------------------------ */
    /**
     * Add a servlet filter mapping
     * @param servletName The name of the servlet to be filtered.
     * @param filterName The name of the filter.
     * @param dispatches An integer formed by the logical OR of FilterHolder.__REQUEST,
     *  FilterHolder.__FORWARD,FilterHolder.__INCLUDE and/or FilterHolder.__ERROR.
     * @return The holder of the filter instance.
     */
    public FilterHolder addFilterServletMapping(String servletName, String filterName, int dispatches)
    {
        FilterHolder holder= (FilterHolder)_filterMap.get(filterName);
        if (holder == null)
            throw new IllegalArgumentException("Unknown filter :" + filterName);
        _servletFilterMap.add(servletName, new FilterMapping(null,holder,dispatches));
        return holder;
    }

    /* ------------------------------------------------------------ */
    public List getFilters()
    {
        return _filters;
    }


    /* ------------------------------------------------------------ */
    public synchronized void addEventListener(EventListener listener)
        throws IllegalArgumentException
    {
        if ((listener instanceof HttpSessionActivationListener)
            || (listener instanceof HttpSessionAttributeListener)
            || (listener instanceof HttpSessionBindingListener)
            || (listener instanceof HttpSessionListener))
        {
            if (_sessionManager != null)
                _sessionManager.addEventListener(listener);
            _sessionListeners= LazyList.add(_sessionListeners, listener);
        }

        if (listener instanceof ServletRequestListener)
        {
            _requestListeners= LazyList.add(_requestListeners, listener);
        }

        if (listener instanceof ServletRequestAttributeListener)
        {
             _requestAttributeListeners= LazyList.add(_requestAttributeListeners, listener);
        }

        if (listener instanceof ServletContextAttributeListener)
        {            
            _contextAttributeListeners= LazyList.add(_contextAttributeListeners, listener);
        }
        
        super.addEventListener(listener);
    }

    /* ------------------------------------------------------------ */
    public synchronized void removeEventListener(EventListener listener)
    {
        if (_sessionManager != null)
            _sessionManager.removeEventListener(listener);

        _sessionListeners= LazyList.remove(_sessionListeners, listener);
        _requestListeners= LazyList.remove(_requestListeners, listener);
        _requestAttributeListeners= LazyList.remove(_requestAttributeListeners, listener);
        _contextAttributeListeners= LazyList.remove(_contextAttributeListeners, listener);
        super.removeEventListener(listener);
    }

    /* ------------------------------------------------------------ */
    public void setSessionManager(SessionManager sm)
    {
        if (isStarted())
            throw new IllegalStateException("Started");

        SessionManager old= getSessionManager();

        if (getHttpContext() != null)
        {
            // recover config and remove listeners from old session manager
            if (old != null && old != sm)
            {
                if (_sessionListeners != null)
                {
                    for (Iterator i= LazyList.iterator(_sessionListeners); i.hasNext();)
                    {
                        EventListener listener= (EventListener)i.next();
                        _sessionManager.removeEventListener(listener);
                    }
                }
            }

            // Set listeners and config on new listener.
            if (sm != null && old != sm)
            {
                if (_sessionListeners != null)
                {
                    for (Iterator i= LazyList.iterator(_sessionListeners); i.hasNext();)
                    {
                        EventListener listener= (EventListener)i.next();
                        sm.addEventListener(listener);
                    }
                }
            }
        }

        super.setSessionManager(sm);
    }

    /* ----------------------------------------------------------------- */
    protected synchronized void doStart() throws Exception
    {
        // Start Servlet RestishHandler
        super.doStart();
        if (log.isDebugEnabled())
            log.debug("Path Filters: " + _pathFilters);
        if (log.isDebugEnabled())
            log.debug("Servlet Filters: " + _servletFilterMap);
        
        if (getHttpContext() instanceof WebApplicationContext)
            _webApplicationContext= (WebApplicationContext)getHttpContext();
        
        if (_filterChainsCached)
        {
            _chainCache = getChainCache();
            _namedChainCache = getChainCache();
        }
    }

    /* ----------------------------------------------------------------- */
    private HashMap[] getChainCache() {
         HashMap[] _chainCache=new HashMap[Dispatcher.__ERROR+1];
        _chainCache[Dispatcher.__REQUEST]=new HashMap();
        _chainCache[Dispatcher.__FORWARD]=new HashMap();
        _chainCache[Dispatcher.__INCLUDE]=new HashMap();
        _chainCache[Dispatcher.__ERROR]=new HashMap();
        return _chainCache;
    }

    /* ------------------------------------------------------------ */
    public void initializeServlets() throws Exception
    {
        // initialize Filters
        MultiException mex= new MultiException();
        Iterator iter= _filters.iterator();
        while (iter.hasNext())
        {
            FilterHolder holder= (FilterHolder)iter.next();
            try
            {
                holder.start();
            }
            catch (Exception e)
            {
                mex.add(e);
            }
        }

        // initialize Servlets
        try
        {
            super.initializeServlets();
        }
        catch (Exception e)
        {
            mex.add(e);
        }

        jsr154FilterHolder=getFilter("jsr154");
        if (jsr154FilterHolder!=null)
            jsr154Filter= (JSR154Filter)jsr154FilterHolder.getFilter();
        log.debug("jsr154filter="+jsr154Filter);
        
        if (LazyList.size(_requestAttributeListeners) > 0 || LazyList.size(_requestListeners) > 0)
        {
            
            if (jsr154Filter==null)
                log.warn("Filter jsr154 not defined for RequestAttributeListeners");
            else
            {
                jsr154Filter.setRequestAttributeListeners(_requestAttributeListeners);
                jsr154Filter.setRequestListeners(_requestListeners);
            }
        }

        mex.ifExceptionThrow();
    }

    /* ------------------------------------------------------------ */
    protected synchronized void doStop() throws Exception
    {
        try
        {
            // Stop servlets
            super.doStop();

            // Stop filters
            for (int i= _filters.size(); i-- > 0;)
            {
                FilterHolder holder= (FilterHolder)_filters.get(i);
                holder.stop();
            }
        }
        finally
        {
            _webApplicationContext= null;
            _sessionListeners= null;
            _requestListeners= null;
            _requestAttributeListeners= null;
            _contextAttributeListeners= null;
        }
    }

    /* ------------------------------------------------------------ */
    public String getErrorPage(int status, ServletHttpRequest request)
    {
        String error_page= null;
        Class exClass= (Class)request.getAttribute(ServletHandler.__J_S_ERROR_EXCEPTION_TYPE);

        if (ServletException.class.equals(exClass))
        {
            error_page= _webApplicationContext.getErrorPage(exClass.getName());
            if (error_page == null)
            {
                Throwable th= (Throwable)request.getAttribute(ServletHandler.__J_S_ERROR_EXCEPTION);
                while (th instanceof ServletException)
                    th= ((ServletException)th).getRootCause();
                if (th != null)
                    exClass= th.getClass();
            }
        }

        if (error_page == null && exClass != null)
        {
            while (error_page == null && exClass != null && _webApplicationContext != null)
            {
                error_page= _webApplicationContext.getErrorPage(exClass.getName());
                exClass= exClass.getSuperclass();
            }

            if (error_page == null)
            {}
        }

        if (error_page == null && _webApplicationContext != null)
            error_page= _webApplicationContext.getErrorPage(TypeUtil.toString(status));

        return error_page;
    }

    /* ------------------------------------------------------------ */
    protected void dispatch(String pathInContext,
                            HttpServletRequest request,
                            HttpServletResponse response,
                            ServletHolder servletHolder, 
                            int type)
        throws ServletException, UnavailableException, IOException
    {
        if (type == Dispatcher.__REQUEST)
        {
            // This is NOT a dispatched request (it it is an initial request)
            ServletHttpRequest servletHttpRequest= (ServletHttpRequest)request;
            ServletHttpResponse servletHttpResponse= (ServletHttpResponse)response;  
            
            // protect web-inf and meta-inf
            if (StringUtil.startsWithIgnoreCase(pathInContext, "/web-inf") || StringUtil.startsWithIgnoreCase(pathInContext, "/meta-inf"))
            {
                response.sendError(HttpResponse.__404_Not_Found);
                return;
            }
            
            // Security Check
            if (!getHttpContext().checkSecurityConstraints(
                            pathInContext,
                            servletHttpRequest.getHttpRequest(),
                            servletHttpResponse.getHttpResponse()))
                return;
        }
        else
        {
            // This is a dispatched request.
            
            // Handle dispatch to j_security_check
            HttpContext context= getHttpContext();
            if (context != null
                    && context instanceof ServletHttpContext
                    && pathInContext != null
                    && pathInContext.endsWith(FormAuthenticator.__J_SECURITY_CHECK))
            {
                ServletHttpRequest servletHttpRequest=
                    (ServletHttpRequest)context.getHttpConnection().getRequest().getWrapper();
                ServletHttpResponse servletHttpResponse= servletHttpRequest.getServletHttpResponse();
                ServletHttpContext servletContext= (ServletHttpContext)context;
                
                if (!servletContext.jSecurityCheck(pathInContext,servletHttpRequest.getHttpRequest(),servletHttpResponse.getHttpResponse()))
                    return;
            }
        }
        
        // Build and/or cache filter chain
        FilterChain chain=null;
        if (pathInContext != null) {
            chain = getChainForPath(type, pathInContext, servletHolder);
        } else {
            chain = getChainForName(type, servletHolder);
        }

        if (log.isDebugEnabled()) log.debug("chain="+chain);
        
        // Do the handling thang
        if (chain!=null)
            chain.doFilter(request, response);
        else if (servletHolder != null)
            servletHolder.handle(request, response);    
        else // Not found
            notFound(request, response);
    }

    /* ------------------------------------------------------------ */
    private FilterChain getChainForName(int requestType, ServletHolder servletHolder) {
        if (servletHolder == null) {
            throw new IllegalStateException("Named dispatch must be to an explicitly named servlet");
        }
        
        if (_filterChainsCached)
        {
            synchronized(this)
            {
                if (_namedChainCache[requestType].containsKey(servletHolder.getName()))
                    return (FilterChain)_namedChainCache[requestType].get(servletHolder.getName());
            }
        }
        
        // Build list of filters
        Object filters= null;
        
        if (jsr154Filter!=null)
        {
            // Slight hack for Named servlets
            // TODO query JSR how to apply filter to all dispatches
            filters=LazyList.add(filters,jsr154FilterHolder);
        }
        
        // Servlet filters
        if (_servletFilterMap.size() > 0)
        {
            Object o= _servletFilterMap.get(servletHolder.getName());
            for (int i=0; i<LazyList.size(o);i++)
            {
                FilterMapping mapping = (FilterMapping)LazyList.get(o,i);
                if (mapping.appliesTo(null,requestType))
                    filters=LazyList.add(filters,mapping.getHolder());
            }
        }

        FilterChain chain = null;
        if (_filterChainsCached)
        {
            synchronized(this)
            {
                if (LazyList.size(filters) > 0)
                    chain= new CachedChain(filters, servletHolder);
                _namedChainCache[requestType].put(servletHolder.getName(),chain);
            }
        }
        else if (LazyList.size(filters) > 0)
            chain = new Chain(filters, servletHolder);
        
        return chain;   
    }

    /* ------------------------------------------------------------ */
    private FilterChain getChainForPath(int requestType, String pathInContext, ServletHolder servletHolder) 
    {
        if (_filterChainsCached)
        {
            synchronized(this)
            {
                if(_chainCache[requestType].containsKey(pathInContext))
                    return (FilterChain)_chainCache[requestType].get(pathInContext);
            }
        }
        
        // Build list of filters
        Object filters= null;
    
        // Path filters
        for (int i= 0; i < _pathFilters.size(); i++)
        {
            FilterMapping mapping = (FilterMapping)_pathFilters.get(i);
            if (mapping.appliesTo(pathInContext, requestType))
                filters= LazyList.add(filters, mapping.getHolder());
        }
        
        // Servlet filters
        if (servletHolder != null && _servletFilterMap.size() > 0)
        {
            Object o= _servletFilterMap.get(servletHolder.getName());
            for (int i=0; i<LazyList.size(o);i++)
            {
                FilterMapping mapping = (FilterMapping)LazyList.get(o,i);
                if (mapping.appliesTo(null,requestType))
                    filters=LazyList.add(filters,mapping.getHolder());
            }
        }
        
        FilterChain chain = null;
        if (_filterChainsCached)
        {
            synchronized(this)
            {
                if (LazyList.size(filters) > 0)
                    chain= new CachedChain(filters, servletHolder);
                _chainCache[requestType].put(pathInContext,chain);
            }
        }
        else if (LazyList.size(filters) > 0)
            chain = new Chain(filters, servletHolder);
    
        return chain;
    }


    /* ------------------------------------------------------------ */
    public synchronized void setContextAttribute(String name, Object value)
    {
        Object old= super.getContextAttribute(name);
        super.setContextAttribute(name, value);

        if (_contextAttributeListeners != null)
        {
            ServletContextAttributeEvent event=
                new ServletContextAttributeEvent(getServletContext(), name, old != null ? old : value);
            for (int i= 0; i < LazyList.size(_contextAttributeListeners); i++)
            {
                ServletContextAttributeListener l=
                    (ServletContextAttributeListener)LazyList.get(_contextAttributeListeners, i);
                if (old == null)
                    l.attributeAdded(event);
                else
                    if (value == null)
                        l.attributeRemoved(event);
                    else
                        l.attributeReplaced(event);
            }
        }
    }

    /* ------------------------------------------------------------ */
    public synchronized void removeContextAttribute(String name)
    {
        Object old= super.getContextAttribute(name);
        super.removeContextAttribute(name);

        if (old != null && _contextAttributeListeners != null)
        {
            ServletContextAttributeEvent event= new ServletContextAttributeEvent(getServletContext(), name, old);
            for (int i= 0; i < LazyList.size(_contextAttributeListeners); i++)
            {
                ServletContextAttributeListener l=
                    (ServletContextAttributeListener)LazyList.get(_contextAttributeListeners, i);
                l.attributeRemoved(event);
            }
        }
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @return Returns the filterChainsCached.
     */
    public boolean isFilterChainsCached()
    {
        return _filterChainsCached;
    }
    
    /* ------------------------------------------------------------ */
    /** Cache filter chains.
     * If true, filter chains are cached by the URI path within the
     * context.  Caching should not be used if the webapp encodes
     * information in URLs. 
     * @param filterChainsCached The filterChainsCached to set.
     */
    public void setFilterChainsCached(boolean filterChainsCached)
    {
        _filterChainsCached = filterChainsCached;
    }

    /* ------------------------------------------------------------ */
    /**
     * @see org.openqa.jetty.util.Container#addComponent(java.lang.Object)
     */
    protected void addComponent(Object o)
    {
        if (_filterChainsCached && isStarted())
        { 
            synchronized(this)
            {
                for (int i=0;i<_chainCache.length;i++)
                    if (_chainCache[i]!=null)
                        _chainCache[i].clear();
            }
        }
        super.addComponent(o);
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @see org.openqa.jetty.util.Container#removeComponent(java.lang.Object)
     */
    protected void removeComponent(Object o)
    {
        if (_filterChainsCached && isStarted())
        { 
            synchronized(this)
            {
                for (int i=0;i<_chainCache.length;i++)
                    if (_chainCache[i]!=null)
                        _chainCache[i].clear();
            }
        }
        super.removeComponent(o);
    }

    /* ----------------------------------------------------------------- */
    public void destroy()
    {
        Iterator iter = _filterMap.values().iterator();
        while (iter.hasNext())
        {
            Object sh=iter.next();
            iter.remove();
            removeComponent(sh);
        }
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private static class FilterMapping
    {
        private String _pathSpec;
        private FilterHolder _holder;
        private int _dispatches;

        /* ------------------------------------------------------------ */
        FilterMapping(String pathSpec,FilterHolder holder,int dispatches)
        {
            _pathSpec=pathSpec;
            _holder=holder;
            _dispatches=dispatches;
        }

        /* ------------------------------------------------------------ */
        FilterHolder getHolder()
        {
            return _holder;
        }
        
        /* ------------------------------------------------------------ */
        /** Check if this filter applies to a path.
         * @param path The path to check.
         * @param type The type of request: __REQUEST,__FORWARD,__INCLUDE or __ERROR.
         * @return True if this filter applies
         */
        boolean appliesTo(String path, int type)
        {
           boolean b=((_dispatches&type)!=0 || (_dispatches==0 && type==Dispatcher.__REQUEST)) && (_pathSpec==null || PathMap.match(_pathSpec, path,true));
           return b;
        }
    }
    

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class Chain implements FilterChain
    {
        int _filter= 0;
        Object _filters;
        ServletHolder _servletHolder;

        /* ------------------------------------------------------------ */
        Chain(Object filters, ServletHolder servletHolder)
        {
            _filters= filters;
            _servletHolder= servletHolder;
        }

        /* ------------------------------------------------------------ */
        public void doFilter(ServletRequest request, ServletResponse response)
            throws IOException, ServletException
        {
            if (log.isTraceEnabled())
                log.trace("doFilter " + _filter);

            // pass to next filter
            if (_filter < LazyList.size(_filters))
            {
                FilterHolder holder= (FilterHolder)LazyList.get(_filters, _filter++);
                if (log.isTraceEnabled())
                    log.trace("call filter " + holder);
                Filter filter= holder.getFilter();
                filter.doFilter(request, response, this);
                return;
            }

            // Call servlet
            if (_servletHolder != null)
            {
                if (log.isTraceEnabled())
                    log.trace("call servlet " + _servletHolder);
                _servletHolder.handle(request, response);
            }
            else // Not found
                notFound((HttpServletRequest)request, (HttpServletResponse)response);
        }
        
        public String toString()
        {
            StringBuffer b = new StringBuffer();
            for (int i=0; i<LazyList.size(_filters);i++)
            {
                b.append(LazyList.get(_filters, i).toString());
                b.append("->");
            }
            b.append(_servletHolder);
            return b.toString();
        }
    }
    

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class CachedChain implements FilterChain
    {
        FilterHolder _filterHolder;
        ServletHolder _servletHolder;
        CachedChain _next;

        /* ------------------------------------------------------------ */
        CachedChain(Object filters, ServletHolder servletHolder)
        {
            if (LazyList.size(filters)>0)
            {
                _filterHolder=(FilterHolder)LazyList.get(filters, 0);
                filters=LazyList.remove(filters,0);
                _next=new CachedChain(filters,servletHolder);
            }
            else
                _servletHolder=servletHolder;
        }

        public void doFilter(ServletRequest request, ServletResponse response) 
            throws IOException, ServletException
        {
            // pass to next filter
            if (_filterHolder!=null)
            {
                if (log.isTraceEnabled())
                    log.trace("call filter " + _filterHolder);
                Filter filter= _filterHolder.getFilter();
                filter.doFilter(request, response, _next);
                return;
            }

            // Call servlet
            if (_servletHolder != null)
            {
                if (log.isTraceEnabled())
                    log.trace("call servlet " + _servletHolder);
                _servletHolder.handle(request, response);
            }
            else // Not found
                notFound((HttpServletRequest)request, (HttpServletResponse)response);
        }
        
        public String toString()
        {
            if (_filterHolder!=null)
                return _filterHolder+"->"+_next.toString();
            if (_servletHolder!=null)
                return _servletHolder.toString();
            return "null";
        }
    }
    
    
    public static void main(String[] arg)
    {

        ServletHandler mServletHandler = new ServletHandler();

        ServletHolder servletHolder = mServletHandler.addServlet("/mPath",
           "wicket.protocol.http.WicketServlet");
        servletHolder.getServletContext().setAttribute("webApplication",  "mWebApplication");
        servletHolder.getServletContext().setAttribute ("applicationContext", "mApplicationContext");

        WebApplicationHandler mWebApplicationHandler = new  WebApplicationHandler();

        ServletHolder servletHolder2 = mWebApplicationHandler.addServlet("/mpath",
           "wicket.protocol.http.WicketServlet");
        servletHolder2.getServletContext().setAttribute("webApplication",  "mWebApplication");
        servletHolder2.getServletContext().setAttribute ("applicationContext", "mApplicationContext");

    }
}
