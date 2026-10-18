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

package dev.selenium.tools.bytecode;

import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

public class BytecodeVersionCheck {

  private static final int CLASS_FILE_MAGIC = 0xCAFEBABE;
  private static final int JAVA_VERSION_OFFSET = 44;
  private static final int EXAMPLES_PER_JAR = 3;

  public static void main(String[] args) throws IOException {
    Map<String, List<Path>> artifacts = readManifest(Paths.get(args[0]));
    int maxJavaVersion = Integer.parseInt(args[1]);

    List<String> failures = new ArrayList<>();
    for (Map.Entry<String, List<Path>> artifact : artifacts.entrySet()) {
      Scan scan = new Scan(maxJavaVersion + JAVA_VERSION_OFFSET);
      for (Path jar : artifact.getValue()) {
        scan.jar(jar);
      }

      if (scan.classes == 0) {
        failures.add(String.format("%s: no classes found to check", artifact.getKey()));
      } else if (!scan.tooNew.isEmpty()) {
        failures.add(report(artifact.getKey(), maxJavaVersion, scan.tooNew));
      } else {
        System.out.printf(
            "%s: %d classes run on Java %d%n", artifact.getKey(), scan.classes, maxJavaVersion);
      }
    }

    if (!failures.isEmpty()) {
      failures.forEach(System.err::println);
      System.err.printf(
          "Pin each dependency below the release that dropped Java %d, or raise Selenium's Java"
              + " minimum.%n",
          maxJavaVersion);
      System.exit(1);
    }
  }

  private static Map<String, List<Path>> readManifest(Path manifest) throws IOException {
    Map<String, List<Path>> artifacts = new LinkedHashMap<>();
    for (String line : Files.readAllLines(manifest)) {
      String[] parts = line.split("\t", 2);
      artifacts.computeIfAbsent(parts[0], ignored -> new ArrayList<>()).add(Paths.get(parts[1]));
    }
    return artifacts;
  }

  private static String report(String artifact, int maxJavaVersion, Map<Path, TooNew> tooNew) {
    StringBuilder message =
        new StringBuilder(
            String.format("%s ships classes newer than Java %d:%n", artifact, maxJavaVersion));
    tooNew.forEach(
        (jar, found) ->
            message.append(
                String.format(
                    "  %s: %d classes up to Java %d, e.g. %s%n",
                    jar,
                    found.count,
                    found.highestMajor - JAVA_VERSION_OFFSET,
                    String.join(", ", found.examples))));
    return message.toString();
  }

  private static class Scan {
    private final int maxMajorVersion;
    private final Map<Path, TooNew> tooNew = new TreeMap<>();
    private int classes;

    private Scan(int maxMajorVersion) {
      this.maxMajorVersion = maxMajorVersion;
    }

    private void jar(Path jar) throws IOException {
      try (ZipFile zip = new ZipFile(jar.toFile())) {
        Enumeration<? extends ZipEntry> entries = zip.entries();
        while (entries.hasMoreElements()) {
          ZipEntry entry = entries.nextElement();
          if (isBaseClass(entry.getName())) {
            try (InputStream in = zip.getInputStream(entry)) {
              inspect(jar, entry.getName(), in.readNBytes(8));
            }
          }
        }
      }
    }

    private void inspect(Path jar, String entryName, byte[] header) {
      ByteBuffer buffer = ByteBuffer.wrap(header);
      if (header.length < 8 || buffer.getInt(0) != CLASS_FILE_MAGIC) {
        return;
      }
      classes++;
      int major = Short.toUnsignedInt(buffer.getShort(6));
      if (major > maxMajorVersion) {
        tooNew.computeIfAbsent(jar, ignored -> new TooNew()).add(entryName, major);
      }
    }

    // Multi-release entries and module descriptors target Java 9+ by design.
    private static boolean isBaseClass(String entryName) {
      return entryName.endsWith(".class")
          && !entryName.startsWith("META-INF/versions/")
          && !entryName.equals("module-info.class")
          && !entryName.endsWith("/module-info.class");
    }
  }

  private static class TooNew {
    private final List<String> examples = new ArrayList<>();
    private int count;
    private int highestMajor;

    private void add(String entryName, int major) {
      count++;
      highestMajor = Math.max(highestMajor, major);
      if (examples.size() < EXAMPLES_PER_JAR) {
        examples.add(
            entryName.substring(0, entryName.length() - ".class".length()).replace('/', '.'));
      }
    }
  }
}
