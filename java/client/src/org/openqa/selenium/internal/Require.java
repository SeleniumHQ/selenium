// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.internal;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Objects;

/**
 * A utility class to check arguments (preconditions) and state.
 * <p>
 * Examples of use:
 * <pre>
 *   public void setActionWithTimeout(Action action delegate, int timeout) {
 *     this.action = Require.nonNull("Action", action);
 *     this.timeout = Require.positive("Timeout", timeout);
 *   }
 * </pre>
 */
public final class Require {

  private Require() {
    // An utility class
  }

  public static void precondition(boolean condition, String message, Object... args) {
    if (!condition) {
      throw new IllegalArgumentException(String.format(message, args));
    }
  }

  public static <T> T nonNull(String argName, T arg) {
    if (arg == null) {
      throw new IllegalArgumentException(argName + " must be set");
    }
    return arg;
  }

  public static <T> T nonNull(String argName, T arg, String message, Object... args) {
    if (arg == null) {
      throw new IllegalArgumentException(String.join(" ", argName, String.format(message, args)));
    }
    return arg;
  }

  public static <T> ArgumentChecker<T> argument(String argName, T arg) {
    return new ArgumentChecker<>(argName, arg);
  }

  public static class ArgumentChecker<T> {

    private final String argName;
    private final T arg;

    ArgumentChecker(String argName, T arg) {
      this.argName = argName;
      this.arg = arg;
    }

    public T nonNull() {
      if (arg == null) {
        throw new IllegalArgumentException(argName + " must be set");
      }
      return arg;
    }

    public T nonNull(String message, Object... args) {
      if (arg == null) {
        throw new IllegalArgumentException(String.format(message, args));
      }
      return arg;
    }

    public T equalTo(Object other) {
      if (arg == null) {
        throw new IllegalArgumentException(argName + " must be set");
      }
      if (!Objects.equals(arg, other)) {
        throw new IllegalArgumentException(argName + " must be equal to `" + other + "`");
      }
      return arg;
    }

    public T instanceOf(Class<?> cls) {
      if (arg == null) {
        throw new IllegalArgumentException(argName + " must be set");
      }
      if (!cls.isInstance(arg)) {
        throw new IllegalArgumentException(argName + " must be an instance of " + cls);
      }
      return arg;
    }
  }

  public static Duration nonNegative(String argName, Duration arg) {
    if (arg == null) {
      throw new IllegalArgumentException(argName + " must be set");
    }
    if (arg.isNegative()) {
      throw new IllegalArgumentException(argName + " must be set to 0 or more");
    }
    return arg;
  }

  public static Duration nonNegative(Duration arg) {
    if (arg == null) {
      throw new IllegalArgumentException("Duration must be set");
    }
    if (arg.isNegative()) {
      throw new IllegalArgumentException("Duration must be set to 0 or more");
    }
    return arg;
  }

  public static int nonNegative(String argName, Integer number) {
    if (number == null) {
      throw new IllegalArgumentException(argName + " must be set");
    }
    if (number < 0) {
      throw new IllegalArgumentException(argName + " cannot be less than 0");
    }
    return number;
  }

  public static int positive(String argName, Integer number) {
    if (number == null) {
      throw new IllegalArgumentException(argName + " must be set");
    }
    if (number <= 0) {
      throw new IllegalArgumentException(argName + " must be greater than 0");
    }
    return number;
  }

  public static IntChecker argument(String argName, Integer number) {
    return new IntChecker(argName, number);
  }

  public static class IntChecker {

    private final String argName;
    private final Integer number;

    IntChecker(String argName, Integer number) {
      this.argName = argName;
      this.number = number;
    }

    public int greaterThan(int max, String message) {
      if (number == null) {
        throw new IllegalArgumentException(argName + " must be set");
      }
      if (number <= max) {
        throw new IllegalArgumentException(message);
      }
      return number;
    }
  }

  public static FileChecker argument(String argName, File file) {
    return new FileChecker(argName, file);
  }

  public static class FileChecker {

    private final String argName;
    private final File file;

    FileChecker(String argName, File file) {
      this.argName = argName;
      this.file = file;
    }

    public File isFile() {
      if (file == null) {
        throw new IllegalArgumentException(argName + " must be set");
      }
      if (!file.exists()) {
        throw new IllegalArgumentException(argName + " must exist: " + file.getAbsolutePath());
      }
      if (!file.isFile()) {
        throw new IllegalArgumentException(argName + " must be a regular file: " + file.getAbsolutePath());
      }
      return file;
    }

    public File isDirectory() {
      if (file == null) {
        throw new IllegalArgumentException(argName + " must be set");
      }
      if (!file.exists()) {
        throw new IllegalArgumentException(argName + " must exist: " + file.getAbsolutePath());
      }
      if (!file.isDirectory()) {
        throw new IllegalArgumentException(argName + " must be a directory: " + file.getAbsolutePath());
      }
      return file;
    }
  }

  public static void stateCondition(boolean state, String message, Object... args) {
    if (!state) {
      throw new IllegalStateException(String.format(message, args));
    }
  }

  public static <T> StateChecker<T> state(String name, T state) {
    return new StateChecker<>(name, state);
  }

  public static class StateChecker<T> {

    private final String name;
    private final T state;

    StateChecker(String name, T state) {
      this.name = name;
      this.state = state;
    }

    public T nonNull() {
      if (state == null) {
        throw new IllegalStateException(name + " must not be null");
      }
      return state;
    }

    public T nonNull(String message, Object... args) {
      if (state == null) {
        throw new IllegalStateException(String.join(" ", name, String.format(message, args)));
      }
      return state;
    }

    public T instanceOf(Class<?> cls) {
      if (state == null) {
        throw new IllegalStateException(name + " must be set");
      }
      if (!cls.isInstance(state)) {
        throw new IllegalStateException(name + " must be an instance of " + cls);
      }
      return state;
    }
  }

  public static FileStateChecker state(String name, File file) {
    return new FileStateChecker(name, file);
  }

  public static class FileStateChecker {

    private final String name;
    private final File file;

    FileStateChecker(String name, File file) {
      this.name = name;
      this.file = file;
    }

    public File isFile() {
      if (file == null) {
        throw new IllegalStateException(name + " must be set");
      }
      if (!file.exists()) {
        throw new IllegalStateException(name + " must exist: " + file.getAbsolutePath());
      }
      if (!file.isFile()) {
        throw new IllegalStateException(name + " must be a regular file: " + file.getAbsolutePath());
      }
      return file;
    }

    public File isDirectory() {
      if (file == null) {
        throw new IllegalStateException(name + " must be set");
      }
      if (!file.exists()) {
        throw new IllegalStateException(name + " must exist: " + file.getAbsolutePath());
      }
      if (!file.isDirectory()) {
        throw new IllegalStateException(name + " must be a directory: " + file.getAbsolutePath());
      }
      return file;
    }
  }

  public static PathStateChecker state(String name, Path path) {
    return new PathStateChecker(name, path);
  }

  public static class PathStateChecker {

    private final String name;
    private final Path path;

    PathStateChecker(String name, Path path) {
      this.name = name;
      this.path = path;
    }

    public Path isFile() {
      if (path == null) {
        throw new IllegalStateException(name + " must be set");
      }
      if (!Files.exists(path)) {
        throw new IllegalStateException(name + " must exist: " + path);
      }
      if (!Files.isRegularFile(path)) {
        throw new IllegalStateException(name + " must be a regular file: " + path);
      }
      return path;
    }

    public Path isDirectory() {
      if (path == null) {
        throw new IllegalStateException(name + " must be set");
      }
      if (!Files.exists(path)) {
        throw new IllegalStateException(name + " must exist: " + path);
      }
      if (!Files.isDirectory(path)) {
        throw new IllegalStateException(name + " must be a directory: " + path);
      }
      return path;
    }
  }
}
