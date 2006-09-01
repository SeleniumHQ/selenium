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
import java.net.*;
import java.util.regex.*;

import org.apache.tools.ant.taskdefs.condition.*;

public class FirefoxChromeLauncher implements BrowserLauncher {

    private static final String DEFAULT_NONWINDOWS_LOCATION = "/Applications/Firefox.app/Contents/MacOS/firefox-bin";

    private static boolean simple = false;

    private int port;
    private String sessionId;
    private File customProfileDir;
    private String[] cmdarray;
    private boolean closed = false;
    private String commandPath;
    private Process process;

    private static AsyncExecute exe = new AsyncExecute();

    public FirefoxChromeLauncher(int port, String sessionId) {
        this(port, sessionId, findBrowserLaunchLocation());
    }

    public FirefoxChromeLauncher(int port, String sessionId, String browserLaunchLocation) {
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

    static final Pattern JAVA_STYLE_UNC_URL = Pattern.compile("^file:////([^/]+/.*)$");

    /**
     * Generates an URL suitable for use in browsers, unlike Java's URLs, which choke
     * on UNC paths.
     * <p/>
     * <P>Java's URLs work in IE, but break in Mozilla.  Mozilla's team snobbily demanded
     * that <I>all</I> file paths must have the empty authority (file:///), even for UNC file paths.
     * On Mozilla \\socrates\build is therefore represented as file://///socrates/build.</P>  See
     * Mozilla bug <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=66194">66194</A>.
     *
     * @param path - the file path to convert to a browser URL
     * @return a nice Mozilla-compatible file URL
     */
    private static String pathToBrowserURL(String path) {
        if (path == null) return null;
        String url = (new File(path)).toURI().toString();
        Matcher m = JAVA_STYLE_UNC_URL.matcher(url);
        if (m.find()) {
            url = "file://///";
            url += m.group(1);
        }
        return url;
    }

    public void launch(String url, String htmlName) {
        try {
            String query = LauncherUtils.getQueryString(url);
            if (null == query) {
                query = "";
            }
            query += "&baseUrl=http://localhost:" + port + "/selenium-server/";
            String homePage = "chrome://src/content/" + htmlName + "?" + query;
            System.out.println(homePage);
            String profilePath = makeCustomProfile(homePage);

            String chromeURL = "chrome://killff/content/kill.html";

            cmdarray = new String[]{commandPath, "-profile", profilePath, chromeURL};

            /* The first time we launch Firefox with an empty profile directory,
     * Firefox will launch itself, populate the profile directory, then
     * kill/relaunch itself, so our process handle goes out of date.
     * So, the first time we launch Firefox, we'll start it up at an URL
     * that will immediately shut itself down. */
            System.out.println("Preparing Firefox profile...");

            exe.setCommandline(cmdarray);
            exe.execute();

            waitForFullProfileToBeCreated(20 * 1000);

            System.out.println("Launching Firefox...");

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

        String sourceLocationName = "customProfileDirCUSTFFCHROME";
        LauncherUtils.copyDirectory(getResourceAsFile(sourceLocationName), customProfileDir);

        copyRunnerHtmlFiles();
        File proxyPAC = LauncherUtils.makeProxyPAC(customProfileDir, port);

        createPrefJs(homePage, proxyPAC);

        return customProfileDir.getAbsolutePath();
    }

    private void createPrefJs(String homePage, File proxyPAC) throws FileNotFoundException {
        // TODO Do we want to make these preferences configurable somehow?
//      TODO: there is redundancy between these settings in the settings in FirefoxChromeLauncher.
        // Those settings should be combined into a single location.

        File prefsJS = new File(customProfileDir, "prefs.js");
        PrintStream out = new PrintStream(new FileOutputStream(prefsJS));
        // Don't ask if we want to switch default browsers
        out.println("user_pref('browser.shell.checkDefaultBrowser', false);");

        // suppress authentication confirmations
        out.println("user_pref('network.http.phishy-userpass-length', 255);");

        out.println("user_pref('startup.homepage_override_url', '" + homePage + "');");

        // Disable pop-up blocking
        out.println("user_pref('browser.allowpopups', true);");
        out.println("user_pref('dom.disable_open_during_load', false);");

        // Configure us as the local proxy
        out.println("user_pref('network.proxy.type', 2);");
        out.println("user_pref('network.proxy.autoconfig_url', '" +
                pathToBrowserURL(proxyPAC.getAbsolutePath()) +
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
    }

    private File getResourceAsFile(String sourceLocationName) {
        return new File(getClass().getClassLoader().getResource(sourceLocationName).getFile());
    }

    private void copyRunnerHtmlFiles() {
        String guid = "{503A0CD4-EDC8-489b-853B-19E0BAA8F0A4}";
        File extensionDir = new File(customProfileDir, "extensions/" + guid);
        File htmlDir = new File(extensionDir, "chrome");
        htmlDir.mkdirs();

        LauncherUtils.extractHTAFile(htmlDir, port, "/core/TestRunner.html", "TestRunner.html");
        LauncherUtils.extractHTAFile(htmlDir, port, "/core/SeleneseRunner.html", "SeleneseRunner.html");

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
            waitForFileLockToGoAway(5 * 000, 500);
        } catch (FileLockRemainedException e1) {
            fileLockException = e1;
        }


        try {
            LauncherUtils.deleteTryTryAgain(customProfileDir, 6);
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

    private class FileLockRemainedException extends Exception {
        FileLockRemainedException(String message) {
            super(message);
        }
    }

    public void launchHTMLSuite(String suiteUrl, String browserURL, boolean multiWindow) {
        System.out.println("========================== Launching ===========================");
        launch("http://localhost:" + port +
                "/selenium-server/core/TestRunner.html?auto=true" +
                "&multiWindow=" + multiWindow +
                "&resultsUrl=http://localhost:" + port +
                "/selenium-server/postResults&test=" + suiteUrl, "TestRunner.html");

    }

    public void launchRemoteSession(String browserURL, boolean multiWindow) {
        launch(LauncherUtils.getDefaultRemoteSessionUrl(browserURL, sessionId, multiWindow), "SeleneseRunner.html");
    }

    public static void main(String[] args) throws Exception {
        FirefoxChromeLauncher l = new FirefoxChromeLauncher(4444, "CUSTFFCHROME");
        l.launch("http://www.google.com", "TestRunner.html");
        int seconds = 15000;
        System.out.println("Killing browser in " + Integer.toString(seconds) + " seconds");
        AsyncExecute.sleepTight(seconds * 1000);
        l.close();
        System.out.println("He's dead now, right?");
    }


}
