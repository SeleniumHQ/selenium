// ========================================================================
// $Id: TestServer.java,v 1.5 2005/08/13 08:12:14 gregwilkins Exp $
// Copyright 1997-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.jetty;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

import junit.framework.TestSuite;

public class TestServer extends junit.framework.TestCase
{
    File home;
    
    public TestServer(String name)
        throws IOException
    {
        super(name);

        File test=new File("./test");
        if (!test.exists())
            test=new File("../test");
        home= new File(new File(test.getParent()).getCanonicalPath());
        System.setProperty("jetty.home",home.toString());
        System.err.println("jetty.home="+home);
    }

    /* ------------------------------------------------------------ */
    public static void main(String[] args)
        throws Exception
    {
        new TestServer("foo").other();
        
        // junit.textui.TestRunner.run(suite());
    }
    
    /* ------------------------------------------------------------ */
    public static junit.framework.Test suite()
    {
        return new TestSuite(TestServer.class);
    }

    /* ------------------------------------------------------------ */
    protected void setUp()
        throws Exception
    {
    }
    
    /* ------------------------------------------------------------ */
    protected void tearDown()
        throws Exception
    {
    }    

    /* ------------------------------------------------------------ */
    public void testServer()
        throws Exception
    {
        System.err.println("Build a server");
        
        Server server = new Server(new File(home,"etc/demo.xml").toString());

        System.err.println("start server");
        
        server.start();
        
        
        assertTrue("started",server.isStarted());
        
        File tmp = File.createTempFile("JettyServer",".serialized");
        ObjectOutputStream oo = new ObjectOutputStream(new FileOutputStream(tmp));
        oo.writeObject(server);
        oo.flush();
        oo.close();
        assertTrue("serialized",tmp.exists());

        server.stop();
        assertTrue("stopped",!server.isStarted());
        server.destroy();

        
        
        System.err.println("Serialize and deserialize server");
        
        ObjectInputStream oi = new ObjectInputStream(new FileInputStream(tmp));
        server = (Server)oi.readObject();
        oi.close();
        

        System.err.println("start recovered server");
        server.start();
        assertTrue("restarted",server.isStarted());
        server.stop();
        assertTrue("restopped",!server.isStarted());
        server.destroy();
    }

    /* ------------------------------------------------------------ */
    public void other()
        throws Exception
    {
        System.err.println("Build a server");
        
        Server server = new Server(new File(home,"etc/demo.xml").toString());

        System.err.println("start server");
        
        server.start();
        
        
        
        File tmp = File.createTempFile("JettyServer",".serialized");
        ObjectOutputStream oo = new ObjectOutputStream(new FileOutputStream(tmp));
        oo.writeObject(server);
        oo.flush();
        oo.close();

        server.stop();
        server.destroy();

        
        
        ObjectInputStream oi = new ObjectInputStream(new FileInputStream(tmp));
        server = (Server)oi.readObject();
        oi.close();
        

        System.err.println("start recovered server");
        server.start();
        server.stop();
        server.destroy();
    }
    
}
