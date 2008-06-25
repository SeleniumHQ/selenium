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

import org.apache.commons.logging.Log;
import org.apache.tools.ant.taskdefs.condition.Os;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.ApplicationRegistry;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;
import org.openqa.selenium.server.browserlaunchers.locators.SafariLocator;

import java.io.*;


public class SafariCustomProfileLauncher extends AbstractBrowserLauncher {

    static Log log = LogFactory.getLog(SafariCustomProfileLauncher.class);

    private static final String REDIRECT_TO_GO_TO_SELENIUM = "redirect_to_go_to_selenium.htm";

    //    private int port;
    private File customProfileDir;
    private String[] cmdarray;
    private boolean closed = false;
    private BrowserInstallation browserInstallation;
    private Process process;
    protected WindowsProxyManager wpm;
    protected MacProxyManager mpm;
    private File backedUpCookieFile;
    private File originalCookieFile;
    private String originalCookieFilePath;

    private static AsyncExecute exe = new AsyncExecute();

    public SafariCustomProfileLauncher(RemoteControlConfiguration configuration, String sessionId) {
        this(configuration, sessionId, (String) null);
    }

    public SafariCustomProfileLauncher(RemoteControlConfiguration configuration, String sessionId, String browserLaunchLocation) {
        this(configuration, sessionId, ApplicationRegistry.instance().browserInstallationCache().locateBrowserInstallation("safari", browserLaunchLocation, new SafariLocator()));
    }

    public SafariCustomProfileLauncher(RemoteControlConfiguration configuration, String sessionId, BrowserInstallation browserInstallation) {
        super(sessionId, configuration);
        this.browserInstallation = browserInstallation;

        if (configuration.shouldOverrideSystemProxy()) {
            createSystemProxyManager(sessionId);
        }
        exe.setLibraryPath(browserInstallation.libraryPath());
        customProfileDir = LauncherUtils.createCustomProfileDir(sessionId);
    }

    protected void launch(String url) {
        try {
            if (getConfiguration().shouldOverrideSystemProxy()) {
                setupSystemProxy();
            }
            if (SeleniumServer.isEnsureCleanSession()) {
                ensureCleanSession();
            }

            cmdarray = new String[]{browserInstallation.launcherFilePath()};
            if (Os.isFamily("mac")) {
                final String redirectHtmlFileName;

                redirectHtmlFileName = makeRedirectionHtml(customProfileDir, url);
                log.info("Launching Safari to visit '" + url + "' via '" + redirectHtmlFileName + "'...");
                cmdarray = new String[]{browserInstallation.launcherFilePath(), redirectHtmlFileName};
            } else {
                log.info("Launching Safari ...");
                cmdarray = new String[]{browserInstallation.launcherFilePath(), "-url", url};
            }

            exe.setCommandline(cmdarray);
            process = exe.asyncSpawn();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void close() {
        final int exitValue;

        if (closed) {
            return;
        }
        if (getConfiguration().shouldOverrideSystemProxy()) {
          restoreSystemProxy();
        }
        
        if (process == null) {
            return;
        }
        log.info("Killing Safari...");
        exitValue = AsyncExecute.killProcess(process);
        if (exitValue == 0) {
            log.warn("Safari seems to have ended on its own (did we kill the real browser???)");
        }
        closed = true;

        if (backedUpCookieFile != null && backedUpCookieFile.exists()) {
            File sessionCookieFile = new File(originalCookieFilePath);
            boolean success = sessionCookieFile.delete();
            if (success) {
                log.info("Session's cookie file deleted.");
            } else {
                log.info("Session's cookie *not* deleted.");
            }
            log.info("Trying to restore originalCookieFile...");
            originalCookieFile = new File(originalCookieFilePath);
            LauncherUtils.copySingleFile(backedUpCookieFile, originalCookieFile);
        }
    }

    private void ensureCleanSession() {
        // see: http://www.macosxhints.com/article.php?story=20051107093733174&lsrc=osxh
        if (Os.isFamily("mac")) {
            String user = System.getenv("USER");
            File cacheDir = new File("/Users/" + user + "/Library/Caches/Safari");
            originalCookieFilePath = "/Users/" + user + "/Library/Cookies" + "/Cookies.plist";
            originalCookieFile = new File(originalCookieFilePath);

            LauncherUtils.deleteTryTryAgain(cacheDir, 6);
        } else {
            originalCookieFilePath = System.getenv("APPDATA") + "/Apple Computer/Safari/Cookies/Cookies.plist";
            originalCookieFile = new File(originalCookieFilePath);
            String localAppData = System.getenv("LOCALAPPDATA");
            if (localAppData == null) {
                localAppData = System.getenv("USERPROFILE") + "/Local Settings/Application Data";
            }
            File cacheFile = new File(localAppData + "/Apple Computer/Safari/Cache.db");
            if (cacheFile.exists()) {
                cacheFile.delete();
            }
        }

        log.info("originalCookieFilePath: " + originalCookieFilePath);

        String backedUpCookieFilePath = customProfileDir.toString() + "/Cookies.plist";
        backedUpCookieFile = new File(backedUpCookieFilePath);
        log.info("backedUpCookieFilePath: " + backedUpCookieFilePath);

        if (originalCookieFile.exists()) {
            LauncherUtils.copySingleFile(originalCookieFile, backedUpCookieFile);
            originalCookieFile.delete();
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


    public Process getProcess() {
        return process;
    }

    private void setupSystemProxy() throws IOException {
        if (WindowsUtils.thisIsWindows()) {
            wpm.backupRegistrySettings();
            changeRegistrySettings();
        } else {
            mpm.backupNetworkSettings();
            mpm.changeNetworkSettings();
        }
    }

    private void restoreSystemProxy() {
        if (WindowsUtils.thisIsWindows()) {
            wpm.restoreRegistrySettings();
        } else {
            mpm.restoreNetworkSettings();
        }
    }

    protected void changeRegistrySettings() throws IOException {
        wpm.changeRegistrySettings();
    }

    private void createSystemProxyManager(String sessionId) {
        if (WindowsUtils.thisIsWindows()) {
            wpm = new WindowsProxyManager(true, sessionId, getPort(), getPort());
        } else {
            mpm = new MacProxyManager(sessionId, getPort());
        }
    }

}
