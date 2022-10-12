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

import com.google.common.io.ByteStreams;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.net.URI;
import java.nio.file.DirectoryStream;
import java.nio.file.FileSystem;
import java.nio.file.FileSystemAlreadyExistsException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

public class IndependentJarFileResource implements Resource {

  private final File jarFile;
  private final String prefix;
  private final String name;

  public IndependentJarFileResource(File jarFile, String prefix, String path) {
    this.prefix = prefix;
    this.name = path;
    this.jarFile = jarFile;
  }

  private URI uri() {
    return URI.create("jar:" + jarFile.toURI());
  }

  @Override
  public String name() {
    return name;
  }

  @Override
  public Optional<Resource> get(String path) {
    return Optional.of(new IndependentJarFileResource(this.jarFile, this.prefix, path));
  }

  private String prefixToUse() {
    String result = prefix;
    if (prefix.startsWith("/")) {
      result = prefix.replaceFirst("/", "");
    }
    return result + "/" + name;
  }

  @Override
  public boolean isDirectory() {
    String computedPrefix = prefixToUse();
    try (JarFile jar = new JarFile(jarFile)) {
      return jar.stream()
        .filter(eachJarEntry -> eachJarEntry.getName().startsWith(computedPrefix))
        .anyMatch(eachJarEntry -> matches(eachJarEntry, computedPrefix));
    } catch (IOException ignored) {
      return false;
    }
  }

  private static boolean matches(JarEntry jarEntry, String prefix) {
    boolean isDirectory = jarEntry.isDirectory();
    boolean fullMatch = jarEntry.getName().equals(prefix);
    return isDirectory || (!fullMatch);
  }

  private Stream<Path> walk(Path file) {
    try {
      return Files.walk(file);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  @Override
  public Set<Resource> list() {
    try (DirectoryStream<Path> directory = directory(fileSystem())) {
      return StreamSupport.stream(directory.spliterator(), false)
        .flatMap(this::walk)
        .map(
          each -> new IndependentJarFileResource(jarFile, prefix, each.getFileName().toString()))
        .collect(Collectors.toSet());
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  @Override
  public Optional<byte[]> read() {
    Function<Path, byte[]> mapper = path -> {
        try (InputStream is = Files.newInputStream(path);
          ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
          ByteStreams.copy(is, bos);
          return bos.toByteArray();
        } catch (IOException ignored) {
          return null;
        }
    };
    return Optional.ofNullable(path(mapper));
  }

  private <T> T path(Function<Path, T> transformer) {
    try (DirectoryStream<Path> directory = directory(fileSystem())) {
      Optional<Path> found = StreamSupport.stream(directory.spliterator(), false)
        .flatMap(this::walk)
        .filter(each -> each.toString().endsWith(this.name))
        .findFirst();
      return found.map(transformer).orElse(null);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private DirectoryStream<Path> directory(FileSystem fs) throws IOException {
    return Files.newDirectoryStream(fs.getPath(prefix), "*");
  }

  private FileSystem fileSystem() throws IOException {
    URI uri = uri();
    FileSystem jarFs;
    try {
      Map<String, String> env = new HashMap<>();
      jarFs = FileSystems.newFileSystem(uri, env);
    } catch (FileSystemAlreadyExistsException ignored) {
      jarFs = FileSystems.getFileSystem(uri);
    }
    return jarFs;
  }
}
