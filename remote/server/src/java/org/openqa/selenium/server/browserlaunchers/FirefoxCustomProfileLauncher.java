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

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.server.ApplicationRegistry;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.browserlaunchers.locators.Firefox2or3Locator;

public class FirefoxCustomProfileLauncher extends AbstractBrowserLauncher {

    private static final Log LOGGER = LogFactory.getLog(FirefoxCustomProfileLauncher.class);

    private boolean closed = false;
    private BrowserInstallation browserInstallation;
    private Process process;
    
    private static boolean alwaysChangeMaxConnections = false;
    protected boolean changeMaxConnections = alwaysChangeMaxConnections;

    private AsyncExecute shell = new AsyncExecute();

    public FirefoxCustomProfileLauncher(BrowserConfigurationOptions browserOptions, RemoteControlConfiguration configuration, String sessionId, String browserLaunchLocation) throws InvalidBrowserExecutableException {
        this(browserOptions, configuration,
                sessionId, ApplicationRegistry.instance().browserInstallationCache().locateBrowserInstallation(
                        "firefoxproxy", browserLaunchLocation, new Firefox2or3Locator()));
        if (browserInstallation == null) {
          throw new InvalidBrowserExecutableException("The specified path to the browser executable is invalid.");
        }
    }

    public FirefoxCustomProfileLauncher(BrowserConfigurationOptions browserOptions, RemoteControlConfiguration configuration, String sessionId, BrowserInstallation browserInstallation) {
        super(sessionId, configuration, browserOptions);
        browserOptions.setProxyEverything(false);
        browserOptions.setAvoidProxy(true);
        browserOptions.setOnlyProxySeleniumTraffic(true);
        init();
        this.browserInstallation = browserInstallation;
        shell.setLibraryPath(browserInstallation.libraryPath());
        // Set MOZ_NO_REMOTE in order to ensure we always get a new Firefox process
        // http://blog.dojotoolkit.org/2005/12/01/running-multiple-versions-of-firefox-side-by-side
        shell.setEnvironmentVariable("MOZ_NO_REMOTE", "1");
    }

    protected void init() {
    }
      
    protected void launch(String url) {
        try {

            LOGGER.debug("customProfileDir = " + customProfileDir());
            makeCustomProfile(customProfileDir());

            String chromeURL = "chrome://killff/content/kill.html";

            String[] cmdarray = new String[]{browserInstallation.launcherFilePath(), "-profile", customProfileDir().getAbsolutePath(), "-chrome", chromeURL};

            /* The first time we launch Firefox with an empty profile directory,
     * Firefox will launch itself, populate the profile directory, then
     * kill/relaunch itself, so our process handle goes out of date.
     * So, the first time we launch Firefox, we'll start it up at an URL
     * that will immediately shut itself down. */
            LOGGER.info("Preparing Firefox profile...");

            shell.setCommandline(cmdarray);
            shell.execute();


            waitForFullProfileToBeCreated(20 * 1000);

            LOGGER.info("Launching Firefox...");
            cmdarray = new String[]{browserInstallation.launcherFilePath(), "-profile", customProfileDir().getAbsolutePath(), url};

            shell.setCommandline(cmdarray);

            process = shell.asyncSpawn();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void makeCustomProfile(File customProfileDirectory) throws IOException {
        File firefoxProfileTemplate = browserConfigurationOptions.getFile("firefoxProfileTemplate");
        if (firefoxProfileTemplate != null) {
            LauncherUtils.copyDirectory(firefoxProfileTemplate, customProfileDir);
        }
        ResourceExtractor.extractResourcePath(getClass(), "/customProfileDirCUSTFF", customProfileDir);

        // Make sure that cert8.db of firefoxProfileTemplate is stored into customProfileDir 
        if (firefoxProfileTemplate != null) {
            LauncherUtils.copySingleFileWithOverwrite(new File(firefoxProfileTemplate, "cert8.db"), new File(customProfileDir, "cert8.db"), true);
        }

        LauncherUtils.generatePacAndPrefJs(customProfileDirectory, getPort(), null, changeMaxConnections, getTimeout(), browserConfigurationOptions);
    }

    /** Implementation identical to that in FirefoxChromeLauncher. **/
    //TODO(jbevan): refactor?
    public void close() {
        if (closed) return;
        FileLockRemainedException fileLockException = null;
        if (process != null) {
            try {
              killFirefoxProcess();
            } catch (FileLockRemainedException flre) {
              fileLockException = flre;
            }
        }
        if (customProfileDir != null) {
            try {
                removeCustomProfileDir();
            } catch (RuntimeException e) {
                if (fileLockException != null) {
                    LOGGER.error("Couldn't delete custom Firefox profile directory", e);
                    LOGGER.error("Perhaps caused by this exception:");
                    if (fileLockException != null) LOGGER.error("Perhaps caused by this exception:", fileLockException);
                    throw new RuntimeException("Couldn't delete custom Firefox " +
                            "profile directory, presumably because task kill failed; " +
                            "see error LOGGER!", e);
                }
                throw e;
            }
        }
        closed = true;
    }
    
    /** Wrapper to allow for stubbed-out testing **/
    protected void removeCustomProfileDir() throws RuntimeException {
        LauncherUtils.deleteTryTryAgain(customProfileDir, 6);
    }

    /** Wrapper to allow for stubbed-out testing **/
    protected void killFirefoxProcess() throws FileLockRemainedException {
        LOGGER.info("Killing Firefox...");
        int exitValue = AsyncExecute.killProcess(process);
        if (exitValue == 0) {
            LOGGER.warn("Firefox seems to have ended on its own (did we kill the real browser???)");
        }
        waitForFileLockToGoAway(0, 500);
    }
    
    // visible for testing
    protected void setCustomProfileDir(File value) {
      customProfileDir = value;
    }
    
    // visible for testing
    protected void setProcess(Process p) {
      process = p;
    }

    public Process getProcess() {
        return process;
    }

    private File customProfileDir = null;

    private File customProfileDir() {
        if (customProfileDir == null) {
            customProfileDir = LauncherUtils.createCustomProfileDir(sessionId);
        }
        return customProfileDir;
    }

    /**
     * Firefox knows it's running by using a "parent.lock" file in
     * the profile directory.  Wait for this file to go away (and stay gone)
     *
     * @param timeout    max time to wait for the file to go away
     * @param timeToWait minimum time to wait to make sure the file is gone
     * @throws FileLockRemainedException Wehn the lock file is still present.
     */
    private void waitForFileLockToGoAway(long timeout, long timeToWait) throws FileLockRemainedException {
        File lock = new File(customProfileDir(), "parent.lock");
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
        File testFile = new File(customProfileDir(), "extensions.ini");
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

    protected class FileLockRemainedException extends Exception {
        FileLockRemainedException(String message) {
            super(message);
        }
    }

    public static void setChangeMaxConnections(boolean changeMaxConnections) {
        FirefoxCustomProfileLauncher.alwaysChangeMaxConnections = changeMaxConnections;
    }
}
