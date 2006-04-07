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

import java.io.*;

import org.apache.tools.ant.*;
import org.apache.tools.ant.taskdefs.*;
import org.apache.tools.ant.taskdefs.condition.*;
import org.openqa.selenium.server.*;

public class FirefoxCustomProfileLauncher extends DestroyableRuntimeExecutingBrowserLauncher {

    private static final String DEFAULT_NONWINDOWS_LOCATION = "/Applications/Firefox.app/Contents/MacOS/firefox-bin";
    
    private static boolean simple = false;
    
    private int port;
    private String sessionId;
    private File customProfileDir;
    private String[] cmdarray;
    private boolean closed = false;

    private static AsyncExecute exe = new AsyncExecute();
    
    public FirefoxCustomProfileLauncher(int port, String sessionId) {
        this(port, sessionId, findBrowserLaunchLocation());
    }
    
    public FirefoxCustomProfileLauncher(int port, String sessionId, String browserLaunchLocation) {
        super(browserLaunchLocation);
        this.port = port;
        this.sessionId = sessionId;
        // Set MOZ_NO_REMOTE in order to ensure we always get a new Firefox process
        // http://blog.dojotoolkit.org/2005/12/01/running-multiple-versions-of-firefox-side-by-side
        exe.setEnvironment(new String[] {"MOZ_NO_REMOTE=1"});
        if (!WindowsUtils.thisIsWindows()) {
            // On unix, add command's directory to LD_LIBRARY_PATH
            File firefoxBin = AsyncExecute.whichExec(commandPath);
            if (firefoxBin == null) {
                File execDirect = new File(commandPath);
                if (execDirect.isAbsolute() && execDirect.exists()) firefoxBin = execDirect;
            }
            if (firefoxBin != null) {
                String libPathKey = getLibPathKey();
                String libPath = WindowsUtils.loadEnvironment().getProperty(libPathKey);
                exe.setEnvironment(new String[] {
                    "MOZ_NO_REMOTE=1",
                    libPathKey+"="+libPath+":" + firefoxBin.getParent(),
                });
            }
        }
    }
    
    private static String getLibPathKey() {
        if (WindowsUtils.thisIsWindows()) return WindowsUtils.getExactPathEnvKey();
        if (Os.isFamily("mac")) return "DYLD_LIBRARY_PATH";
        // TODO other linux?
        return "LD_LIBRARY_PATH";
    }
    
    private static String findBrowserLaunchLocation() {
        String defaultPath = System.getProperty("firefoxDefaultPath");
        if (defaultPath == null) {
            if (WindowsUtils.thisIsWindows()) {
                defaultPath = WindowsUtils.getProgramFilesPath() + "\\Mozilla Firefox\\firefox.exe";
            } else {
                defaultPath = DEFAULT_NONWINDOWS_LOCATION;
            }
        }
        File defaultLocation = new File(defaultPath);
        if (defaultLocation.exists()) {
            return defaultLocation.getAbsolutePath();
        } else {
            if (WindowsUtils.thisIsWindows()) {
            	File firefoxEXE = AsyncExecute.whichExec("firefox.exe");
            	if (firefoxEXE != null) return firefoxEXE.getAbsolutePath();
            	throw new RuntimeException("Firefox couldn't be found in the path!\n" +
            			"Please add the directory containing firefox.exe to your PATH environment\n" +
            			"variable, or explicitly specify a path to Firefox like this:\n" +
            			"*firefox c:\\blah\\firefox.exe");
            } else {
                // On unix, prefer firefoxBin if it's on the path
                File firefoxBin = AsyncExecute.whichExec("firefox-bin");
                if (firefoxBin != null) {
                    return firefoxBin.getAbsolutePath();
                }
                throw new RuntimeException("Firefox couldn't be found in the path!\n" +
            			"Please add the directory containing 'firefox-bin' to your PATH environment\n" +
            			"variable, or explicitly specify a path to Firefox like this:\n" +
            			"*firefox /blah/blah/firefox-bin");
            }
            
        }
    }
    
    public void launch(String url) {
        try {
            String profilePath = makeCustomProfile();
            
            String chromeURL = "chrome://killff/content/kill.html";
            
            cmdarray = new String[] {commandPath, "-profile", profilePath, chromeURL};
            
            /* The first time we launch Firefox with an empty profile directory,
             * Firefox will launch itself, populate the profile directory, then
             * kill/relaunch itself, so our process handle goes out of date.
             * So, the first time we launch Firefox, we'll start it up at an URL
             * that will immediately shut itself down. */
            System.out.println("Preparing Firefox profile...");
            
            exe.setCommandline(cmdarray);
            exe.execute();
            
            
            waitForFullProfileToBeCreated(20*1000);
            
            System.out.println("Launching Firefox...");
            cmdarray = new String[] {commandPath, "-profile", profilePath, url};
            
            exe.setCommandline(cmdarray);
            
            process = exe.asyncSpawn();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    

    private String makeCustomProfile() throws IOException {
        customProfileDir = new File("customProfileDir" + sessionId);
        if (customProfileDir.exists()) {
            recursivelyDeleteDir(customProfileDir);
        }
        customProfileDir.mkdir();
        
        if (simple) return customProfileDir.getAbsolutePath();
        
        File proxyPAC = new File(customProfileDir, "proxy.pac");
        PrintStream out = new PrintStream(new FileOutputStream(proxyPAC));
        out.println("function FindProxyForURL(url, host) {");
        out.println("   if(shExpMatch(url, '*/selenium-server/*')) {");
        out.println("       return 'PROXY localhost:" + Integer.toString(port) + "; DIRECT'");
        out.println("   }");
        out.println("}");
        out.close();
        
        File extensionDir = new File(customProfileDir, "extensions/{538F0036-F358-4f84-A764-89FB437166B4}");
        extensionDir.mkdirs();
        
        File killHTML = new File(customProfileDir, "kill.html");
        out = new PrintStream(new FileOutputStream(killHTML));
        out.println("<html><body>Firefox should die immediately upon viewing this!  If you're reading this, there must be a bug!");
        out.println("<script src=\"chrome://global/content/globalOverlay.js\"></script>");
        out.println("");
        out.println("<script>");
        out.println("goQuitApplication();");
        out.println("</script>  ");
        out.println("</body></html>");
        out.close();
        
        File installRDF = new File(extensionDir, "install.rdf");
        out = new PrintStream(new FileOutputStream(installRDF));
        out.println("<?xml version=\"1.0\"?>");
        out.println("<RDF xmlns=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"");
        out.println("     xmlns:em=\"http://www.mozilla.org/2004/em-rdf#\">");
        out.println("");
        out.println("    <Description about=\"urn:mozilla:install-manifest\">");
        out.println("        <em:id>{538F0036-F358-4f84-A764-89FB437166B4}</em:id>");
        out.println("        <em:type>2</em:type>");
        out.println("        <em:name>KillFF</em:name>");
        out.println("        <em:version>1.0</em:version>");
        out.println("        <em:description>Provides a chrome URL that can kill the browser</em:description>");
        out.println("");
        out.println("        <!-- Firefox -->");
        out.println("        <em:targetApplication>");
        out.println("            <Description>");
        out.println("                <em:id>{ec8030f7-c20a-464f-9b0e-13a3a9e97384}</em:id>");
        out.println("                <em:minVersion>1.4.1</em:minVersion>");
        out.println("                <em:maxVersion>1.6</em:maxVersion>");
        out.println("            </Description>");
        out.println("        </em:targetApplication>");
        out.println("");
        out.println("    </Description>");
        out.println("</RDF>");
        out.close();
        
        File chromeManifest = new File(extensionDir, "chrome.manifest");
        out = new PrintStream(new FileOutputStream(chromeManifest));
        out.print("content\tkillff\t");
        out.println(killHTML.toURL());
        out.close();
        
        // TODO Do we want to make these preferences configurable somehow?
        File prefsJS = new File(customProfileDir, "prefs.js");
        out = new PrintStream(new FileOutputStream(prefsJS));
        // Don't ask if we want to switch default browsers
        out.println("user_pref('browser.shell.checkDefaultBrowser', false);");
        
        // Disable pop-up blocking
        out.println("user_pref('browser.allowpopups', true);");
        out.println("user_pref('dom.disable_open_during_load', false);");
        
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
        if (closed) return;
        System.out.println("Killing Firefox...");
        Exception taskKillException = null;
        Exception fileLockException = null;
        if (false) {
            try {
                // try to kill with windows taskkill
                WindowsUtils.kill(cmdarray);
            } catch (Exception e) {
                taskKillException = e;
            }
        }
        process.destroy();
        int exitValue = AsyncExecute.waitForProcessDeath(process, 10000);
        if (exitValue == 0) {
            System.err.println("WARNING: Firefox seems to have ended on its own (did we kill the real browser???)");
        }
        try {
            waitForFileLockToGoAway(5*000, 500);
        } catch (FileLockRemainedException e1) {
            fileLockException = e1;
        }
        
        
        
        try {
            deleteTryTryAgain(customProfileDir, 6);
        } catch (RuntimeException e) {
            if (taskKillException != null || fileLockException != null) {
                e.printStackTrace();
                System.err.print("Perhaps caused by: ");
                if (taskKillException != null) taskKillException.printStackTrace();
                if (fileLockException != null) fileLockException.printStackTrace();
                throw new RuntimeException("Couldn't delete custom Firefox " +
                        "profile directory, presumably because task kill failed; " +
                        "see stderr!", e);
            }
            throw e;
        }
        closed = true;
    }
    
    private void deleteTryTryAgain(File dir, int tries) {
        try {
            recursivelyDeleteDir(dir);
        } catch (BuildException e) {
            if (tries > 0) {
                AsyncExecute.sleepTight(2000);
                deleteTryTryAgain(dir, tries-1);
            } else {
                throw e;
            }
        }
    }
    private void recursivelyDeleteDir(File f) {
        Delete delete = new Delete();
        delete.setProject(new Project());
        delete.setDir(customProfileDir);
        delete.setFailOnError(true);
        delete.execute();
    }
    
    /** Firefox knows it's running by using a "parent.lock" file in
     * the profile directory.  Wait for this file to go away (and stay gone)
     * @param timeout max time to wait for the file to go away
     * @param timeToWait minimum time to wait to make sure the file is gone
     * @throws FileLockRemainedException 
     */
    private void waitForFileLockToGoAway(long timeout, long timeToWait) throws FileLockRemainedException {
        File lock = new File(customProfileDir, "parent.lock");
        for (long start = System.currentTimeMillis(); System.currentTimeMillis() < start + timeout; ) {
            AsyncExecute.sleepTight(500);
            if (!lock.exists() && makeSureFileLockRemainsGone(lock, timeToWait)) return;
        }
        if (lock.exists()) throw new FileLockRemainedException("Lock file still present! " + lock.getAbsolutePath());
    }
    
    /** When initializing the profile, Firefox rapidly starts, stops, restarts and
     * stops again; we need to wait a bit to make sure the file lock is really gone.
     * @param lock the parent.lock file in the profile directory
     * @param timeToWait minimum time to wait to see if the file shows back 
     * up again. This is not a timeout; we will always wait this amount of time or more.
     * @return true if the file stayed gone for the entire timeToWait; false if the 
     * file exists (or came back)
     */
    private boolean makeSureFileLockRemainsGone(File lock, long timeToWait) {
        for (long start = System.currentTimeMillis(); System.currentTimeMillis() < start + timeToWait; ) {
            AsyncExecute.sleepTight(500);
            if (lock.exists()) return false;
        }
        if (!lock.exists()) return true;
        return false;
    }
    
    /** Wait for one of the Firefox-generated files to come into existence, then wait
     * for Firefox to exit
     * @param timeout the maximum amount of time to wait for the profile to be created
     */
    private void waitForFullProfileToBeCreated(long timeout) {
        // This will be a characteristic file in the profile
        File testFile = new File(customProfileDir, "extensions.ini");
        long start = System.currentTimeMillis();
        for (; System.currentTimeMillis() < start + timeout; ) {
            
            AsyncExecute.sleepTight(500);
            if (testFile.exists()) break;
        }
        if (!testFile.exists()) throw new RuntimeException("Timed out waiting for profile to be created!");
        // wait the rest of the timeout for the file lock to go away
        long subTimeout = timeout - (System.currentTimeMillis() - start);
        try {
            waitForFileLockToGoAway(subTimeout, 500);
        } catch (FileLockRemainedException e) {
            throw new RuntimeException("Firefox refused shutdown while preparing a profile", e);
        }
    }
    
    public static void main(String[] args) throws Exception {
        FirefoxCustomProfileLauncher l = new FirefoxCustomProfileLauncher(SeleniumServer.DEFAULT_PORT, "CUSTFF");
        l.launch("http://www.google.com");
        int seconds = 15;
        System.out.println("Killing browser in " + Integer.toString(seconds) + " seconds");
        AsyncExecute.sleepTight(seconds * 1000);
        l.close();
        System.out.println("He's dead now, right?");
    }
    
    private class FileLockRemainedException extends Exception {
        FileLockRemainedException(String message) {
            super(message);
        }
    }
    
}
