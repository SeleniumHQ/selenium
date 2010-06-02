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

import junit.framework.Test;
import junit.framework.TestCase;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.TemporaryFilesystem;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class FirefoxDriverTestSuite extends TestCase {
  public static Test suite() throws Exception {

//    System.setProperty("webdriver.development", "true");
//  System.setProperty("webdriver.firefox.useExisting", "true");

    return new TestSuiteBuilder()
        .addSourceDir("firefox")
        .addSourceDir("common")
        .usingDriver(FirefoxDriver.class)
        .exclude(FIREFOX)
        .keepDriverInstance()
        .includeJavascriptTests()
        .includeJsApiTests()
        .create();
  }

  public static class TestFirefoxDriver extends FirefoxDriver {
    public TestFirefoxDriver() {
      super(createTemporaryProfile());
    }

    public TestFirefoxDriver(FirefoxProfile profile) {
      super(copyExtensionTo(profile));
    }

    public TestFirefoxDriver(Capabilities capabilities) {
      super(tweakCapabilities(capabilities));
    }

    private static Capabilities tweakCapabilities(Capabilities caps) {
      DesiredCapabilities tweaked = new DesiredCapabilities(caps.asMap());
      if (tweaked.getCapability(PROFILE) == null) {
        tweaked.setCapability(PROFILE, createTemporaryProfile());
      } else {
        try {
          FirefoxProfile profile = 
              FirefoxProfile.fromJson((String) tweaked.getCapability(PROFILE));
          copyExtensionTo(profile);
          tweaked.setCapability(PROFILE, profile);
        } catch (IOException e) {
          throw new RuntimeException(e);
        }
      }
      return tweaked;
    }

    private static FirefoxProfile createTemporaryProfile() {
      File dir = TemporaryFilesystem.createTempDir("firefoxdriver", "");
      return copyExtensionTo(new FirefoxProfile(dir));
    }

    private static FirefoxProfile copyExtensionTo(FirefoxProfile p) {
      File extensionSource = FileHandler.locateInProject("firefox/src/extension");

      File dir = p.getProfileDir();
      File extension = new File(dir, "extensions/fxdriver@googlecode.com");

      try {
        if (!extension.mkdirs()) {
          throw new RuntimeException("Unable to create temp directory for webdriver extension");
        }
        FileHandler.copy(extensionSource, extension);
      } catch (IOException e) {
        throw new RuntimeException("Cannot copy extension directory");
      }

      File buildDir = FileHandler.locateInProject("build/Win32");

      // Copy in the native events library/libraries
      Map<String, String> fromTo = new HashMap<String, String>();
      if (Platform.getCurrent().is(Platform.WINDOWS)) {
        fromTo.put("Release/webdriver-firefox.dll",
        "platform/WINNT_x86-msvc/components/webdriver-firefox.dll");
      } else if (Platform.getCurrent().is(Platform.UNIX)) {
        fromTo.put("../linux64/Release/libwebdriver-firefox.so",
        "platform/Linux/components/libwebdriver-firefox.so");
      
        fromTo.put("../linux64/Release/x_ignore_nofocus.so",
        "amd64/x_ignore_nofocus.so");
        
        fromTo.put("../linux/Release/x_ignore_nofocus.so",
        "x86/x_ignore_nofocus.so");
      }

      // Grab the dommessenger
      File domMessenger = FileHandler.locateInProject("common/src/js/extension/dommessenger.js");
      File targetDomMessenger = new File(extension, "content/dommessenger.js");
      try {
        FileHandler.copy(domMessenger, targetDomMessenger);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }

      // We know the location of the "from" in relation to the extension source
      for (Map.Entry<String, String> entry : fromTo.entrySet()) {
        File source = new File(buildDir, entry.getKey());
        if (!source.exists()) {
          System.out.println("File does not exist. Falling back: " + source);
          source = FileHandler.locateInProject("firefox/prebuilt");
          source = new File(source, entry.getKey());
          if (!source.exists()) {
            throw new RuntimeException("Unable to locate: " + source);
          }
        }
        File toDir = extension;
        if (entry.getValue().contains("x_ignore_nofocus.so")) {
          toDir = dir;
        }
        
        File dest = new File(toDir, entry.getValue());
        dest.getParentFile().mkdirs(); // Ignore the return code, cos we're about to throw an exception
        try {
          FileHandler.copy(source, dest);
        } catch (IOException e) {
          throw new RuntimeException(e);
        }
      }

      copyXpts(extension);

      // Now delete all the .svn directories
      deleteSvnDirectories(extension);

      FirefoxProfile profile = new FirefoxProfile(dir);
      p.getAdditionalPreferences().addTo(profile);
      if (Boolean.getBoolean("webdriver.debug")) {
        try {
          profile.addExtension(FileHandler.locateInProject("third_party/firebug/firebug-1.5.0-fx.xpi"));
        } catch (IOException e) {
          throw new RuntimeException(e);
        }
      }
      return profile;
    }

    private static void copyXpts(File extension) {
      Map<String, String> components = new HashMap<String, String>() {{
        put("build/firefox/nsINativeEvents.xpt", "components/nsINativeEvents.xpt");
        put("build/firefox/nsICommandProcessor.xpt", "components/nsICommandProcessor.xpt");
        put("build/firefox/nsIResponseHandler.xpt", "components/nsIResponseHandler.xpt");
      }};

      for (Map.Entry<String, String> component : components.entrySet()) {
        File xpt = FileHandler.locateInProject(component.getKey());
        File outXpt = new File(extension, component.getValue());

        try {
          if (xpt.exists()) {
            FileHandler.copy(xpt, outXpt);
          }
        } catch (IOException e) {
          throw new RuntimeException(e);
        }
      }
    }

    private static void deleteSvnDirectories(File file) {
      if (file.isDirectory()) {
        File svn = new File(file, ".svn");
        if (svn.exists()) {
          FileHandler.delete(svn);
        }

        File[] allChildren = file.listFiles();
        for (File child : allChildren) {
          deleteSvnDirectories(child);
        }
      }
    }
  }
}
