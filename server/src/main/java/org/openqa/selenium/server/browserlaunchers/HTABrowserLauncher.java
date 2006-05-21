/*
 * Created on May 14, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import java.io.*;

public class HTABrowserLauncher implements BrowserLauncher {

    private int port;
    private String sessionId;
    private File dir;
    private String commandPath;
    private Process process;

    public HTABrowserLauncher() {
        commandPath = findBrowserLaunchLocation();
    }
    
    public HTABrowserLauncher(int port, String sessionId) {
        commandPath = findBrowserLaunchLocation();
        this.port = port;
        this.sessionId = sessionId;
    }
    
    public HTABrowserLauncher(int port, String sessionId, String browserLaunchLocation) {
        commandPath = browserLaunchLocation;
        this.port = port;
        this.sessionId = sessionId;
    }
    
    private static String findBrowserLaunchLocation() {
        String defaultPath = System.getProperty("mshtaDefaultPath");
        if (defaultPath == null) {
            defaultPath = WindowsUtils.findSystemRoot() + "\\system32\\mshta.exe";
        }
        File defaultLocation = new File(defaultPath);
        if (defaultLocation.exists()) {
            return defaultLocation.getAbsolutePath();
        }
        File mshtaEXE = AsyncExecute.whichExec("mshta.exe");
        if (mshtaEXE != null) return mshtaEXE.getAbsolutePath();
        throw new RuntimeException("MSHTA.exe couldn't be found in the path!\n" +
                "Please add the directory containing mshta.exe to your PATH environment\n" +
                "variable, or explicitly specify a path to mshta.exe like this:\n" +
                "*mshta c:\\blah\\mshta.exe");
    }

    private void launch(String url, String htaName) {
        String query = LauncherUtils.getQueryString(url);
        if (null == query) {
            query = "";
        }
        query += "&baseUrl=http://localhost:" + port + "/selenium-server/";
        createHTAFiles();
        String hta = (new File(dir, htaName)).getAbsolutePath();
        System.out.println("Launching Internet Explorer HTA...");
        AsyncExecute exe = new AsyncExecute();
        exe.setCommandline(new String[] {commandPath, hta, query});
        try {
            process = exe.asyncSpawn();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    
    private void createHTAFiles() {
        dir = LauncherUtils.createCustomProfileDir(sessionId);
        LauncherUtils.extractHTAFile(dir, port, "/core/TestRunner.html", "TestRunner.hta");
        LauncherUtils.extractHTAFile(dir, port, "/core/SeleneseRunner.html", "SeleneseRunner.hta");
    }

    public void close() {
        process.destroy();
        LauncherUtils.recursivelyDeleteDir(dir);
    }
    
    public void launchHTMLSuite(String suiteUrl, String browserURL) {
        throw new UnsupportedOperationException("HTA mode doesn't support running Selenium tests under Selenium RC.\n" +
                "Just run the tests in HTA mode with Selenium Core!");
        //launch(LauncherUtils.getDefaultHTMLSuiteUrl(browserURL, suiteUrl), "TestRunner.hta");
    }
    
    public void launchRemoteSession(String browserURL) {
        launch(LauncherUtils.getDefaultRemoteSessionUrl(browserURL, sessionId), "SeleneseRunner.hta");
    }

}
