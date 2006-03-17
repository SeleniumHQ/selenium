/*
 * Created on Mar 3, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import java.io.*;

import org.apache.tools.ant.*;
import org.apache.tools.ant.taskdefs.*;
import org.apache.tools.ant.taskdefs.condition.*;
import org.openqa.selenium.server.*;

public class FirefoxCustomProfileLauncher extends DestroyableRuntimeExecutingBrowserLauncher {

    private static final String DEFAULT_LOCATION = "c:\\program files\\mozilla firefox\\firefox.exe"; 
    
    private int port = 8180; 
    private File customProfileDir;
    private String[] cmdarray;
    
    public FirefoxCustomProfileLauncher() {
        super(findBrowserLaunchLocation());
    }
    
    public FirefoxCustomProfileLauncher(int port) {
        super(findBrowserLaunchLocation());
        this.port = port;
    }
    
    public FirefoxCustomProfileLauncher(int port, String browserLaunchLocation) {
        super(browserLaunchLocation);
        this.port = port;
    }
    
    private static String findBrowserLaunchLocation() {
        String defaultPath = System.getProperty("firefoxDefaultPath", DEFAULT_LOCATION);
        File defaultLocation = new File(defaultPath);
        if (defaultLocation.exists()) {
            return defaultLocation.getAbsolutePath();
        } else {
            // Hope it's on the path
            return "firefox";
        }
    }
    
    public void launch(String url) {
        try {
            String profilePath = makeCustomProfile();
            
            cmdarray = new String[] {commandPath, "-profile", profilePath, url};
            
            AsyncExecute exe = new AsyncExecute();
            exe.setCommandline(cmdarray);
            exe.setEnvironment(new String[] {"MOZ_NO_REMOTE=1"});
            // Set MOZ_NO_REMOTE in order to ensure we always get a new Firefox process
            // http://blog.dojotoolkit.org/2005/12/01/running-multiple-versions-of-firefox-side-by-side
            process = exe.asyncSpawn();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    

    private String makeCustomProfile() throws IOException {
        customProfileDir = new File("customProfileDir");
        if (customProfileDir.exists()) {
            recursivelyDeleteDir(customProfileDir);
        }
        customProfileDir.mkdir();
        
        File proxyPAC = new File(customProfileDir, "proxy.pac");
        PrintStream out = new PrintStream(new FileOutputStream(proxyPAC));
        out.println("function FindProxyForURL(url, host) {");
        out.println("   if(shExpMatch(url, '*/selenium-server/*')) {");
        out.println("       return 'PROXY localhost:" + Integer.toString(port) + "; DIRECT'");
        out.println("   }");
        out.println("}");
        out.close();
        
        // TODO Do we want to make these preferences configurable somehow?
        // TODO Disable pop-up blocking?
        File prefsJS = new File(customProfileDir, "prefs.js");
        out = new PrintStream(new FileOutputStream(prefsJS));
        // Don't ask if we want to switch default browsers
        out.println("user_pref('browser.shell.checkDefaultBrowser', false);");
        
        // Configure us as the local proxy
        out.println("user_pref('network.proxy.type', 2);");
        out.println("user_pref('network.proxy.autoconfig_url', '" +
                proxyPAC.toURL() + 
                "');");
        
        // Disable security warnings
        out.println("user_pref('security.warn_submit_insecure', false);");
        out.println("user_pref('security.warn_submit_insecure.show_once', false);");
        out.println("user_pref('security.warn_entering_secure', false);");
        out.println("user_pref('security.warn_entering_secure.show_once', false);");
        out.println("user_pref('security.warn_entering_weak', false);");
        out.println("user_pref('security.warn_entering_weak.show_once', false);");
        out.println("user_pref('security.warn_leaving_secure', false);");
        out.println("user_pref('security.warn_leaving_secure.show_once', false);");
        out.println("user_pref('security.warn_viewing_mixed', false);");
        out.println("user_pref('security.warn_viewing_mixed.show_once', false);");
        
        // Disable "do you want to remember this password?"
        out.println("user_pref('signon.rememberSignons', false);");
        out.close();
        return customProfileDir.getAbsolutePath();
    }

    public void close() {
        Exception taskKillException = null;
        if (WindowsTaskKill.thisIsWindows()) {
            try {
                // try to kill with windows taskkill
                WindowsTaskKill.kill(cmdarray);
            } catch (Exception e) {
                taskKillException = e;
            }
        }
        super.close();
        /* Sleeping two seconds to give Windows time to
         * notice that the cache files in the customProfileDir
         * are now unlocked
         */
        try {Thread.sleep(2000);} catch (InterruptedException e) {}
        try {
            recursivelyDeleteDir(customProfileDir);
        } catch (RuntimeException e) {
            if (taskKillException != null) {
                e.printStackTrace();
                System.err.print("Perhaps caused by: ");
                taskKillException.printStackTrace();
                throw new RuntimeException("Couldn't delete custom Firefox " +
                        "profile directory, presumably because task kill failed; " +
                        "see stderr!", e);
            }
            throw e;
        }
    }
    
    private void recursivelyDeleteDir(File f) {
        Delete delete = new Delete();
        delete.setProject(new Project());
        delete.setDir(customProfileDir);
        delete.setFailOnError(true);
        delete.execute();
    }
    
    public static void main(String[] args) throws Exception {
        FirefoxCustomProfileLauncherTest test = new FirefoxCustomProfileLauncherTest();
        test.testFirefox();
    }
    
    class AsyncExecute extends Execute {
        File workingDirectory ;
        Project project;
        boolean useVMLauncher = true; 
        
        public AsyncExecute() {
            project = new Project();
        }
        
        // Copied from spawn, but actually returns the Process, instead of void
        public Process asyncSpawn() throws IOException {
            if (workingDirectory != null && !workingDirectory.exists()) {
                throw new BuildException(workingDirectory + " doesn't exist.");
            }
            final Process process = launch(project, getCommandline(),
                                           getEnvironment(), workingDirectory,
                                           useVMLauncher);
            if (Os.isFamily("windows")) {
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    project.log("interruption in the sleep after having spawned a process",
                        Project.MSG_VERBOSE);
                }
            }

            OutputStream dummyOut = new OutputStream() {
                public void write(int b) throws IOException {
                }
            };

            ExecuteStreamHandler streamHandler = new PumpStreamHandler(dummyOut);
            streamHandler.setProcessErrorStream(process.getErrorStream());
            streamHandler.setProcessOutputStream(process.getInputStream());
            streamHandler.start();
            process.getOutputStream().close();

            project.log("spawned process " + process.toString(), Project.MSG_VERBOSE);
            return process;
        }
    }
    
}
