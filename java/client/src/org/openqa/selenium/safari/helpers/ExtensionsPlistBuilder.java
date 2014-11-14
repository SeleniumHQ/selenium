package org.openqa.selenium.safari.helpers;

import com.google.common.base.Joiner;
import com.google.common.io.Files;

import java.io.File;
import java.util.List;

public class ExtensionsPlistBuilder {

  private static final String EXTENSION_PLIST_LINES_HEAD = Joiner.on("\n").join(
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      "<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\"" +
      " \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">",
      "<plist version=\"1.0\">",
      "<dict>",
      "\t<key>Available Updates</key>",
      "\t<dict>",
      "\t\t<key>Last Update Check Time</key>",
      "\t\t<real>370125644.75941497</real>",
      "\t\t<key>Updates List</key>",
      "\t\t<array/>",
      "\t</dict>",
      "\t<key>Installed Extensions</key>",
      "\t<array>\n");

  private static final String EXTENSION_PLIST_LINES_ITEM = Joiner.on("\n").join(
      "\t\t<dict>",
      "\t\t\t<key>Added Non-Default Toolbar Items</key>",
      "\t\t\t<array/>",
      "\t\t\t<key>Archive File Name</key>",
      "\t\t\t<string>%s.safariextz</string>",       // %s = name
      "\t\t\t<key>Bundle Directory Name</key>",
      "\t\t\t<string>%s.safariextension</string>",  // %s = name
      "\t\t\t<key>Enabled</key>",
      "\t\t\t<true/>",
      "\t\t\t<key>Hidden Bars</key>",
      "\t\t\t<array/>",
      "\t\t\t<key>Removed Default Toolbar Items</key>",
      "\t\t\t<array/>",
      "\t\t</dict>\n");

  private static final String EXTENSION_PLIST_LINES_TAIL = Joiner.on("\n").join(
      "\t</array>",
      "\t<key>Version</key>",
      "\t<integer>1</integer>",
      "</dict>",
      "</plist>");


  public static String buildPlist(List<File> installedExtensions) {
    StringBuilder plistContent = new StringBuilder(EXTENSION_PLIST_LINES_HEAD);
    for (File extensionFile : installedExtensions) {
      String basename = Files.getNameWithoutExtension(extensionFile.getName()); // Strip .safariextz
      plistContent.append(String.format(EXTENSION_PLIST_LINES_ITEM, basename, basename));
    }
    plistContent.append(EXTENSION_PLIST_LINES_TAIL);

    return plistContent.toString();
  }

}
