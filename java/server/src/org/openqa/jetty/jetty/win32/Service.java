// ========================================================================
// $Id: Service.java,v 1.8 2005/08/13 00:01:27 gregwilkins Exp $
// Copyright 1999-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.jetty.win32;
import java.io.File;
import java.io.FileOutputStream;
import java.io.PrintStream;
import java.util.Vector;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpServer;
import org.openqa.jetty.jetty.Server;
import org.openqa.jetty.util.LogSupport;

/* ------------------------------------------------------------ */
/** Run Jetty as a Win32 service.
 *
 * System.out and System.err output can be controlled with java
 * properties:  SERVICE_OUT and SERVICE_ERR.
 * The log file can be controlled with the property SERVICE_LOG_FILE
 * Derived from SCMEventManager.java by Bill Giel/KC Multimedia and Design Group, Inc.,
 * <h4>Example</h4>
 * <pre>
 * jettysvc -c -DSERVICE_OUT="./logs/jettysvc.out" \\
 *             -DSERVICE_ERR="./logs/jettysvc.err" \\
 *             Jetty.xml wrkdir=$JETTY_HOME
 * </pre>
 *
 * @version $Revision: 1.8 $
 * @author Greg Wilkins (gregw)
 */
public class Service 
{
    private static Log log = LogFactory.getLog(Service.class);

    /* ------------------------------------------------------------ */
    static String serviceLogFile=
    System.getProperty("SERVICE_LOG_FILE","logs"+File.separator+"yyyy_mm_dd.service.log");
    
    /* ------------------------------------------------------------ */
    public static final int SERVICE_CONTROL_STOP = 1;
    public static final int SERVICE_CONTROL_PAUSE = 2;
    public static final int SERVICE_CONTROL_CONTINUE = 3;
    public static final int SERVICE_CONTROL_INTERROGATE = 4;
    public static final int SERVICE_CONTROL_SHUTDOWN = 5;
    public static final int SERVICE_CONTROL_PARAMCHANGE = 6;

    /* ------------------------------------------------------------ */
    private static Vector _servers;
    private static Vector _configs;
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     */
    private Service()
    {}
    
    /* ------------------------------------------------------------ */
    public static void dispatchSCMEvent(int eventID)
    {
        switch(eventID)
        {
          case SERVICE_CONTROL_STOP:
          case SERVICE_CONTROL_PAUSE:
              stopAll();
              break;
              
          case SERVICE_CONTROL_CONTINUE :
              startAll();
              break;
              
          case SERVICE_CONTROL_SHUTDOWN:
              destroyAll();
              break;
              
          case SERVICE_CONTROL_PARAMCHANGE:
              stopAll();
              destroyAll();
              createAll();
              startAll();
              break;

          default:
              break;
        }
    }
    
    /* ------------------------------------------------------------ */
    private static void createAll()
    {
        if (_configs!=null)
        {
            synchronized(_configs)
            {
                _servers=new Vector();
                for(int i=0;i<_configs.size();i++)
                {
                    try
                    {
                        Server server = new Server((String)_configs.get(i));
                        _servers.add(server);
                    }
                    catch(Exception e)
                    {
                        log.warn(_configs.get(i)+" configuration problem: ",e);
                    }
                }
            }
        }
    }
    
    
    /* ------------------------------------------------------------ */
    private static void startAll()
    {
        try
        {
            if (_configs!=null)
            {
                synchronized(_configs)
                {
                    for(int i=0;i<_servers.size();i++)
                    {
                        HttpServer server = (HttpServer)_servers.get(i);
                        if (!server.isStarted())
                            server.start();
                    }
                }
            }
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
        }
    }
    
    /* ------------------------------------------------------------ */
    private static void stopAll()
    { 
        if (_configs!=null)
        {
            synchronized(_configs)
            {
                for(int i=0;i<_servers.size();i++)
                {
                    HttpServer server = (HttpServer)_servers.get(i);
                    try{server.stop();}catch(InterruptedException e){}
                }
            }
        }
    }
    
    /* ------------------------------------------------------------ */
    private static void destroyAll()
    {
        stopAll();
        if (_servers!=null)
            _servers.clear();
        _servers=null;
    }

    /* ------------------------------------------------------------ */
    public static void stopAndDestroy(String[] arg)
    {
        if (arg==null || arg.length==0)
        {
            stopAll();
            destroyAll();
        }
        else
        {
            log.warn(LogSupport.NOT_IMPLEMENTED);
        }
    }
    
    /* ------------------------------------------------------------ */
    public static void main(String[] arg)
    {
        String opt;	
        opt = System.getProperty("SERVICE_OUT");
        if (opt != null)
        {
            try
            {
                PrintStream stdout = new PrintStream(new FileOutputStream(opt));
                System.setOut(stdout);
            }
            catch(Exception e){log.warn(LogSupport.EXCEPTION,e);}
        }
		
        opt = System.getProperty("SERVICE_ERR");
        if (opt != null)
        {
            try
            {
                PrintStream stderr = new PrintStream(new FileOutputStream(opt));
                System.setErr(stderr);
            }
            catch(Exception e){log.warn(LogSupport.EXCEPTION,e);}
        }
        
        
        if (arg.length==0)
            arg=new String[] {"etc/jetty.xml"};
        
        try
        {
            _configs=new Vector();
            for (int i=0;i<arg.length;i++)
                _configs.add(arg[i]);
            createAll();
            startAll();
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
        }
    }
}

