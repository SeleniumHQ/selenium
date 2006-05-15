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
package org.openqa.selenium.server.browserlaunchers;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;

import org.apache.tools.ant.taskdefs.condition.Os;
import org.openqa.selenium.server.SeleniumServer;

public class SafariCustomProfileLauncher implements BrowserLauncher {

    private static final String DEFAULT_LOCATION = "/Applications/Safari.app/Contents/MacOS/Safari";

    private static final String REDIRECT_TO_GO_TO_SELENIUM = "redirect_to_go_to_selenium.htm";
    
//    private int port;
//    private String sessionId;
    private File customProfileDir;
    private String[] cmdarray;
    private boolean closed = false;
    private String commandPath;
    private Process process;

    private static AsyncExecute exe = new AsyncExecute();
    
    public SafariCustomProfileLauncher(int port, String sessionId) {
        this(port, sessionId, findBrowserLaunchLocation());
    }
    
    public SafariCustomProfileLauncher(int port, String sessionId, String browserLaunchLocation) {
        commandPath = findBrowserLaunchLocation();
//        this.port = port;
//        this.sessionId = sessionId;
        if (!WindowsUtils.thisIsWindows()) {
            // On unix, add command's directory to LD_LIBRARY_PATH
            File SafariBin = AsyncExecute.whichExec(commandPath);
            if (SafariBin == null) {
                File execDirect = new File(commandPath);
                if (execDirect.isAbsolute() && execDirect.exists()) SafariBin = execDirect;
            }
            if (SafariBin != null) {
                String libPathKey = getLibPathKey();
                String libPath = WindowsUtils.loadEnvironment().getProperty(libPathKey);
                exe.setEnvironment(new String[] {
                    libPathKey+"="+libPath+":" + SafariBin.getParent(),
                });
            }
        }
        customProfileDir = LauncherUtils.createCustomProfileDir(sessionId);
    }
    
    private static String getLibPathKey() {
        if (WindowsUtils.thisIsWindows()) return WindowsUtils.getExactPathEnvKey();
        if (Os.isFamily("mac")) return "DYLD_LIBRARY_PATH";
        // TODO other linux?
        return "LD_LIBRARY_PATH";
    }
    
    private static String findBrowserLaunchLocation() {
        String defaultPath = System.getProperty("SafariDefaultPath");
        if (defaultPath == null) {
            defaultPath = DEFAULT_LOCATION;
        }
        File defaultLocation = new File(defaultPath);
        if (defaultLocation.exists()) {
            return defaultLocation.getAbsolutePath();
        }
        // On unix, prefer SafariBin if it's on the path
        File SafariBin = AsyncExecute.whichExec("Safari");
        if (SafariBin != null) {
            return SafariBin.getAbsolutePath();
        }
        throw new RuntimeException("Safari couldn't be found in the path!\n" +
                "Please add the directory containing 'Safari' to your PATH environment\n" +
                "variable, or explicitly specify a path to Safari like this:\n" +
        "*Safari /blah/blah/Safari");
    }
        
    public void launch(String url) {
        try {
            cmdarray = new String[] {commandPath};
            
            String redirectHtmlFileName = makeRedirectionHtml(customProfileDir, url);
            
            System.out.println("Launching Safari to visit " + url + " via " + redirectHtmlFileName + "...");
            cmdarray = new String[] {commandPath, redirectHtmlFileName};
            
            exe.setCommandline(cmdarray);
            
            process = exe.asyncSpawn();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    

    protected String makeRedirectionHtml(File parentDir, String url) {
        File f = new File(parentDir, REDIRECT_TO_GO_TO_SELENIUM);
        PrintStream out;
        try {
            out = new PrintStream(new FileOutputStream(f));
        } catch (FileNotFoundException e) {
            throw new RuntimeException("troublemaking redirection HTML: " + e);            
        }
        out.println("<script language=\"JavaScript\">\n" + 
                "    location = \"" +
                url +
                "\"\n" + 
                "</script>\n" + 
                "");
        out.close();
        return f.getAbsolutePath();
    }

    
    public void close() {
        if (closed) return;
        System.out.println("Killing Safari...");
        process.destroy();
        int exitValue = AsyncExecute.waitForProcessDeath(process, 10000);
        if (exitValue == 0) {
            System.err.println("WARNING: Safari seems to have ended on its own (did we kill the real browser???)");
        }
        closed = true;
    }
    
    public static void main(String[] args) throws Exception {
        SafariCustomProfileLauncher l = new SafariCustomProfileLauncher(SeleniumServer.DEFAULT_PORT, "CUST");
        l.launch("http://www.google.com");
        int seconds = 15;
        System.out.println("Killing browser in " + Integer.toString(seconds) + " seconds");
        AsyncExecute.sleepTight(seconds * 1000);
        l.close();
        System.out.println("He's dead now, right?");
    }
}
