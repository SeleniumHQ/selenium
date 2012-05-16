/*
 * Copyright 2008 Google, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.LauncherUtils;
import org.openqa.selenium.browserlaunchers.locators.BrowserInstallation;
import org.openqa.selenium.browserlaunchers.locators.GoogleChromeLocator;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.server.ApplicationRegistry;
import org.openqa.selenium.server.RemoteControlConfiguration;

import com.google.common.collect.Lists;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Browser launcher for Google Chrome.
 * 
 * <p>
 * Known issues:
 * 
 * <ul>
 * <li>Does not support the avoidProxy command-line option.</li>
 * <li>Does not fall back to a direct connection if the proxy fails to respond.</li>
 * </ul>
 */
public class GoogleChromeLauncher extends AbstractBrowserLauncher {

  private static final Logger log = Logger.getLogger(GoogleChromeLauncher.class.getName());

  private BrowserInstallation browserInstallation;

  private File customProfileDir;

  private CommandLine process;

  public GoogleChromeLauncher(Capabilities browserOptions,
      RemoteControlConfiguration configuration,
      String sessionId, String browserLaunchLocation) {
    this(browserOptions, configuration, sessionId, ApplicationRegistry.instance()
        .browserInstallationCache().
        locateBrowserInstallation(BrowserType.GOOGLECHROME, browserLaunchLocation, new GoogleChromeLocator()));
  }

  public GoogleChromeLauncher(Capabilities browserOptions,
      RemoteControlConfiguration configuration,
      String sessionId, BrowserInstallation browserInstallation) {
    super(sessionId, configuration, browserOptions);
    this.browserInstallation = browserInstallation;
  }

  @Override
  protected void launch(String url) {
    log.info("Launching Google Chrome...");

    createProfile(sessionId, url);
    final String[] cmdArray = createCommandArray(url);
    process = new CommandLine(cmdArray);
    process.executeAsync();
  }

  public void close() {
    log.info("Killing Google Chrome...");

    if (process == null) {
      return;
    }

    int exitValue = process.destroy();
    if (exitValue == 0) {
      log.warning("Google Chrome seems to have ended on its own.");
    }

    try {
      LauncherUtils.recursivelyDeleteDir(customProfileDir);
    } catch (RuntimeException e) {
      final String errorMessage = "Couldn't delete custom profile directory";
      log.log(Level.SEVERE, errorMessage, e);
      throw new RuntimeException(errorMessage, e);
    }
  }

  private String getUntrustedCertificatesFlag() {
    if (browserConfigurationOptions.is("trustAllSSLCertificates"))
      return "--ignore-certificate-errors";
    else
      return "";
  }

  private void createProfile(String sessionId, String url) {
    try {
      customProfileDir = LauncherUtils.createCustomProfileDir(sessionId);
    } catch (RuntimeException e) {
      final String errorMessage = "Couldn't create custom profile directory";
      log.log(Level.SEVERE, errorMessage, e);
      throw new RuntimeException(errorMessage, e);
    }

    File defaultDir = new File(customProfileDir, "Default");
    defaultDir.mkdir();

    PrefNode prefs = new PrefNode();

    // Disable error page suggestions (e.g. on HTTP 404 pages).
    prefs.setPref("alternate_error_pages.enabled", "false");
    // Don't show the bookmark bar on all tabs.
    prefs.setPref("bookmark_bar.show_on_all_tabs", "false");
    // Disable DNS prefetching.
    prefs.setPref("dns_prefetching.enabled", "false");
    // Disable password manager.
    prefs.setPref("profile.password_manager_enabled", "false");
    // Disable SafeBrowsing.
    prefs.setPref("safebrowsing.enabled", "false");
    // Disable Suggest support.
    prefs.setPref("search.suggest_enabled", "false");
    // Allow all cookies.
    prefs.setPref("security.cookie_behavior", "0");
    // Allow all mixed content to load on SSL pages.
    prefs.setPref("security.mixed_content_filtering", "0");
    // Allow JavaScript to open new windows (e.g. window.open and
    // window.showModalDialog).
    prefs.setPref("webkit.webprefs.javascript_can_open_windows_automatically", "true");
    // Make sure JavaScript is enabled.
    prefs.setPref("webkit.webprefs.javascript_enabled", "true");

    try {
      File prefsFile = new File(defaultDir, "Preferences");
      PrintStream out = new PrintStream(new FileOutputStream(prefsFile));
      out.println(prefs.toString());
      out.close();
    } catch (IOException e) {
      final String errorMessage = "Couldn't create preferences file";
      log.log(Level.SEVERE, errorMessage, e);
      throw new RuntimeException(errorMessage, e);
    }
  }

  private String[] createCommandArray(String url) {
    String userDir = customProfileDir.getAbsolutePath();

    List<String> array = Lists.newArrayList(
      new String[] {
        browserInstallation.launcherFilePath(),
        // Disable hang monitor dialogs in renderer process.
        "--disable-hang-monitor",
        // Disable metrics reporting system.
        "--disable-metrics",
        // Disable pop-up blocking.
        "--disable-popup-blocking",
        // Don't prompt when navigating to a page that was the result
        // of a post.
        "--disable-prompt-on-repost",
        // Set the proxy server.
        "--proxy-server=localhost:" + getPort(),
        // Always start the window maximized. This is a poor man's
        // replacement for windowMaximize (which does not work).
        "--start-maximized",
        // Makes sure that no first time run dialog boxes are shown
        "--no-first-run",
        // Make sure the browser window is activated when launched (Windows does this by default,
        // but needed for Mac)
        "--activate-on-launch",
        // Don't ask to be the default browser
        "--no-default-browser-check",
        // Disable the "translate page" in-page toolbar from appearing
        "--disable-translate",
        // Don't enforce the same-origin policy
        "--disable-web-security",
        // Set the user data (i.e. profile) directory.
        "--user-data-dir=" + userDir,
        getUntrustedCertificatesFlag()
      }
    );
    array.addAll(Lists.newArrayList(getCommandLineFlagsAsArray()));
    array.add(url);

    return array.toArray(new String[array.size()]);
  }

  /**
   * A helper class to generate Google Chrome preferences.
   * 
   * <p>
   * The structure of a preferences file is as follows:
   * 
   * <pre>
     * {
     *    "preference_group_1": {
     *       "preference_a": <value>,
     *       "preference_b": <value>
     *    },
     *    "preference_group_2": {
     *       "preference_c": <value>,
     *       "preference_d": <value>
     *    }
     * }
     * </pre>
   * 
   * <p>
   * The format of the file is in JSON.
   * 
   * <p>
   * As is shown, preferences are divided into groupings. These groupings are logical: similar
   * preferences are grouped together. Groupings may be nested.
   * 
   * <p>
   * Preference names are delimited with a "." between groups. For instance, in the above example
   * the name of the first preference would be: <code>preference_group_1.preference_a</code>.
   * 
   * <p>
   * A user of this class should create one <code>PrefNode</code> object as the root and call the
   * <code>setPref</code> method to add preferences. Once all preferences have been added, simply
   * call <code>toString</code> to generate a serialized string of the preferences. This string can
   * then be parsed by Google Chrome.
   */
  private class PrefNode {

    protected String name;

    private Map<String, PrefNode> prefs;

    public PrefNode() {
      this(false);
    }

    protected PrefNode(boolean isLeaf) {
      if (!isLeaf) {
        prefs = new HashMap<String, PrefNode>();
      }
    }

    public void setPref(String pref, String value) {
      String[] prefParts = pref.split("\\.");
      setPref(prefParts, 0, value);
    }

    private boolean isLastIndex(String[] array, int index) {
      return index + 1 == array.length;
    }

    protected void setPref(String[] prefParts, int index, String value) {
      final String name = prefParts[index];

      if (prefs.containsKey(name) == false) {
        if (isLastIndex(prefParts, index)) {
          prefs.put(name, new PrefLeafNode());
        } else {
          prefs.put(name, new PrefNode());
        }
      }

      PrefNode node = prefs.get(name);
      node.name = name;
      node.setPref(prefParts, index + 1, value);
    }

    protected void buildString(StringBuilder builder) {
      if (name != null) {
        builder.append('"');
        builder.append(name);
        builder.append('"');
        builder.append(':');
      }

      builder.append('{');
      int index = 0;
      for (PrefNode pref : prefs.values()) {
        pref.buildString(builder);
        if (++index < prefs.size()) {
          builder.append(',');
        }
      }
      builder.append('}');
    }

    @Override
    public String toString() {
      StringBuilder builder = new StringBuilder();
      buildString(builder);
      return builder.toString();
    }

  }

  private class PrefLeafNode extends PrefNode {

    private String value;

    public PrefLeafNode() {
      super(true);
    }

    @Override
    protected void setPref(String[] prefParts, int index, String value) {
      this.value = value;
    }

    @Override
    protected void buildString(StringBuilder builder) {
      builder.append('"');
      builder.append(name);
      builder.append('"');
      builder.append(':');
      builder.append(value);
    }

  }

}
