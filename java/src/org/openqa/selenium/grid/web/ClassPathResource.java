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

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.JarURLConnection;
import java.net.URL;
import java.util.Optional;
import java.util.Set;
import java.util.jar.JarFile;
import org.openqa.selenium.internal.Require;

public class ClassPathResource implements Resource {

  private final Resource delegate;

  public ClassPathResource(URL resourceUrl, String stripPrefix) {
    Require.nonNull("Resource URL", resourceUrl);
    Require.nonNull("Prefix to strip", stripPrefix);

    if ("jar".equals(resourceUrl.getProtocol())) {
      try {
        JarURLConnection juc = (JarURLConnection) resourceUrl.openConnection();
        JarFile jarFile = juc.getJarFile();

        this.delegate = new JarFileResource(jarFile, juc.getEntryName(), stripPrefix);
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    } else {
      throw new IllegalArgumentException(
          "Unable to handle scheme of type " + resourceUrl.getProtocol());
    }
  }

  @Override
  public String name() {
    return delegate.name();
  }

  @Override
  public Optional<Resource> get(String path) {
    Require.nonNull("Path", path);
    return delegate.get(path);
  }

  @Override
  public boolean isDirectory() {
    return delegate.isDirectory();
  }

  @Override
  public Set<Resource> list() {
    return delegate.list();
  }

  @Override
  public Optional<byte[]> read() {
    return delegate.read();
  }
}
