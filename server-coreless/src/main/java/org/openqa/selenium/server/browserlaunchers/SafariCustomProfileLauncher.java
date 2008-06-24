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
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;

import java.io.*;


public class SafariCustomProfileLauncher extends AbstractBrowserLauncher {

    static Log log = LogFactory.getLog(SafariCustomProfileLauncher.class);

    private static final String REDIRECT_TO_GO_TO_SELENIUM = "redirect_to_go_to_selenium.htm";

    //    private int port;
    private File customProfileDir;
    private String[] cmdarray;
    private boolean closed = false;
    private String commandPath;
    private Process process;
    protected WindowsProxyManager wpm;
    protected MacProxyManager mpm;
    private File backedUpCookieFile;
    private File originalCookieFile;
    private String originalCookieFilePath;

    private static AsyncExecute exe = new AsyncExecute();

    public SafariCustomProfileLauncher(RemoteControlConfiguration configuration, String sessionId) {
        this(configuration, sessionId, SafariLocator.findBrowserLaunchLocation());
    }

    public SafariCustomProfileLauncher(RemoteControlConfiguration configuration, String sessionId, String browserLaunchLocation) {
        super(sessionId, configuration);
        this.sessionId = sessionId;
        commandPath = browserLaunchLocation;

        if (configuration.shouldOverrideSystemProxy()) {
            createSystemProxyManager(sessionId);
        }
        setLibraryPath();

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

            cmdarray = new String[]{commandPath};
            if (Os.isFamily("mac")) {
                final String redirectHtmlFileName;

                redirectHtmlFileName = makeRedirectionHtml(customProfileDir, url);
                log.info("Launching Safari to visit '" + url + "' via '" + redirectHtmlFileName + "'...");
                cmdarray = new String[]{commandPath, redirectHtmlFileName};
            } else {
                log.info("Launching Safari ...");
                cmdarray = new String[]{commandPath, "-url", url};
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

    private void setLibraryPath() {
        if (!WindowsUtils.thisIsWindows()) {
            // On unix, add command's directory to LD_LIBRARY_PATH
            File SafariBin = AsyncExecute.whichExec(commandPath);
            if (SafariBin == null) {
                File execDirect = new File(commandPath);
                if (execDirect.isAbsolute() && execDirect.exists()) {
                    SafariBin = execDirect;
                }
            }
            if (SafariBin != null) {
                String libPathKey = SystemUtils.libraryPathEnvironmentVariable();
                String libPath = WindowsUtils.loadEnvironment().getProperty(libPathKey);
                exe.setEnvironment(new String[]{
                        libPathKey + "=" + libPath + ":" + SafariBin.getParent(),
                });
            }
        }
    }
    
}
