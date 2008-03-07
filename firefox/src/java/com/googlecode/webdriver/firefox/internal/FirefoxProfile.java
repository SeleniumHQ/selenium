package com.googlecode.webdriver.firefox.internal;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;

public class FirefoxProfile {
  private final File profileDir;
  private final File extensionsDir;
  private File userPrefs;
  private Map<String, String> additionalPrefs = new HashMap<String, String>();
  private int port;
  
  public FirefoxProfile(File profileDir) {
    this.profileDir = profileDir;
    this.extensionsDir = new File(profileDir, "extensions");
    this.userPrefs = new File(profileDir, "user.js");
  }
 
  public File getProfileDir() {
    return profileDir;
  }
  
  public Map<String, Object> getUserPrefs() {
    return null;
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
          throw new RuntimeException(e);
      } finally {
          Cleanly.close(reader);
      }

      return prefs;
  }

  public File getExtensionsDir() {
    return extensionsDir;
  }

  public void addAdditionalPreferences(Map<String, String> additionalPrefs) {
    this.additionalPrefs.putAll(additionalPrefs);
  }
  
  public void updateUserPrefs() {
    if (port == 0) {
      throw new RuntimeException("You must set the port to listen on before updating user.js");
    }
    
    Map<String, String> prefs = new HashMap<String, String>();
    
    if (userPrefs.exists()) {
        prefs = readExistingPrefs(userPrefs);
        if (!userPrefs.delete())
            throw new RuntimeException("Cannot delete existing user preferences");
    }

    prefs.putAll(additionalPrefs);
    
    // Normal settings to facilitate testing
    prefs.put("app.update.enabled", "false");
    prefs.put("browser.download.manager.showWhenStarting", "false");
    prefs.put("browser.link.open_external", "2");
    prefs.put("browser.link.open_newwindow", "2");
    prefs.put("browser.search.update", "false");
    prefs.put("browser.shell.checkDefaultBrowser", "false");
    prefs.put("browser.startup.page", "0");
    prefs.put("browser.tabs.warnOnClose", "false");
    prefs.put("browser.tabs.warnOnOpen", "false");
    prefs.put("dom.disable_open_during_load", "false");
    prefs.put("extensions.update.enabled", "false");
    prefs.put("extensions.update.notifyUser", "false");
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

    // Settings to facilitate debugging the driver
    prefs.put("javascript.options.showInConsole", "true"); // Logs errors in chrome files to the Error Console.
    prefs.put("browser.dom.window.dump.enabled", "true");  // Enables the use of the dump() statement 

    writeNewPrefs(prefs);
  }

  public void deleteExtensionsCacheIfItExists() {
    File cacheFile = new File(extensionsDir, "extensions.cache");
    if (cacheFile.exists())
        cacheFile.delete();
  }
  
  protected void writeNewPrefs(Map<String, String> prefs) {
    Writer writer = null;
    try {
        writer = new FileWriter(userPrefs);
        for (Map.Entry<String, String> entry : prefs.entrySet()) {
            writer.append("user_pref(\"").append(entry.getKey()).append("\", ").append(entry.getValue()).append(");\n");
        }
    } catch (IOException e) {
        throw new RuntimeException(e);
    } finally {
        Cleanly.close(writer);
    }
  }

  public void setPort(int port) {
    this.port = port;
  }
}
