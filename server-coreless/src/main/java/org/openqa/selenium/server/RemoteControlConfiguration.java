package org.openqa.selenium.server;

import java.io.File;

/**
 * Encapsulate Remote Control Configuration
 */
public class RemoteControlConfiguration {

    private static final int DEFAULT_PORT = 4444;
    private int port;
    private boolean multiWindow;
    private boolean proxyInjectionModeArg;
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
    


    public RemoteControlConfiguration() {
        this.port = DEFAULT_PORT;
        this.multiWindow = false;
        this.proxyInjectionModeArg = false;
        this.portDriversShouldContact = 0;
        this.debugURL = "";
        this.dontInjectRegex = null;
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
}
