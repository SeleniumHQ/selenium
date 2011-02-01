// ===========================================================================
// Copyright (c) 1996 Mort Bay Consulting Pty. Ltd. All rights reserved.
// $Id: Debug.java,v 1.10 2005/08/13 00:01:28 gregwilkins Exp $
// ---------------------------------------------------------------------------

package org.openqa.jetty.servlet;
import java.io.IOException;
import java.io.Writer;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.html.Block;
import org.openqa.jetty.html.Break;
import org.openqa.jetty.html.Font;
import org.openqa.jetty.html.Page;
import org.openqa.jetty.html.TableForm;
import org.openqa.jetty.log.LogImpl;
import org.openqa.jetty.log.LogSink;
import org.openqa.jetty.log.OutputStreamLogSink;


/* ------------------------------------------------------------ */
// Don't  write servlets like this one :-)
public class Debug extends HttpServlet
{    
    /* ------------------------------------------------------------ */
    public void doGet(HttpServletRequest request,
                      HttpServletResponse response) 
        throws ServletException, IOException
    {
        Page page= new Page();
        page.title(getServletInfo());
        page.attribute("text","#000000");
        page.attribute(Page.BGCOLOR,"#FFFFFF");
        page.attribute("link","#606CC0");
        page.attribute("vlink","#606CC0");
        page.attribute("alink","#606CC0");


        Log l = LogFactory.getLog(Debug.class);
        
        if (!(l instanceof LogImpl))
            return;
        LogImpl log = (LogImpl) l;
        
        
        TableForm tf = new TableForm(request.getRequestURI());
        page.add(tf);
        tf.table().newRow().addCell(new Block(Block.Bold)
            .add(new Font(3,true).add(getServletInfo()))).cell().attribute("COLSPAN","2");
        tf.table().add(Break.rule);
        
        tf.addCheckbox("D","Debug On",log.getDebug());
        tf.addTextField("V","Verbosity Level",6,""+log.getVerbose());
        tf.addTextField("P","Debug Patterns",40,log.getDebugPatterns());
        tf.addCheckbox("W","Suppress Warnings",log.getSuppressWarnings());

        
        LogSink[] sinks = log.getLogSinks();
        for (int s=0;sinks!=null && s<sinks.length;s++)
        {
            if (sinks[s]==null)
                continue;

            tf.table().newRow().addCell(Break.rule).cell().attribute("COLSPAN","2");
            tf.table().newRow().addCell("<B><font size=\"+1\">Log Sink "+s+":</font></B").right();
            tf.table().addCell(sinks[s].getClass().getName()).left();

            tf.addCheckbox("LSS"+s,"Started",sinks[s].isStarted());
            
            if (sinks[s] instanceof OutputStreamLogSink)
            {
                OutputStreamLogSink sink=(OutputStreamLogSink)sinks[s];
                
                tf.addCheckbox("LT"+s,"Tag",sink.isLogTags());
                tf.addCheckbox("LL"+s,"Label",sink.isLogLabels());
                tf.addCheckbox("Ls"+s,"Stack Size",sink.isLogStackSize());
                tf.addCheckbox("LS"+s,"Stack Trace",sink.isLogStackTrace());
                tf.addCheckbox("SS"+s,"Suppress Stacks",sink.isSuppressStack());
                tf.addCheckbox("SL"+s,"Single Line",sink.isLogOneLine());
                tf.addTextField("LF"+s,"Log File Name",40,sink.getFilename());
            }
        }
        
        tf.table().newRow().addCell(Break.rule).cell().attribute("COLSPAN","2");
        
        tf.addTextField("LSC","Add LogSink Class",40,"org.openqa.jetty.log.OutputStreamLogSink");
        
        tf.addButtonArea();
        tf.addButton("Action","Set Options");
        tf.addButton("Action","Add LogSink");
        tf.addButton("Action","Delete Stopped Sinks");
        tf.table().newRow().addCell(Break.rule).cell().attribute("COLSPAN","2");
        
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

        Log l = LogFactory.getLog(Debug.class);
        
        if (!(l instanceof LogImpl))
            return;
        LogImpl log = (LogImpl) l;
        String action=request.getParameter("Action");
        
        if ("Set Options".equals(action))
        {
            log.setDebug("on".equals(request.getParameter("D")));
            log.setSuppressWarnings("on".equals(request.getParameter("W")));
            String v=request.getParameter("V");
            if (v!=null && v.length()>0)
                log.setVerbose(Integer.parseInt(v));
            else
                log.setVerbose(0);
            log.setDebugPatterns(request.getParameter("P"));


            LogSink[] sinks = log.getLogSinks();
            for (int s=0;sinks!=null && s<sinks.length;s++)
            {
                if (sinks[s]==null)
                    continue;
                
                if ("on".equals(request.getParameter("LSS"+s)))
                {
                    if(!sinks[s].isStarted())
                        try{sinks[s].start();}catch(Exception e){log.warn(e);}
                }
                else
                {
                    if(sinks[s].isStarted())
                        try{sinks[s].stop();}catch(InterruptedException e){}
                }

                String options=request.getParameter("LO"+s);
                if (options==null)
                    options="";
                
                if (sinks[s] instanceof OutputStreamLogSink)
                {
                    OutputStreamLogSink sink=(OutputStreamLogSink)sinks[s];
                    
                    sink.setLogTags("on".equals(request.getParameter("LT"+s)));
                    sink.setLogLabels ("on".equals(request.getParameter("LL"+s)));
                    sink.setLogStackSize("on".equals(request.getParameter("Ls"+s)));
                    sink.setLogStackTrace("on".equals(request.getParameter("LS"+s)));
                    sink.setSuppressStack("on".equals(request.getParameter("SS"+s)));
                    sink.setLogOneLine("on".equals(request.getParameter("SL"+s)));

                    sink.setFilename(request.getParameter("LF"+s));
                }
                
            }
        }
        else if ("Add LogSink".equals(action))
        {
            System.err.println("add log sink "+request.getParameter("LSC"));
            try
            {
                log.add(request.getParameter("LSC"));
            }
            catch(Exception e)
            {
                log.warn(e);
            }
        }
        else if ("Delete Stopped Sinks".equals(action))
        {
            log.deleteStoppedLogSinks();
        }
        
        response.sendRedirect(request.getContextPath()+
                              request.getServletPath()+"/"+
                              Long.toString(System.currentTimeMillis(),36)+
                              (target!=null?("#"+target):""));
    }
    
    /* ------------------------------------------------------------ */
    public String getServletInfo()
    {
        return "Debug And  Log Options";
    }
}
