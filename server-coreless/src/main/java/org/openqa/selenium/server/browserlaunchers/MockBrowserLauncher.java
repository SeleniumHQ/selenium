/*
 * Created on Oct 25, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.DefaultRemoteCommand;
import org.openqa.selenium.server.RemoteCommand;
import org.openqa.selenium.server.SeleniumServer;

public class MockBrowserLauncher implements BrowserLauncher, Runnable {

    static Log log = LogFactory.getLog(MockBrowserLauncher.class);
    private final int port;
    private final String sessionId;
    private Thread browser;
    private boolean interrupted = false;
    private String uniqueId;
    private int sequenceNumber = 0;
    
    public MockBrowserLauncher(int port, String sessionId) {
        this.port = port;
        this.sessionId = sessionId;
        this.uniqueId = "mock";
    }
    
    public MockBrowserLauncher(int port, String sessionId, String command) {
        this.port = port;
        this.sessionId = sessionId;
    }
    
    
    
    public void launchRemoteSession(String url, boolean multiWindow) {
        browser = new Thread(this);
        browser.setName("mockbrowser");
        browser.start();
    }

    public void launchHTMLSuite(String startURL, String suiteUrl,
            boolean multiWindow, String defaultLogLevel) {

    }

    public void close() {
        interrupted = true;
        browser.interrupt();
        
    }

    public Process getProcess() {
        return null;
    }

    public void run() {
        try {
            String startURL = "http://localhost:" + port+"/selenium-server/driver/?sessionId=" + sessionId + "&uniqueId=" + uniqueId;
            String commandLine = doBrowserRequest(startURL+"&seleniumStart=true&sequenceNumber="+sequenceNumber++, "START");
            while (!interrupted) {
                log.info("MOCK: " + commandLine);
                RemoteCommand sc = DefaultRemoteCommand.parse(commandLine);
                String result = doCommand(sc);
                if (SeleniumServer.isBrowserSideLogEnabled() && !interrupted) {
                    for (int i = 0; i < 3; i++) {
                        doBrowserRequest(startURL + "&logging=true&sequenceNumber="+sequenceNumber++, "logLevel=debug:dummy log message " + i + "\n");
                    }
                }
                if (!interrupted) {
                    commandLine = doBrowserRequest(startURL+"&sequenceNumber="+sequenceNumber++, result);
                }
            }
            log.info("MOCK: interrupted, exiting");
        } catch (Exception e) {
            RuntimeException re = new RuntimeException("Exception in mock browser", e);
            re.printStackTrace();
            throw re;
        }
    }

    private String doCommand(RemoteCommand sc) {
        String command = sc.getCommand();
        String result = "OK";
        if (command.equals("getAllButtons")) {
            result = "OK,";
        } else if (command.equals("getAllLinks")) {
            result = "OK,1";
        } else if (command.equals("getAllFields")) {
            result = "OK,1,2,3";
        } else if (command.equals("getWhetherThisFrameMatchFrameExpression")) {
            result = "OK,true";
        }
        else if (command.startsWith("get")) {
            result = "OK,x";
        } else if (command.startsWith("is")) {
            result = "OK,true";
        }
        return result;
    }
    
    private String stringContentsOfInputStream(InputStream is) throws IOException {
        StringBuffer sb = new StringBuffer();
        InputStreamReader r = new InputStreamReader(is, "UTF-8");
        int c;
        while ((c = r.read()) != -1) {
            sb.append((char) c);
        }
        return sb.toString();
    }
    
    private String doBrowserRequest(String url, String body) throws IOException {
        int responsecode = 200;
        URL result = new URL(url);
        HttpURLConnection conn = (HttpURLConnection) result.openConnection();
        
        conn.setRequestProperty("Content-Type", "application/xml");
        // Send POST output.
        conn.setDoOutput(true);
        OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
        wr.write(body);
        wr.flush();
        wr.close();
        //conn.setInstanceFollowRedirects(false);
        //responsecode = conn.getResponseCode();
        if (responsecode == 301) {
            String pathToServlet = conn.getRequestProperty("Location");
            throw new RuntimeException("Bug! 301 redirect??? " + pathToServlet);
        } else if (responsecode != 200) {
            throw new RuntimeException(conn.getResponseMessage());
        } else {
            InputStream is = conn.getInputStream();
            return stringContentsOfInputStream(is);
        }
    }

}
