/*
 * Created on May 14, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import java.io.*;

import org.apache.commons.logging.Log;
import org.apache.tools.ant.util.*;
import org.mortbay.log.LogFactory;

public class HTABrowserLauncher implements BrowserLauncher {

    static Log log = LogFactory.getLog(HTABrowserLauncher.class);
    private int port;
    private String sessionId;
    private File dir;
    private String htaCommandPath;
    private Process htaProcess;
    private Process iexploreProcess;

    public HTABrowserLauncher() {
        htaCommandPath = findHTALaunchLocation();
    }
    
    public HTABrowserLauncher(int port, String sessionId) {
        htaCommandPath = findHTALaunchLocation();
        this.port = port;
        this.sessionId = sessionId;
    }
    
    public HTABrowserLauncher(int port, String sessionId, String browserLaunchLocation) {
        htaCommandPath = browserLaunchLocation;
        this.port = port;
        this.sessionId = sessionId;
    }
    
    private static String findHTALaunchLocation() {
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
        query += "&baseUrl=http://localhost:" + port + "/selenium-server/";
        createHTAFiles();
        String hta = (new File(dir, "core/" + htaName)).getAbsolutePath();
        log.info("Launching Embedded Internet Explorer...");
        AsyncExecute exe = new AsyncExecute();
        exe.setCommandline(new String[] {InternetExplorerCustomProxyLauncher.findBrowserLaunchLocation(), "-Embedding"});
        try {
            iexploreProcess = exe.asyncSpawn();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        log.info("Launching Internet Explorer HTA...");
        AsyncExecute htaExe = new AsyncExecute();
        htaExe.setCommandline(new String[] {htaCommandPath, hta, query});
        try {
            htaProcess = htaExe.asyncSpawn();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    
    private void createHTAFiles() {
        dir = LauncherUtils.createCustomProfileDir(sessionId);
        File coreDir = new File(dir, "core");
        try {
            coreDir.mkdirs();
            ResourceExtractor.extractResourcePath(HTABrowserLauncher.class, "/core", coreDir);
            FileUtils f = FileUtils.getFileUtils();
            File selRunnerSrc = new File(coreDir, "RemoteRunner.html");
            File selRunnerDest = new File(coreDir, "RemoteRunner.hta");
            File testRunnerSrc = new File(coreDir, "TestRunner.html");
            File testRunnerDest = new File(coreDir, "TestRunner.hta");
            f.copyFile(selRunnerSrc, selRunnerDest);
            f.copyFile(testRunnerSrc, testRunnerDest);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        
        
    }

    public void close() {
    	if (iexploreProcess != null) {
    		int exitValue = AsyncExecute.killProcess(iexploreProcess);
            if (exitValue == 0) {
                log.warn("Embedded iexplore seems to have ended on its own (did we kill the real browser???)");
            }
    	}
    	if (htaProcess == null) return;
    	AsyncExecute.killProcess(htaProcess);
        LauncherUtils.recursivelyDeleteDir(dir);
    }

    public Process getProcess() {
        return htaProcess;
    }

    public void launchHTMLSuite(String suiteUrl, String browserURL, boolean multiWindow, String defaultLogLevel) {
        launch(LauncherUtils.getDefaultHTMLSuiteUrl(browserURL, suiteUrl, multiWindow, port, defaultLogLevel), "TestRunner.hta");
    }
    
    public void launchRemoteSession(String browserURL, boolean multiWindow) {
        launch(LauncherUtils.getDefaultRemoteSessionUrl(browserURL, sessionId, multiWindow, port), "RemoteRunner.hta");
    }

}
