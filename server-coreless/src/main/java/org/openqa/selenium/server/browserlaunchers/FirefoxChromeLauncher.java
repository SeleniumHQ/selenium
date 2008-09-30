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
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.ApplicationRegistry;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.browserlaunchers.locators.Firefox2or3Locator;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

public class FirefoxChromeLauncher extends AbstractBrowserLauncher {

    public static final String CHROME_URL = "chrome://killff/content/kill.html";
    private static Log LOGGER = LogFactory.getLog(FirefoxChromeLauncher.class);

    private File customProfileDir;
    private String[] cmdarray;
    private boolean closed = false;
    private BrowserInstallation browserInstallation;
    private Process process;

    private AsyncExecute shell = new AsyncExecute();

    private static boolean changeMaxConnections = false;

    public FirefoxChromeLauncher(RemoteControlConfiguration configuration, String sessionId) {
        this(configuration, sessionId, (String) null);
    }

    public FirefoxChromeLauncher(RemoteControlConfiguration configuration, String sessionId, String browserString) {
        this(configuration, sessionId,
                ApplicationRegistry.instance().browserInstallationCache().locateBrowserInstallation(
                        "chrome", browserString, new Firefox2or3Locator()));
    }

    public FirefoxChromeLauncher(RemoteControlConfiguration configuration, String sessionId, BrowserInstallation browserInstallation) {
        super(sessionId, configuration);

        this.browserInstallation = browserInstallation;

        shell.setLibraryPath(browserInstallation.libraryPath());
        // Set MOZ_NO_REMOTE in order to ensure we always get a new Firefox process
        // http://blog.dojotoolkit.org/2005/12/01/running-multiple-versions-of-firefox-side-by-side
        shell.setEnvironmentVariable("MOZ_NO_REMOTE", "1");
    }

    
    /* (non-Javadoc)
     * @see org.openqa.selenium.server.browserlaunchers.AbstractBrowserLauncher#launch(java.lang.String)
     */
    @Override
    protected void launch(String url) {
        launch(url, null);       
    }

    protected void launch(String url, BrowserConfigurationOptions config) {
        final String profilePath;
        final String homePage;
        String profile = "";

        try {
            homePage = new ChromeUrlConvert().convert(url);
            if (config != null) {
                profile = config.getProfile();
            } 
            profilePath = makeCustomProfile(homePage, profile);
            populateCustomProfileDirectory(profilePath);

            LOGGER.info("Launching Firefox...");
            cmdarray = new String[]{browserInstallation.launcherFilePath(), "-profile", profilePath};
            shell.setCommandline(cmdarray);
            process = shell.asyncSpawn();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void populateCustomProfileDirectory(String profilePath) throws IOException {
        /*
        * The first time we launch Firefox with an empty profile directory,
    * Firefox will launch itself, populate the profile directory, then
    * kill/relaunch itself, so our process handle goes out of date.
    * So, the first time we launch Firefox, we'll start it up at an URL
    * that will immediately shut itself down.
    */
        cmdarray = new String[]{browserInstallation.launcherFilePath(), "-profile", profilePath, "-chrome", CHROME_URL};
        LOGGER.info("Preparing Firefox profile...");
        shell.setCommandline(cmdarray);
        shell.execute();
        waitForFullProfileToBeCreated(20 * 1000);
    }

    private String makeCustomProfile(String homePage, String profile) throws IOException {
        customProfileDir = LauncherUtils.createCustomProfileDir(sessionId);

        String sourceLocationName = "/customProfileDirCUSTFFCHROME";

        File firefoxProfileTemplate = null;
        if (!"".equals(getConfiguration().getProfilesLocation()) && !"".equals(profile)) {
            File profileDirectory = getConfiguration().getProfilesLocation();
            firefoxProfileTemplate = new File(profileDirectory + "/" + profile);
            if (!firefoxProfileTemplate.exists()) {
                throw new RuntimeException("The profile specified '" + firefoxProfileTemplate.getAbsolutePath() + "' does not exist");
            }
        } else  {
            firefoxProfileTemplate = getConfiguration().getFirefoxProfileTemplate();
        }
        
        if (firefoxProfileTemplate != null) {
            LauncherUtils.copyDirectory(firefoxProfileTemplate, customProfileDir);
        }
        ResourceExtractor.extractResourcePath(getClass(), sourceLocationName, customProfileDir);

        copyRunnerHtmlFiles();

        LauncherUtils.generatePacAndPrefJs(customProfileDir, getPort(), LauncherUtils.ProxySetting.NO_PROXY, homePage, changeMaxConnections, getConfiguration());

        return customProfileDir.getAbsolutePath();
    }


    private void copyRunnerHtmlFiles() {
        String guid = "{503A0CD4-EDC8-489b-853B-19E0BAA8F0A4}";
        File extensionDir = new File(customProfileDir, "extensions/" + guid);
        File htmlDir = new File(extensionDir, "chrome");
        htmlDir.mkdirs();

        LauncherUtils.extractHTAFile(htmlDir, getPort(), "/core/TestRunner.html", "TestRunner.html");
        LauncherUtils.extractHTAFile(htmlDir, getPort(), "/core/RemoteRunner.html", "RemoteRunner.html");

    }


    public void close() {
        if (closed) return;
        if (process == null) return;
        LOGGER.info("Killing Firefox...");
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
        int exitValue = AsyncExecute.killProcess(process);
        if (exitValue == 0) {
            LOGGER.warn("Firefox seems to have ended on its own (did we kill the real browser???)");
        }
        try {
            waitForFileLockToGoAway(5 * 000, 500);
        } catch (FileLockRemainedException e1) {
            fileLockException = e1;
        }


        try {
            LauncherUtils.deleteTryTryAgain(customProfileDir, 6);
        } catch (RuntimeException e) {
            if (taskKillException != null || fileLockException != null) {
                LOGGER.error("Couldn't delete custom Firefox profile directory", e);
                LOGGER.error("Perhaps caused by this exception:");
                if (taskKillException != null) LOGGER.error("Perhaps caused by this exception:", taskKillException);
                if (fileLockException != null) LOGGER.error("Perhaps caused by this exception:", fileLockException);
                throw new RuntimeException("Couldn't delete custom Firefox " +
                        "profile directory, presumably because task kill failed; " +
                        "see error LOGGER!", e);
            }
            throw e;
        }
        closed = true;
    }

    public Process getProcess() {
        return process;
    }

    /**
     * Firefox knows it's running by using a "parent.lock" file in
     * the profile directory.  Wait for this file to go away (and stay gone)
     *
     * @param timeout    max time to wait for the file to go away
     * @param timeToWait minimum time to wait to make sure the file is gone
     * @throws FileLockRemainedException
     */
    private void waitForFileLockToGoAway(long timeout, long timeToWait) throws FileLockRemainedException {
        File lock = new File(customProfileDir, "parent.lock");
        for (long start = System.currentTimeMillis(); System.currentTimeMillis() < start + timeout;) {
            AsyncExecute.sleepTight(500);
            if (!lock.exists() && makeSureFileLockRemainsGone(lock, timeToWait)) return;
        }
        if (lock.exists()) throw new FileLockRemainedException("Lock file still present! " + lock.getAbsolutePath());
    }

    /**
     * When initializing the profile, Firefox rapidly starts, stops, restarts and
     * stops again; we need to wait a bit to make sure the file lock is really gone.
     *
     * @param lock       the parent.lock file in the profile directory
     * @param timeToWait minimum time to wait to see if the file shows back
     *                   up again. This is not a timeout; we will always wait this amount of time or more.
     * @return true if the file stayed gone for the entire timeToWait; false if the
     *         file exists (or came back)
     */
    private boolean makeSureFileLockRemainsGone(File lock, long timeToWait) {
        for (long start = System.currentTimeMillis(); System.currentTimeMillis() < start + timeToWait;) {
            AsyncExecute.sleepTight(500);
            if (lock.exists()) return false;
        }
        return !lock.exists();
    }

    /**
     * Wait for one of the Firefox-generated files to come into existence, then wait
     * for Firefox to exit
     *
     * @param timeout the maximum amount of time to wait for the profile to be created
     */
    private void waitForFullProfileToBeCreated(long timeout) {
        // This will be a characteristic file in the profile
        File testFile = new File(customProfileDir, "extensions.ini");
        long start = System.currentTimeMillis();
        for (; System.currentTimeMillis() < start + timeout;) {

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

    public static void setChangeMaxConnections(boolean changeMaxConnections) {
        FirefoxChromeLauncher.changeMaxConnections = changeMaxConnections;
    }

    private class FileLockRemainedException extends Exception {
        FileLockRemainedException(String message) {
            super(message);
        }
    }

    public static class ChromeUrlConvert {
        public String convert(String httpUrl) throws MalformedURLException {
            String query = LauncherUtils.getQueryString(httpUrl);
            String file = new File(new URL(httpUrl).getPath()).getName();
            return "chrome://src/content/" + file + "?" + query;
        }
    }

    @Override // need to specify an absolute resultsUrl
    public void launchHTMLSuite(String suiteUrl, String browserURL, boolean multiWindow, String defaultLogLevel) {
        launch(LauncherUtils.getDefaultHTMLSuiteUrl(browserURL, suiteUrl, multiWindow, getPort(), defaultLogLevel), null);
    }
    
    @Override // need to specify an absolute driverUrl
    public void launchRemoteSession(String browserURL, boolean multiWindow, BrowserConfigurationOptions config) { 
        launch(LauncherUtils.getDefaultRemoteSessionUrl(browserURL, sessionId, multiWindow, getPort()), config);
    }

}

