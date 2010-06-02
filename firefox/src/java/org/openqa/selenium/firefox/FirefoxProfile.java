/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.firefox;

import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.Proxy.ProxyType;
import org.openqa.selenium.internal.Cleanly;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.TemporaryFilesystem;
import org.openqa.selenium.internal.Zip;
import org.w3c.dom.Document;
import org.w3c.dom.Node;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.xml.XMLConstants;
import javax.xml.namespace.NamespaceContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

public class FirefoxProfile {
  private static final String EXTENSION_NAME = "fxdriver@googlecode.com";
  private static final String EM_NAMESPACE_URI = "http://www.mozilla.org/2004/em-rdf#";
  private File profileDir;
  private File extensionsDir;
  private File userPrefs;
  private Preferences additionalPrefs = new Preferences();
  private int port;
  private boolean enableNativeEvents;
  private boolean loadNoFocusLib;
  private boolean acceptUntrustedCerts;
  private boolean untrustedCertIssuer;

  /**
   * Constructs a firefox profile from an existing, physical profile directory.
   * Not a good idea, please don't.
   * 
   * <p>Users who need this functionality should be using a named profile.
   * 
   * @param profileDir
   */
  protected FirefoxProfile(File profileDir) {
    this.profileDir = profileDir;
    this.extensionsDir = new File(profileDir, "extensions");
    this.userPrefs = new File(profileDir, "user.js");

    port = FirefoxDriver.DEFAULT_PORT;
    enableNativeEvents = FirefoxDriver.DEFAULT_ENABLE_NATIVE_EVENTS;
    loadNoFocusLib = false;
    acceptUntrustedCerts = FirefoxDriver.ACCEPT_UNTRUSTED_CERTIFICATES;
    untrustedCertIssuer = FirefoxDriver.ASSUME_UNTRUSTED_ISSUER;

    if (!profileDir.exists()) {
      throw new WebDriverException(MessageFormat.format("Profile directory does not exist: {0}",
          profileDir.getAbsolutePath()));
    }
  }

  
  public FirefoxProfile() {
    this(TemporaryFilesystem.createTempDir("webdriver", "profile"));
  }

  protected void addWebDriverExtensionIfNeeded(boolean forceCreation) {
    File extensionLocation = new File(extensionsDir, EXTENSION_NAME);
    if (!forceCreation && extensionLocation.exists()) {
      return;
    }

    try {
      addExtension(FirefoxProfile.class, "webdriver.xpi");
    } catch (IOException e) {
      if (!Boolean.getBoolean("webdriver.development")) {
        throw new WebDriverException("Failed to install webdriver extension", e);
      }
    }

    deleteExtensionsCacheIfItExists();
  }

  public File addExtension(Class<?> loadResourcesUsing, String loadFrom) throws IOException {
      // Is loadFrom a file?
      File file = new File(loadFrom);
      if (file.exists()) {
        addExtension(file);
        return file;
      }

      // Try and load it from the classpath
      InputStream resource = loadResourcesUsing.getResourceAsStream(loadFrom);
      if (resource == null && !loadFrom.startsWith("/")) {
        resource = loadResourcesUsing.getResourceAsStream("/" + loadFrom);
      }
      if (resource == null) {
        resource = FirefoxProfile.class.getResourceAsStream(loadFrom);
      }
      if (resource == null && !loadFrom.startsWith("/")) {
        resource = FirefoxProfile.class.getResourceAsStream("/" + loadFrom);
      }
      if (resource == null) {
        throw new FileNotFoundException("Cannot locate resource with name: " + loadFrom);
      }

      File root;
      if (FileHandler.isZipped(loadFrom)) {
        root = FileHandler.unzip(resource);
      } else {
        throw new WebDriverException("Will only install zipped extensions for now");
      }

      addExtension(root);
      return root;
    }

  /**
   * Attempt to add an extension to install into this instance.
   *
   * @param extensionToInstall
   * @throws IOException
   */
  public void addExtension(File extensionToInstall) throws IOException {
    if (!extensionToInstall.isDirectory() &&
        !FileHandler.isZipped(extensionToInstall.getAbsolutePath())) {
      throw new IOException("Can only install from a zip file, an XPI or a directory");
    }

    File root = obtainRootDirectory(extensionToInstall);

    String id = readIdFromInstallRdf(root);

    File extensionDirectory = new File(extensionsDir, id);

    if (extensionDirectory.exists() && !FileHandler.delete(extensionDirectory)) {
      throw new IOException("Unable to delete existing extension directory: " + extensionDirectory);
    }

    FileHandler.createDir(extensionDirectory);
    FileHandler.makeWritable(extensionDirectory);
    FileHandler.copy(root, extensionDirectory);
  }

  private String readIdFromInstallRdf(File root) {
    try {
      File installRdf = new File(root, "install.rdf");

      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
      factory.setNamespaceAware(true);
      DocumentBuilder builder = factory.newDocumentBuilder();
      Document doc = builder.parse(installRdf);

      XPath xpath = XPathFactory.newInstance().newXPath();
      xpath.setNamespaceContext(new NamespaceContext() {
        public String getNamespaceURI(String prefix) {
          if ("em".equals(prefix)) {
            return EM_NAMESPACE_URI;
          } else if ("RDF".equals(prefix)) {
            return "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
          }

          return XMLConstants.NULL_NS_URI;
        }

        public String getPrefix(String uri) {
          throw new UnsupportedOperationException("getPrefix");
        }

        public Iterator<?> getPrefixes(String uri) {
          throw new UnsupportedOperationException("getPrefixes");
        }
      });

      Node idNode = (Node) xpath.compile("//em:id").evaluate(doc, XPathConstants.NODE);

      String id = null;
      if (idNode == null) {
        Node descriptionNode =
            (Node) xpath.compile("//RDF:Description").evaluate(doc, XPathConstants.NODE);
        Node idAttr = descriptionNode.getAttributes().getNamedItemNS(EM_NAMESPACE_URI, "id");
        if (idAttr == null) {
          throw new WebDriverException(
              "Cannot locate node containing extension id: " + installRdf.getAbsolutePath());
        }
        id = idAttr.getNodeValue();
      } else {
        id = idNode.getTextContent();
      }

      if (id == null || "".equals(id.trim())) {
        throw new FileNotFoundException("Cannot install extension with ID: " + id);
      }
      return id;
    } catch (Exception e) {
      throw new WebDriverException(e);
    }
  }

  private File obtainRootDirectory(File extensionToInstall) throws IOException {
    File root = extensionToInstall;
    if (!extensionToInstall.isDirectory()) {
      BufferedInputStream bis =
          new BufferedInputStream(new FileInputStream(extensionToInstall));
      try {
        root = FileHandler.unzip(bis);
      } finally {
        bis.close();
      }
    }
    return root;
  }

  protected void installDevelopmentExtension() throws IOException {
      if (!FileHandler.createDir(extensionsDir))
        throw new IOException("Cannot create extensions directory: " + extensionsDir.getAbsolutePath());

      String home = findFirefoxExtensionRootInSourceCode();

      File writeTo = new File(extensionsDir, EXTENSION_NAME);
        if (writeTo.exists() && !FileHandler.delete(writeTo)) {
            throw new IOException("Cannot delete existing extensions directory: " +
                                  extensionsDir.getAbsolutePath());
        }

        FileWriter writer = null;
        try {
            writer = new FileWriter(writeTo);
            writer.write(home);
        } catch (IOException e) {
            throw new WebDriverException(e);
        } finally {
            Cleanly.close(writer);
        }
    }

  private String findFirefoxExtensionRootInSourceCode() {
    String[] possiblePaths = {
        "firefox/src/extension",
        "../firefox/src/extension",
        "../../firefox/src/extension",
    };

    File current;
    for (String potential : possiblePaths) {
      current = new File(potential);
      if (current.exists()) {
        return current.getAbsolutePath();
      }
    }

    throw new WebDriverException("Unable to locate firefox driver extension in developer source");
  }

  public File getProfileDir() {
        return profileDir;
    }

    //Assumes that we only really care about the preferences, not the comments
    private Map<String, String> readExistingPrefs(File userPrefs) {
        Map<String, String> prefs = new HashMap<String, String>();

        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new FileReader(userPrefs));
            String line = reader.readLine();
            while (line != null) {
                if (!line.startsWith("user_pref(\"")) {
                    line = reader.readLine();
                    continue;
                }
                line = line.substring("user_pref(\"".length());
                line = line.substring(0, line.length() - ");".length());
                String[] parts = line.split(",");
                parts[0] = parts[0].substring(0, parts[0].length() - 1);
                prefs.put(parts[0].trim(), parts[1].trim());

                line = reader.readLine();
            }
        } catch (IOException e) {
            throw new WebDriverException(e);
        } finally {
            Cleanly.close(reader);
        }

        return prefs;
    }

    public File getExtensionsDir() {
        return extensionsDir;
    }

    /**
     * Set a preference for this particular profile. The value will be properly quoted
     * before use. Note that if a value looks as if it is a quoted string (that is, starts
     * with a quote character and ends with one too) an IllegalArgumentException is thrown:
     * Firefox fails to start properly when some values are set to this.
     *
     * @param key The key
     * @param value The new value.
     */
    public void setPreference(String key, String value) {
        additionalPrefs.setPreference(key, value);
    }

    /**
     * Set a preference for this particular profile.
     *
     * @param key The key
     * @param value The new value.
     */
    public void setPreference(String key, boolean value) {
        additionalPrefs.setPreference(key, value);
    }

    /**
     * Set a preference for this particular profile.
     *
     * @param key The key
     * @param value The new value.
     */
    public void setPreference(String key, int value) {
        additionalPrefs.setPreference(key, value);
    }

    /**
     * Set proxy preferences for this profile.
     * 
     * @param proxy The proxy preferences.
     * @return The profile, for further settings.
     */
    public FirefoxProfile setProxyPreferences(Proxy proxy) {
      if (proxy.getProxyType() == ProxyType.UNSPECIFIED) {
        return this;
      }
      setPreference("network.proxy.type", proxy.getProxyType().ordinal());

      switch (proxy.getProxyType()) {
        case MANUAL:// By default, assume we're proxying the lot
          setPreference("network.proxy.no_proxies_on", "");

          setManualProxyPreference("ftp", proxy.getFtpProxy());
          setManualProxyPreference("http", proxy.getHttpProxy());
          setManualProxyPreference("ssl", proxy.getSslProxy());
          if (proxy.getNoProxy() != null) {
            setPreference("network.proxy.no_proxies_on", proxy.getNoProxy());
          }
          
          break;
        case PAC:
          setPreference("network.proxy.autoconfig_url", proxy.getProxyAutoconfigUrl());
          break;
      }
      return this;
    }
    
    private void setManualProxyPreference(String key, String settingString) {
      if (settingString == null) {
        return;
      }
      String[] hostPort = settingString.split(":");
      setPreference("network.proxy." + key, hostPort[0]);
      if (hostPort.length > 1) {
        setPreference("network.proxy." + key + "_port", Integer.parseInt(hostPort[1]));
      }
    }


    protected Preferences getAdditionalPreferences() {
      return additionalPrefs;
    }

    public void updateUserPrefs() {
        if (port == 0) {
            throw new WebDriverException("You must set the port to listen on before updating user.js");
        }

        Map<String, String> prefs = new HashMap<String, String>();

        // Allow users to override these settings
        prefs.put("browser.startup.homepage", "\"about:blank\"");
        // The user must be able to override this setting (to 1) in order to
        // to change homepage on Firefox 3.0
        prefs.put("browser.startup.page", "0");

        if (userPrefs.exists()) {
            prefs = readExistingPrefs(userPrefs);
            if (!userPrefs.delete())
                throw new WebDriverException("Cannot delete existing user preferences");
        }

        additionalPrefs.addTo(prefs);

        // Normal settings to facilitate testing
        prefs.put("app.update.auto", "false");
        prefs.put("app.update.enabled", "false");
        prefs.put("browser.download.manager.showWhenStarting", "false");
        prefs.put("browser.EULA.override", "true");
        prefs.put("browser.EULA.3.accepted", "true");
        prefs.put("browser.link.open_external", "2");
        prefs.put("browser.link.open_newwindow", "2");
        prefs.put("browser.safebrowsing.enabled", "false");
        prefs.put("browser.search.update", "false");
        prefs.put("browser.sessionstore.resume_from_crash", "false");
        prefs.put("browser.shell.checkDefaultBrowser", "false");
        prefs.put("browser.tabs.warnOnClose", "false");
        prefs.put("browser.tabs.warnOnOpen", "false");
        prefs.put("dom.disable_open_during_load", "false");
        prefs.put("extensions.update.enabled", "false");
        prefs.put("extensions.update.notifyUser", "false");
        prefs.put("security.fileuri.origin_policy", "3");
        prefs.put("security.fileuri.strict_origin_policy", "false");
        prefs.put("security.warn_entering_secure", "false");
        prefs.put("security.warn_submit_insecure", "false");
        prefs.put("security.warn_entering_secure.show_once", "false");
        prefs.put("security.warn_entering_weak", "false");
        prefs.put("security.warn_entering_weak.show_once", "false");
        prefs.put("security.warn_leaving_secure", "false");
        prefs.put("security.warn_leaving_secure.show_once", "false");
        prefs.put("security.warn_submit_insecure", "false");
        prefs.put("security.warn_viewing_mixed", "false");
        prefs.put("security.warn_viewing_mixed.show_once", "false");
        prefs.put("signon.rememberSignons", "false");

        // Which port should we listen on?
        prefs.put("webdriver_firefox_port", Integer.toString(port));

        // Should we use native events?
        prefs.put("webdriver_enable_native_events",
            Boolean.toString(enableNativeEvents));
        
        // Should we accept untrusted certificates or not?
        prefs.put("webdriver_accept_untrusted_certs",
            Boolean.toString(acceptUntrustedCerts));
        
        prefs.put("webdriver_assume_untrusted_issuer",
            Boolean.toString(untrustedCertIssuer));
         

        // Settings to facilitate debugging the driver
        prefs.put("javascript.options.showInConsole", "true"); // Logs errors in chrome files to the Error Console.
        prefs.put("browser.dom.window.dump.enabled", "true");  // Enables the use of the dump() statement

        // If the user sets the home page, we should also start up there
        prefs.put("startup.homepage_welcome_url", prefs.get("browser.startup.homepage"));

        if (!"about:blank".equals(prefs.get("browser.startup.homepage"))) {
          prefs.put("browser.startup.page", "1");
        }

        writeNewPrefs(prefs);
    }

    public void deleteExtensionsCacheIfItExists() {
        File cacheFile = new File(extensionsDir, "../extensions.cache");
        if (cacheFile.exists())
            cacheFile.delete();
    }

    protected void writeNewPrefs(Map<String, String> prefs) {
        Writer writer = null;
        try {
            writer = new FileWriter(userPrefs);
            for (Map.Entry<String, String> entry : prefs.entrySet()) {
                writer.append(
                  String.format("user_pref(\"%s\", %s);\n", entry.getKey(), entry.getValue())
              );
            }
        } catch (IOException e) {
            throw new WebDriverException(e);
        } finally {
            Cleanly.close(writer);
        }
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public boolean enableNativeEvents() {
      return enableNativeEvents;
    }

    public void setEnableNativeEvents(boolean enableNativeEvents) {
      this.enableNativeEvents = enableNativeEvents;
    }

    /**
     * Returns whether the no focus library should be loaded for Firefox
     * profiles launched on Linux, even if native events are disabled.
     *
     * @return Whether the no focus library should always be loaded for Firefox
     *     on Linux.
     */
    public boolean alwaysLoadNoFocusLib() {
      return loadNoFocusLib;
    }

    /**
     * Sets whether the no focus library should always be loaded on Linux.
     *
     * @param loadNoFocusLib Whether to always load the no focus library.
     */
    public void setAlwaysLoadNoFocusLib(boolean loadNoFocusLib) {
      this.loadNoFocusLib = loadNoFocusLib;
    }
    
    /**
     * Sets whether Firefox should accept SSL certificates which have expired,
     * signed by an unknown authority or are generally untrusted.
     * This is set to true by defaul.t
     * 
     * @param acceptUntrustedSsl Whether untrusted SSL certificates should be
     * accepted.
     */
    
    public void setAcceptUntrustedCertificates(boolean acceptUntrustedSsl) {
      this.acceptUntrustedCerts = acceptUntrustedSsl;
    }

    /**
     * By default, when accepting untrusted SSL certificates, assume that
     * these certificates will come from an untrusted issuer or will be self
     * signed.
     * Due to limitation within Firefox, it is easy to find out if the
     * certificate has expired or does not match the host it was served for,
     * but hard to find out if the issuer of the certificate is untrusted.
     * 
     * By default, it is assumed that the certificates were not be issued from
     * a trusted CA.
     * 
     * If you are receive an "untrusted site" prompt on Firefox when using a
     * certificate that was issued by valid issuer, but has expired or 
     * is being served served for a different host (e.g. production certificate
     * served in a testing environment) set this to false.
     *  
     * @param untrustedIssuer whether to assume untrusted issuer or not.
     */
    public void setAssumeUntrustedCertificateIssuer(boolean untrustedIssuer) {
      this.untrustedCertIssuer = untrustedIssuer;
    }

  public boolean isRunning() {
        File macAndLinuxLockFile = new File(profileDir, ".parentlock");
        File windowsLockFile = new File(profileDir, "parent.lock");

        return macAndLinuxLockFile.exists() || windowsLockFile.exists();
    }

    public void clean() {
      TemporaryFilesystem.deleteTempDir(profileDir);
    }

  public String toJson() throws IOException {
    updateUserPrefs();

    return new Zip().zip(profileDir);
  }

  public static FirefoxProfile fromJson(String json) throws IOException {
    File dir = TemporaryFilesystem.createTempDir("webdriver", "duplicated");

    new Zip().unzip(json, dir);

    return new FirefoxProfile(dir);
  }
}
