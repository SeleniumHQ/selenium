
package org.openqa.selenium.server.browserlaunchers;

import java.io.*;
import java.net.*;

import org.apache.tools.ant.*;
import org.apache.tools.ant.taskdefs.*;
import org.openqa.selenium.server.SeleniumServer;

/**
 * Various static utility functions used to launch browsers
 */
public class LauncherUtils {

    /** creates an empty temp directory for managing a browser profile */
    protected static File createCustomProfileDir(String sessionId) {
        File tmpDir = new File(System.getProperty("java.io.tmpdir"));
        String customProfileDirParent = ((tmpDir.exists() && tmpDir.isDirectory()) ? tmpDir.getAbsolutePath() : ".");
        File customProfileDir = new File(customProfileDirParent + "/customProfileDir" + sessionId);
        if (customProfileDir.exists()) {
            LauncherUtils.recursivelyDeleteDir(customProfileDir);
        }
        customProfileDir.mkdir();
        return customProfileDir;
    }

    /** Delete a directory and all subdirectories */
    protected static void recursivelyDeleteDir(File customProfileDir) {
	if(customProfileDir == null || !customProfileDir.exists()){
		return;
	}
        Delete delete = new Delete();
        delete.setProject(new Project());
        delete.setDir(customProfileDir);
        delete.setFailOnError(true);
        delete.execute();
    }

    /** Try several times to recursively delete a directory */
    protected static void deleteTryTryAgain(File dir, int tries) {
        try {
            recursivelyDeleteDir(dir);
        } catch (BuildException e) {
            if (tries > 0) {
                AsyncExecute.sleepTight(2000);
                deleteTryTryAgain(dir, tries-1);
            } else {
                throw e;
            }
        }
    }

    /** Generate a proxy.pac file, configuring a dynamic proxy for URLs
     * containing "/selenium-server/"
     */
    protected static File makeProxyPAC(File parentDir, int port) throws FileNotFoundException {
        return makeProxyPAC(parentDir, port, true);
    }
    
    /** Generate a proxy.pac file, configuring a dynamic proxy.
     * 
     *  If proxySeleniumTrafficOnly is true, then the proxy applies only to URLs containing "/selenium-server/".
     *  Otherwise the proxy applies to all URLs.
     */
    protected static File makeProxyPAC(File parentDir, int port, boolean proxySeleniumTrafficOnly) throws FileNotFoundException {
        File proxyPAC = new File(parentDir, "proxy.pac");
        PrintStream out = new PrintStream(new FileOutputStream(proxyPAC));
        String defaultProxy = "DIRECT";
        String configuredProxy = System.getProperty("http.proxyHost");
        if (configuredProxy != null) {
            defaultProxy = "PROXY " + configuredProxy;
            String proxyPort = System.getProperty("http.proxyPort");
            if (proxyPort != null) {
                defaultProxy += ":" + proxyPort;
            }
        }
        out.println("function FindProxyForURL(url, host) {");
        if (proxySeleniumTrafficOnly) {
            out.println("    if(shExpMatch(url, '*/selenium-server/*')) {");
        }
        out.println("        return 'PROXY localhost:" + Integer.toString(port) + "; " +
                defaultProxy + "';");
        if (configuredProxy != null) {
            out.println("    } else {");
            out.println("        return '" + defaultProxy + "';");
        }
        if (proxySeleniumTrafficOnly) { 
            out.println("    }");
        }
        out.println("}");
        out.close();
        return proxyPAC;
    }

    /** Strips the specified URL so it only includes a protocal, hostname and port 
     * @throws MalformedURLException */
    public static String stripStartURL(String url) {
        try {
            URL u = new URL(url);
            return u.getProtocol() + "://" + u.getAuthority();
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }

    protected static String getQueryString(String url) {
        try {
            URL u = new URL(url);
            String query = u.getQuery();
            return query;
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }
    
    protected static String getDefaultHTMLSuiteUrl(String browserURL, String suiteUrl, boolean multiWindow) {
        String url = LauncherUtils.stripStartURL(browserURL);
        return url + "/selenium-server/core/TestRunner.html?auto=true&" +
                "multiWindow=" + multiWindow + 
                "&resultsUrl=../postResults&test=" + suiteUrl;
    }
    
    protected static String getDefaultRemoteSessionUrl(String startURL, String sessionId) {
        String url = LauncherUtils.stripStartURL(startURL);
        return url + "/selenium-server/core/SeleneseRunner.html?sessionId=" + sessionId + "&debugMode=" + SeleniumServer.isDebugMode();
    }

    protected static File extractHTAFile(File dir, int port, String resourceFile, String outFile) {
        InputStream input = HTABrowserLauncher.class.getResourceAsStream(resourceFile);
        BufferedReader br = new BufferedReader(new InputStreamReader(input));
        File hta = new File(dir, outFile);
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
        return hta;
    }

    protected static void assertNotScriptFile(File f) {
        try {
            FileReader r = new FileReader(f);
            char firstTwoChars[] = new char[2];
            int charsRead = r.read(firstTwoChars);
            if (charsRead != 2) return;
            if (firstTwoChars[0] == '#' && firstTwoChars[1] == '!') {
                throw new RuntimeException("File was a script file, not a real executable: " + f.getAbsolutePath());
            }
        } catch (IOException e) {
            throw new RuntimeException (e);
        }
    }
    
}
