package org.openqa.selenium.internal;

import java.io.File;
import java.io.FileNotFoundException;

import org.openqa.selenium.WebDriverException;

public class InProject {
  /**
   * Locates a file in the current project
   * @param path path to file to locate from root of project
   * @return file being sought, if it exists
   * @throws org.openqa.selenium.WebDriverException wrapped FileNotFoundException if file could
   * not be found
   */
  public static File locate(String path) {
    File dir = new File(".").getAbsoluteFile();
    while (dir != null) {
      File needle = new File(dir, path);
      if (needle.exists()) {
        return needle;
      }
      dir = dir.getParentFile();
    }

    throw new WebDriverException(new FileNotFoundException(
        "Could not find " + path + " in the project"));
  }
}
