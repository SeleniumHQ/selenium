/*
 * Copyright 2011 Software Freedom Conservancy.
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
package org.openqa.selenium.browserlaunchers;

import org.openqa.selenium.os.CommandLine;

import java.io.File;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;
import java.util.prefs.Preferences;
import java.util.regex.Pattern;

/**
 * Class to manage the proxy server on OS X. It uses the 'networksetup' tool to do its magic; it
 * also depends on 'scutil' to read some settings we need to interact with 'networksetup.'
 *
 * <p>
 * 'networksetup' seems to come in a great many varieties depending on different versions of OS X
 * (and different architectures: PPC vs Intel), so we've taken some care to write this class very
 * defensively.
 * </p>
 */
public class MacProxyManager {
  static Logger log = Logger.getLogger(MacProxyManager.class.getName());

  private static final Pattern SCUTIL_LINE = Pattern.compile("^  (\\S+) : (.*)$");
  private static final Pattern NETWORKSETUP_LISTORDER_LINE = Pattern
      .compile("\\(Hardware Port: ([^,]*), Device: ([^\\)]*)\\)");
  private static final Pattern NETWORKSETUP_LINE = Pattern.compile("^([^:]+): (.*)$");

  private static final String BACKUP_READY = "backupready";

  private String sessionId;
  private File customProxyPACDir; // TODO evict this?
  private int port;
  // DGF used to be static/final, but that made it harder to mock out
  private Preferences prefs = Preferences.userNodeForPackage(MacProxyManager.class);
  /**
   * The user defined name of the network service, used as an argument to 'networksetup', e.g.
   * "Built-in Ethernet" or "AirPort".
   */
  private String networkService;

  public MacProxyManager(String sessionId, int port) {
    this.sessionId = sessionId;
    this.port = port;
    prefs = Preferences.userNodeForPackage(MacProxyManager.class);
  }

  public File getCustomProxyPACDir() {
    return customProxyPACDir;
  }

  private boolean prefNodeExists(String key) {
    return null != prefs.get(key, null);
  }

  /** change the network settings to enable use of our proxy */
  public void changeNetworkSettings() {
    if (networkService == null) {
      getCurrentNetworkSettings();
    }
    customProxyPACDir = LauncherUtils.createCustomProfileDir(sessionId);
    if (customProxyPACDir.exists()) {
      LauncherUtils.recursivelyDeleteDir(customProxyPACDir);
    }
    customProxyPACDir.mkdir();
    log.info("Modifying OS X global network settings...");
    // TODO Disable proxy PAC URL (or, even better, use one!) SRC-364

    runNetworkSetup("-setwebproxy", networkService, "localhost", "" + port);

    runNetworkSetup("-setproxybypassdomains", networkService, "Empty");
  }

  private String findNetworkSetupBin() {
    String defaultPath =
        "/System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Support/networksetup";
    File defaultLocation = new File(defaultPath);
    if (defaultLocation.exists()) {
      return defaultLocation.getAbsolutePath();
    }
    String networkSetupBin = CommandLine.find("networksetup");
    if (networkSetupBin != null) {
      return networkSetupBin;
    }
    if (defaultLocation.getParentFile().exists()) {
      String[] files = defaultLocation.getParentFile().list();
      String guess = chooseSuitableNetworkSetup(System.getProperty("os.version"),
          System.getProperty("os.arch"), files);
      if (guess != null) {
        File guessedLocation = new File(defaultLocation.getParentFile(), guess);
        log.warning("Couldn't find 'networksetup' in expected location; we're taking " +
            "a guess and using " + guessedLocation.getAbsolutePath() +
            " instead.  Please create a symlink called 'networksetup' to make " +
            "this warning go away.");
        return guessedLocation.getAbsolutePath();
      }
    }
    throw new MacNetworkSetupException("networksetup couldn't be found in the path!\n" +
        "Please add the directory containing 'networksetup' to your PATH environment\n" +
        "variable.");
  }

  /** Try to guess which 'networksetup' executable to use */
  private String chooseSuitableNetworkSetup(String osVersion, String osArch, String... files) {
    // DGF we don't technically need to know osArch, but according to comments in SRC-13,
    // sometimes Tiger on PPC looks different from Tiger on Intel, so we'll leave it in,
    // just in case

    Set<String> candidates = new HashSet<String>();
    for (String file : files) {
      if (file.startsWith("networksetup-")) {
        candidates.add(file);
      }
    }
    if (candidates.isEmpty()) {
      log.fine("No networksetup candidates found");
      return null;
    }
    if (candidates.size() == 1) {
      log.fine("One networksetup candidate found");
      return candidates.iterator().next();
    }
    log.fine("Multiple networksetup candidates found: " + candidates);
    // uh-oh. There's no 'networksetup' and more than one 'networksetup-*'
    // we'll have to take a guess!
    String[] versionParts = osVersion.split("\\.");
    if (versionParts.length < 2) {
      log.fine("OS version seems to be invalid: " + osVersion);
      return null;
    }
    if (!"10".equals(versionParts[0])) {
      log.fine("OS version doesn't seem to be 10.*: " + osVersion);
      return null;
    }
    CodeName codeName;
    try {
      codeName = CodeName.minorVersion(versionParts[1]);
      String possibleCandidate = "networksetup-" + codeName.name().toLowerCase();
      if (candidates.contains(possibleCandidate)) {
        log.fine("This seems to be " + codeName + ", so we'll use " + possibleCandidate);
        return possibleCandidate;
      }
      log.fine("This seems to be " + codeName + ", but there's no " + possibleCandidate);
    } catch (IllegalArgumentException e) {
      log.fine("Couldn't find code name for OS version " + osVersion);
      return null;
    }
    // DGF when we know there's multiple candidates, but none of them match, should we just pick
    // one?
    return null;
  }

  private enum CodeName {
    PUMA("1"),
    JAGUAR("2"),
    PANTHER("3"),
    TIGER("4"),
    LEOPARD("5");

    String minorVersion;

    CodeName(String minorVersion) {
      this.minorVersion = minorVersion;
    }

    static CodeName minorVersion(String minorVersion) {
      for (CodeName cn : values()) {
        if (cn.minorVersion.equals(minorVersion)) {
          return cn;
        }
      }
      throw new IllegalArgumentException("No codename matches minorVersion " + minorVersion);
    }
  }

  private String findScutilBin() {
    String defaultPath = "/usr/sbin/scutil";
    File defaultLocation = new File(defaultPath);
    if (defaultLocation.exists()) {
      return defaultLocation.getAbsolutePath();
    }
    String scutilBin = CommandLine.find("scutil");
    if (scutilBin != null) {
      return scutilBin;
    }
    throw new MacNetworkSetupException("scutil couldn't be found in the path!\n" +
        "Please add the directory containing 'scutil' to your PATH environment\n" +
        "variable.");
  }

  /** Acquire current network settings using scutil/networksetup */
  private MacNetworkSettings getCurrentNetworkSettings() {
    getPrimaryNetworkServiceName();
    String output = runNetworkSetup("-getwebproxy", networkService);
    log.fine(output);
    Map<String, String> dictionary =
        Maps.parseDictionary(output.toString(), NETWORKSETUP_LINE, false);
    String strEnabled = verifyKey("Enabled", dictionary, "networksetup", output);
    boolean enabled = isTrueOrSomething(strEnabled);
    String server = verifyKey("Server", dictionary, "networksetup", output);
    String strPort = verifyKey("Port", dictionary, "networksetup", output);
    int port1;
    try {
      port1 = Integer.parseInt(strPort);
    } catch (NumberFormatException e) {
      throw new MacNetworkSetupException("Port didn't look right: " + output, e);
    }
    String strAuth = verifyKey("Authenticated Proxy Enabled", dictionary, "networksetup", output);
    boolean auth = isTrueOrSomething(strAuth);
    String[] bypassDomains = getCurrentProxyBypassDomains();
    MacNetworkSettings networkSettings =
        new MacNetworkSettings(networkService, enabled, server, port1, auth, bypassDomains);
    return networkSettings;
  }

  private String[] getCurrentProxyBypassDomains() {
    String output = runNetworkSetup("-getproxybypassdomains", networkService);
    log.fine(output);
    if (output == null) {
      throw new MacNetworkSetupException("-getproxybypassdomains had no output");
    }
    String[] lines = output.split("\n");
    int i = 0;
    if (lines.length == i) {
      return new String[] {""};
    }
    if (lines[i].startsWith("cp: /Library")) { // spurious warning when you don't run as root
      i++;
    }
    if (lines.length == i) {
      return new String[] {""};
    }
    if (lines[i].startsWith("There aren't any")) {
      return new String[0];
    }
    if (i == 0) return lines;
    String[] domains = new String[lines.length - i];
    System.arraycopy(lines, i, domains, 0, lines.length - i);
    return domains;
  }

  private boolean isTrueOrSomething(String value) {
    // networksetup sometimes uses one of these; we don't really care which!
    String[] matches = {"yes", "1", "true", "on"};
    for (String match : matches) {
      if (match.equalsIgnoreCase(value)) return true;
    }
    return false;
  }

  private String verifyKey(String key, Map<String, String> dictionary, String executable,
      String output) {
    if (!dictionary.containsKey(key)) {
      throw new MacNetworkSetupException("Couldn't find " + key + " in " + executable +
          "; output: " + output);
    }
    return dictionary.get(key);
  }

  private String getPrimaryNetworkServiceName() {
    // TODO This would be faster (but harder to test?) if we just launched scutil once
    // and communicated with it line-by-line using stdin/stdout
    String output = runScutil("show State:/Network/Global/IPv4");
    log.fine(output);
    Map<String, String> dictionary = Maps.parseDictionary(output.toString(), SCUTIL_LINE, false);
    String primaryInterface = verifyKey("PrimaryInterface", dictionary, "scutil", output);
    output = runNetworkSetup("-listnetworkserviceorder");
    log.fine(output);
    dictionary = Maps.parseDictionary(output.toString(), NETWORKSETUP_LISTORDER_LINE, true);
    String userDefinedName =
        verifyKey(primaryInterface, dictionary, "networksetup -listnetworksetuporder", output);
    networkService = userDefinedName;
    return userDefinedName;

  }

  /** Execute scutil and quit, returning the output */
  protected String runScutil(String arg) {
    CommandLine command = new CommandLine(findScutilBin());
    command.setInput(arg + "\nquit\n");
    command.execute();
    String output = command.getStdOut();
    if (!command.isSuccessful()) {
      throw new RuntimeException("exec return code " + command.getExitCode() + ": " + output);
    }
    return output;
  }

  /** Execute networksetup, returning the output */
  protected String runNetworkSetup(String... args) {
    CommandLine command = new CommandLine(findNetworkSetupBin(), args);
    command.execute();
    String output = command.getStdOut();
    if (!command.isSuccessful()) {
      throw new RuntimeException("exec return code " + command.getStdOut() + ": " + output);
    }
    return output;
  }

  @SuppressWarnings("serial")
  static class MacNetworkSetupException extends RuntimeException {
    MacNetworkSetupException(Exception e) {
      super(generateMessage(), e);
    }

    private static String generateMessage() {
      return "Problem while managing OS X network settings, OS Version " +
          System.getProperty("os.version");
      // TODO more diagnostics re: networksetup? md5sum? others?
    }

    MacNetworkSetupException(String message) {
      this(new RuntimeException(message));
    }

    MacNetworkSetupException(String message, Throwable e) {
      super(generateMessage() + ": " + message, e);
    }
  }

  /**
   * Copy OS X network settings into Java's per-user persistent preference store
   *
   * @see Preferences
   * */
  public void backupNetworkSettings() {
    // Don't clobber our old backup if we
    // never got the chance to restore for some reason
    if (backupIsReady()) return;
    log.info("Backing up OS X global network settings...");
    MacNetworkSettings networkSettings = getCurrentNetworkSettings();
    writeToPrefs(networkSettings);
    backupReady(true);
  }

  /** Restore OS X network settings back the way thay were */
  public void restoreNetworkSettings() {
    // Backup really should be ready, but if not, skip it
    if (!backupIsReady()) return;
    log.info("Restoring OS X global network settings...");
    MacNetworkSettings networkSettings = retrieveFromPrefs();

    runNetworkSetup("-setwebproxy", networkSettings.serviceName, networkSettings.proxyServer, "" +
        networkSettings.port1);
    // DGF Do we need to do anything with authentication? Let's just leave it alone and hope it
    // doesn't bite us

    if (networkSettings.bypass.length > 0) {
      String[] bypassDomainArgs = new String[networkSettings.bypass.length + 2];
      bypassDomainArgs[0] = "-setproxybypassdomains";
      bypassDomainArgs[1] = networkSettings.serviceName;
      System.arraycopy(networkSettings.bypass, 0, bypassDomainArgs, 2,
          networkSettings.bypass.length);
      runNetworkSetup(bypassDomainArgs);
    } else {
      runNetworkSetup("-setproxybypassdomains", networkSettings.serviceName, "Empty");
    }

    String enabledArg = networkSettings.enabled ? "on" : "off";

    runNetworkSetup("-setwebproxystate", networkSettings.serviceName, enabledArg);

    backupReady(false);
  }

  /** Extract network data from Java user preferences */
  private MacNetworkSettings retrieveFromPrefs() {
    String serviceName = prefsGetStringOrFail("serviceName");
    String proxyServer = prefsGetStringOrFail("proxyServer");
    String strBypass = prefsGetStringOrFail("bypass");
    String[] bypassEncodedArray, bypass;
    if ("".equals(strBypass)) {
      bypass = new String[0];
    } else {
      bypassEncodedArray = strBypass.split("\t");
      int domains;
      try {
        domains = Integer.parseInt(bypassEncodedArray[0]);
      } catch (NumberFormatException e) {
        throw new RuntimeException("BUG! Couldn't decode bypass preference: " + strBypass);
      }
      bypass = new String[domains];
      if (domains == bypassEncodedArray.length) {
        // DGF blank domain... I assume that only the last domain can be blank?
        if (domains == 1) {
          bypass = new String[] {""};
        } else {
          if (bypassEncodedArray.length != domains - 1) {
            throw new RuntimeException("BUG! Couldn't decode bypass preference: " + strBypass);
          }
          System.arraycopy(bypassEncodedArray, 1, bypass, 0, domains - 1);
        }
      } else {
        if (bypassEncodedArray.length != domains + 1) {
          throw new RuntimeException("BUG! Couldn't decode bypass preference: " + strBypass);
        }
        System.arraycopy(bypassEncodedArray, 1, bypass, 0, domains);
      }
    }

    int port1 = prefsGetIntOrFail("port");
    boolean enabled = prefsGetBooleanOrFail("enabled");
    boolean authenticated = prefsGetBooleanOrFail("authenticated");
    return new MacNetworkSettings(serviceName, enabled, proxyServer, port1, authenticated, bypass);
  }

  private String prefsGetStringOrFail(String key) {
    String value = prefs.get(key, null);
    if (value == null) {
      throw new RuntimeException("BUG! pref key " + key + " should not be null");
    }
    return value;
  }

  private int prefsGetIntOrFail(String key) {
    prefsGetStringOrFail(key);
    return prefs.getInt(key, 0);
  }

  private boolean prefsGetBooleanOrFail(String key) {
    prefsGetStringOrFail(key);
    return prefs.getBoolean(key, false);
  }

  private void writeToPrefs(MacNetworkSettings networkSettings) {
    prefs.put("serviceName", networkSettings.serviceName);
    prefs.putBoolean("enabled", networkSettings.enabled);
    prefs.put("proxyServer", networkSettings.proxyServer);
    prefs.putInt("port", networkSettings.port1);
    prefs.putBoolean("authenticated", networkSettings.authenticated);
    prefs.put("bypass", networkSettings.bypassAsString());
  }

  private boolean backupIsReady() {
    if (!prefNodeExists(BACKUP_READY)) return false;
    return prefs.getBoolean(BACKUP_READY, false);
  }

  private void backupReady(boolean backupReady) {
    prefs.putBoolean(BACKUP_READY, backupReady);
  }

  /** Data class to hold network settings */
  class MacNetworkSettings {
    final String serviceName;
    final boolean enabled;
    final String proxyServer;
    final int port1;
    final boolean authenticated;
    final String[] bypass;

    public MacNetworkSettings(String serviceName, boolean enabled, String server, int port,
        boolean authenticated, String[] bypass) {
      this.serviceName = serviceName;
      this.enabled = enabled;
      this.proxyServer = server;
      this.port1 = port;
      this.authenticated = authenticated;
      this.bypass = bypass;
    }


    /** Return bypass domains as tab-delimited string */
    public String bypassAsString() {
      StringBuffer sb = new StringBuffer();
      sb.append(bypass.length).append('\t');
      for (String domain : bypass) {
        sb.append(domain).append('\t');
      }
      return sb.toString();
    }

    @Override
    public String toString() {
      StringBuffer sb = new StringBuffer("{serviceName=");
      sb.append(serviceName)
          .append(", enabled=").append(enabled)
          .append(", proxyServer=").append(proxyServer)
          .append(", port=").append(port1)
          .append(", authenticated=").append(authenticated)
          .append(", bypass=").append(Arrays.toString(bypass))
          .append("}");
      return sb.toString();
    }
  }

}
