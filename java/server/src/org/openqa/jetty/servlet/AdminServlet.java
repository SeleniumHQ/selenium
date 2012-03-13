// ========================================================================
// $Id: AdminServlet.java,v 1.13 2005/08/13 00:01:28 gregwilkins Exp $
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
import java.io.Writer;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.StringTokenizer;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.openqa.jetty.html.Block;
import org.openqa.jetty.html.Break;
import org.openqa.jetty.html.Composite;
import org.openqa.jetty.html.Element;
import org.openqa.jetty.html.Font;
import org.openqa.jetty.html.Form;
import org.openqa.jetty.html.Heading;
import org.openqa.jetty.html.Input;
import org.openqa.jetty.html.Link;
import org.openqa.jetty.html.List;
import org.openqa.jetty.html.Page;
import org.openqa.jetty.html.Target;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpHandler;
import org.openqa.jetty.http.HttpListener;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.http.HttpServer;
import org.openqa.jetty.http.PathMap;
import org.openqa.jetty.jetty.servlet.ServletHandler;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.LifeCycle;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.URI;
import org.openqa.jetty.util.UrlEncoded;


/* ------------------------------------------------------------ */
/** Jetty Administration Servlet.
 *
 * This is a minimal start to a administration servlet that allows
 * start/stop of server components and control of debug parameters.
 *
 * @version $Id: AdminServlet.java,v 1.13 2005/08/13 00:01:28 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class AdminServlet extends HttpServlet
{
    static Log log = LogFactory.getLog(AdminServlet.class);

    private Collection _servers;
    
    /* ------------------------------------------------------------ */
    public void init(ServletConfig config)
         throws ServletException
    {
        super.init(config);
        _servers =HttpServer.getHttpServers();
    }
    
    /* ------------------------------------------------------------ */
    private String doAction(HttpServletRequest request)
        throws IOException
    {
        String action=request.getParameter("A");
        if ("exit all servers".equalsIgnoreCase(action))
        {
            new Thread(new Runnable() // Thread safety reviewed
                {
                    public void run()
                    {
                        try{Thread.sleep(1000);}
                        catch(Exception e){LogSupport.ignore(log,e);}
                        log.info("Stopping All servers");
                        Iterator s=_servers.iterator();
                        while(s.hasNext())
                        {
                            HttpServer server=(HttpServer)s.next();
                            try{server.stop();}
                            catch(Exception e){LogSupport.ignore(log,e);}
                        }
                        log.info("Exiting JVM");
                        System.exit(1);
                    }
                }).start();
            
            throw new HttpException(HttpResponse.__503_Service_Unavailable);
        }
        
        boolean start="start".equalsIgnoreCase(action);
        String id=request.getParameter("ID");

        StringTokenizer tok=new StringTokenizer(id,":");
        int tokens=tok.countTokens();
        String target=null;
        
        try{
            target=tok.nextToken();
            int t=Integer.parseInt(target);
            Iterator s=_servers.iterator();
            HttpServer server=null;
            while(s.hasNext() && t>=0)
                if (t--==0)
                    server=(HttpServer)s.next();
                else
                    s.next();
            
            if (tokens==1)
            {
                // Server stop/start
                if (start) server.start();
                else server.stop();
            }
            else if (tokens==3)
            {
                // Listener stop/start
                String l=tok.nextToken()+":"+tok.nextToken();

                HttpListener[] listeners=server.getListeners();
                for (int i2=0;i2<listeners.length;i2++)
                {
                    HttpListener listener = listeners[i2];
                    if (listener.toString().indexOf(l)>=0)
                    {
                        if (start) listener.start();
                        else listener.stop();
                    }
                }
            }
            else
            {
                String host=tok.nextToken();
                if ("null".equals(host))
                    host=null;
                
                String contextPath=tok.nextToken();
                target+=":"+host+":"+contextPath;
                if (contextPath.length()>1)
                    contextPath+="/*";
                int contextIndex=Integer.parseInt(tok.nextToken());
                target+=":"+contextIndex;
                HttpContext
                    context=server.getContext(host,contextPath,contextIndex);
                
                if (tokens==4)
                {
                    // Context stop/start
                    if (start) context.start();
                    else context.stop();
                }
                else if (tokens==5)
                {
                    // RestishHandler stop/start
                    int handlerIndex=Integer.parseInt(tok.nextToken());
                    HttpHandler handler=context.getHandlers()[handlerIndex];
                    
                    if (start) handler.start();
                    else handler.stop();
                }
            }
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
        }
        catch(Error e)
        {
            log.warn(LogSupport.EXCEPTION,e);
        }
        
        return target;
    }
    
    /* ------------------------------------------------------------ */
    public void doGet(HttpServletRequest request,
                      HttpServletResponse response) 
        throws ServletException, IOException
    {
        if (request.getQueryString()!=null &&
            request.getQueryString().length()>0)
        {
            String target=doAction(request);
            response.sendRedirect(request.getContextPath()+
                                  request.getServletPath()+
                                  (request.getPathInfo()!=null
                                   ?request.getPathInfo():"")+
                                  (target!=null?("#"+target):""));
            return;
        }
        
        Page page= new Page();
        page.title(getServletInfo());
        page.addHeader("");
        page.attribute("text","#000000");
        page.attribute(Page.BGCOLOR,"#FFFFFF");
        page.attribute("link","#606CC0");
        page.attribute("vlink","#606CC0");
        page.attribute("alink","#606CC0");

        page.add(new Block(Block.Bold).add(new Font(3,true).add(getServletInfo())));
        page.add(Break.rule);
        Form form=new Form(request.getContextPath()+
                           request.getServletPath()+
                           "?A=exit");
        form.method("GET");
        form.add(new Input(Input.Submit,"A","Exit All Servers"));
        page.add(form);
        page.add(Break.rule);
        page.add(new Heading(3,"Components:"));

        List sList=new List(List.Ordered);
        page.add(sList);
        
        String id1;
        int i1=0;
        Iterator s=_servers.iterator();
        while(s.hasNext())
        {
            id1=""+i1++;
            HttpServer server=(HttpServer)s.next();            
            Composite sItem = sList.newItem();
            sItem.add("<B>HttpServer&nbsp;");
            sItem.add(lifeCycle(request,id1,server));
            sItem.add("</B>");
            sItem.add(Break.line);
            sItem.add("<B>Listeners:</B>");
            List lList=new List(List.Unordered);
            sItem.add(lList);

            HttpListener[] listeners=server.getListeners();
            for (int i2=0;i2<listeners.length;i2++)
            {
                HttpListener listener = listeners[i2];
                String id2=id1+":"+listener;
                lList.add(lifeCycle(request,id2,listener));
            }

            Map hostMap = server.getHostMap();
            
            sItem.add("<B>Contexts:</B>");
            List hcList=new List(List.Unordered);
            sItem.add(hcList);
            Iterator i2=hostMap.entrySet().iterator();
            while(i2.hasNext())
            {
                Map.Entry hEntry=(Map.Entry)(i2.next());
                String host=(String)hEntry.getKey();

                PathMap contexts=(PathMap)hEntry.getValue();
                Iterator i3=contexts.entrySet().iterator();
                while(i3.hasNext())
                {
                    Map.Entry cEntry=(Map.Entry)(i3.next());
                    String contextPath=(String)cEntry.getKey();
                    java.util.List contextList=(java.util.List)cEntry.getValue();
                    
                    Composite hcItem = hcList.newItem();
                    if (host!=null)
                        hcItem.add("Host="+host+":");
                    hcItem.add("ContextPath="+contextPath);
                    
                    String id3=id1+":"+host+":"+
                        (contextPath.length()>2
                         ?contextPath.substring(0,contextPath.length()-2)
                         :contextPath);
                    
                    List cList=new List(List.Ordered);
                    hcItem.add(cList);
                    for (int i4=0;i4<contextList.size();i4++)
                    {
                        String id4=id3+":"+i4;
                        Composite cItem = cList.newItem();
                        HttpContext hc=
                            (HttpContext)contextList.get(i4);
                        cItem.add(lifeCycle(request,id4,hc));
                        cItem.add("<BR>ResourceBase="+hc.getResourceBase());
                        cItem.add("<BR>ClassPath="+hc.getClassPath());

                    
                        List hList=new List(List.Ordered);
                        cItem.add(hList);
                        int handlers = hc.getHandlers().length;
                        for(int i5=0;i5<handlers;i5++)
                        {
                            String id5=id4+":"+i5;
                            HttpHandler handler = hc.getHandlers()[i5];
                            Composite hItem=hList.newItem();
                            hItem.add(lifeCycle(request,
                                                id5,
                                                handler,
                                                handler.getName()));
                            if (handler instanceof ServletHandler)
                            {
                                hItem.add("<BR>"+
                                          ((ServletHandler)handler)
                                          .getServletMap());
                            }
                        }
                    }
                }
            }
            sItem.add("<P>");
        }


        response.setContentType("text/html");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Cache-Control", "no-cache,no-store");
        Writer writer=response.getWriter();
        page.write(writer);
        writer.flush();
    }

    /* ------------------------------------------------------------ */
    public void doPost(HttpServletRequest request,
                        HttpServletResponse response) 
        throws ServletException, IOException
    {
        String target=null;
        response.sendRedirect(request.getContextPath()+
                              request.getServletPath()+"/"+
                              Long.toString(System.currentTimeMillis(),36)+
                              (target!=null?("#"+target):""));
    }
    
    /* ------------------------------------------------------------ */
    private Element lifeCycle(HttpServletRequest request,
                              String id,
                              LifeCycle lc)
    {
        return lifeCycle(request,id,lc,lc.toString());
    }
    
    /* ------------------------------------------------------------ */
    private Element lifeCycle(HttpServletRequest request,
                              String id,
                              LifeCycle lc,
                              String name)
    {
        Composite comp=new Composite();
        comp.add(new Target(id));
        Font font = new Font();
        comp.add(font);
        font.color(lc.isStarted()?"green":"red");
        font.add(name);

        String action=lc.isStarted()?"Stop":"Start";
        
        comp.add("&nbsp;[");
        comp.add(new Link(URI.addPaths(request.getContextPath(),request.getServletPath())+
                          "?T="+Long.toString(System.currentTimeMillis(),36)+
                          "&A="+action+
                          "&ID="+UrlEncoded.encodeString(id),
                          action));
        comp.add("]");
        return comp;
    }
    
    
    /* ------------------------------------------------------------ */
    public String getServletInfo()
    {
        return "HTTP Admin";
    }
}










