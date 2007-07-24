package org.openqa.selenium.server;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

import org.mortbay.http.handler.ProxyHandler;
import org.mortbay.jetty.Server;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncher;
import org.openqa.selenium.server.htmlrunner.HTMLResultsListener;

// Stub selenium server so that everything looks the same
public class SeleniumServer {
	public static final int DEFAULT_PORT = 4444;

	public SeleniumServer(int port, boolean slowResources, boolean multiWindow)
			throws Exception {
		// no-op
	}

	public SeleniumServer(int port, boolean slowResources) throws Exception {
		this(port, slowResources, false);
	}

	public SeleniumServer(int port) throws Exception {
		this(port, slowResourceProperty());
	}

	public SeleniumServer() throws Exception {
		this(SeleniumServer.getDefaultPort(), slowResourceProperty());
	}

	public static int getDefaultPort() {
		String portString = System.getProperty("selenium.port", ""
				+ SeleniumServer.DEFAULT_PORT);
		return Integer.parseInt(portString);
	}

	public static File getFirefoxProfileTemplate() {
		throw new UnsupportedOperationException("getFirefoxProfileTemplate");
	}

	private static boolean slowResourceProperty() {
		return ("true".equals(System.getProperty("slowResources")));
	}

	public static void setTimeoutInSeconds(int timeoutInSeconds) {
		throw new UnsupportedOperationException("setTimeoutInSeconds");
	}

	public void addNewStaticContent(File directory) {
		throw new UnsupportedOperationException("addNewStaticContent");
	}

	public void handleHTMLRunnerResults(HTMLResultsListener listener) {
		throw new UnsupportedOperationException("handleHTMLRunnerResults");
	}

	public void start() throws Exception {
		// Does nothing
	}

	public static boolean isForceProxyChain() {
		return false;
	}

	public static void setForceProxyChain(boolean force) {
		// no-op
	}

	public static void setCustomProxyHandler(ProxyHandler customProxyHandler) {
		throw new UnsupportedOperationException("setCustomProxyHandler");
	}

	public void stop() {
		// Does nothing
	}

	/**
	 * Returns a map of session IDs and their associated browser launchers for
	 * all active sessions.
	 * 
	 * @return
	 */
	// public Map<String, BrowserLauncher> getBrowserLaunchers() {
	public Map getBrowserLaunchers() {
		throw new UnsupportedOperationException("getBrowserLaunchers");
	}

	public int getPort() {
		return DEFAULT_PORT;
	}

	public boolean isMultiWindow() {
		return true;
	}

	public Server getServer() {
		throw new UnsupportedOperationException("getServer");
	}

	public InputStream getResourceAsStream(String path) throws IOException {
		throw new UnsupportedOperationException("getResourceAsStream");
	}

	/** Registers a running browser with a specific sessionID */
	public void registerBrowserLauncher(String sessionId, BrowserLauncher launcher) {
		throw new UnsupportedOperationException("registerBrowserLauncher");
	}

	/**
	 * Get the number of threads that the server will use to configure the
	 * embedded Jetty instance.
	 * 
	 * @return Returns the number of threads for Jetty.
	 */
	public static int getJettyThreads() {
		throw new UnsupportedOperationException("getJettyThreads");
	}

	/**
	 * Set the number of threads that the server will use for Jetty.
	 * 
	 * In order to use this, you must call this method before you call the
	 * SeleniumServer constructor.
	 * 
	 * @param jettyThreads
	 *            Number of jetty threads for the server to use
	 * @throws IllegalArgumentException
	 *             when jettyThreads < MIN_JETTY_THREADS or > MAX_JETTY_THREADS
	 */
	public static void setJettyThreads(int jettyThreads) {
		throw new UnsupportedOperationException("setJettyThreads");
	}

	public static boolean isDebugMode() {
		throw new UnsupportedOperationException("isDebugMode");
	}

	static public void setDebugMode(boolean debugMode) {
		throw new UnsupportedOperationException("setDebugMode");
	}

	public static boolean isProxyInjectionMode() {
		throw new UnsupportedOperationException("isProxyInjectionMode");
	}

	public static void setAlwaysProxy(boolean alwaysProxy) {
		throw new UnsupportedOperationException("setAlwaysProxy");
	}

	public static boolean isAlwaysProxy() {
		throw new UnsupportedOperationException("isAlwaysProxy");
	}

	public static int getPortDriversShouldContact() {
		throw new UnsupportedOperationException("getPortDriversShouldContact");
	}

	public void setProxyInjectionMode(boolean proxyInjectionMode) {
		throw new UnsupportedOperationException("setProxyInjectionMode");
	}

	public static String getForcedBrowserMode() {
		throw new UnsupportedOperationException("getForcedBrowserMode");
	}

	public static int getTimeoutInSeconds() {
		throw new UnsupportedOperationException("getTimeoutInSeconds");
	}

	public static void setForcedBrowserMode(String s) {
		throw new UnsupportedOperationException("setForcedBrowserMode");
	}

	public static void setDontInjectRegex(String dontInjectRegex) {
		throw new UnsupportedOperationException("setDontInjectRegex");
	}

	public static boolean reusingBrowserSessions() {
		throw new UnsupportedOperationException("reusingBrowserSessions");
	}

	public static boolean shouldInject(String path) {
		throw new UnsupportedOperationException("shouldInject");
	}

	public static String getDebugURL() {
		throw new UnsupportedOperationException("getDebugURL");
	}

	public static void setReusingBrowserSessions(boolean reusingBrowserSessions) {
		throw new UnsupportedOperationException("setReusingBrowserSessions");
	}

	public static void main(String[] args) {
		// Does nothing
	}
}
