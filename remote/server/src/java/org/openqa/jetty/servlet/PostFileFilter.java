//========================================================================
//$Id: PostFileFilter.java,v 1.1 2005/10/05 11:54:37 gregwilkins Exp $
//Copyright 2004 Mort Bay Consulting Pty. Ltd.
//------------------------------------------------------------------------
//Licensed under the Apache License, Version 2.0 (the "License");
//you may not use this file except in compliance with the License.
//You may obtain a copy of the License at 
//http://www.apache.org/licenses/LICENSE-2.0
//Unless required by applicable law or agreed to in writing, software
//distributed under the License is distributed on an "AS IS" BASIS,
//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.
//========================================================================

package org.openqa.jetty.servlet;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/* ------------------------------------------------------------ */
/** PostFileFilter.
 * 
 * Filter to accept file content from a POST request.
 * The translated path is used as the file name to store the content from POST requests.
 * 
 * Configuration init parameters:<ul>
 *   <li>bufferSize - The size of the buffer used to copy content
 *   <li>response - The response after the file is received:<ul>
 *       <li>ok - an empty response with an OK status
 *       <li>nocontent - an empty response with a NO_CONTENT status (the default)
 *       <li>chain - pass the request down the filter chain for normal response. 
 *       <li>redirect - redirect for a GET request to the same URI
 *     </ul>
 * </ul>
 * 
 * @author gregw@mortbay.com
 *
 */
public class PostFileFilter implements Filter
{
    ServletContext _context;
    int _bufferSize=8092;
    String _response="nocontent";
    
    public void init(FilterConfig filterConfig) 
        throws ServletException
    {
        _context=filterConfig.getServletContext();
        String tmp=filterConfig.getInitParameter("bufferSize");
        if (tmp!=null)
            _bufferSize=Integer.parseInt(tmp);
        tmp=filterConfig.getInitParameter("response");
        if (tmp!=null)
            _response=tmp;
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
        throws IOException, ServletException
    {
        HttpServletRequest srequest = (HttpServletRequest)request;
        HttpServletResponse sresponse = (HttpServletResponse)response;
        
        if ("POST".equalsIgnoreCase(srequest.getMethod()))
        {
            String filename = srequest.getPathTranslated();
            if (filename==null)
            {
                if (srequest.getPathInfo()==null)
                    filename=_context.getRealPath(srequest.getServletPath());
                else
                    filename=_context.getRealPath(srequest.getServletPath()+srequest.getPathInfo());
            }
            if (filename==null)
            {
                sresponse.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            
            if (srequest.getContentLength()==0)
            {
                sresponse.sendError(HttpServletResponse.SC_LENGTH_REQUIRED);
                return;
            }
            
            File file = new File(filename);
            
            if (file.exists() && (!file.canWrite() ||
                                  file.isDirectory()) || 
               !file.exists() && ( !file.getParentFile().exists() ||
                                   !file.getParentFile().isDirectory() || 
                                   !file.getParentFile().canWrite()))
            {
                sresponse.sendError(HttpServletResponse.SC_FORBIDDEN, "No write permission");
                return;
            }
            
            InputStream in = srequest.getInputStream();
            FileOutputStream out = new FileOutputStream(file,false);
            byte[] buf = new byte[_bufferSize];
            while (true)
            {
                int len=in.read(buf);
                if (len<0)
                    break;
                out.write(buf,0,len);
            }
            out.close();
            
            if ("redirect".equalsIgnoreCase(_response))
                sresponse.sendRedirect(srequest.getRequestURI()); 
            else if ("chain".equalsIgnoreCase(_response))
                chain.doFilter(request, response);
            else if ("ok".equalsIgnoreCase(_response))
                sresponse.setStatus(HttpServletResponse.SC_OK);  
            else
                sresponse.setStatus(HttpServletResponse.SC_NO_CONTENT);
        }
        else
            chain.doFilter(request, response);
       
    }

    public void destroy()
    {}

}
