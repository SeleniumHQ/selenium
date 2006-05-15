
package org.openqa.selenium.server.browserlaunchers;

import java.io.*;
import java.net.*;

import org.apache.tools.ant.*;
import org.apache.tools.ant.taskdefs.*;

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
        File proxyPAC = new File(parentDir, "proxy.pac");
        PrintStream out = new PrintStream(new FileOutputStream(proxyPAC));
        out.println("function FindProxyForURL(url, host) {");
        out.println("   if(shExpMatch(url, '*/selenium-server/*')) {");
        out.println("       return 'PROXY localhost:" + Integer.toString(port) + "; DIRECT'");
        out.println("   }");
        out.println("}");
        out.close();
        return proxyPAC;
    }

    /** Strips the specified URL so it only includes a protocal, hostname and port 
     * @throws MalformedURLException */
    public static String stripStartURL(String url) throws MalformedURLException {
        URL u = new URL(url);
        return u.getProtocol() + "://" + u.getAuthority();
    }

}
