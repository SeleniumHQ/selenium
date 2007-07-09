package org.openqa.selenium.server.browserlaunchers;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.logging.Log;
import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Project;
import org.apache.tools.ant.taskdefs.Copy;
import org.apache.tools.ant.taskdefs.Delete;
import org.apache.tools.ant.types.FileSet;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.SeleniumServer;

/**
 * Various static utility functions used to launch browsers
 */
public class LauncherUtils {

    static Log log = LogFactory.getLog(LauncherUtils.class);
	
	/**
	 * creates an empty temp directory for managing a browser profile
	 */
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

	/**
	 * Delete a directory and all subdirectories
	 */
	protected static void recursivelyDeleteDir(File customProfileDir) {
		if (customProfileDir == null || !customProfileDir.exists()) {
			return;
		}
		Delete delete = new Delete();
		delete.setProject(new Project());
		delete.setDir(customProfileDir);
		delete.setFailOnError(true);
		delete.execute();
	}

	/**
	 * Try several times to recursively delete a directory
	 */
	protected static void deleteTryTryAgain(File dir, int tries) {
		try {
			recursivelyDeleteDir(dir);
		} catch (BuildException e) {
			if (tries > 0) {
				AsyncExecute.sleepTight(2000);
				deleteTryTryAgain(dir, tries - 1);
			} else {
				throw e;
			}
		}
	}

	/**
	 * Generate a proxy.pac file, configuring a dynamic proxy for URLs
	 * containing "/selenium-server/"
	 */
	protected static File makeProxyPAC(File parentDir, int port) throws FileNotFoundException {
		return makeProxyPAC(parentDir, port, true);
	}

	/**
	 * Generate a proxy.pac file, configuring a dynamic proxy. <p/> If
	 * proxySeleniumTrafficOnly is true, then the proxy applies only to URLs
	 * containing "/selenium-server/". Otherwise the proxy applies to all URLs.
	 */
	protected static File makeProxyPAC(File parentDir, int port, boolean proxySeleniumTrafficOnly) throws FileNotFoundException {
		if (SeleniumServer.isAlwaysProxy()) {
            proxySeleniumTrafficOnly = false;
        }
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
		out.println("        return 'PROXY localhost:" + Integer.toString(port) + "; " + defaultProxy + "';");
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

	/**
	 * Strips the specified URL so it only includes a protocal, hostname and
	 * port
	 * 
	 * @throws MalformedURLException
	 */
	public static String stripStartURL(String url) {
		try {
			URL u = new URL(url);
			String path = u.getPath();
			if (path != null && !"".equals(path) && !path.endsWith("/")) {
				log.warn("It looks like your baseUrl ("+url+") is pointing to a file, not a directory (it doesn't end with a /).  We're going to have to strip off the last part of the pathname."); 
			}
			return u.getProtocol() + "://" + u.getAuthority();
		} catch (MalformedURLException e) {
			throw new RuntimeException(e);
		}
	}

	protected static String getQueryString(String url) {
		try {
			URL u = new URL(url);
			String query = u.getQuery();
			return query == null ? "" : query;
		} catch (MalformedURLException e) {
			throw new RuntimeException(e);
		}
	}

	protected static String getDefaultHTMLSuiteUrl(String browserURL, String suiteUrl, boolean multiWindow, int serverPort) {
		String url = LauncherUtils.stripStartURL(browserURL);
        String resultsUrl;
        if (serverPort == 0) {
            resultsUrl = "../postResults";
        } else {
            resultsUrl = "http://localhost:" + serverPort + "/selenium-server/postResults";
        }
		return url + "/selenium-server/core/TestRunner.html?auto=true"
                + "&multiWindow=" + multiWindow
                + "&baseUrl=" + urlEncode(browserURL) + "/selenium-server/tests/"
                + "&resultsUrl=" + resultsUrl
                + "&test=" + suiteUrl;
	}

	protected static String getDefaultRemoteSessionUrl(String startURL, String sessionId, boolean multiWindow, int serverPort) {
		String url = LauncherUtils.stripStartURL(startURL);
		url += "/selenium-server/core/RemoteRunner.html?" 
                + "sessionId=" + sessionId 
                + "&multiWindow=" + multiWindow 
                + "&baseUrl=" + urlEncode(startURL)
                + "&debugMode=" + SeleniumServer.isDebugMode();
        if (serverPort != 0) {
            url += "&driverUrl=http://localhost:" + serverPort + "/selenium-server/driver/";
        }
        return url;
	}
    
    
    /** Encodes the text as an URL using UTF-8.
     * 
     * @param text the text too encode
     * @return the encoded URI string
     * @see URLEncoder#encode(java.lang.String, java.lang.String)
     */
    public static String urlEncode(String text) {
        try {
            return URLEncoder.encode(text, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
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
			if (charsRead != 2)
				return;
			if (firstTwoChars[0] == '#' && firstTwoChars[1] == '!') {
				throw new RuntimeException("File was a script file, not a real executable: " + f.getAbsolutePath());
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

    protected static void copyDirectory(File source, File dest) {
        Project p = new Project();
        Copy c = new Copy();
        c.setProject(p);
        c.setTodir(dest);
        FileSet fs = new FileSet();
        fs.setDir(source);
        c.addFileset(fs);
        c.execute();
    }
    
    protected enum ProxySetting { NO_PROXY, PROXY_SELENIUM_TRAFFIC_ONLY, PROXY_EVERYTHING };
    
	protected static void generatePacAndPrefJs(File customProfileDir, int port, ProxySetting proxySetting, String homePage) throws FileNotFoundException {
		// TODO Do we want to make these preferences configurable somehow?
        if (SeleniumServer.isAlwaysProxy()) {
            proxySetting = ProxySetting.PROXY_EVERYTHING;
        }

        File prefsJS = new File(customProfileDir, "prefs.js");
		PrintStream out = new PrintStream(new FileOutputStream(prefsJS, true));
		// Don't ask if we want to switch default browsers
		out.println("user_pref('browser.shell.checkDefaultBrowser', false);");

        if (proxySetting != ProxySetting.NO_PROXY) {
            boolean proxySeleniumTrafficOnly = (proxySetting == ProxySetting.PROXY_SELENIUM_TRAFFIC_ONLY);
            // Configure us as the local proxy
            File proxyPAC = LauncherUtils.makeProxyPAC(customProfileDir, port, proxySeleniumTrafficOnly);
            out.println("user_pref('network.proxy.type', 2);");
            out.println("user_pref('network.proxy.autoconfig_url', '" + pathToBrowserURL(proxyPAC.getAbsolutePath()) + "');");
        }
        
		// suppress authentication confirmations
		out.println("user_pref('network.http.phishy-userpass-length', 255);");

		// Disable pop-up blocking
		out.println("user_pref('browser.allowpopups', true);");
		out.println("user_pref('dom.disable_open_during_load', false);");

		// Open links in new windows (Firefox 2.0)
		out.println("user_pref('browser.link.open_external', 2);");
		out.println("user_pref('browser.link.open_newwindow', 2);");

		if (homePage != null) {
			out.println("user_pref('startup.homepage_override_url', '" + homePage + "');");
			// for Firefox 2.0
			out.println("user_pref('browser.startup.homepage', '" + homePage + "');");
            out.println("user_pref('startup.homepage_welcome_url', '');");
		}

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

		// Disable cache
		out.println("user_pref('browser.cache.disk.enable', false);");
		out.println("user_pref('browser.cache.memory.enable', true);");

		// Disable "do you want to remember this password?"
		out.println("user_pref('signon.rememberSignons', false);");

        // Disable any of the random self-updating crap
        out.println("user_pref('app.update.auto', false);");
        out.println("user_pref('app.update.enabled', false);");
        out.println("user_pref('extensions.update.enabled', false);");
        out.println("user_pref('browser.search.update', false);");
        out.println("user_pref('browser.safebrowsing.enabled', false);");

        out.close();
	}

	static final Pattern JAVA_STYLE_UNC_URL = Pattern.compile("^file:////([^/]+/.*)$");

	/**
	 * Generates an URL suitable for use in browsers, unlike Java's URLs, which
	 * choke on UNC paths. <p/>
	 * <P>
	 * Java's URLs work in IE, but break in Mozilla. Mozilla's team snobbily
	 * demanded that <I>all</I> file paths must have the empty authority
	 * (file:///), even for UNC file paths. On Mozilla \\socrates\build is
	 * therefore represented as file://///socrates/build.
	 * </P>
	 * See Mozilla bug <a
	 * href="https://bugzilla.mozilla.org/show_bug.cgi?id=66194">66194</A>.
	 * 
	 * @param path -
	 *            the file path to convert to a browser URL
	 * @return a nice Mozilla-compatible file URL
	 */
	private static String pathToBrowserURL(String path) {
		if (path == null)
			return null;
		String url = (new File(path)).toURI().toString();
		Matcher m = JAVA_STYLE_UNC_URL.matcher(url);
		if (m.find()) {
			url = "file://///";
			url += m.group(1);
		}
		return url;
	}

}
