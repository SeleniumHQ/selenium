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
import java.io.IOException;
import java.util.ArrayList;

import org.openqa.selenium.server.SeleniumServer;

public class InternetExplorerCustomProxyLauncher implements BrowserLauncher {

    protected static final String REG_KEY_SELENIUM_FOLDER = "HKEY_CURRENT_USER\\Software\\Selenium\\RemoteControl\\";
    protected static final String REG_KEY_BACKUP_READY = REG_KEY_SELENIUM_FOLDER + "BackupReady";
    protected static final String REG_KEY_BACKUP_AUTOCONFIG_URL = REG_KEY_SELENIUM_FOLDER + "AutoConfigURL";
    protected static final String REG_KEY_BACKUP_PROXY_ENABLE = REG_KEY_SELENIUM_FOLDER + "ProxyEnable";
    protected static final String REG_KEY_BACKUP_PROXY_SERVER = REG_KEY_SELENIUM_FOLDER + "ProxyServer";
    protected static final String REG_KEY_BACKUP_AUTOPROXY_RESULT_CACHE = REG_KEY_SELENIUM_FOLDER + "EnableAutoproxyResultCache";
    protected static final String REG_KEY_BACKUP_POPUP_MGR = REG_KEY_SELENIUM_FOLDER + "PopupMgr";
    protected static final String REG_KEY_POPUP_MGR = "HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\New Windows\\PopupMgr";
    protected static final String REG_KEY_AUTOCONFIG_URL = "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\AutoConfigURL";
    protected static final String REG_KEY_PROXY_ENABLE = "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ProxyEnable";
    protected static final String REG_KEY_PROXY_SERVER = "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ProxyServer";
    protected static final String REG_KEY_AUTOPROXY_RESULT_CACHE = "HKEY_CURRENT_USER\\Software\\Policies\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\EnableAutoproxyResultCache";
    
    private static ArrayList<RegKeyBackup> keys = null;
    
    private int port = 8180;
    private String sessionId;
    private File customProxyPACDir;
    private String[] cmdarray;
    private String commandPath;
    private Process process;
    protected boolean customPACappropriate = true;
    
    public InternetExplorerCustomProxyLauncher(int port, String sessionId) {
        init();
        commandPath = findBrowserLaunchLocation();
        this.port = port;
        this.sessionId = sessionId;
    }
    
    public InternetExplorerCustomProxyLauncher(int port, String sessionId, String browserLaunchLocation) {
        init();
        commandPath = browserLaunchLocation;
        this.port = port;
        this.sessionId = sessionId;
    }    
    
    protected void init() {
        if (!isStaticInitDone()) {
            initStatic();
        }
    }

    protected boolean isStaticInitDone() {
        return keys!=null;
    }
    protected void initStatic() {
        keys = new ArrayList<RegKeyBackup>();
        addRegistryKeyToBackupList(REG_KEY_POPUP_MGR, REG_KEY_BACKUP_POPUP_MGR, String.class);
        addRegistryKeyToBackupList(REG_KEY_AUTOCONFIG_URL, REG_KEY_BACKUP_AUTOCONFIG_URL, String.class);
        addRegistryKeyToBackupList(REG_KEY_AUTOPROXY_RESULT_CACHE, REG_KEY_BACKUP_AUTOPROXY_RESULT_CACHE, boolean.class);
    }

    protected void addRegistryKeyToBackupList(String regKey, String backupRegKey, Class clazz) {
        keys.add(new RegKeyBackup(regKey, backupRegKey, clazz));
    }

    protected static String findBrowserLaunchLocation() {
        String defaultPath = System.getProperty("internetExplorerDefaultPath");
        if (defaultPath == null) {
            defaultPath = WindowsUtils.getProgramFilesPath() + "\\Internet Explorer\\iexplore.exe";
        }
        File defaultLocation = new File(defaultPath);
        if (defaultLocation.exists()) {
            return defaultLocation.getAbsolutePath();
        }
        File iexploreEXE = AsyncExecute.whichExec("iexplore.exe");
    	if (iexploreEXE != null) return iexploreEXE.getAbsolutePath();
    	throw new RuntimeException("Internet Explorer couldn't be found in the path!\n" +
    			"Please add the directory containing iexplore.exe to your PATH environment\n" +
    			"variable, or explicitly specify a path to IE like this:\n" +
    			"*iexplore c:\\blah\\iexplore.exe");
    }
    
    public void launch(String url) {
        try {
            backupRegistrySettings();
            changeRegistrySettings();
            cmdarray = new String[] {commandPath, "-new", url};
            
            System.out.println("Launching Internet Explorer...");
            AsyncExecute exe = new AsyncExecute();
            exe.setCommandline(cmdarray);
            process = exe.asyncSpawn();
            
            
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    

    protected void changeRegistrySettings() throws IOException {
        if (!customPACappropriate) {
            if (WindowsUtils.doesRegistryValueExist(REG_KEY_AUTOCONFIG_URL)) {
                WindowsUtils.deleteRegistryValue(REG_KEY_AUTOCONFIG_URL);
            }
        }
        else {
            customProxyPACDir = LauncherUtils.createCustomProfileDir(sessionId);
            if (customProxyPACDir.exists()) {
                LauncherUtils.recursivelyDeleteDir(customProxyPACDir);
            }
            customProxyPACDir.mkdir();
            
            File proxyPAC = LauncherUtils.makeProxyPAC(customProxyPACDir, port);
            
            System.out.println("Modifying registry settings...");
            
            String newURL = "file://" + proxyPAC.getAbsolutePath().replace('\\', '/');
            WindowsUtils.writeStringRegistryValue(REG_KEY_AUTOCONFIG_URL, newURL);
        }
        
        // Disabling automatic proxy caching
        // http://support.microsoft.com/?kbid=271361
        // Otherwise, *all* requests will go through our proxy, rather than just */selenium-server/* requests
        WindowsUtils.writeBooleanRegistryValue(REG_KEY_AUTOPROXY_RESULT_CACHE, false);
        
        // Disable pop-up blocking
        WindowsUtils.writeStringRegistryValue(REG_KEY_POPUP_MGR, "no");
        
        // TODO Do we want to make these preferences configurable somehow?
        // TODO Disable security warnings
        // TODO Disable "do you want to remember this password?"
    }

    public void backupRegistrySettings() {
        // Don't clobber our old backup if we 
        // never got the chance to restore for some reason 
        if (backupIsReady()) return;
        System.out.println("Backing up registry settings...");
        for (RegKeyBackup key : keys) {
            key.backup();
        }
        backupReady(true);
    }
    
    public void restoreRegistrySettings() {
        // Backup really should be ready, but if not, skip it 
        if (!backupIsReady()) return;
        System.out.println("Restoring registry settings (won't affect running browsers)...");
        for (RegKeyBackup key : keys) {
            key.restore();
        }
        backupReady(false);
    }
    
    private boolean backupIsReady() {
        if (!WindowsUtils.doesRegistryValueExist(REG_KEY_BACKUP_READY)) return false;
        return WindowsUtils.readBooleanRegistryValue(REG_KEY_BACKUP_READY);
    }
    
    private void backupReady(boolean backupReady) {
        WindowsUtils.writeBooleanRegistryValue(REG_KEY_BACKUP_READY, backupReady);
    }
    
    public void close() {
        Exception taskKillException = null;
        restoreRegistrySettings();
        if (false) {
            try {
                // try to kill with windows taskkill
                WindowsUtils.kill(cmdarray);
            } catch (Exception e) {
                taskKillException = e;
            }
        }
        process.destroy();
        if (customPACappropriate) {
            try {
                LauncherUtils.recursivelyDeleteDir(customProxyPACDir);
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
    }
    
    public static void main(String[] args) {
        InternetExplorerCustomProxyLauncher l = new InternetExplorerCustomProxyLauncher(SeleniumServer.DEFAULT_PORT, "CUSTIE");
        l.launch("http://www.google.com/");
        int seconds = 5;
        System.out.println("Killing browser in " + Integer.toString(seconds) + " seconds");
        AsyncExecute.sleepTight(seconds * 1000);
        l.close();
        System.out.println("He's dead now, right?");
    }
    
    /** A data wrapper class to manage backup/restore of registry keys */
    private static class RegKeyBackup {
        private String keyOriginal;
        private String keyBackup;
        private Class type;
        
        public RegKeyBackup(String keyOriginal, String keyBackup, Class type) {
            this.keyOriginal = keyOriginal;
            this.keyBackup = keyBackup;
            this.type = type;
        }
        
        private boolean backupExists() {
            return WindowsUtils.doesRegistryValueExist(keyBackup);
        }
        
        private boolean originalExists() {
            return WindowsUtils.doesRegistryValueExist(keyOriginal);
        }
        
        private void backup() {
            if (originalExists()) {
                copy(keyOriginal, keyBackup);
            } else {
                clear(keyBackup);
            }
        }
        
        private void restore() {
            if (backupExists()) {
                copy(keyBackup, keyOriginal);
            } else {
                clear(keyOriginal);
            }
        }
        
        private void clear(String key) {
            if (WindowsUtils.doesRegistryValueExist(key)) {
                WindowsUtils.deleteRegistryValue(key);
            }
        }
        
        private void copy(String source, String dest) {
            if (type.equals(String.class)) {
                copyString(source, dest);
                return;
            } else if (type.equals(boolean.class)) {
                copyBoolean(source, dest);
                return;
            } else if (type.equals(int.class)) {
                copyInt(source, dest);
                return;
            }
            throw new RuntimeException("Bad type: " + type.getName());
        }
        
        private void copyString(String source, String dest) {
            String data = WindowsUtils.readStringRegistryValue(source);
            WindowsUtils.writeStringRegistryValue(dest, data);
        }
        
        private void copyBoolean(String source, String dest) {
            boolean data = WindowsUtils.readBooleanRegistryValue(source);
            WindowsUtils.writeBooleanRegistryValue(dest, data);
        }
        
        private void copyInt(String source, String dest) {
            int data = WindowsUtils.readIntRegistryValue(source);
            WindowsUtils.writeIntRegistryValue(dest, data);
        }
    }
    
    public void launchHTMLSuite(String suiteUrl, String browserURL) {
        launch(LauncherUtils.getDefaultHTMLSuiteUrl(browserURL, suiteUrl));
    }
    
    public void launchRemoteSession(String browserURL) {
        launch(LauncherUtils.getDefaultRemoteSessionUrl(browserURL, sessionId));
    }
}
