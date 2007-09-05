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
import java.net.MalformedURLException;
import java.net.URL;

import org.apache.commons.logging.Log;
import org.apache.tools.ant.taskdefs.condition.Os;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.SeleniumServer;

public class FirefoxChromeLauncher extends AbstractBrowserLauncher {

    static Log log = LogFactory.getLog(FirefoxChromeLauncher.class);
    private static final String DEFAULT_NONWINDOWS_LOCATION = "/Applications/Firefox.app/Contents/MacOS/firefox-bin";

    private static boolean simple = false;

    private int port;
    private File customProfileDir;
    private String[] cmdarray;
    private boolean closed = false;
    private String commandPath;
    private Process process;

    private static AsyncExecute exe = new AsyncExecute();

    private static boolean changeMaxConnections = false;

    public FirefoxChromeLauncher(int port, String sessionId) {
        this(port, sessionId, findBrowserLaunchLocation());
    }

    public FirefoxChromeLauncher(int port, String sessionId, String browserLaunchLocation) {
        super(sessionId);
        commandPath = browserLaunchLocation;
        this.port = port;
        this.sessionId = sessionId;
        // Set MOZ_NO_REMOTE in order to ensure we always get a new Firefox process
        // http://blog.dojotoolkit.org/2005/12/01/running-multiple-versions-of-firefox-side-by-side
        exe.setEnvironment(new String[]{"MOZ_NO_REMOTE=1"});
        if (!WindowsUtils.thisIsWindows()) {
            // On unix, add command's directory to LD_LIBRARY_PATH
            File firefoxBin = AsyncExecute.whichExec(commandPath);
            if (firefoxBin == null) {
                File execDirect = new File(commandPath);
                if (execDirect.isAbsolute() && execDirect.exists()) firefoxBin = execDirect;
            }
            if (firefoxBin != null) {
                LauncherUtils.assertNotScriptFile(firefoxBin);
                String libPathKey = getLibPathKey();
                String libPath = WindowsUtils.loadEnvironment().getProperty(libPathKey);
                exe.setEnvironment(new String[]{
                        "MOZ_NO_REMOTE=1",
                        libPathKey + "=" + libPath + ":" + firefoxBin.getParent(),
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
        }
        if (WindowsUtils.thisIsWindows()) {
            File firefoxEXE = AsyncExecute.whichExec("firefox.exe");
            if (firefoxEXE != null) return firefoxEXE.getAbsolutePath();
            throw new RuntimeException("Firefox couldn't be found in the path!\n" +
                    "Please add the directory containing firefox.exe to your PATH environment\n" +
                    "variable, or explicitly specify a path to Firefox like this:\n" +
                    "*firefox c:\\blah\\firefox.exe");
        }
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

    protected void launch(String url) {
        try {        
            String homePage = new ChromeUrlConvert().convert(url, port);
            String profilePath = makeCustomProfile(homePage);

            String chromeURL = "chrome://killff/content/kill.html";

            cmdarray = new String[]{commandPath, "-profile", profilePath, "-chrome", chromeURL};

            /* The first time we launch Firefox with an empty profile directory,
     * Firefox will launch itself, populate the profile directory, then
     * kill/relaunch itself, so our process handle goes out of date.
     * So, the first time we launch Firefox, we'll start it up at an URL
     * that will immediately shut itself down. */
            log.info("Preparing Firefox profile...");

            exe.setCommandline(cmdarray);
            exe.execute();

            waitForFullProfileToBeCreated(20 * 1000);

            log.info("Launching Firefox...");

            cmdarray = new String[]{commandPath, "-profile", profilePath};
            exe.setCommandline(cmdarray);
            process = exe.asyncSpawn();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }


    private String makeCustomProfile(String homePage) throws IOException {
        customProfileDir = LauncherUtils.createCustomProfileDir(sessionId);
        if (simple) return customProfileDir.getAbsolutePath();

        String sourceLocationName = "/customProfileDirCUSTFFCHROME";
        File firefoxProfileTemplate = SeleniumServer.getFirefoxProfileTemplate(); 
        if (firefoxProfileTemplate != null) {
            LauncherUtils.copyDirectory(firefoxProfileTemplate, customProfileDir);
        }
        ResourceExtractor.extractResourcePath(getClass(), sourceLocationName, customProfileDir);

        copyRunnerHtmlFiles();

        LauncherUtils.generatePacAndPrefJs(customProfileDir, port, LauncherUtils.ProxySetting.NO_PROXY, homePage, changeMaxConnections);

        return customProfileDir.getAbsolutePath();
    }


    private void copyRunnerHtmlFiles() {
        String guid = "{503A0CD4-EDC8-489b-853B-19E0BAA8F0A4}";
        File extensionDir = new File(customProfileDir, "extensions/" + guid);
        File htmlDir = new File(extensionDir, "chrome");
        htmlDir.mkdirs();

        LauncherUtils.extractHTAFile(htmlDir, port, "/core/TestRunner.html", "TestRunner.html");
        LauncherUtils.extractHTAFile(htmlDir, port, "/core/RemoteRunner.html", "RemoteRunner.html");

    }


    public void close() {
        if (closed) return;
        if (process == null) return;
        log.info("Killing Firefox...");
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
            log.warn("Firefox seems to have ended on its own (did we kill the real browser???)");
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
                log.error("Couldn't delete custom Firefox profile directory", e);
                log.error("Perhaps caused by this exception:");
                if (taskKillException != null) log.error("Perhaps caused by this exception:", taskKillException);
                if (fileLockException != null) log.error("Perhaps caused by this exception:", fileLockException);
                throw new RuntimeException("Couldn't delete custom Firefox " +
                        "profile directory, presumably because task kill failed; " +
                        "see error log!", e);
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
        if (!lock.exists()) return true;
        return false;
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
        public String convert(String httpUrl, int port) throws MalformedURLException {
            String query = LauncherUtils.getQueryString(httpUrl);
            String file = new File(new URL(httpUrl).getPath()).getName();
            return "chrome://src/content/" + file + "?" + query;
        }
    }

    public static void main(String[] args) throws Exception {
        FirefoxChromeLauncher l = new FirefoxChromeLauncher(4444, "CUSTFFCHROME");
        l.launch("http://www.google.com");
        int seconds = 15000;
        System.out.println("Killing browser in " + Integer.toString(seconds) + " seconds");
        AsyncExecute.sleepTight(seconds * 1000);
        l.close();
        System.out.println("He's dead now, right?");
    }

    @Override // need to specify an absolute resultsUrl
    public void launchHTMLSuite(String suiteUrl, String browserURL, boolean multiWindow, String defaultLogLevel) {
        launch(LauncherUtils.getDefaultHTMLSuiteUrl(browserURL, suiteUrl, multiWindow, port, defaultLogLevel));
    }
    
    @Override // need to specify an absolute driverUrl
    public void launchRemoteSession(String browserURL, boolean multiWindow) { 
        launch(LauncherUtils.getDefaultRemoteSessionUrl(browserURL, sessionId, multiWindow, port));
    }

}

