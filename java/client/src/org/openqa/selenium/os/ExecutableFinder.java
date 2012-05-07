package org.openqa.selenium.os;

import static org.openqa.selenium.Platform.WINDOWS;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Map;

import org.openqa.selenium.Platform;

import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableSet;
import com.google.common.io.Files;

public class ExecutableFinder {
  private static final ImmutableSet<String> ENDINGS = Platform.getCurrent().is(WINDOWS) ?
      ImmutableSet.of("", ".exe", ".com", ".bat") : ImmutableSet.of("");

  private static final Method JDK6_CAN_EXECUTE = findJdk6CanExecuteMethod();

  private final ImmutableSet.Builder<String> pathSegmentBuilder =
      new ImmutableSet.Builder<String>();
  
  /**
   * Find the executable by scanning the file system and the PATH. In the case of Windows this
   * method allows common executable endings (".com", ".bat" and ".exe") to be omitted.
   *
   * @param named The name of the executable to find
   * @return The absolute path to the executable, or null if no match is made.
   */
  public String find(String named) {
    File file = new File(named);
    if (canExecute(file)) {
      return named;
    }
    
    addPathFromEnvironment();
    if (Platform.getCurrent().is(Platform.MAC)) {
      addMacSpecificPath();
    }
    
    for (String pathSegment : pathSegmentBuilder.build()) {
      for (String ending : ENDINGS) {
        file = new File(pathSegment, named + ending);
        if (canExecute(file)) {
          return file.getAbsolutePath();
        }
      }
    }
    return null;
  }

  private void addPathFromEnvironment() {
    String pathName = "PATH";
    Map<String, String> env = System.getenv();
    if (!env.containsKey(pathName)) {
      for (String key : env.keySet()) {
        if (pathName.equalsIgnoreCase(key)) {
          pathName = key;
          break;
        }
      }
    }
    String path = env.get(pathName);
    if (path != null) {
      pathSegmentBuilder.add(path.split(File.pathSeparator));
    }
  }

  private void addMacSpecificPath() {
    File pathFile = new File("/etc/paths");
    if (pathFile.exists()) {
      try {
        pathSegmentBuilder.addAll(Files.readLines(pathFile, Charsets.UTF_8));
      } catch (IOException e) {
        // Guess we won't include those, then
      }
    }
  }

  private static boolean canExecute(File file) {
    if (!file.exists() || file.isDirectory()) {
      return false;
    }

    if (JDK6_CAN_EXECUTE != null) {
      try {
        return (Boolean) JDK6_CAN_EXECUTE.invoke(file);
      } catch (IllegalAccessException e) {
        // Do nothing
      } catch (InvocationTargetException e) {
        // Still do nothing
      }
    }
    return true;
  }

  private static Method findJdk6CanExecuteMethod() {
    try {
      return File.class.getMethod("canExecute");
    } catch (NoSuchMethodException e) {
      return null;
    }
  }
}
