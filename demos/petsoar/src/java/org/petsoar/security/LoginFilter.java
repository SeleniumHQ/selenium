/*
 * Copyright (c) 2003-2005, Wiley & Sons, Joe Walnes,Ara Abrahamian,
 * Mike Cannon-Brookes,Patrick A Lightbody
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the distribution.
 *     * Neither the name of the 'Wiley & Sons', 'Java Open Source
 * Programming' nor the names of the authors may be used to endorse or
 * promote products derived from this software without specific prior
 * written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

package org.petsoar.security;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.StringTokenizer;

public class LoginFilter implements Filter {
    public static String LOGIN_KEY = "loggedIn";

    private Set extensions;
    private String loginAction;
    private String loginPage;

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String servletPath = req.getServletPath();
        String extension = servletPath.substring(servletPath.lastIndexOf('.') + 1).toLowerCase();

        if (servletPath.equals(loginAction) || servletPath.equals(loginPage) || extensions.contains(extension)) {
            chain.doFilter(req, res);
        } else if (req.getSession(true).getAttribute(LOGIN_KEY) == null) {
            res.sendRedirect(loginPage);
            return;
        } else {
            chain.doFilter(req, res);
        }
    }

    public void init(FilterConfig filterConfig) throws ServletException {
        loginPage = filterConfig.getInitParameter("loginPage");
        loginAction = filterConfig.getInitParameter("loginAction");

        extensions = new HashSet();

        String ignoreExtensions = filterConfig.getInitParameter("ignoreExtensions");
        StringTokenizer st = new StringTokenizer(ignoreExtensions, ", ");

        while (st.hasMoreTokens()) {
            extensions.add(st.nextToken().toLowerCase());
        }
    }

    public void destroy() {
    }
}
