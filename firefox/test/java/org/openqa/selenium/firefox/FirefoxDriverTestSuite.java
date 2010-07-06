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

import java.io.File;
import java.io.IOException;
import java.util.Map;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.TemporaryFilesystem;
import org.openqa.selenium.remote.DesiredCapabilities;

import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Platform.WINDOWS;

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

    public TestFirefoxDriver(FirefoxProfile profile) throws Exception {
      super(copyExtensionTo(profile));
    }

    public TestFirefoxDriver(Capabilities capabilities) throws Exception {
      super(tweakCapabilities(capabilities));
    }

    private static Capabilities tweakCapabilities(Capabilities caps) throws Exception {
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
      try {
        return copyExtensionTo(new FirefoxProfile(dir));
      } catch (Exception e) {
        e.printStackTrace();
        fail(e.getMessage());
      }
      return null;
    }

    private static FirefoxProfile copyExtensionTo(FirefoxProfile p) throws Exception {
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

      // /me rolls up sleeves. Here we go.
      //' Where are resources able to hide?
      File root = FileHandler.locateInProject("Rakefile").getParentFile();
      File[] roots = new File[] {
          root,
          new File(root, "build/firefox"),
          new File(root, "firefox/prebuilt"),
          new File(root, "build/common"),
          new File(root, "common/prebuilt"),
          new File(".")  // Just in case
      };

      // Resources that are generated and which aren't prebuilt and destinations
      Map<String, File> generated = ImmutableMap.of(
        "atoms.js", new File(extension, "resource/modules/atoms.js")
      );
      
      // Resources that are generated and which are prebuilt
      Map<String, File> prebuilts = new ImmutableMap.Builder<String, File>()
          .put("Win32/Release/webdriver-firefox.dll", new File(extension, "platform/WINNT_x86-msvc/components/webdriver-firefox.dll"))
          .put("i386/libnoblur.so", new File(extension, "platform/Linux_x86-gcc3/components/libwebdriver-firefox.so"))
          .put("amd64/libnoblur64.so", new File(extension, "platform/Linux_x86_64-gcc3/components/libwebdriver-firefox.so"))
          .put("nsINativeEvents.xpt", new File(extension, "components/nsINativeEvents.xpt"))
          .put("nsICommandProcessor.xpt", new File(extension, "components/nsICommandProcessor.xpt"))
          .put("nsIResponseHandler.xpt", new File(extension, "components/nsIResponseHandler.xpt"))
          .build();

      // Resources that are in the tree and just need copying
      Map<String, File> toCopy = ImmutableMap.of(
          "common/src/js/extension/dommessenger.js", new File(extension, "content/dommessenger.js"),
          "firefox/src/extension", extension,
          "firefox/src/js", new File(extension, "resource/modules")
      );

      // TODO(simon): Handle the case of the "noblur" libraries

      copyGeneratedResources(roots, generated);
      copyResources(roots, prebuilts);
      copyResources(roots, toCopy);

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

    private static void copyGeneratedResources(File[] roots, Map<String, File> generated)
        throws Exception {
      // Snappy
      File found = findFile(roots, generated.entrySet().iterator().next().getKey());
      if (found == null) {
        runFirefoxBuild();
      }

      copyResources(roots, generated);
    }

    private static void copyResources(File[] roots, Map<String, File> files) throws IOException {
      for (Map.Entry<String, File> items : files.entrySet()) {
        File source = findFile(roots, items.getKey());
        createDestinationDirectory(items, source);
        FileHandler.copy(source, items.getValue());
      }
    }

    private static void createDestinationDirectory(Map.Entry<String, File> items, File source) {
      File dest = items.getValue();
      File parent = source.isFile() ? dest.getParentFile() : dest;
      assertTrue("Cannot make parent directory", parent.exists() || parent.mkdirs());
    }

    private static File findFile(File[] roots, String filename) {
      for (File root : roots) {
        File file = new File(root, filename);
        if (file.exists()) {
          return file;
        }
      }

      return null;
    }

    private static void runFirefoxBuild() throws Exception {
      System.out.println("Running //firefox:webdriver to generate required resources");

      String command = Platform.getCurrent().is(WINDOWS) ? "go.bat" : "./go";

      ProcessBuilder builder = new ProcessBuilder(command, "//firefox:webdriver");
      builder.directory(FileHandler.locateInProject("Rakefile").getParentFile());
      Process process = builder.start();

      int exitValue = process.waitFor();
      if (exitValue != 0) {
        fail("Unable to build artifacts");
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
