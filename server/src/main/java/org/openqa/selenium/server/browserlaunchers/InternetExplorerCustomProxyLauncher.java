/*
 * Created on Mar 3, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import java.io.*;

import org.apache.tools.ant.*;
import org.apache.tools.ant.taskdefs.*;
import org.openqa.selenium.server.*;

public class InternetExplorerCustomProxyLauncher extends DestroyableRuntimeExecutingBrowserLauncher {

    private static final String DEFAULT_LOCATION = "c:\\program files\\internet explorer\\iexplore.exe";
    private static final String REG_KEY_INTERNET_SETTINGS = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings";
    private static final String REG_VALUE_AUTOCONFIG_URL = "AutoConfigURL";
    private static final String REG_KEY_INTERNET_POLICIES = "HKCU\\Software\\Policies\\Microsoft\\Windows\\CurrentVersion\\Internet Settings";
    private static final String REG_VALUE_AUTOPROXY_RESULT_CACHE = "EnableAutoproxyResultCache";
    
    private int port = 8180; 
    private File customProxyPACDir;
    private String[] cmdarray;
    private String oldAutoConfigURL = null;
    private Boolean oldAutoProxyCache = null;
    
    public InternetExplorerCustomProxyLauncher() {
        super(findBrowserLaunchLocation());
    }
    
    public InternetExplorerCustomProxyLauncher(int port) {
        super(findBrowserLaunchLocation());
        this.port = port;
    }
    
    public InternetExplorerCustomProxyLauncher(int port, String browserLaunchLocation) {
        super(browserLaunchLocation);
        this.port = port;
    }
    
    private static String findBrowserLaunchLocation() {
        String defaultPath = System.getProperty("internetExplorerDefaultPath", DEFAULT_LOCATION);
        File defaultLocation = new File(defaultPath);
        if (defaultLocation.exists()) {
            return defaultLocation.getAbsolutePath();
        } else {
            // Hope it's on the path
            return "iexplore";
        }
    }
    
    public void launch(String url) {
        try {
            changeRegistrySettings();
            cmdarray = new String[] {commandPath, "-new", url};
            
            AsyncExecute exe = new AsyncExecute();
            exe.setCommandline(cmdarray);
            process = exe.asyncSpawn();
            /* We immediately undo our registry change, now that we've launched 
             * the current IE process, so that future IE processes don't get
             * accidentally affected
             */
            restoreOldRegistrySettings();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    

    private void changeRegistrySettings() throws IOException {
        customProxyPACDir = new File("customProfileDir");
        if (customProxyPACDir.exists()) {
            recursivelyDeleteDir(customProxyPACDir);
        }
        customProxyPACDir.mkdir();
        
        File proxyPAC = new File(customProxyPACDir, "proxy.pac");
        PrintStream out = new PrintStream(new FileOutputStream(proxyPAC));
        out.println("function FindProxyForURL(url, host) {");
        out.println("   if(shExpMatch(url, '*/selenium-server/*')) {");
        out.println("       return 'PROXY localhost:" + Integer.toString(port) + "; DIRECT'");
        out.println("   }");
        out.println("}");
        out.close();
        
        
        if (WindowsUtils.doesRegistryValueExist(REG_KEY_INTERNET_SETTINGS, REG_VALUE_AUTOCONFIG_URL)) {
            oldAutoConfigURL = WindowsUtils.readStringRegistryValue(REG_KEY_INTERNET_SETTINGS, REG_VALUE_AUTOCONFIG_URL);
        }
        
        
        String newURL = "file://" + proxyPAC.getAbsolutePath().replace('\\', '/');
        WindowsUtils.writeStringRegistryValue(REG_KEY_INTERNET_SETTINGS, REG_VALUE_AUTOCONFIG_URL, newURL);
        
        // Disabling automatic proxy caching
        // http://support.microsoft.com/?kbid=271361
        // Otherwise, *all* requests will go through our proxy, rather than just */selenium-server/* requests
        if (WindowsUtils.doesRegistryValueExist(REG_KEY_INTERNET_POLICIES, REG_VALUE_AUTOPROXY_RESULT_CACHE)) {
            oldAutoProxyCache = new Boolean(WindowsUtils.readBooleanRegistryValue(REG_KEY_INTERNET_POLICIES, REG_VALUE_AUTOPROXY_RESULT_CACHE));
        } else {
            oldAutoProxyCache = null;
        }
        WindowsUtils.writeBooleanRegistryValue(REG_KEY_INTERNET_POLICIES, REG_VALUE_AUTOPROXY_RESULT_CACHE, false);
        
        // TODO Do we want to make these preferences configurable somehow?
        // TODO Disable pop-up blocking?
        // TODO Disable security warnings
        // TODO Disable "do you want to remember this password?"
    }

    public void restoreOldRegistrySettings() {
        if (null == oldAutoConfigURL) {
            WindowsUtils.deleteRegistryValue(REG_KEY_INTERNET_SETTINGS, REG_VALUE_AUTOCONFIG_URL);
        } else {
            WindowsUtils.writeStringRegistryValue(REG_KEY_INTERNET_SETTINGS, REG_VALUE_AUTOCONFIG_URL, oldAutoConfigURL);
        }
        
        if (null == oldAutoProxyCache) {
            WindowsUtils.deleteRegistryValue(REG_KEY_INTERNET_POLICIES, REG_VALUE_AUTOPROXY_RESULT_CACHE);
        } else {
            WindowsUtils.writeBooleanRegistryValue(REG_KEY_INTERNET_POLICIES, REG_VALUE_AUTOPROXY_RESULT_CACHE, oldAutoProxyCache.booleanValue());
        }
    }
    
    public void close() {
        Exception taskKillException = null;
        if (WindowsUtils.thisIsWindows()) {
            try {
                // try to kill with windows taskkill
                WindowsUtils.kill(cmdarray);
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
            recursivelyDeleteDir(customProxyPACDir);
        } catch (RuntimeException e) {
            if (taskKillException != null) {
                e.printStackTrace();
                System.err.print("Perhaps caused by: ");
                taskKillException.printStackTrace();
                throw new RuntimeException("Couldn't delete custom IE " +
                        "proxy directory, presumably because task kill failed; " +
                        "see stderr!", e);
            }
            throw e;
        }
    }
    
    private void recursivelyDeleteDir(File f) {
        Delete delete = new Delete();
        delete.setProject(new Project());
        delete.setDir(customProxyPACDir);
        delete.setFailOnError(true);
        delete.execute();
    }
    
    public static void main(String[] args) throws IOException, InterruptedException {
        InternetExplorerCustomProxyLauncher l = new InternetExplorerCustomProxyLauncher(SeleniumProxy.DEFAULT_PORT);
        l.launch("http://www.google.com/selenium-server/index.html");
        int seconds = 5;
        System.out.println("Killing browser in " + Integer.toString(seconds) + " seconds");
        Thread.sleep(seconds * 1000);
        l.close();
        System.out.println("He's dead now, right?");
    }
    
}
