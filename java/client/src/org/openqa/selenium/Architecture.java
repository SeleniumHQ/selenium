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

package org.openqa.selenium;

/**
 * Represents the known architectures used in WebDriver.  It attempts to smooth over some of Java's
 * rough edges when dealing with microprocessor architectures by, for instance, allowing you to
 * query if a particular architecture is 32- or 64-bit.
 *
 * @see org.openqa.selenium.Platform
 */
// Useful URLs:
// http://hg.openjdk.java.net/jdk7/modules/jdk/file/a37326fa7f95/src/windows/native/java/lang/java_props_md.c
public enum Architecture {

  // Architecture families

  X86("x86", "i386", "ia32", "i686", "i486", "i86", "pentium", "pentium_pro", "pentium_pro+mmx",
      "pentium+mmx") {
    @Override
    public int getDataModel() {
      return 32;
    }
  },

  X64("amd64", "ia64", "x86_64"),

  ARM("arm"),

  MIPS32("mips32") {
    @Override
    public int getDataModel() {
      return 32;
    }
  },

  MIPS64("mips64"),

  // Meta architecture

  ANY("") {
    @Override
    public boolean is(Architecture compareWith) {
      return true;
    }
  };

  private final String[] archIdentifiers;

  Architecture(String... partOfArch) {
    archIdentifiers = partOfArch;
  }

  /**
   * Heuristic for comparing two architectures.  If architectures are found to be in the same
   * "architecture family" (e.g. i386, i686, x86 and ia32 are considered related), they will match.
   *
   * @param compareWith the architecture to compare with
   * @return true if architectures belong to the same architecture family, false otherwise
   */
  public boolean is(Architecture compareWith) {
    return this.equals(compareWith);
  }

  /**
   * Gets the data model of the architecture.  The data model tells you how big memory addresses are
   * on the given microprocessor architecture.
   *
   * @return 32- or 64-bit depending on architecture
   */
  public int getDataModel() {
    return 64;
  }

  @Override
  public String toString() {
    return name().toLowerCase();
  }

  /**
   * Gets current architecture.
   *
   * @return current architecture
   */
  public static Architecture getCurrent() {
    return extractFromSysProperty(System.getProperty("os.arch"));
  }

  /**
   * Extracts architectures based on system properties in Java and a heuristic to overcome
   * differences between JDK implementations.  If not able to determine the operating system's
   * architecture, it will throw.
   *
   * @param arch the architecture name to determine the architecture of
   * @return the most likely architecture based on the given architecture name
   * @throws UnsupportedOperationException if the architecture given is unknown or unsupported
   */
  public static Architecture extractFromSysProperty(String arch) {
    if (arch != null) {
      arch = arch.toLowerCase();
    }

    // Some architectures are basically the same even though they have different names.  ia32, x86,
    // i386 and i686 are for WebDriver's purposes the same sort of 32-bit x86-esque architecture.
    // So each architecture defined in this enum has an array of strings with the different
    // identifiers it matches.
    for (Architecture architecture : values()) {
      if (architecture == Architecture.ANY) {
        continue;
      }

      for (String matcher : architecture.archIdentifiers) {
        if (matcher.equals(arch)) {
          return architecture;
        }
      }
    }

    throw new UnsupportedOperationException("Unknown architecture: " + arch);
  }

}
