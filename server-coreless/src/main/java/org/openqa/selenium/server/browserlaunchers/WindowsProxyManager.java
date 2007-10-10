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
import java.util.prefs.Preferences;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.SeleniumServer;
import org.openqa.selenium.server.browserlaunchers.WindowsUtils.WindowsRegistryException;

public class WindowsProxyManager {
    static Log log = LogFactory.getLog(WindowsProxyManager.class);
    protected static final String REG_KEY_BACKUP_READY = "BackupReady";
    protected static final String REG_KEY_BACKUP_AUTOCONFIG_URL = "AutoConfigURL";
    protected static final String REG_KEY_BACKUP_MAX_CONNECTIONS_PER_1_0_SVR = "MaxConnectionsPer1_0Server";
    protected static final String REG_KEY_BACKUP_MAX_CONNECTIONS_PER_1_1_SVR = "MaxConnectionsPerServer";
    protected static final String REG_KEY_BACKUP_PROXY_ENABLE = "ProxyEnable";
    protected static final String REG_KEY_BACKUP_PROXY_OVERRIDE = "ProxyOverride";
    protected static final String REG_KEY_BACKUP_PROXY_SERVER = "ProxyServer";
    protected static final String REG_KEY_BACKUP_AUTOPROXY_RESULT_CACHE = "EnableAutoproxyResultCache";
    protected static final String REG_KEY_BACKUP_POPUP_MGR = "PopupMgr";
    protected static final String REG_KEY_BACKUP_USERNAME_PASSWORD_DISABLE = "UsernamePasswordDisable";
    protected static final String REG_KEY_BACKUP_MIME_EXCLUSION_LIST_FOR_CACHE = "MimeExclusionListForCache";

    protected static String REG_KEY_BASE = "HKEY_CURRENT_USER";
    protected static final String REG_KEY_POPUP_MGR = "\\Software\\Microsoft\\Internet Explorer\\New Windows\\PopupMgr";
    protected static final String REG_KEY_USERNAME_PASSWORD_DISABLE = "\\Software\\Microsoft\\Internet Explorer\\Main\\FeatureControl\\FEATURE_HTTP_USERNAME_PASSWORD_DISABLE\\iexplore.exe";
    protected static final String REG_KEY_AUTOCONFIG_URL = "\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\AutoConfigURL";
    protected static final String REG_KEY_MAX_CONNECTIONS_PER_1_0_SVR = "\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\MaxConnectionsPer1_0Server";
    protected static final String REG_KEY_MAX_CONNECTIONS_PER_1_1_SVR = "\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\MaxConnectionsPerServer";
    protected static final String REG_KEY_PROXY_ENABLE = "\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ProxyEnable";
    protected static final String REG_KEY_PROXY_OVERRIDE = "\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ProxyOverride";
    protected static final String REG_KEY_PROXY_SERVER = "\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ProxyServer";
    protected static final String REG_KEY_AUTOPROXY_RESULT_CACHE = "\\Software\\Policies\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\EnableAutoproxyResultCache";
    protected static final String REG_KEY_MIME_EXCLUSION_LIST_FOR_CACHE = "\\Software\\Policies\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\MimeExclusionListForCache";
    protected static final String REG_KEY_WARN_ON_FORM_SUBMIT = "\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3\\1601";

    protected static Class<?> popupMgrType;
    
    private static ArrayList<RegKeyBackup> keys = null;
    private boolean customPACappropriate;
    private String sessionId;
    private File customProxyPACDir;
    private int port;
    private boolean changeMaxConnections;
    private static final Preferences prefs = Preferences.userNodeForPackage(WindowsProxyManager.class);

    public WindowsProxyManager(boolean customPACappropriate, String sessionId, int port) {
        this.customPACappropriate = customPACappropriate;
        this.sessionId = sessionId;
        this.port = port;
        init();
    }
    
    public void setChangeMaxConnections(boolean changeMaxConnections) {
        this.changeMaxConnections = changeMaxConnections;
    }
    
    public boolean getChangeMaxConnections() {
        return changeMaxConnections;
    }
    
    public File getCustomProxyPACDir() {
        return customProxyPACDir;
    }
    
    protected boolean isStaticInitDone() {
        return keys != null;
    }

    protected void initStatic() {
        keys = new ArrayList<RegKeyBackup>();
        handleEvilPopupMgrBackup();
        addRegistryKeyToBackupList(REG_KEY_BASE + REG_KEY_POPUP_MGR, REG_KEY_BACKUP_POPUP_MGR, popupMgrType);
        addRegistryKeyToBackupList(REG_KEY_BASE + REG_KEY_AUTOCONFIG_URL, REG_KEY_BACKUP_AUTOCONFIG_URL, String.class);
        addRegistryKeyToBackupList(REG_KEY_BASE + REG_KEY_AUTOPROXY_RESULT_CACHE, REG_KEY_BACKUP_AUTOPROXY_RESULT_CACHE, boolean.class);
        addRegistryKeyToBackupList(REG_KEY_BASE + REG_KEY_MIME_EXCLUSION_LIST_FOR_CACHE, REG_KEY_BACKUP_MIME_EXCLUSION_LIST_FOR_CACHE, String.class);
        addRegistryKeyToBackupList(REG_KEY_BASE + REG_KEY_MIME_EXCLUSION_LIST_FOR_CACHE, REG_KEY_BACKUP_MIME_EXCLUSION_LIST_FOR_CACHE, String.class);
        addRegistryKeyToBackupList(REG_KEY_BASE + REG_KEY_USERNAME_PASSWORD_DISABLE, REG_KEY_BACKUP_USERNAME_PASSWORD_DISABLE, boolean.class);
        
        // Only needed for proxy injection mode, but always adding to the list to guarantee they get restored correctly
        addRegistryKeyToBackupList(REG_KEY_BASE + REG_KEY_PROXY_ENABLE, REG_KEY_BACKUP_PROXY_ENABLE, boolean.class);
        addRegistryKeyToBackupList(REG_KEY_BASE + REG_KEY_PROXY_OVERRIDE, REG_KEY_BACKUP_PROXY_OVERRIDE, String.class);
        addRegistryKeyToBackupList(REG_KEY_BASE + REG_KEY_PROXY_SERVER, REG_KEY_BACKUP_PROXY_SERVER, String.class);
        addRegistryKeyToBackupList(REG_KEY_BASE + REG_KEY_MAX_CONNECTIONS_PER_1_0_SVR, REG_KEY_BACKUP_MAX_CONNECTIONS_PER_1_0_SVR, int.class);
        addRegistryKeyToBackupList(REG_KEY_BASE + REG_KEY_MAX_CONNECTIONS_PER_1_1_SVR, REG_KEY_BACKUP_MAX_CONNECTIONS_PER_1_1_SVR, int.class);
    }
    protected void init() {
        if (!isStaticInitDone()) {
            initStatic();
        }
    }

    
    // IE7 changed the type of the popup mgr key to DWORD (int/boolean) from String (which could be "yes" or "no")
    protected void handleEvilPopupMgrBackup() {
        // this will return String (REG_SZ), int (REG_DWORD), or null if the key is missing
        popupMgrType = WindowsUtils.discoverRegistryKeyType(REG_KEY_BASE + REG_KEY_POPUP_MGR);
        Class<?> backupPopupMgrType = discoverPrefKeyType(REG_KEY_BACKUP_POPUP_MGR);
        if (popupMgrType == null) { // if official PopupMgr key is missing
            if (backupPopupMgrType == null) {
                // we don't know which type it should be; let's take a guess
                // IE6 can deal with a DWORD 0
                popupMgrType = boolean.class;
                return;
            }
            // non-null backup type is our best guess
            popupMgrType = backupPopupMgrType;
            return;
        }
        if (popupMgrType.equals(backupPopupMgrType)) return;
        
        // if we're here, we know the current type of pop-up manager,
        // and the backup has a different (wrong) type
        if (backupPopupMgrType != null) {
            WindowsUtils.deleteRegistryValue(REG_KEY_BACKUP_POPUP_MGR);
        }
        if (!backupIsReady()) {
            return;
        }
        
        // assume they wanted it off
        turnOffPopupBlocking(REG_KEY_BACKUP_POPUP_MGR);
    }
    
    private static boolean prefNodeExists(String key) {
        return null != prefs.get(key, null);
    }
    
    private Class<?> discoverPrefKeyType(String key) {
        String data = prefs.get(key, null);
        if (data == null) return null;
        if ("true".equals(data) || "false".equals(data)) {
            return boolean.class;
        }
        try {
            Integer.parseInt(data);
            return int.class;
        } catch (NumberFormatException e) {
            return String.class;
        }
    }
    
    protected void turnOffPopupBlocking(String key) {
        if (WindowsUtils.doesRegistryValueExist(key)) {
            WindowsUtils.deleteRegistryValue(key);
        }
        if (popupMgrType.equals(String.class)) {
            WindowsUtils.writeStringRegistryValue(key, "no");
        } else {
            WindowsUtils.writeBooleanRegistryValue(key, false);
        }
    }

    protected void addRegistryKeyToBackupList(String regKey, String backupRegKey, Class<?> clazz) {
        keys.add(new RegKeyBackup(regKey, backupRegKey, clazz));
    }

    public static void setBaseRegKey(String base) {
        REG_KEY_BASE = base;
    }

    protected void changeRegistrySettings() throws IOException {
        customProxyPACDir = LauncherUtils.createCustomProfileDir(sessionId);
        if (customProxyPACDir.exists()) {
            LauncherUtils.recursivelyDeleteDir(customProxyPACDir);
        }
        customProxyPACDir.mkdir();
        if (!customPACappropriate) {
            if (WindowsUtils.doesRegistryValueExist(REG_KEY_BASE + REG_KEY_AUTOCONFIG_URL)) {
                WindowsUtils.deleteRegistryValue(REG_KEY_BASE + REG_KEY_AUTOCONFIG_URL);
            }
            WindowsUtils.writeBooleanRegistryValue(REG_KEY_BASE + REG_KEY_PROXY_ENABLE, true);
            WindowsUtils.writeStringRegistryValue(REG_KEY_BASE + REG_KEY_PROXY_SERVER, "127.0.0.1:" + SeleniumServer.getPortDriversShouldContact());
        } else {
            File proxyPAC = LauncherUtils.makeProxyPAC(customProxyPACDir, port);

            log.info("Modifying registry settings...");

            String newURL = "file://" + proxyPAC.getAbsolutePath().replace('\\', '/');
            WindowsUtils.writeStringRegistryValue(REG_KEY_BASE + REG_KEY_AUTOCONFIG_URL, newURL);
        }

        // Disabling automatic proxy caching
        // http://support.microsoft.com/?kbid=271361
        // Otherwise, *all* requests will go through our proxy, rather than just */selenium-server/* requests
        try {
            WindowsUtils.writeBooleanRegistryValue(REG_KEY_BASE + REG_KEY_AUTOPROXY_RESULT_CACHE, false);
        } catch (WindowsRegistryException ex) {
            log.debug("Couldn't modify autoproxy result cache; this often fails on Vista, but it's merely a nice-to-have", ex);
        }
        
        // Disable caching of html
        try {
            WindowsUtils.writeStringRegistryValue(REG_KEY_BASE + REG_KEY_MIME_EXCLUSION_LIST_FOR_CACHE, "multipart/mixed multipart/x-mixed-replace multipart/x-byteranges text/html");
        } catch (WindowsRegistryException ex) {
            log.debug("Couldn't disable caching of html; this often fails on Vista, but it's merely a nice-to-have", ex);
        }
        
        WindowsUtils.writeBooleanRegistryValue(REG_KEY_BASE + REG_KEY_USERNAME_PASSWORD_DISABLE, false);

        // Disable pop-up blocking
        turnOffPopupBlocking(REG_KEY_BASE + REG_KEY_POPUP_MGR);

        WindowsUtils.writeIntRegistryValue(REG_KEY_BASE + REG_KEY_WARN_ON_FORM_SUBMIT, 0);

        if (WindowsUtils.doesRegistryValueExist(REG_KEY_BASE + REG_KEY_PROXY_OVERRIDE)) {
            WindowsUtils.deleteRegistryValue(REG_KEY_BASE + REG_KEY_PROXY_OVERRIDE);
        }

        if (changeMaxConnections) {
            // need at least 1 xmlHttp connection per frame/window
            WindowsUtils.writeIntRegistryValue(REG_KEY_BASE + REG_KEY_MAX_CONNECTIONS_PER_1_0_SVR, 256);
            WindowsUtils.writeIntRegistryValue(REG_KEY_BASE + REG_KEY_MAX_CONNECTIONS_PER_1_1_SVR, 256);
        }

        // TODO Do we want to make these preferences configurable somehow?
        // TODO Disable security warnings
        // TODO Disable "do you want to remember this password?"
    }

    public void backupRegistrySettings() {
        // Don't clobber our old backup if we 
        // never got the chance to restore for some reason 
        if (backupIsReady()) return;
        log.info("Backing up registry settings...");
        for (RegKeyBackup key : keys) {
            key.backup();
        }
        backupReady(true);
    }

    public void restoreRegistrySettings() {
        // Backup really should be ready, but if not, skip it 
        if (!backupIsReady()) return;
        log.info("Restoring registry settings (won't affect running browsers)...");
        for (RegKeyBackup key : keys) {
            key.restore();
        }
        backupReady(false);
    }

    private boolean backupIsReady() {
        if (!prefNodeExists(REG_KEY_BACKUP_READY)) return false;
        return prefs.getBoolean(REG_KEY_BACKUP_READY, false);
    }

    private void backupReady(boolean backupReady) {
        prefs.putBoolean(REG_KEY_BACKUP_READY, backupReady);
    }
    
    /**
     * A data wrapper class to manage backup/restore of registry keys
     */
    private static class RegKeyBackup {
        private String keyOriginal;
        private String keyBackup;
        private Class<?> type;
        
        
        public RegKeyBackup(String keyOriginal, String keyBackup, Class<?> type) {
            this.keyOriginal = keyOriginal;
            this.keyBackup = keyBackup;
            this.type = type;
        }

        private boolean backupExists() {
            return prefNodeExists(keyBackup);
        }

        private boolean originalExists() {
            return WindowsUtils.doesRegistryValueExist(keyOriginal);
        }

        private void backup() {
            if (originalExists()) {
                if (type.equals(String.class)) {
                    String data = WindowsUtils.readStringRegistryValue(keyOriginal);
                    prefs.put(keyBackup, data);
                    return;
                } else if (type.equals(boolean.class)) {
                    boolean data = WindowsUtils.readBooleanRegistryValue(keyOriginal);
                    prefs.putBoolean(keyBackup, data);
                    return;
                } else if (type.equals(int.class)) {
                    int data = WindowsUtils.readIntRegistryValue(keyOriginal);
                    prefs.putInt(keyBackup, data);
                    return;
                }
                throw new RuntimeException("Bad type: " + type.getName());
            } else {
                prefs.remove(keyBackup);
            }
        }

        private void restore() {
            if (backupExists()) {
                if (type.equals(String.class)) {
                    String data = prefs.get(keyBackup, null);
                    WindowsUtils.writeStringRegistryValue(keyOriginal, data);
                    return;
                } else if (type.equals(boolean.class)) {
                    boolean data = prefs.getBoolean(keyBackup, false);
                    WindowsUtils.writeBooleanRegistryValue(keyOriginal, data);
                    return;
                } else if (type.equals(int.class)) {
                    int data = prefs.getInt(keyBackup, 0);
                    WindowsUtils.writeIntRegistryValue(keyOriginal, data);
                    return;
                }
                throw new RuntimeException("Bad type: " + type.getName());
            } else {
                if (WindowsUtils.doesRegistryValueExist(keyOriginal)) {
                    WindowsUtils.deleteRegistryValue(keyOriginal);
                }
            }
        }
    }

}
