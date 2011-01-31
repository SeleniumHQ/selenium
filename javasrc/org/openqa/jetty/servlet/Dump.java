// ========================================================================
// $Id: Dump.java,v 1.42 2005/12/21 23:14:38 gregwilkins Exp $
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

package org.openqa.jetty.servlet;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.lang.reflect.Field;
import java.util.Enumeration;
import java.util.Locale;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletRequestWrapper;
import javax.servlet.UnavailableException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.html.Break;
import org.openqa.jetty.html.Font;
import org.openqa.jetty.html.Heading;
import org.openqa.jetty.html.Page;
import org.openqa.jetty.html.Select;
import org.openqa.jetty.html.Table;
import org.openqa.jetty.html.TableForm;
import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.util.Loader;
import org.openqa.jetty.util.LogSupport;

/* ------------------------------------------------------------ */
/** Dump Servlet Request.
 * 
 */
public class Dump extends HttpServlet
{
    private static Log log= LogFactory.getLog(Dump.class);

    /* ------------------------------------------------------------ */
    String pageType;

    /* ------------------------------------------------------------ */
    public void init(ServletConfig config) throws ServletException
    {
    	super.init(config);
    }

    /* ------------------------------------------------------------ */
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        doGet(request, response);
    }

    /* ------------------------------------------------------------ */
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        request.setAttribute("Dump", this);
        request.setCharacterEncoding("ISO_8859_1");
        getServletContext().setAttribute("Dump",this);
        
        String info= request.getPathInfo();
        if (info != null && info.endsWith("Exception"))
        {
            try
            {
                throw (Throwable) (Loader.loadClass(this.getClass(), info.substring(1)).newInstance());
            }
            catch (Throwable th)
            {
                throw new ServletException(th);
            }
        }

        String redirect= request.getParameter("redirect");
        if (redirect != null && redirect.length() > 0)
        {
            response.getOutputStream().println("THIS SHOULD NOT BE SEEN!");
            response.sendRedirect(redirect);
            response.getOutputStream().println("THIS SHOULD NOT BE SEEN!");
            return;
        }

        String error= request.getParameter("error");
        if (error != null && error.length() > 0)
        {
            response.getOutputStream().println("THIS SHOULD NOT BE SEEN!");
            response.sendError(Integer.parseInt(error));
            response.getOutputStream().println("THIS SHOULD NOT BE SEEN!");
            return;
        }

        String length= request.getParameter("length");
        if (length != null && length.length() > 0)
        {
            response.setContentLength(Integer.parseInt(length));
        }

        String buffer= request.getParameter("buffer");
        if (buffer != null && buffer.length() > 0)
            response.setBufferSize(Integer.parseInt(buffer));

        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/html");

        if (info != null && info.indexOf("Locale/") >= 0)
        {
            try
            {
                String locale_name= info.substring(info.indexOf("Locale/") + 7);
                Field f= java.util.Locale.class.getField(locale_name);
                response.setLocale((Locale)f.get(null));
            }
            catch (Exception e)
            {
                LogSupport.ignore(log, e);
                response.setLocale(Locale.getDefault());
            }
        }

        String cn= request.getParameter("cookie");
        String cv=request.getParameter("value");
        String v=request.getParameter("version");
        if (cn!=null && cv!=null)
        {
            Cookie cookie= new Cookie(cn, cv);
            cookie.setComment("Cookie from dump servlet");
            if (v!=null)
            {
                cookie.setMaxAge(300);
                cookie.setPath("/");
                cookie.setVersion(Integer.parseInt(v));
            }
            response.addCookie(cookie);
        }

        String pi= request.getPathInfo();
        if (pi != null && pi.startsWith("/ex"))
        {
            OutputStream out= response.getOutputStream();
            out.write("</H1>This text should be reset</H1>".getBytes());
            if ("/ex0".equals(pi))
                throw new ServletException("test ex0", new Throwable());
            if ("/ex1".equals(pi))
                throw new IOException("test ex1");
            if ("/ex2".equals(pi))
                throw new UnavailableException("test ex2");
            if ("/ex3".equals(pi))
                throw new HttpException(501);
        }

        PrintWriter pout= response.getWriter();
        Page page= null;

        try
        {
            page= new Page();
            page.title("Dump Servlet");

            page.add(new Heading(1, "Dump Servlet"));
            Table table= new Table(0).cellPadding(0).cellSpacing(0);
            page.add(table);
            table.newRow();
            table.addHeading("getMethod:&nbsp;").cell().right();
            table.addCell("" + request.getMethod());
            table.newRow();
            table.addHeading("getContentLength:&nbsp;").cell().right();
            table.addCell(Integer.toString(request.getContentLength()));
            table.newRow();
            table.addHeading("getContentType:&nbsp;").cell().right();
            table.addCell("" + request.getContentType());
            table.newRow();
            table.addHeading("getCharacterEncoding:&nbsp;").cell().right();
            table.addCell("" + request.getCharacterEncoding());
            table.newRow();
            table.addHeading("getRequestURI:&nbsp;").cell().right();
            table.addCell("" + request.getRequestURI());
            table.newRow();
            table.addHeading("getRequestURL:&nbsp;").cell().right();
            table.addCell("" + request.getRequestURL());
            table.newRow();
            table.addHeading("getContextPath:&nbsp;").cell().right();
            table.addCell("" + request.getContextPath());
            table.newRow();
            table.addHeading("getServletPath:&nbsp;").cell().right();
            table.addCell("" + request.getServletPath());
            table.newRow();
            table.addHeading("getPathInfo:&nbsp;").cell().right();
            table.addCell("" + request.getPathInfo());
            table.newRow();
            table.addHeading("getPathTranslated:&nbsp;").cell().right();
            table.addCell("" + request.getPathTranslated());
            table.newRow();
            table.addHeading("getQueryString:&nbsp;").cell().right();
            table.addCell("" + request.getQueryString());

            table.newRow();
            table.addHeading("getProtocol:&nbsp;").cell().right();
            table.addCell("" + request.getProtocol());
            table.newRow();
            table.addHeading("getScheme:&nbsp;").cell().right();
            table.addCell("" + request.getScheme());
            table.newRow();
            table.addHeading("getServerName:&nbsp;").cell().right();
            table.addCell("" + request.getServerName());
            table.newRow();
            table.addHeading("getServerPort:&nbsp;").cell().right();
            table.addCell("" + Integer.toString(request.getServerPort()));
            table.newRow();
            table.addHeading("getLocalName:&nbsp;").cell().right();
            table.addCell("" + request.getLocalName());
            table.newRow();
            table.addHeading("getLocalAddr:&nbsp;").cell().right();
            table.addCell("" + request.getLocalAddr());
            table.newRow();
            table.addHeading("getLocalPort:&nbsp;").cell().right();
            table.addCell("" + Integer.toString(request.getLocalPort()));
            table.newRow();
            table.addHeading("getRemoteUser:&nbsp;").cell().right();
            table.addCell("" + request.getRemoteUser());
            table.newRow();
            table.addHeading("getRemoteAddr:&nbsp;").cell().right();
            table.addCell("" + request.getRemoteAddr());
            table.newRow();
            table.addHeading("getRemoteHost:&nbsp;").cell().right();
            table.addCell("" + request.getRemoteHost());
            table.newRow();
            table.addHeading("getRemotePort:&nbsp;").cell().right();
            table.addCell("" + request.getRemotePort());
            table.newRow();
            table.addHeading("getRequestedSessionId:&nbsp;").cell().right();
            table.addCell("" + request.getRequestedSessionId());
            table.newRow();
            table.addHeading("isSecure():&nbsp;").cell().right();
            table.addCell("" + request.isSecure());

            table.newRow();
            table.addHeading("isUserInRole(admin):&nbsp;").cell().right();
            table.addCell("" + request.isUserInRole("admin"));

            table.newRow();
            table.addHeading("getLocale:&nbsp;").cell().right();
            table.addCell("" + request.getLocale());

            Enumeration locales= request.getLocales();
            while (locales.hasMoreElements())
            {
                table.newRow();
                table.addHeading("getLocales:&nbsp;").cell().right();
                table.addCell(locales.nextElement());
            }

            table.newRow();
            table
                .newHeading()
                .cell()
                .nest(new Font(2, true))
                .add("<BR>Other HTTP Headers")
                .attribute("COLSPAN", "2")
                .left();
            Enumeration h= request.getHeaderNames();
            String name;
            while (h.hasMoreElements())
            {
                name= (String)h.nextElement();

                Enumeration h2= request.getHeaders(name);
                while (h2.hasMoreElements())
                {
                    String hv= (String)h2.nextElement();
                    table.newRow();
                    table.addHeading(name + ":&nbsp;").cell().right();
                    table.addCell(hv);
                }
            }

            table.newRow();
            table
                .newHeading()
                .cell()
                .nest(new Font(2, true))
                .add("<BR>Request Parameters")
                .attribute("COLSPAN", "2")
                .left();
            h= request.getParameterNames();
            while (h.hasMoreElements())
            {
                name= (String)h.nextElement();
                table.newRow();
                table.addHeading(name + ":&nbsp;").cell().right();
                table.addCell(request.getParameter(name));
                String[] values= request.getParameterValues(name);
                if (values == null)
                {
                    table.newRow();
                    table.addHeading(name + " Values:&nbsp;").cell().right();
                    table.addCell("NULL!!!!!!!!!");
                }
                else
                    if (values.length > 1)
                    {
                        for (int i= 0; i < values.length; i++)
                        {
                            table.newRow();
                            table.addHeading(name + "[" + i + "]:&nbsp;").cell().right();
                            table.addCell(values[i]);
                        }
                    }
            }

            table.newRow();
            table
                .newHeading()
                .cell()
                .nest(new Font(2, true))
                .add("<BR>Cookies")
                .attribute("COLSPAN", "2")
                .left();
            Cookie[] cookies = request.getCookies();
            for (int i=0; cookies!=null && i<cookies.length;i++)
            {
                Cookie cookie = cookies[i];

                table.newRow();
                table.addHeading(cookie.getName() + ":&nbsp;").cell().attribute("VALIGN", "TOP").right();
                table.addCell(cookie.getValue());
            }
            
            /* ------------------------------------------------------------ */
            table.newRow();
            table
                .newHeading()
                .cell()
                .nest(new Font(2, true))
                .add("<BR>Request Attributes")
                .attribute("COLSPAN", "2")
                .left();
            Enumeration a= request.getAttributeNames();
            while (a.hasMoreElements())
            {
                name= (String)a.nextElement();
                table.newRow();
                table.addHeading(name + ":&nbsp;").cell().attribute("VALIGN", "TOP").right();
                table.addCell("<pre>" + toString(request.getAttribute(name)) + "</pre>");
            }            

            /* ------------------------------------------------------------ */
            table.newRow();
            table
                .newHeading()
                .cell()
                .nest(new Font(2, true))
                .add("<BR>Servlet InitParameters")
                .attribute("COLSPAN", "2")
                .left();
            a= getInitParameterNames();
            while (a.hasMoreElements())
            {
                name= (String)a.nextElement();
                table.newRow();
                table.addHeading(name + ":&nbsp;").cell().attribute("VALIGN", "TOP").right();
                table.addCell("<pre>" + toString(getInitParameter(name)) + "</pre>");
            }

            table.newRow();
            table
                .newHeading()
                .cell()
                .nest(new Font(2, true))
                .add("<BR>Context InitParameters")
                .attribute("COLSPAN", "2")
                .left();
            a= getServletContext().getInitParameterNames();
            while (a.hasMoreElements())
            {
                name= (String)a.nextElement();
                table.newRow();
                table.addHeading(name + ":&nbsp;").cell().attribute("VALIGN", "TOP").right();
                table.addCell("<pre>" + toString(getServletContext().getInitParameter(name)) + "</pre>");
            }

            table.newRow();
            table
                .newHeading()
                .cell()
                .nest(new Font(2, true))
                .add("<BR>Context Attributes")
                .attribute("COLSPAN", "2")
                .left();
            a= getServletContext().getAttributeNames();
            while (a.hasMoreElements())
            {
                name= (String)a.nextElement();
                table.newRow();
                table.addHeading(name + ":&nbsp;").cell().attribute("VALIGN", "TOP").right();
                table.addCell("<pre>" + toString(getServletContext().getAttribute(name)) + "</pre>");
            }

            if (request.getContentType() != null
                && request.getContentType().startsWith("multipart/form-data")
                && request.getContentLength() < 1000000)
            {
                MultiPartRequest multi= new MultiPartRequest(request);
                String[] parts= multi.getPartNames();

                table.newRow();
                table
                    .newHeading()
                    .cell()
                    .nest(new Font(2, true))
                    .add("<BR>Multi-part content")
                    .attribute("COLSPAN", "2")
                    .left();
                for (int p= 0; p < parts.length; p++)
                {
                    name= parts[p];
                    table.newRow();
                    table.addHeading(name + ":&nbsp;").cell().attribute("VALIGN", "TOP").right();
                    table.addCell("<pre>" + multi.getString(parts[p]) + "</pre>");
                }
            }

            String res= request.getParameter("resource");
            if (res != null && res.length() > 0)
            {
                table.newRow();
                table
                    .newHeading()
                    .cell()
                    .nest(new Font(2, true))
                    .add("<BR>Get Resource: " + res)
                    .attribute("COLSPAN", "2")
                    .left();

                table.newRow();
                table.addHeading("this.getClass():&nbsp;").cell().right();
                table.addCell("" + this.getClass().getResource(res));

                table.newRow();
                table.addHeading("this.getClass().getClassLoader():&nbsp;").cell().right();
                table.addCell("" + this.getClass().getClassLoader().getResource(res));

                table.newRow();
                table.addHeading("Thread.currentThread().getContextClassLoader():&nbsp;").cell().right();
                table.addCell("" + Thread.currentThread().getContextClassLoader().getResource(res));

                table.newRow();
                table.addHeading("getServletContext():&nbsp;").cell().right();
                try{table.addCell("" + getServletContext().getResource(res));}
                catch(Exception e) {table.addCell("" +e);}
            }
            

            /* ------------------------------------------------------------ */
            page.add(Break.para);
            page.add(new Heading(1, "Request Wrappers"));
            ServletRequest rw=request;
            int w=0;
            while (rw !=null)
            {
                page.add((w++)+": "+rw.getClass().getName()+"<br/>");
                if (rw instanceof HttpServletRequestWrapper)
                    rw=((HttpServletRequestWrapper)rw).getRequest();
                else if (rw  instanceof ServletRequestWrapper)
                    rw=((ServletRequestWrapper)rw).getRequest();
                else
                    rw=null;
            }
            
            page.add(Break.para);
            page.add(new Heading(1, "International Characters"));
            page.add("Directly encoced:  Dürst<br/>");
            page.add("HTML reference: D&uuml;rst<br/>");
            page.add("Decimal (252) 8859-1: D&#252;rst<br/>");
            page.add("Hex (xFC) 8859-1: D&#xFC;rst<br/>");
            page.add(
                "Javascript unicode (00FC) : <script language='javascript'>document.write(\"D\u00FCrst\");</script><br/>");
            page.add(Break.para);
            page.add(new Heading(1, "Form to generate GET content"));
            TableForm tf= new TableForm(response.encodeURL(getURI(request)));
            tf.method("GET");
            tf.addTextField("TextField", "TextField", 20, "value");
            tf.addButton("Action", "Submit");
            page.add(tf);

            page.add(Break.para);
            page.add(new Heading(1, "Form to generate POST content"));
            tf= new TableForm(response.encodeURL(getURI(request)));
            tf.method("POST");
            tf.addTextField("TextField", "TextField", 20, "value");
            Select select= tf.addSelect("Select", "Select", true, 3);
            select.add("ValueA");
            select.add("ValueB1,ValueB2");
            select.add("ValueC");
            tf.addButton("Action", "Submit");
            page.add(tf);

            page.add(new Heading(1, "Form to upload content"));
            tf= new TableForm(response.encodeURL(getURI(request)));
            tf.method("POST");
            tf.attribute("enctype", "multipart/form-data");
            tf.addFileField("file", "file");
            tf.addButton("Upload", "Upload");
            page.add(tf);

            page.add(new Heading(1, "Form to get Resource"));
            tf= new TableForm(response.encodeURL(getURI(request)));
            tf.method("POST");
            tf.addTextField("resource", "resource", 20, "");
            tf.addButton("Action", "getResource");
            page.add(tf);

        }
        catch (Exception e)
        {
            log.warn(LogSupport.EXCEPTION, e);
        }

        page.write(pout);

        String data= request.getParameter("data");
        if (data != null && data.length() > 0)
        {
            int d= Integer.parseInt(data);
            while (d > 0)
            {
                pout.println("1234567890123456789012345678901234567890123456789\n");
                d= d - 50;

            }
        }

        pout.close();

        if (pi != null)
        {
            if ("/ex4".equals(pi))
                throw new ServletException("test ex4", new Throwable());
            if ("/ex5".equals(pi))
                throw new IOException("test ex5");
            if ("/ex6".equals(pi))
                throw new UnavailableException("test ex6");
            if ("/ex7".equals(pi))
                throw new HttpException(501);
        }

        request.getInputStream().close();

    }

    /* ------------------------------------------------------------ */
    public String getServletInfo()
    {
        return "Dump Servlet";
    }

    /* ------------------------------------------------------------ */
    public synchronized void destroy()
    {
        log.debug("Destroyed");
    }

    /* ------------------------------------------------------------ */
    private String getURI(HttpServletRequest request)
    {
        String uri= (String)request.getAttribute("javax.servlet.forward.request_uri");
        if (uri == null)
            uri= request.getRequestURI();
        return uri;
    }

    /* ------------------------------------------------------------ */
    private static String toString(Object o)
    {
        if (o == null)
            return null;

        if (o.getClass().isArray())
        {
            StringBuffer sb= new StringBuffer();
            Object[] array= (Object[])o;
            for (int i= 0; i < array.length; i++)
            {
                if (i > 0)
                    sb.append("\n");
                sb.append(array.getClass().getComponentType().getName());
                sb.append("[");
                sb.append(i);
                sb.append("]=");
                sb.append(toString(array[i]));
            }
            return sb.toString();
        }
        else
            return o.toString();
    }

}
