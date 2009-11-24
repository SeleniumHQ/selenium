// ========================================================================
// $Id: TestThreadedServer.java,v 1.8 2005/03/08 12:14:35 gregwilkins Exp $
// Copyright 2002-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.util;

import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.net.Socket;
import java.util.HashSet;

import junit.framework.TestSuite;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class TestThreadedServer extends junit.framework.TestCase
{
    static Log log = LogFactory.getLog(TestThreadedServer.class);

    TestServer server;
        
    public TestThreadedServer(String name)
    {
        super(name);
    }

    /* ------------------------------------------------------------ */
    public static void main(String[] args)
    {
        junit.textui.TestRunner.run(suite());
    }
    
    /* ------------------------------------------------------------ */
    public static junit.framework.Test suite()
    {
        return new TestSuite(TestThreadedServer.class);
    }

    /* ------------------------------------------------------------ */
    protected void setUp()
        throws Exception
    {
        server=new TestServer();
        server.start();
        log.info("ThreadedServer test started");
        Thread.sleep(500);
    }

    
    /* ------------------------------------------------------------ */
    protected void tearDown()
        throws Exception
    {
        server.stop();
    }
    

    /* ------------------------------------------------------------ */
    public void testThreadedServer()
        throws Exception
    {
        assertTrue("isStarted",server.isStarted());
        assertEquals("Minimum Threads",0,server._connections);
        assertEquals("Minimum Threads",0,server._jobs);
        assertEquals("Minimum Threads",2,server.getThreads());

        
        PrintWriter p1 = server.stream();
        Thread.sleep(250);
        assertEquals("New connection",1,server._connections);
        assertEquals("New connection",1,server._jobs);
        assertEquals("New connection",2,server.getThreads());
            

        PrintWriter p2 = server.stream();
        System.err.print(".");System.err.flush();
        Thread.sleep(250);
        assertEquals("New thread",2,server._connections);
        assertEquals("New thread",2,server._jobs);
        assertEquals("New thread",2,server.getThreads());
        Thread.sleep(250);
        assertEquals("Steady State",2,server._connections);
        assertEquals("Steady State",2,server._jobs);
        assertEquals("Steady State",2,server.getThreads());
        
        p1.print("Exit\015");
        p1.flush();
        Thread.sleep(250);
        assertEquals("exit job",2,server._connections);
        assertEquals("exit job",1,server._jobs);
        assertEquals("exit job",2,server.getThreads());

        p1 = server.stream();
        Thread.sleep(350);
        assertEquals("reuse thread",3,server._connections);
        assertEquals("reuse thread",2,server._jobs);

        // TODO - this needs to be reworked without timeouts!
    }
    
    /* ------------------------------------------------------------ */
    static class TestServer extends ThreadedServer
    {
        int _jobs=0;
        int _connections=0;
        HashSet _sockets=new HashSet();
        
        /* -------------------------------------------------------- */
        TestServer()
            throws Exception
        {
            super(new InetAddrPort(8765));
            setMinThreads(2);
            setMaxThreads(4);
            setMaxIdleTimeMs(5000);
        }
        
        /* -------------------------------------------------------- */
        protected void handleConnection(InputStream in,OutputStream out)
        {
            try
            {
                synchronized(this.getClass())
                {
                    if(log.isDebugEnabled())log.debug("Connection "+in);
                    _jobs++;
                    _connections++;
                }
                
                String line=null;
                LineInput lin= new LineInput(in);
                while((line=lin.readLine())!=null)
                {
                    if(log.isDebugEnabled())log.debug("Line "+line);		    
                    if ("Exit".equals(line))
                    {
                        return;
                    }
                }
            }
            catch(Error e)
            {
                LogSupport.ignore(log,e);
            }
            catch(Exception e)
            {
                LogSupport.ignore(log,e);
            }
            finally
            {    
                synchronized(this.getClass())
                {
                    _jobs--;
                    if(log.isDebugEnabled())log.debug("Disconnect: "+in);
                }
            }
        }

        /* -------------------------------------------------------- */
        PrintWriter stream()
            throws Exception
        {
            InetAddrPort addr = new InetAddrPort();
            addr.setInetAddress(InetAddress.getByName("127.0.0.1"));
            addr.setPort(8765);
            Socket s = new Socket(addr.getInetAddress(),addr.getPort());
            _sockets.add(s);
            if(log.isDebugEnabled())log.debug("Socket "+s);
            return new PrintWriter(new OutputStreamWriter(s.getOutputStream()));
        }    
    }
    
    
}
