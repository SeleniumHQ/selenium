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

package org.openqa.selenium.grid.web;

import com.google.common.collect.ImmutableSet;
import com.google.common.io.ByteStreams;
import org.openqa.selenium.internal.Require;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.Set;
import java.util.jar.JarFile;
import java.util.zip.ZipEntry;

public class JarFileResource implements Resource {

  private final JarFile jarFile;
  private final String entryName;
  private final String stripPrefix;

  public JarFileResource(JarFile jarFile, String entryName, String stripPrefix) {
    this.jarFile = Require.nonNull("Jar file", jarFile);
    this.entryName = Require.nonNull("Entry name", entryName);

    Require.nonNull("Prefix", stripPrefix);
    this.stripPrefix = stripPrefix.endsWith("/") ? stripPrefix : stripPrefix + "/";

    Require.precondition(entryName.startsWith(stripPrefix), "Entry is not under stripped prefix");
  }

  @Override
  public String name() {
    return entryName.substring(stripPrefix.length());
  }

  @Override
  public Optional<Resource> get(String path) {
    Require.nonNull("Path", path);

    if (!isDirectory()) {
      return Optional.empty();
    }

    String name = stripPrefix + stripLeadingSlash(path);

    ZipEntry entry = jarFile.getEntry(name);
    return Optional.ofNullable(entry).map(e -> new JarFileResource(jarFile, entry.getName(), name));
  }

  private String stripLeadingSlash(String from) {
    if (!from.startsWith("/")) {
      return from;
    }

    if ("/".equals(from)) {
      return "";
    }

    if (from.length() < 2) {
      throw new IllegalArgumentException("From string must have something following the slash: " + from);
    }

    return from.substring(1);
  }

  @Override
  public boolean isDirectory() {
    return jarFile.getEntry(entryName).isDirectory();
  }

  @Override
  public Set<Resource> list() {
    if (!isDirectory()) {
      return ImmutableSet.of();
    }

    String prefix = entryName.endsWith("/") ? entryName : entryName + "/";
    int count = prefix.split("/").length + 1;

    return jarFile.stream()
      .filter(e -> e.getName().startsWith(prefix))
      .filter(e -> !e.getName().equals(entryName))
      .filter(e -> !e.getName().equals(prefix))
      .filter(e -> e.getName().split("/").length == count)
      .map(e -> new JarFileResource(jarFile, e.getName(), prefix))
      .collect(ImmutableSet.toImmutableSet());
  }

  @Override
  public Optional<byte[]> read() {
    ZipEntry entry = jarFile.getEntry(entryName);
    if (entry.isDirectory()) {
      return Optional.empty();
    }

    try (InputStream is = jarFile.getInputStream(entry);
         ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
      ByteStreams.copy(is, bos);
      return Optional.of(bos.toByteArray());
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
