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

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.jar.JarFile;

public class PrefixAwareJarFileResource extends JarFileResource {
    private final String subPath;
    private static final List<String> EXCLUSION_LIST = Arrays.asList(
        ".woff", ".woff2", ".svg", ".png"
    );

    public PrefixAwareJarFileResource(JarFile jarFile, String entryName, String stripPrefix, String subPath) {
        super(jarFile, entryName, stripPrefix);
        this.subPath = subPath;
    }

    @Override
    protected JarFileResource newInstance(JarFile jarFile, String entryName, String prefix) {
        return new PrefixAwareJarFileResource(jarFile, entryName, prefix, subPath);
    }

    @Override
    public Optional<byte[]> read() {
        Optional<byte[]> readByteArray = super.read();
        boolean found = EXCLUSION_LIST.parallelStream()
        .anyMatch(entryName::endsWith);

        if (found) {
            return readByteArray;
        }
        if (!readByteArray.isPresent()) {
            return readByteArray;
        }
        String readString = new String(readByteArray.get());
        
        // All file such as index.html, *.js, *.css and *.js.map
        readString = readString.replaceAll("/ui/", subPath.concat("/ui/"))
        .replaceAll("\\+\"/graphql\"", "+\"".concat(subPath).concat("/graphql\""));
        
        return Optional.of(readString.getBytes());
    }
}