/*
 * Copyright 2006 ThoughtWorks, Inc.
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

package org.openqa.selenium.server;

import java.io.*;
import java.lang.reflect.*;
import java.net.*;
import java.util.*;

import org.mortbay.http.*;
import org.mortbay.http.handler.*;
import org.mortbay.util.*;
import org.openqa.selenium.server.browserlaunchers.*;
import org.openqa.selenium.server.htmlrunner.*;

/**
 * A Jetty handler that takes care of Selenese Driven requests.
 * 
 * Selenese Driven requests are described in detail in the class description for
 * <code>SeleniumProxy</code>
 * @see org.openqa.selenium.server.SeleniumServer
 * @author Paul Hammant
 * @version $Revision: 674 $
 */
public class SeleniumDriverResourceHandler extends ResourceHandler {

    private final Map queues = new HashMap();
    private final Map launchers = new HashMap();
    private SeleniumServer server;

    public SeleniumDriverResourceHandler(SeleniumServer server) {
        this.server = server;
    }

    /** Handy helper to retrieve the first parameter value matching the name
     * 
     * @param req - the Jetty HttpRequest
     * @param name - the HTTP parameter whose value we'll return
     * @return the value of the first HTTP parameter whose name matches <code>name</code>, or <code>null</code> if there is no such parameter
     */
    private String getParam(HttpRequest req, String name) {
        List parameterValues = req.getParameterValues(name);
        if (parameterValues == null) {
            return null;
        }
        return (String) parameterValues.get(0);
    }

    public void handle(String pathInContext, String pathParams, HttpRequest req, HttpResponse res) throws HttpException, IOException {
        res.setField(HttpFields.__ContentType, "text/plain");
        setNoCacheHeaders(res);

        OutputStream out = res.getOutputStream();
        ByteArrayOutputStream buf = new ByteArrayOutputStream(1000);
        Writer writer = new OutputStreamWriter(buf, StringUtil.__UTF_8);
        String seleniumStart = getParam(req, "seleniumStart");
        String method = req.getMethod();
        String cmd = getParam(req, "cmd");
        String sessionId = getParam(req, "sessionId");

        // If this is a browser requesting work for the first time...
        if ("POST".equalsIgnoreCase(method) || (seleniumStart != null && seleniumStart.equals("true"))) {
            //System.out.println("commandResult = " + commandResult);

            InputStream is = req.getInputStream();
            StringBuffer sb = new StringBuffer();
            InputStreamReader r = new InputStreamReader(is, "UTF-8");
            int c;
            while ((c = r.read()) != -1) {
                sb.append((char) c);
            }
            String commandResult = sb.toString();
            
            if ("true".equals(seleniumStart)) {
                commandResult = null;
            }

            SeleneseQueue queue = getQueue(sessionId);
            SeleneseCommand sc = queue.handleCommandResult(commandResult);
            //System.out.println("Sending next command: " + sc.getCommandString());
            writer.flush();
            writer.write(sc.toString());
            for (int pad = 998 - buf.size(); pad-- > 0;) {
                writer.write(" ");
            }
            writer.write("\015\012");
            writer.flush();
            buf.writeTo(out);

            req.setHandled(true);
        } else if (cmd != null) {
            handleCommandRequest(req, res, cmd, sessionId);
        } else {
            //System.out.println("Unexpected: " + req.getRequestURL() + "?" + req.getQuery());
            req.setHandled(false);
        }
    }

    private void handleCommandRequest(HttpRequest req, HttpResponse res, String cmd, String sessionId) {
        // If this a Driver Client sending a new command...
        res.setContentType("text/plain");
        hackRemoveConnectionCloseHeader(res);

        Vector values = new Vector();

        for (int i = 1; req.getParameter(Integer.toString(i)) != null; i++) {
            values.add(req.getParameter(Integer.toString(i)));
        }
        if (values.size() < 1) {
            values.add("");
        }
        if (values.size() < 2) {
            values.add("");
        }

        String results;
        System.out.println("queryString = " + req.getQuery());
        results = doCommand(cmd, values, sessionId, res);
        try {
            res.getOutputStream().write(results.getBytes("UTF-8"));
        } catch (IOException e) {
            e.printStackTrace();
        }

        req.setHandled(true);
    }

    public String doCommand(String cmd, Vector values, String sessionId, HttpResponse res) {
        String results;
        // handle special commands
        if ("getNewBrowserSession".equals(cmd)) {
            results = "OK," + getNewBrowserSession((String)values.get(0), (String)values.get(1));
        } else if ("testComplete".equals(cmd)) {
            BrowserLauncher launcher = getLauncher(sessionId);
            if (launcher == null) {
                results = "ERROR: No launcher found for sessionId " + sessionId;
            } else {
                launcher.close();
                // finally, if the command was testComplete, remove the queue
                if ("testComplete".equals(cmd)) {
                    clearQueue(sessionId);
                }
                results = "OK";
            }
        } else if ("shutDown".equals(cmd)) {
            System.out.println("Shutdown command received");
            if (res != null) {
                try {
                    res.getOutputStream().write("OK".getBytes());
                    res.commit();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
            AsyncExecute.sleepTight(3000);
            System.exit(0);
            results = null;
        } else if ("isPostSupported".equals(cmd)) {
            // We don't support POST
            results = "OK,false";
        } else if ("addStaticContent".equals(cmd)) {
            File dir = new File((String) values.get(0));
            if (dir.exists()) {
                server.addNewStaticContent(dir);
                results = "OK";
            } else {
                results = "ERROR: dir does not exist - " + dir.getAbsolutePath();
            }
        } else if ("runHTMLSuite".equals(cmd)) {
            HTMLLauncher launcher = new HTMLLauncher(server);
            File output = null;
            if (values.size() < 3) {
                results = "ERROR: Not enough arguments (browser, browserURL, suiteURL, [outputFile])";
            } else {
                if (values.size() > 3) {
                    output = new File((String)values.get(3));
                }
                // TODO User Configurable timeout 
                long timeout = 1000 * 60 * 30;
                try {
                    results = launcher.runHTMLSuite((String) values.get(0), (String) values.get(1), (String) values.get(2), output, timeout);
                } catch (IOException e) {
                    e.printStackTrace();
                    results = e.toString();
                }
            }
        } else {

            SeleneseQueue queue = getQueue(sessionId);
            results = queue.doCommand(cmd, (String)values.get(0), (String)values.get(1));
        }
        System.out.println("Got result: " + results);
        return results;
    }

    private String getNewBrowserSession(String browser, String startURL) {
        if (browser == null) throw new IllegalArgumentException("browser may not be null");
        String sessionId = Long.toString(System.currentTimeMillis());
        String results;
        BrowserLauncherFactory blf = new BrowserLauncherFactory(server);
        BrowserLauncher launcher = blf.getBrowserLauncher(browser, sessionId);
        String url = null;
        try {
            url = LauncherUtils.stripStartURL(startURL);
        } catch (MalformedURLException e) {
            e.printStackTrace();
            return e.toString();
        }
        launcher.launch(url + "/selenium-server/core/SeleneseRunner.html?sessionId=" + sessionId);
        launchers.put(sessionId, launcher);
        SeleneseQueue queue = getQueue(sessionId);
        queue.doCommand("setContext", sessionId, "");
        results = sessionId;
        return results;
    }

    /** Perl and Ruby hang forever when they see "Connection: close" in the HTTP headers.
     * They see that and they think that Jetty will close the socket connection, but
     * Jetty doesn't appear to do that reliably when we're creating a process while
     * handling the HTTP response!  So, removing the "Connection: close" header so that
     * Perl and Ruby think we're morons and hang up on us in disgust.
     * @param res the HTTP response
     */
    private void hackRemoveConnectionCloseHeader(HttpResponse res) {
        // First, if Connection has been added, remove it.
        res.removeField(HttpFields.__Connection);
        // Now, claim that this connection is *actually* persistent
        Field[] fields = HttpConnection.class.getDeclaredFields();
        for (int i = 0; i < fields.length; i++) {
            if (fields[i].getName().equals("_close")) {
                Field _close = fields[i];
                _close.setAccessible(true);
                try {
                    _close.setBoolean(res.getHttpConnection(), false);
                } catch (IllegalArgumentException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
            }
            if (fields[i].getName().equals("_persistent")) {
                Field _close = fields[i];
                _close.setAccessible(true);
                try {
                    _close.setBoolean(res.getHttpConnection(), true);
                } catch (IllegalArgumentException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
            }
        }
    }

    /** Retrieves a launcher for the specified sessionId, or <code>null</code> if there is no such launcher. */
    private BrowserLauncher getLauncher(String sessionId) {
        synchronized (launchers) {
            return (BrowserLauncher) launchers.get(sessionId);
        }
    }

    /** Retrieves a SeleneseQueue for the specifed sessionId, creating a new one if there isn't one with that sessionId already */
    private SeleneseQueue getQueue(String sessionId) {
        synchronized (queues) {
            SeleneseQueue queue = (SeleneseQueue) queues.get(sessionId);
            if (queue == null) {
                queue = new SeleneseQueue();
                queues.put(sessionId, queue);
            }

            return queue;
        }
    }

    /** Deletes the specified SeleneseQueue */
    public void clearQueue(String sessionId) {
        synchronized(queues) {
            queues.remove(sessionId);
        }
    }

    /** Kills all running browsers */
    public void stopAllBrowsers() {
        for (Iterator i = launchers.values().iterator(); i.hasNext();) {
            BrowserLauncher launcher = (BrowserLauncher) i.next();
            launcher.close();
        }
    }

    /** Sets all the don't-cache headers on the HttpResponse */
    private void setNoCacheHeaders(HttpResponse res) {
        res.setField(HttpFields.__CacheControl, "no-cache");
        res.setField(HttpFields.__Pragma, "no-cache");
        res.setField(HttpFields.__Expires, "-1");
    }
}
