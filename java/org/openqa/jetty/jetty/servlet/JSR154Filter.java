// ========================================================================
// $Id: JSR154Filter.java,v 1.5 2005/12/04 19:47:18 janb Exp $
// Copyright 2003-2004 Mort Bay Consulting Pty. Ltd.
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

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletRequestAttributeEvent;
import javax.servlet.ServletRequestAttributeListener;
import javax.servlet.ServletRequestEvent;
import javax.servlet.ServletRequestListener;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import org.openqa.jetty.util.LazyList;

/* ------------------------------------------------------------ */
/** JSR 154 Stupidness filter.
 * This filter contains the elements of the JSR154 servlet 2.4 specification
 * that are too objectionable to include in the core of Jetty.  Thus they have
 * been added as a filter that can be removed from the defaultweb.xml file if
 * none of the following "features" are required:<ul>
 * <li>RequestAttributeListeners. If you actually have a real use for these, please
 * tell the jetty lists what they are and why you can't use a normal filter/wrapper for
 * this?</li>
 * <li>SRV.6.2.2 Dispatachers where the container cannot wrap the request or
 * response. See http://jetty.mortbay.org/jetty/doc/servlet24.html#d0e711
 * to find out why this is stupid.</li>
 * </ul>
 * 
 * The boolean init parameter "unwrappedDispatched"
 * 
 */
public class JSR154Filter implements Filter
{
    private static ThreadLocal __states=new ThreadLocal();
    private ServletContext _servletContext;
    private Object _requestListeners;
    private Object _requestAttributeListeners;
    private boolean _unwrappedDispatchSupported;
    
    /* ------------------------------------------------------------ */
    public void init(FilterConfig filterConfig)
        throws ServletException
    {
        _servletContext=filterConfig.getServletContext();
        _unwrappedDispatchSupported=Boolean.valueOf(filterConfig.getInitParameter("unwrappedDispatch")).booleanValue();
    }

    /* ------------------------------------------------------------ */
    protected void setRequestAttributeListeners(Object list)
    {
        _requestAttributeListeners=list;
    }
    
    /* ------------------------------------------------------------ */
    protected void setRequestListeners(Object list)
    {
        _requestListeners=list;
    }

    /* ------------------------------------------------------------ */
    public boolean isUnwrappedDispatchSupported()
    {
        return _unwrappedDispatchSupported;
    }

    /* ------------------------------------------------------------ */
    /**
     * @param supportUnwrappedDispatch The supportUnwrappedDispatch to set.
     */
    public void setUnwrappedDispatchSupported(boolean supportUnwrappedDispatch)
    {
        _unwrappedDispatchSupported = supportUnwrappedDispatch;
    }
    
    /* ------------------------------------------------------------ */
    public void setDispatch(Dispatcher.DispatcherRequest request, Dispatcher.DispatcherResponse response)
    {
        ThreadState state=state();
        state.dispatchRequest=request;
        state.dispatchResponse=response;
    }

    /* ------------------------------------------------------------ */
    public Dispatcher.DispatcherRequest getDispatchRequest()
    {
        ThreadState state=state();
        return state.dispatchRequest;
    }
    
    /* ------------------------------------------------------------ */
    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain chain)
	throws IOException, ServletException
    {
        HttpServletRequest  srequest  = (HttpServletRequest)request;
        HttpServletResponse sresponse = (HttpServletResponse)response;
        Request requestWrapper=null;
        Response responseWrapper=null;
        boolean root_filter=false;
        

        // Do we need a root wrapper?
        ThreadState state = state();
        if (_unwrappedDispatchSupported || LazyList.size(_requestAttributeListeners)>0 )
        {
            if (srequest instanceof ServletHttpRequest)
            {
                request=state.rootRequest=requestWrapper=new Request(srequest);
                response=state.rootResponse=responseWrapper=new Response(sresponse);
                root_filter=true;
            }
            else
            {
                requestWrapper=state.rootRequest;
                responseWrapper=state.rootResponse;
            }
        }
        
        // Is this the first time this request has been in this _context?
        boolean first_in_context=root_filter ||
        	requestWrapper!=null && 
        	requestWrapper.getRequest()!=null && requestWrapper.getRequest() instanceof Dispatcher.DispatcherRequest &&
        	((Dispatcher.DispatcherRequest)requestWrapper.getRequest()).crossContext();
        
        if (first_in_context)
        {
            requestInitialized(request);
            
            if (requestWrapper!=null && LazyList.size(_requestAttributeListeners)>0)
                requestWrapper.addContextFilter(this);
        }
        
        // setup dispatch
        boolean dispatch=false;
        if (_unwrappedDispatchSupported && state.dispatchRequest!=null)
        {
            dispatch=true;
            requestWrapper.pushWrapper(state.dispatchRequest);
            responseWrapper.pushWrapper(state.dispatchResponse);
            state.dispatchRequest=null;
            state.dispatchResponse=null;
        }
        
        try
        {
            chain.doFilter(request, response);   
        }
        finally
        {
            if (first_in_context)
            {
                requestDestroyed(request);
                if (requestWrapper!=null && LazyList.size(_requestAttributeListeners)>0)
                    requestWrapper.delContextFilter(this);
            }
            
            if (root_filter)
                state.clear();
            
            if (dispatch)
            {
                requestWrapper.popWrapper();
                responseWrapper.popWrapper();
            }
        }
    }

    /* ------------------------------------------------------------ */
    public void destroy()
    {
    }
    
    /* ------------------------------------------------------------ */
    private void requestInitialized(ServletRequest request)
    {
        ServletRequestEvent event = new ServletRequestEvent(_servletContext,request);
        for (int i=0;i<LazyList.size(_requestListeners);i++)
            ((ServletRequestListener)LazyList.get(_requestListeners,i))
                        .requestInitialized(event);
    }
    
    /* ------------------------------------------------------------ */
    private void requestDestroyed(ServletRequest request)
    {
        ServletRequestEvent event = new ServletRequestEvent(_servletContext,request);
        for (int i=LazyList.size(_requestListeners);i-->0;)
            ((ServletRequestListener)LazyList.get(_requestListeners,i))
                        .requestDestroyed(event);
    }
    
    /* ------------------------------------------------------------ */
    private void attributeNotify(ServletRequest request,String name,Object oldValue,Object newValue)
    {
        ServletRequestAttributeEvent event =
            new ServletRequestAttributeEvent(_servletContext,request,name,oldValue==null?newValue:oldValue);
        for (int i=0;i<LazyList.size(_requestAttributeListeners);i++)
        {
            ServletRequestAttributeListener listener = 
                ((ServletRequestAttributeListener)LazyList.get(_requestAttributeListeners,i));
            if (oldValue==null)
                listener.attributeAdded(event);
            else if (newValue==null)
                listener.attributeRemoved(event);
            else
                listener.attributeReplaced(event);
        }
    }

    /* ------------------------------------------------------------ */
    private static ThreadState state()
    {
        ThreadState state=(ThreadState)__states.get();
        if (state==null)
        {
            state=new ThreadState();
            __states.set(state);
        }
        return state;
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private static class ThreadState
    {
        Request rootRequest;
        Response rootResponse;
        Dispatcher.DispatcherRequest dispatchRequest; 
        Dispatcher.DispatcherResponse dispatchResponse;
        
        void clear()
        {
            rootRequest=null;
            rootResponse=null;
            dispatchRequest=null;
            dispatchResponse=null;
        }
    }
    
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private static class Request extends HttpServletRequestWrapper
    {
        Object contextFilters;
        
        /* ------------------------------------------------------------ */
        Request(HttpServletRequest httpServletRequest)
        {
            super(httpServletRequest);
        }
        

        /* ------------------------------------------------------------ */
        /**
         * @param filter
         */
        public void delContextFilter(JSR154Filter filter)
        {
            contextFilters=LazyList.remove(contextFilters,filter);
        }


        /* ------------------------------------------------------------ */
        /**
         * @param filter
         */
        public void addContextFilter(JSR154Filter filter)
        {
            contextFilters=LazyList.add(contextFilters,filter);
        }

        /* ------------------------------------------------------------ */
        public void setAttribute(String name, Object value)
        {
            Object old=getAttribute(name);
            super.setAttribute(name,value);
            for (int i=LazyList.size(contextFilters);i-->0;)
                ((JSR154Filter)LazyList.get(contextFilters, i)).attributeNotify(this,name,old,value);
        }
        
        /* ------------------------------------------------------------ */
        public void removeAttribute(String name)
        {   
            Object old=getAttribute(name);
            super.removeAttribute(name);
            for (int i=LazyList.size(contextFilters);i-->0;)
                ((JSR154Filter)LazyList.get(contextFilters, i)).attributeNotify(this,name,old,null);
        }

        /* ------------------------------------------------------------ */
        public void pushWrapper(HttpServletRequestWrapper wrapper)
        {
            wrapper.setRequest(getRequest());
            setRequest(wrapper);
        }
        
        /* ------------------------------------------------------------ */
        public void popWrapper()
        {
            HttpServletRequestWrapper wrapper=(HttpServletRequestWrapper)getRequest();
            HttpServletRequest request=(HttpServletRequest)wrapper.getRequest();
            setRequest(request);
        }
    }
    
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private static class Response extends HttpServletResponseWrapper
    {
        /* ------------------------------------------------------------ */
        Response(HttpServletResponse httpServletResponse)
        {
            super(httpServletResponse);
        }
        
        /* ------------------------------------------------------------ */
        public void pushWrapper(HttpServletResponseWrapper wrapper)
        {
            wrapper.setResponse(getResponse());
            setResponse(wrapper);
        }
        
        /* ------------------------------------------------------------ */
        public void popWrapper()
        {
            HttpServletResponseWrapper wrapper=(HttpServletResponseWrapper)getResponse();
            HttpServletResponse response=(HttpServletResponse)wrapper.getResponse();
            setResponse(response);
        }
    }

}

