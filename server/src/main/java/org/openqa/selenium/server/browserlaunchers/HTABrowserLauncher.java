/*
 * Created on May 14, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import java.io.*;
import java.net.*;

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

    public void launch(String url) {
        String query = getQueryString(url);
        if (null == query) {
            query = "";
        }
        query += "&baseUrl=http://localhost:" + port + "/selenium-server/";
        String hta = createHTAFile();
        System.out.println("Launching Internet Explorer HTA...");
        AsyncExecute exe = new AsyncExecute();
        exe.setCommandline(new String[] {commandPath, hta, query});
        try {
            process = exe.asyncSpawn();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    
    private String createHTAFile() {
        dir = LauncherUtils.createCustomProfileDir(sessionId);
        InputStream input = HTABrowserLauncher.class.getResourceAsStream("/core/SeleneseRunner.html");
        BufferedReader br = new BufferedReader(new InputStreamReader(input));
        File hta = new File(dir, "SeleneseRunner.hta");
        try {
            FileWriter fw = new FileWriter(hta);
            String line = br.readLine();
            fw.write(line);
            fw.write('\n');
            fw.write("<base href=\"http://localhost:" + port + "/selenium-server/core/\">");
            while ((line = br.readLine()) != null) {
                fw.write(line);
                fw.write('\n');
            }
            fw.flush();
            fw.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return hta.getAbsolutePath();
    }
    
    private String getQueryString(String url) {
        try {
            URL u = new URL(url);
            String query = u.getQuery();
            return query;
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }

    public void close() {
        process.destroy();
        LauncherUtils.recursivelyDeleteDir(dir);
    }

}
