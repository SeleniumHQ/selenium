// ========================================================================
// $Id: Invoker.java,v 1.15 2005/08/13 00:01:27 gregwilkins Exp $
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
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.URI;

/* ------------------------------------------------------------ */
/**  Dynamic Servlet Invoker.  
 * This servlet invokes anonymous servlets that have not been defined   
 * in the web.xml or by other means. The first element of the pathInfo  
 * of a request passed to the envoker is treated as a servlet name for  
 * an existing servlet, or as a class name of a new servlet.            
 * This servlet is normally mapped to /servlet/*                        
 * This servlet support the following initParams:                       
 * <PRE>                                                                     
 *  nonContextServlets       If false, the invoker can only load        
 *                           servlets from the contexts classloader.    
 *                           This is false by default and setting this  
 *                           to true may have security implications.    
 *                                                                      
 *  verbose                  If true, log dynamic loads                 
 *                                                                      
 *  *                        All other parameters are copied to the     
 *                           each dynamic servlet as init parameters    
 * </PRE>
 * @version $Id: Invoker.java,v 1.15 2005/08/13 00:01:27 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class Invoker extends HttpServlet
{
    private static Log log = LogFactory.getLog(Invoker.class);

    private ServletHandler _servletHandler;
    private Map.Entry _invokerEntry;
    private Map _parameters;
    private boolean _nonContextServlets;
    private boolean _verbose;
        
    /* ------------------------------------------------------------ */
    public void init()
    {
        ServletContext config=getServletContext();
        _servletHandler=((ServletHandler.Context)config).getServletHandler();

        Enumeration e = getInitParameterNames();
        while(e.hasMoreElements())
        {
            String param=(String)e.nextElement();
            String value=getInitParameter(param);
            String lvalue=value.toLowerCase();
            if ("nonContextServlets".equals(param))
            {
                _nonContextServlets=value.length()>0 && lvalue.startsWith("t");
            }
            if ("verbose".equals(param))
            {
                _verbose=value.length()>0 && lvalue.startsWith("t");
            }
            else
            {
                if (_parameters==null)
                    _parameters=new HashMap();
                _parameters.put(param,value);
            }
        }
    }
    
    /* ------------------------------------------------------------ */
    protected void service(HttpServletRequest request, HttpServletResponse response)
	throws ServletException, IOException
    {
        // Get the requested path and info
        boolean included=false;
        String servlet_path=(String)request.getAttribute(Dispatcher.__INCLUDE_SERVLET_PATH);
        if (servlet_path==null)
            servlet_path=request.getServletPath();
        else
            included=true;
        String path_info = (String)request.getAttribute(Dispatcher.__INCLUDE_PATH_INFO);
        if (path_info==null)
            path_info=request.getPathInfo();
        
        // Get the servlet class
        String servlet = path_info;
        if (servlet==null || servlet.length()<=1 )
        {
            response.sendError(404);
            return;
        }
        
        int i0=servlet.charAt(0)=='/'?1:0;
        int i1=servlet.indexOf('/',i0);
        servlet=i1<0?servlet.substring(i0):servlet.substring(i0,i1);

        // look for a named holder
        ServletHolder holder=_servletHandler.getServletHolder(servlet);
        if (holder!=null)
        {
            // Add named servlet mapping
            _servletHandler.addServletHolder(holder);
            _servletHandler.mapPathToServlet(URI.addPaths(servlet_path,servlet)+"/*", holder.getName());
        }
        else
        {
            // look for a class mapping
            if (servlet.endsWith(".class"))
                servlet=servlet.substring(0,servlet.length()-6);
            if (servlet==null || servlet.length()==0)
            {
                response.sendError(404);
                return;
            }   
        
            synchronized(_servletHandler)
            {
                // find the entry for the invoker
                if (_invokerEntry==null)
                    _invokerEntry=_servletHandler.getHolderEntry(servlet_path);
            
                // Check for existing mapping (avoid threaded race).
                String path=URI.addPaths(servlet_path,servlet);
                Map.Entry entry = _servletHandler.getHolderEntry(path);

                if (entry!=null && entry!=_invokerEntry)
                {
                    // Use the holder
                    holder=(ServletHolder)entry.getValue();       
                }
                else
                {
                    // Make a holder
                    holder=new ServletHolder(_servletHandler,servlet,servlet);
                    
                    if (_parameters!=null)
                        holder.putAll(_parameters);
                    
                    try {holder.start();}
                    catch (Exception e)
                    {
                        log.debug(LogSupport.EXCEPTION,e);
                        throw new UnavailableException(e.toString());
                    }
                    
                    // Check it is from an allowable classloader
                    if (!_nonContextServlets)
                    {
                        Object s=holder.getServlet();
                        
                        if (_servletHandler.getClassLoader()!=
                            s.getClass().getClassLoader())
                        {
                            holder.stop();
                            log.warn("Dynamic servlet "+s+
                                         " not loaded from context "+
                                         request.getContextPath());
                            throw new UnavailableException("Not in context");
                        }
                    }

                    // Add the holder for all the possible paths
                    if (_verbose)
                        log("Dynamic load '"+servlet+"' at "+path);
                    _servletHandler.addServletHolder(holder);
                    _servletHandler.mapPathToServlet(path+"/*",holder.getName());
                    _servletHandler.mapPathToServlet(path+".class/*",holder.getName());
                }
            }
            
        }
        
        if (holder!=null)
            holder.handle(new Request(request,included,servlet,servlet_path,path_info),
                          response);
        else
            response.sendError(404);
        
    }

    /* ------------------------------------------------------------ */
    class Request extends HttpServletRequestWrapper
    {
        String _servletPath;
        String _pathInfo;
        boolean _included;
        
        /* ------------------------------------------------------------ */
        Request(HttpServletRequest request,
                boolean included,
                String name,
                String servletPath,
                String pathInfo)
        {
            super(request);
            _included=included;
            _servletPath=URI.addPaths(servletPath,name);
            _pathInfo=pathInfo.substring(name.length()+1);
            if (_pathInfo.length()==0)
                _pathInfo=null;
        }
        
        /* ------------------------------------------------------------ */
        public String getServletPath()
        {
            if (_included)
                return super.getServletPath();
            return _servletPath;
        }
        
        /* ------------------------------------------------------------ */
        public String getPathInfo()
        {
            if (_included)
                return super.getPathInfo();
            return _pathInfo;
        }
        
        /* ------------------------------------------------------------ */
        public Object getAttribute(String name)
        {
            if (_included)
            {
                if (name.equals(Dispatcher.__INCLUDE_REQUEST_URI))
                    return URI.addPaths(URI.addPaths(getContextPath(),_servletPath),_pathInfo);
                if (name.equals(Dispatcher.__INCLUDE_PATH_INFO))
                    return _pathInfo;
                if (name.equals(Dispatcher.__INCLUDE_SERVLET_PATH))
                    return _servletPath;
            }
            return super.getAttribute(name);
        }
    }
}
