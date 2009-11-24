//========================================================================
//Copyright 2006 Mort Bay Consulting Pty. Ltd.
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
package org.openqa.jetty.jetty;

import junit.framework.TestCase;
import org.openqa.jetty.jetty.Server;
import org.openqa.jetty.http.SocketListener;

public class TestStopStart  extends TestCase {
    private Server webServer = new Server();

    public void testDoubleStartStop() throws Exception {
        System.err.println(Thread.currentThread().getContextClassLoader());
        init();
        System.err.println(Thread.currentThread().getContextClassLoader());
        start();
        System.err.println(Thread.currentThread().getContextClassLoader());
        stop();
        System.err.println(Thread.currentThread().getContextClassLoader());
        // Uncomment the line below and you'll get an "InvocationTargetException" instead of "NullPointerException"
        //Thread.currentThread().setContextClassLoader(null);
        start();
        System.err.println(Thread.currentThread().getContextClassLoader());
        stop();
        System.err.println(Thread.currentThread().getContextClassLoader());
    }

    private void start() throws Exception {
        webServer.start();
    }

    private void stop() throws InterruptedException {
        webServer.stop();
    }

    private void init() throws Exception {
        SocketListener webServerSocketListener = new SocketListener();
        webServerSocketListener.setPort (5780);
        webServerSocketListener.setHost("127.0.0.1");

        webServer.addListener(webServerSocketListener);
        webServer.addWebApplication("/api", "./webapps/template");
        webServer.setStatsOn(true);
    }
}
