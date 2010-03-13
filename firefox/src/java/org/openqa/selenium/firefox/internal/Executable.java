package org.openqa.selenium.firefox.internal;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.internal.CircularOutputStream;

import java.io.File;
import java.io.OutputStream;
import java.util.Map;

/**
 * Wrapper around our runtime environment requirements.
 * Performs discovery of firefox instances.
 * 
 * <p>NOTE: System and platform binaries will only be discovered at class initialization.
 * 
 * @author gregory.block@google.com (Gregory Block)
 */
public class Executable {
  private static final File SYSTEM_BINARY = locateFirefoxBinaryFromSystemProperty();
  private static final File PLATFORM_BINARY = locateFirefoxBinaryFromPlatform();
  
  private final File binary;
  
  public Executable(File userSpecifiedBinaryPath) {
    if (userSpecifiedBinaryPath != null) {
      
      // It should exist and be a file.
      if (userSpecifiedBinaryPath.exists() && userSpecifiedBinaryPath.isFile()) {
        binary = userSpecifiedBinaryPath;
        return;
      }
      
      throw new WebDriverException(
          "Specified firefox binary location does not exist or is not a real file: " + 
          userSpecifiedBinaryPath);
    }

    if (SYSTEM_BINARY != null && SYSTEM_BINARY.exists()) {
      binary = SYSTEM_BINARY;
      return;
    }

    if (PLATFORM_BINARY != null && PLATFORM_BINARY.exists()) {
      binary = PLATFORM_BINARY;
      return;
    }
    
    throw new WebDriverException("Cannot find firefox binary in PATH. " +
        "Make sure firefox is installed. OS appears to be: " + Platform.getCurrent());
  }
  
  public File getFile() {
    return binary;
  }
  
  public String getPath() {
    return binary.getAbsolutePath();
  }
  
  public void setLibraryPath(ProcessBuilder builder, Map<String, String> extraEnv) {
    final String propertyName = getLibraryPathPropertyName();
    StringBuilder libraryPath = new StringBuilder();
    
    // If we have an env var set for the path, use it.
    String env = getEnvVar(propertyName, null);
    if (env != null) {
        libraryPath.append(env).append(File.pathSeparator);
    }
    
    // Check our extra env vars for the same var, and use it too.
    env = extraEnv.get(propertyName);
    if (env != null) {
        libraryPath.append(env).append(File.pathSeparator);
    }

    // Last, add the contents of the specified system property, defaulting to the binary's path.
    
    // On Snow Leopard, beware of problems the sqlite library    
    String firefoxLibraryPath = System.getProperty("webdriver.firefox.library.path", 
        binary.getParentFile().getAbsolutePath());
    if (Platform.getCurrent().is(Platform.MAC) && Platform.getCurrent().getMinorVersion() > 5) {
      libraryPath.append(libraryPath).append(File.pathSeparator);  
    } else {
      libraryPath.append(firefoxLibraryPath).append(File.pathSeparator).append(libraryPath);	
    }

    // Add the library path to the builder.
    builder.environment().put(propertyName, libraryPath.toString());
  }
  
  /**
   * Locates the firefox binary from a system property. Will throw an exception if the binary
   * cannot be found.
   */
  private static File locateFirefoxBinaryFromSystemProperty() {
      String binaryName = System.getProperty("webdriver.firefox.bin");
      if (binaryName == null)
          return null;
  
      File binary = new File(binaryName);
      if (binary.exists())
          return binary;
  
      switch (Platform.getCurrent()) {
          case WINDOWS:
          case VISTA:
          case XP:
              if (!binaryName.endsWith(".exe"))
                binaryName += ".exe";
              break;
  
          case MAC:
              if (!binaryName.endsWith(".app"))
                  binaryName += ".app";
              binaryName += "/Contents/MacOS/firefox-bin";
              break;

          default:
              // Fall through
      }

      binary = new File(binaryName);
      if (binary.exists())
          return binary;

      throw new WebDriverException(
          String.format(
              "\"webdriver.firefox.bin\" property set, but unable to locate the requested binary: %s",
              binaryName
          ));
  }
  
  /**
   * Locates the firefox binary by platform.
   */
  private static File locateFirefoxBinaryFromPlatform() {
    File binary = null;

    switch (Platform.getCurrent()) {
      case WINDOWS:
      case VISTA:
      case XP:
          binary = new File(getEnvVar("PROGRAMFILES", "\\Program Files") + "\\Mozilla Firefox\\firefox.exe");
          if (!binary.exists()) {
            binary = new File("/Program Files (x86)/Mozilla Firefox/firefox.exe");
          }
          break;

      case MAC:
          binary = new File("/Applications/Firefox.app/Contents/MacOS/firefox-bin");
          break;

      default:
          // Do nothing
    }

    return binary != null && binary.exists() ? binary : findBinary("firefox3", "firefox2", "firefox");
  }
  
  /**
   * Retrieve an env var; if no var is set, returns the default
   * 
   * @param name the name of the variable
   * @param defaultValue the default value of the variable
   * @return the env var
   */
  private static String getEnvVar(String name, String defaultValue) {
    final String value = System.getenv(name);
    if (value != null) {
      return value;
    }
    return defaultValue;
  }
  
  /**
   * Retrieves the platform specific env property name which contains the library path.
   */
  private static String getLibraryPathPropertyName() {
    switch (Platform.getCurrent()) {
      case MAC:
          return "DYLD_LIBRARY_PATH";

      case WINDOWS:
      case VISTA:
      case XP:
          return "PATH";

      default:
          return "LD_LIBRARY_PATH";
    }
  }

  /**
   * Walk a PATH to locate binaries with a specified name. Binaries will be searched for in the
   * order they are provided.
   * 
   * @param binaryNames the binary names to search for
   * @return the first binary found matching that name.
   */
  private static File findBinary(String... binaryNames) {
    final String[] paths = System.getenv("PATH").split(File.pathSeparator);
    for (String binaryName : binaryNames) {
      for (String path : paths) {
        File file = new File(path, binaryName);
        if (file.exists() && !file.isDirectory()) {
          return file;
        }
        if (Platform.getCurrent().is(Platform.WINDOWS)) {
          File exe = new File(path, binaryName + ".exe");
          if (exe.exists() && !exe.isDirectory()) {
            return exe;
          }
        }
      }
    }
    return null;
  }

  public OutputStream getDefaultOutputStream() {
    String firefoxLogFile = System.getProperty("webdriver.firefox.logfile");
    File logFile = firefoxLogFile == null ? null : new File(firefoxLogFile);
    return new CircularOutputStream(logFile);
  }
}
