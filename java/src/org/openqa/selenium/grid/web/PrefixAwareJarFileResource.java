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

import java.util.Optional;
import java.util.Set;
import java.util.jar.JarFile;
import java.util.zip.ZipEntry;

import com.google.common.collect.ImmutableSet;
import org.openqa.selenium.internal.Require;

public class PrefixAwareJarFileResource extends JarFileResource {
    private final String subPath;
    
    public PrefixAwareJarFileResource(JarFile jarFile, String entryName, String stripPrefix, String subPath) {
        super(jarFile, entryName, stripPrefix);
        this.subPath = subPath;
    }

    @Override
    public Optional<Resource> get(String path) {
        Require.nonNull("Path", path);

        if (!isDirectory()) {
            return Optional.empty();
        }

        String name = stripPrefix + stripLeadingSlash(path);

        ZipEntry entry = jarFile.getEntry(name);
        return Optional.ofNullable(entry).map(e -> new PrefixAwareJarFileResource(jarFile, entry.getName(), name, subPath));
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
        .map(e -> new PrefixAwareJarFileResource(jarFile, e.getName(), prefix, subPath))
        .collect(ImmutableSet.toImmutableSet());
    }

    @Override
    public Optional<byte[]> read() {
        Optional<byte[]> readByteArray = super.read();
        String readString = new String(readByteArray.get());
        
        // All file such as index.html, *.js, *.css and *.js.map
        readString = readString.replaceAll("/ui/", subPath.concat("/ui/"))
        .replaceAll("\\+\"/graphql\"", "+\"".concat(subPath).concat("/graphql\""));
        
        readByteArray = Optional.of(readString.getBytes());
        return readByteArray;
    }
}