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
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.ClassPathResource;

/**
 * Various static utility functions used to launch browsers
 */
public class LauncherUtils {

  static Log log = LogFactory.getLog(LauncherUtils.class);

  /**
   * creates an empty temp directory for managing a browser profile
   */
  protected static File createCustomProfileDir(String sessionId) {
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
  public static void deleteTryTryAgain(File dir, int tries) {
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
        log.warn("It looks like your baseUrl (" + url
                 + ") is pointing to a file, not a directory (it doesn't end with a /).  We're going to have to strip off the last part of the pathname.");
      }
      return u.getProtocol() + "://" + u.getAuthority();
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }

  protected static String getQueryString(String url) {
    final String query;

    try {
      query = new URL(url).getQuery();
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
           + "&defaultLogLevel=info"
           + "&baseUrl=" + urlEncode(browserURL)
           + "&resultsUrl=" + resultsUrl
           + "&test=" + urlEncode(suiteUrl);
  }

  protected static String getDefaultRemoteSessionUrl(String startURL, String sessionId, boolean multiWindow, int serverPort, boolean browserSideLog) {
    String url = LauncherUtils.stripStartURL(startURL);
    url += "/selenium-server/core/RemoteRunner.html?"
           + "sessionId=" + sessionId
           + "&multiWindow=" + multiWindow
           + "&baseUrl=" + urlEncode(startURL)
           + "&debugMode=" + browserSideLog;
    if (serverPort != 0) {
      url += "&driverUrl=http://localhost:" + serverPort + "/selenium-server/driver/";
    }
    return url;
  }


  /**
   * Encodes the text as an URL using UTF-8.
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

  public static InputStream getSeleniumResourceAsStream(String resourceFile) {
    Class clazz = ClassPathResource.class;
    InputStream input = clazz.getResourceAsStream(resourceFile);
    if (input == null) {
      try {
        // This is hack for the OneJar version of Selenium-Server.
        // Examine the contents of the jar made by
        // https://svn.openqa.org/svn/selenium-rc/trunk/selenium-server-onejar/build.xml
        clazz = Class.forName("OneJar");
        input = clazz.getResourceAsStream(resourceFile);
      } catch (ClassNotFoundException e) {
      }
    }
    return input;
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

  protected static void copySingleFile(File sourceFile, File destFile) {
    copySingleFileWithOverwrite(sourceFile, destFile, false);
  }

  protected static void copySingleFileWithOverwrite(File sourceFile, File destFile, boolean overwrite) {
    Project p = new Project();
    Copy c = new Copy();
    c.setProject(p);
    c.setTofile(destFile);
    FileSet fs = new FileSet();
    fs.setProject(p);
    fs.setFile(sourceFile);
    c.addFileset(fs);
    c.setOverwrite(overwrite);
    c.execute();
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

  /**
   * Copies all files matching the suffix to the destination directory.
   * <p/>
   * If no files match, and the destination directory did not already
   * exist, the destination directory is still created, if possible.
   *
   * @param source the source directory
   * @param suffix the suffix for all files to be copied.
   * @param dest   the destination directory
   */
  protected static boolean copyDirectory(File source, String suffix, File dest) {
    boolean result = false;
    try {
      Project p = new Project();
      Copy c = new Copy();
      c.setProject(p);
      c.setTodir(dest);
      FileSet fs = new FileSet();
      fs.setDir(source);
      if (null != suffix) {
        fs.setIncludes("*" + suffix); // add the wildcard.
      }
      c.addFileset(fs);
      c.execute();

      // handle case where no files match; must create empty directory.
      if (!dest.exists()) {
        result = dest.mkdirs();
      } else {
        result = true;
      }
    } catch (SecurityException se) {
      log.warn("Could not copy the specified directory files", se);
      result = false;
    }
    return result;
  }

  protected static void generatePacAndPrefJs(File customProfileDir, int port, String homePage,
      boolean changeMaxConnections, int timeoutInSeconds, BrowserConfigurationOptions options)
      throws FileNotFoundException {


    File prefsJS = new File(customProfileDir, "prefs.js");
    PrintStream out = new PrintStream(new FileOutputStream(prefsJS, true));
    // Don't ask if we want to switch default browsers
    out.println("user_pref('browser.shell.checkDefaultBrowser', false);");

    if (options.isProxyRequired()) {
      // Configure us as the local proxy
      File proxyPAC = Proxies.makeProxyPAC(customProfileDir, port, options.asCapabilities());
      out.println("user_pref('network.proxy.type', 2);");
      out.println("user_pref('network.proxy.autoconfig_url', '"
                  + pathToBrowserURL(proxyPAC.getAbsolutePath()) + "');");
    }

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

      // This handles known RC problems when the startup page is a blank page or when the previous session has been restored
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
   * Generates an URL suitable for use in browsers, unlike Java's URLs, which
   * choke on UNC paths. <p/>
   * <p/>
   * Java's URLs work in IE, but break in Mozilla. Mozilla's team snobbily
   * demanded that <I>all</I> file paths must have the empty authority
   * (file:///), even for UNC file paths. On Mozilla \\socrates\build is
   * therefore represented as file://///socrates/build.
   * </P>
   * See Mozilla bug <a
   * href="https://bugzilla.mozilla.org/show_bug.cgi?id=66194">66194</A>.
   *
   * @param path -
   *             the file path to convert to a browser URL
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
