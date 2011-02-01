// ========================================================================
// $Id: WelcomeFilter.java,v 1.3 2004/05/09 20:32:41 gregwilkins Exp $
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

package org.openqa.jetty.servlet;
import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

/* ------------------------------------------------------------ */
public  class WelcomeFilter implements Filter
{
    private String welcome;
    
    public void init(FilterConfig filterConfig)
    {
        welcome=filterConfig.getInitParameter("welcome");
    }

    /* ------------------------------------------------------------ */
    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain chain)
	throws IOException, ServletException
    {
        String path=((HttpServletRequest)request).getServletPath();
        if (welcome!=null && path.endsWith("/"))
            request.getRequestDispatcher(path+welcome).forward(request,response);
        else
            chain.doFilter(request, response);
    }

    public void destroy() {}
}

