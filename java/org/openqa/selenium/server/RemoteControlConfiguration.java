package org.openqa.selenium.server;

import java.io.File;

/**
 * Encapsulate Remote Control Configuration
 */
public class RemoteControlConfiguration {

    public static final int DEFAULT_PORT = 4444;
    private static final int USE_SAME_PORT = -1;
    public static final int MINUTES = 60;
    public static final int DEFAULT_TIMEOUT_IN_SECONDS = 30 * MINUTES;
    public static final int DEFAULT_RETRY_TIMEOUT_IN_SECONDS = 10;

    private int port;
    private File profilesLocation;
    private boolean proxyInjectionModeArg;
    /**
     * The following port is the one which drivers and browsers should use when they contact the selenium server.
     * Under normal circumstances, this port will be the same as the port which the selenium server listens on.
     * But if a developer wants to monitor traffic into and out of the selenium server, he can set this port from
     * the command line to be a different value and then use a tool like tcptrace to link this port with the
     * server listening port, thereby opening a window into the raw HTTP traffic.
     * <p/>
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
    /**
     * add special tracing for debug when this URL is requested
     */
    private String debugURL;
    private String dontInjectRegex;
    private File firefoxProfileTemplate;
    private boolean reuseBrowserSessions;
    private String logOutFileName;
    private String forcedBrowserMode;
    private boolean honorSystemProxy;
    private int timeoutInSeconds;
    private int retryTimeoutInSeconds;
    /** useful for situations where Selenium is being invoked programatically and the outside container wants to own logging */
    private boolean dontTouchLogging = false;
    private boolean ensureCleanSession;
    private boolean avoidProxy;
    private boolean debugMode;
    private boolean browserSideLogEnabled;
    private int jettyThreads = SeleniumServer.DEFAULT_JETTY_THREADS;
    private SeleniumServer server;
    private boolean singleWindow;
    

    public RemoteControlConfiguration() {
        this.port = getDefaultPort();
        this.logOutFileName = getDefaultLogOutFile();
        this.profilesLocation = null;
        this.proxyInjectionModeArg = false;
        this.portDriversShouldContact = USE_SAME_PORT;
        this.timeoutInSeconds = DEFAULT_TIMEOUT_IN_SECONDS;
        this.retryTimeoutInSeconds = DEFAULT_RETRY_TIMEOUT_IN_SECONDS;
        this.debugURL = "";
        this.dontInjectRegex = null;
        this.firefoxProfileTemplate = null;
        this.dontTouchLogging = false;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int newPortNumber) {
        this.port = newPortNumber;
    }

    public boolean isSingleWindow() {
        return singleWindow;
    }
    
    public void setSingleWindow(boolean useSingleWindow) {
        singleWindow = useSingleWindow;
    }
    
    public File getProfilesLocation() {
        return profilesLocation;
    }

    public void setProfilesLocation(File profilesLocation) {
        this.profilesLocation = profilesLocation;
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
        debugURL = newDebugURL;
    }
    
    public boolean isDebugMode() {
        return debugMode;
    }

    public void setDebugMode(boolean debugMode) {
        this.debugMode = debugMode;
    }

    public void setDontInjectRegex(String newdontInjectRegex) {
        dontInjectRegex = newdontInjectRegex;
    }

    public String getDontInjectRegex() {
        return dontInjectRegex;
    }

    public File getFirefoxProfileTemplate() {
        return firefoxProfileTemplate;
    }

    public void setFirefoxProfileTemplate(File newFirefoxProfileTemplate) {
        firefoxProfileTemplate = newFirefoxProfileTemplate;
    }

    public void setReuseBrowserSessions(boolean reuseBrowserSessions) {
        this.reuseBrowserSessions = reuseBrowserSessions;
    }

    public boolean reuseBrowserSessions() {
        return reuseBrowserSessions;
    }

    public void setLogOutFileName(String newLogOutFileName) {
        logOutFileName = newLogOutFileName;
    }

    public String getLogOutFileName() {
        return logOutFileName;
    }

    public void setLogOutFile(File newLogOutFile) {
        logOutFileName = (null == newLogOutFile) ? null : newLogOutFile.getAbsolutePath();
    }

    public File getLogOutFile() {
        return (null == logOutFileName) ? null : new File(logOutFileName);
    }

    public static String getDefaultLogOutFile() {
        final String logOutFileProperty;

        logOutFileProperty = System.getProperty("selenium.LOGGER");
        if (null == logOutFileProperty) {
            return null;
        }
        return new File(logOutFileProperty).getAbsolutePath();
    }

    public void setForcedBrowserMode(String newForcedBrowserMode) {
        this.forcedBrowserMode = newForcedBrowserMode;
    }

    public String getForcedBrowserMode() {
        return forcedBrowserMode;
    }

    public static int getDefaultPort() {
        final String portProperty;

        portProperty = System.getProperty("selenium.port", "" + DEFAULT_PORT);
        if (null == portProperty) {
            return DEFAULT_PORT;
        }
        return Integer.parseInt(portProperty);
    }

    public boolean honorSystemProxy() {
        return honorSystemProxy;
    }

    public void setHonorSystemProxy(boolean willHonorSystemProxy) {
        honorSystemProxy = willHonorSystemProxy;
    }

    public boolean shouldOverrideSystemProxy() {
        return !honorSystemProxy;
    }

    public int getTimeoutInSeconds() {
        return timeoutInSeconds;
    }

    public void setTimeoutInSeconds(int newTimeoutInSeconds) {
        timeoutInSeconds = newTimeoutInSeconds;
    }

    public int getRetryTimeoutInSeconds() {
        return retryTimeoutInSeconds;
    }

    public void setRetryTimeoutInSeconds(int newRetryTimeoutInSeconds) {
        retryTimeoutInSeconds = newRetryTimeoutInSeconds;
    }

    public boolean dontTouchLogging() {
        return dontTouchLogging;
    }

    public void setDontTouchLogging(boolean newValue) {
        this.dontTouchLogging = newValue;
    }

    public int shortTermMemoryLoggerCapacity() {
        return 30;
    }
    

    public boolean isEnsureCleanSession() {
        return ensureCleanSession;
    }

    public void setEnsureCleanSession(boolean value) {
        ensureCleanSession = value;
    }

    public boolean isAvoidProxy() {
        return avoidProxy;
    }

    public void setAvoidProxy(boolean value) {
        avoidProxy = value;
    }
    
    public boolean isBrowserSideLogEnabled() {
        return browserSideLogEnabled;
    }

    public void setBrowserSideLogEnabled(boolean value) {
        browserSideLogEnabled = value;
    }
    
    public int getJettyThreads() {
        return jettyThreads;
    }
    
    public void setJettyThreads(int jettyThreads) {
        final int MAX_JETTY_THREADS = 1024;
        if (jettyThreads < 1
                || jettyThreads > MAX_JETTY_THREADS) {
            throw new IllegalArgumentException(
                    "Number of jetty threads specified as an argument must be greater than zero and less than "
                            + MAX_JETTY_THREADS);
        }
        this.jettyThreads = jettyThreads;
    }

    public SeleniumServer getSeleniumServer() {
        return server;
    }
    
    public void setSeleniumServer(SeleniumServer server) {
        this.server = server;
    }
    
    public void copySettingsIntoBrowserOptions(BrowserConfigurationOptions browserOptions) {
        browserOptions.setSafely("timeoutInSeconds", timeoutInSeconds);
        browserOptions.setSafely("honorSystemProxy", honorSystemProxy);
        browserOptions.setSafely("firefoxProfileTemplate", firefoxProfileTemplate);
        browserOptions.setSafely("dontInjectRegex", dontInjectRegex);
        browserOptions.setSafely("trustAllSSLCertificates", trustAllSSLCertificates);
        browserOptions.setSafely("userJSInjection", userJSInjection);
        browserOptions.setSafely("userExtensions", userExtensions);
        browserOptions.setSafely("proxyInjectionMode", proxyInjectionModeArg);
        browserOptions.setSafely("singleWindow", singleWindow);
        browserOptions.setSafely("ensureCleanSession", ensureCleanSession);
        browserOptions.setSafely("avoidProxy", avoidProxy);
        browserOptions.setSafely("browserSideLog", browserSideLogEnabled);
    }
    
}
