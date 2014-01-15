package org.openqa.selenium.atoms;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.google.common.io.Resources;

import org.openqa.selenium.Build;
import org.openqa.selenium.testing.InProject;

import java.io.File;
import java.io.IOException;
import java.net.URL;

/**
 * Utility class for loading JavaScript resources.
 */
class JavaScriptLoader {
  private JavaScriptLoader() {}  // Utility class.

  static String loadResource(String resourcePath, String resourceTask) throws IOException {
    URL resourceUrl = JavaScriptLoader.class.getResource(resourcePath);
    if (resourceUrl != null) {
      return Resources.toString(resourceUrl, Charsets.UTF_8);
    } else {
      new Build().of(resourceTask).go();

      File topDir = InProject.locate("Rakefile").getParentFile();
      File builtFile = new File(topDir, taskToBuildOutput(resourceTask));
      return Files.toString(builtFile, Charsets.UTF_8);
    }
  }

  static String taskToBuildOutput(String taskName) {
    return taskName.replace("//", "build/") .replace(":", "/") + ".js";
  }
}
