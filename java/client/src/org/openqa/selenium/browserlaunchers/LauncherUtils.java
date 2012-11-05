/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.browserlaunchers;

import com.google.common.base.Throwables;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.net.Urls;

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
import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Various static utility functions used to launch browsers
 */
public class LauncherUtils {

  static Logger log = Logger.getLogger(LauncherUtils.class.getName());

  /**
   * creates an empty temp directory for managing a browser profile
   */
  // TODO(simon): Change this back to protected once moved into browserlaunchers
  public static File createCustomProfileDir(String sessionId) {
    final File customProfileDir;

    customProfileDir = customProfileDir(sessionId);
    if (customProfileDir.exists()) {
      LauncherUtils.recursivelyDeleteDir(customProfileDir);
    }
    customProfileDir.mkdir();
    return customProfileDir;
  }

  /**
   * Return the name of the custom profile directory for a specific seleniumm session
   * 
   * @param sessionId Current selenium sesssion id. Cannot be null.
   * @return file path of the custom profile directory for this session.
   */
  public static File customProfileDir(String sessionId) {
    final File tmpDir;
    final String customProfileDirParent;
    final File customProfileDir;

    tmpDir = new File(System.getProperty("java.io.tmpdir"));
    customProfileDirParent =
        ((tmpDir.exists() && tmpDir.isDirectory()) ? tmpDir.getAbsolutePath() : ".");
    customProfileDir = new File(customProfileDirParent + "/customProfileDir" + sessionId);

    return customProfileDir;
  }

  /**
   * Delete a directory and all subdirectories
   */
  public static void recursivelyDeleteDir(File customProfileDir) {
    FileHandler.delete(customProfileDir);
  }

  /**
   * Try several times to recursively delete a directory
   */
  public static void deleteTryTryAgain(File dir, int tries) {
    try {
      recursivelyDeleteDir(dir);
    } catch (RuntimeException e) {
      if (tries > 0) {
        Sleeper.sleepTight(2000);
        deleteTryTryAgain(dir, tries - 1);
      } else {
        throw e;
      }
    }
  }


  // TODO(simon): Should not be public
  public static String getQueryString(String url) {
    final String query;

    try {
      query = new URL(url).getQuery();
      return query == null ? "" : query;
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }

  // TODO(simon): Revert back to protected once the abstract browser launcher is in the same package
  public static String getDefaultHTMLSuiteUrl(String browserURL, String suiteUrl,
      boolean multiWindow, int serverPort) {
    String url = Urls.toProtocolHostAndPort(browserURL);
    String resultsUrl;
    if (serverPort == 0) {
      resultsUrl = "../postResults";
    } else {
      resultsUrl = "http://localhost:" + serverPort + "/selenium-server/postResults";
    }
    return url + "/selenium-server/core/TestRunner.html?auto=true"
        + "&multiWindow=" + multiWindow
        + "&defaultLogLevel=info"
        + "&baseUrl=" + Urls.urlEncode(browserURL)
        + "&resultsUrl=" + resultsUrl
        + "&test=" + Urls.urlEncode(suiteUrl);
  }

  // TODO(simon): Reduce visibility once server/browserlaunchers no more
  public static String getDefaultRemoteSessionUrl(String startURL, String sessionId,
      boolean multiWindow, int serverPort, boolean browserSideLog) {
    String url = Urls.toProtocolHostAndPort(startURL);
    url += "/selenium-server/core/RemoteRunner.html?"
        + "sessionId=" + sessionId
        + "&multiWindow=" + multiWindow
        + "&baseUrl=" + Urls.urlEncode(startURL)
        + "&debugMode=" + browserSideLog;
    if (serverPort != 0) {
      url += "&driverUrl=http://localhost:" + serverPort + "/selenium-server/driver/";
    }
    return url;
  }


  // TODO(simon): Reduce visibility.
  public static File extractHTAFile(File dir, int port, String resourceFile, String outFile) {
    InputStream input = getSeleniumResourceAsStream(resourceFile);
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

  private static InputStream getSeleniumResourceAsStream(String resourceFile) {
    return LauncherUtils.class.getResourceAsStream(resourceFile);
  }

  public static boolean isScriptFile(File aFile) {
    final char firstTwoChars[] = new char[2];
    final FileReader reader;
    int charsRead;

    try {
      reader = new FileReader(aFile);
      charsRead = reader.read(firstTwoChars);
      if (2 != charsRead) {
        return false;
      }
      return (firstTwoChars[0] == '#' && firstTwoChars[1] == '!');
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  // TODO(simon): Replace with something not in LauncherUtils
  public static void copySingleFile(File sourceFile, File destFile) {
    copySingleFileWithOverwrite(sourceFile, destFile, false);
  }

  // TODO(simon): Replace me
  public static void copySingleFileWithOverwrite(File sourceFile, File destFile, boolean overwrite) {
    // Ensure that the source is actually a file
    if (!sourceFile.exists()) {
      throw new RuntimeException("Source file does not exist: " + sourceFile);
    }

    if (!sourceFile.isFile()) {
      throw new RuntimeException("Source is not a single file: " + sourceFile);
    }

    if (!overwrite && destFile.exists()) {
      throw new RuntimeException("Destination file already exists: " + destFile);
    }


    try {
      FileHandler.copy(sourceFile, destFile);
    } catch (IOException e) {
      throw Throwables.propagate(e);
    }
  }

  // TODO(simon): Replace me
  public static void copyDirectory(File source, File dest) {
    try {
      FileHandler.copy(source, dest);
    } catch (IOException e) {
      throw Throwables.propagate(e);
    }
  }

  /**
   * Copies all files matching the suffix to the destination directory.
   * <p/>
   * If no files match, and the destination directory did not already exist, the destination
   * directory is still created, if possible.
   * 
   * @param source the source directory
   * @param suffix the suffix for all files to be copied.
   * @param dest the destination directory
   */
  protected static boolean copyDirectory(File source, String suffix, File dest) {
    try {
      FileHandler.copy(source, dest, suffix);
      return true;
    } catch (IOException e) {
      return false;
    }
  }

  // TODO(simon): Reduce visibility
  public static void generatePacAndPrefJs(File customProfileDir, int port, String homePage,
      boolean changeMaxConnections, long timeoutInSeconds, Capabilities capabilities)
      throws FileNotFoundException {


    File prefsJS = new File(customProfileDir, "prefs.js");
    PrintStream out = new PrintStream(new FileOutputStream(prefsJS, true));
    // Don't ask if we want to switch default browsers
    out.println("user_pref('browser.shell.checkDefaultBrowser', false);");

    // TODO(simon): Remove hard-coded string
    if (Proxies.isProxyRequired(capabilities)) {
      // Configure us as the local proxy
      File proxyPAC = Proxies.makeProxyPAC(customProfileDir, port, capabilities);
      out.println("user_pref('network.proxy.type', 2);");
      out.println("user_pref('network.proxy.autoconfig_url', '"
          + pathToBrowserURL(proxyPAC.getAbsolutePath()) + "');");
    }
    out.println("user_pref('toolkit.networkmanager.disable', true);");
    out.println("user_pref('browser.offline', false);");

    // suppress authentication confirmations
    out.println("user_pref('network.http.phishy-userpass-length', 255);");

    // Disable pop-up blocking
    out.println("user_pref('browser.allowpopups', true);");
    out.println("user_pref('dom.disable_open_during_load', false);");

    // Allow scripts to run as long as the server timeout

    out.println("user_pref('dom.max_script_run_time', " + timeoutInSeconds + ");");
    out.println("user_pref('dom.max_chrome_script_run_time', " + timeoutInSeconds + ");");

    // Open links in new windows (Firefox 2.0)
    out.println("user_pref('browser.link.open_external', 2);");
    out.println("user_pref('browser.link.open_newwindow', 2);");

    if (homePage != null) {
      out.println("user_pref('startup.homepage_override_url', '" + homePage + "');");
      // for Firefox 2.0
      out.println("user_pref('browser.startup.homepage', '" + homePage + "');");
      out.println("user_pref('startup.homepage_welcome_url', '');");

      // This handles known RC problems when the startup page is a blank page or when the previous
      // session has been restored
      out.println("user_pref('browser.startup.page', 1);");
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

    //Allow extensions to be installed into the profile and still work
    out.println("user_pref('extensions.autoDisableScopes', 10);");

    // Disable "do you want to remember this password?"
    out.println("user_pref('signon.rememberSignons', false);");

    // Disable re-asking for license agreement (Firefox 3)
    out.println("user_pref('browser.EULA.3.accepted', true);");
    out.println("user_pref('browser.EULA.override', true);");

    // Disable any of the random self-updating crap
    out.println("user_pref('app.update.auto', false);");
    out.println("user_pref('app.update.enabled', false);");
    out.println("user_pref('extensions.update.enabled', false);");
    out.println("user_pref('browser.search.update', false);");
    out.println("user_pref('extensions.blocklist.enabled', false);");
    out.println("user_pref('browser.safebrowsing.enabled', false);");

    if (changeMaxConnections) {
      out.println("user_pref('network.http.max-connections', 256);");
      out.println("user_pref('network.http.max-connections-per-server', 256);");
      out.println("user_pref('network.http.max-persistent-connections-per-proxy', 256);");
      out.println("user_pref('network.http.max-persistent-connections-per-server', 256);");
    }

    out.close();
  }

  static final Pattern JAVA_STYLE_UNC_URL = Pattern.compile("^file:////([^/]+/.*)$");

  /**
   * Generates an URL suitable for use in browsers, unlike Java's URLs, which choke on UNC paths.
   * <p/>
   * <p/>
   * Java's URLs work in IE, but break in Mozilla. Mozilla's team snobbily demanded that <I>all</I>
   * file paths must have the empty authority (file:///), even for UNC file paths. On Mozilla
   * \\socrates\build is therefore represented as file://///socrates/build.
   * </P>
   * See Mozilla bug <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=66194">66194</A>.
   * 
   * @param path - the file path to convert to a browser URL
   * @return a nice Mozilla-compatible file URL
   */
  private static String pathToBrowserURL(String path) {
    if (path == null) {
      return null;
    }
    String url = (new File(path)).toURI().toString();
    Matcher m = JAVA_STYLE_UNC_URL.matcher(url);
    if (m.find()) {
      url = "file://///";
      url += m.group(1);
    }
    return url;
  }
}
