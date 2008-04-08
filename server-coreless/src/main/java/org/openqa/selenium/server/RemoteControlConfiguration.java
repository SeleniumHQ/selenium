package org.openqa.selenium.server;

import java.io.File;

/**
 * Encapsulate Remote Control Configuration
 */
public class RemoteControlConfiguration {

    private static final int DEFAULT_PORT = 4444;
    private static final int USE_SAME_PORT = -1;
    private int port;
    private boolean multiWindow;
    private boolean proxyInjectionModeArg;
    /**
     * The following port is the one which drivers and browsers should use when they contact the selenium server.
     * Under normal circumstances, this port will be the same as the port which the selenium server listens on.
     * But if a developer wants to monitor traffic into and out of the selenium server, he can set this port from
     * the command line to be a different value and then use a tool like tcptrace to link this port with the
     * server listening port, thereby opening a window into the raw HTTP traffic.
     *
     * For example, if the selenium server is invoked with  -portDriversShouldContact 4445, then traffic going
     * into the selenium server will be routed to port 4445, although the selenium server will still be listening
     * to the default port 4444.  At this point, you would open tcptrace to bridge the gap and be able to watch
     * all the data coming in and out:     
     */
    private int portDriversShouldContact;
    private boolean htmlSuite;
    private boolean selfTest;
    private File selfTestDir;
    private boolean interactive;
    private File userExtensions;
    private boolean userJSInjection;
    private boolean trustAllSSLCertificates;
    /** add special tracing for debug when this URL is requested */
    private String debugURL;
    private String dontInjectRegex;
    private File firefoxProfileTemplate;
    private boolean reuseBrowserSessions;


    public RemoteControlConfiguration() {
        this.port = DEFAULT_PORT;
        this.multiWindow = false;
        this.proxyInjectionModeArg = false;
        this.portDriversShouldContact = USE_SAME_PORT;
        this.debugURL = "";
        this.dontInjectRegex = null;
        this.firefoxProfileTemplate = null;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int newPortNumber) {
        this.port = newPortNumber;
    }

    public boolean isMultiWindow() {
        return multiWindow;
    }

    public void setMultiWindow(boolean useMultiWindow) {
        this.multiWindow = useMultiWindow;
    }

    public void setProxyInjectionModeArg(boolean proxyInjectionModeArg) {
        this.proxyInjectionModeArg = proxyInjectionModeArg;
    }

    public boolean getProxyInjectionModeArg() {
        return proxyInjectionModeArg;
    }

    public void setPortDriversShouldContact(int newPortDriversShouldContact) {
        this.portDriversShouldContact = newPortDriversShouldContact;
    }

    public int getPortDriversShouldContact() {
        if (USE_SAME_PORT == portDriversShouldContact) {
            return port;
        }
        return portDriversShouldContact;
    }

    public void setHTMLSuite(boolean isHTMLSuite) {
        this.htmlSuite = isHTMLSuite;
    }

    public boolean isHTMLSuite() {
        return htmlSuite;
    }

    public boolean isSelfTest() {
        return selfTest;
    }

    public void setSelfTest(boolean isSelftest) {
        this.selfTest = isSelftest;
    }

    public void setSelfTestDir(File newSelfTestDir) {
        this.selfTestDir = newSelfTestDir;
    }

    public File getSelfTestDir() {
        return selfTestDir;
    }

    public boolean isInteractive() {
        return interactive;
    }

    public void setInteractive(boolean isInteractive) {
        this.interactive = isInteractive;
    }

    public File getUserExtensions() {
        return userExtensions;
    }

    public void setUserExtensions(File newuserExtensions) {
        this.userExtensions = newuserExtensions;
    }

    public boolean userJSInjection() {
        return userJSInjection;
    }

    public void setUserJSInjection(boolean useUserJSInjection) {
        this.userJSInjection = useUserJSInjection;
    }

    public void setTrustAllSSLCertificates(boolean trustAllSSLCertificates) {
        this.trustAllSSLCertificates = trustAllSSLCertificates;
    }

    public boolean trustAllSSLCertificates() {
        return trustAllSSLCertificates;
    }

    public String getDebugURL() {
        return debugURL;
    }

    public void setDebugURL(String newDebugURL) {
        this.debugURL = newDebugURL;
    }

    public void setDontInjectRegex(String newdontInjectRegex) {
        this.dontInjectRegex = newdontInjectRegex;
    }

    public String getDontInjectRegex() {
        return dontInjectRegex;
    }

    public File getFirefoxProfileTemplate() {
        return firefoxProfileTemplate;
    }

    public void setFirefoxProfileTemplate(File newFirefoxProfileTemplate) {
        this.firefoxProfileTemplate = newFirefoxProfileTemplate;
    }

    public void setReuseBrowserSessions(boolean reuseBrowserSessions) {
        this.reuseBrowserSessions = reuseBrowserSessions;
    }

    public boolean reuseBrowserSessions() {
        return this.reuseBrowserSessions;
    }

}
