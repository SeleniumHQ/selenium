/*
 * Copyright 2004 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.thoughtworks.selenium.b.embedded.jetty;

import junit.framework.TestCase;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.util.Vector;

import com.thoughtworks.selenium.b.embedded.jetty.JettyCommandProcessor;
import com.thoughtworks.selenium.b.CommandProcessor;

/**
 * @author Paul Hammant
 * @version $Revision: 1.1 $
 */
public class JettySeleniumServerTestCase extends TestCase {

    CommandProcessor selenium;
    private Vector result;

    protected void setUp() throws Exception {
        super.setUp();
        result = new Vector();
        selenium = new JettyCommandProcessor(null, "selenium-driver");
        selenium.start();
    }

    protected void tearDown() throws Exception {
        selenium.stop();
    }

    public void testBasicReplyRequestOverTcpip() throws IOException, InterruptedException {

        // different thread is needed as blocking (in .doCommand()) will halt the test

        Runnable open = new Runnable() {
            public void run() {
                result.add(selenium.doCommand("Apple", "Orange", "Pear"));
                result.add(selenium.doCommand("Apple2", "Orange2", "Pear2"));
                result.add(selenium.doCommand("Apple3", "Orange3", "Pear3"));
                result.add(selenium.doCommand("End", "", ""));
            }
        };
        Thread openThread = new Thread(open);
        openThread.start();
        Thread.sleep(1000);

        URL mockBrowser = new URL("http://localhost:8080/selenium-driver/driver?seleniumStart=true");
        URLConnection conn = mockBrowser.openConnection();
        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String inputLine;

        inputLine = in.readLine();
        in.close();

        assertEquals("Selenese: Apple | Orange | Pear", inputLine.trim());

        mockBrowser = new URL("http://localhost:8080/selenium-driver/driver?commandResult=ResultForFirstCall");
        conn = mockBrowser.openConnection();
        in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        inputLine = in.readLine();
        in.close();

        assertEquals("Selenese: Apple2 | Orange2 | Pear2", inputLine.trim());

        mockBrowser = new URL("http://localhost:8080/selenium-driver/driver?commandResult=ResultForSecondCall");
        conn = mockBrowser.openConnection();
        in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        inputLine = in.readLine();
        in.close();

        assertEquals("Selenese: Apple3 | Orange3 | Pear3", inputLine.trim());

        mockBrowser = new URL("http://localhost:8080/selenium-driver/driver?commandResult=ResultForThirdCall");
        conn = mockBrowser.openConnection();
        in = new BufferedReader(new InputStreamReader(conn.getInputStream()));

        inputLine = in.readLine();
        in.close();

        assertEquals("Selenese: End |  |", inputLine.trim());

        assertNotNull(result.get(0));
        //TODO these are offset by one...
        assertEquals("ResultForFirstCall", result.get(0));
        assertEquals("ResultForSecondCall", result.get(1));
        assertEquals("ResultForThirdCall", result.get(2));

    }

    // this main method works fine.
    // invoke it then point a real browser at
    //     http://localhost:8080/selenium-driver/driver?commandResult=Hello
    // then do a refresh.
    // that /mimicks/ what the browserBot would do....
    // this one is good cos you can *see* it.
    public static void main(String[] args) throws Exception {

        JettySeleniumServerTestCase dstc = new JettySeleniumServerTestCase();

        dstc.setUp();

        System.out.println("--> 1 " + dstc.selenium.doCommand("one", "two", "three"));
        System.out.println("--> 2 " + dstc.selenium.doCommand("four", "five", "six"));

        Thread.sleep(2000);

        dstc.tearDown();

    }
}
