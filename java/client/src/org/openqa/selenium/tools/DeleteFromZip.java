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

package org.openqa.selenium.tools;

import com.google.common.io.MoreFiles;
import com.google.common.io.RecursiveDeleteOption;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

final class DeleteFromZip {
  public static void main(String[] args) throws IOException, URISyntaxException {
    if (args.length < 2) {
      throw new RuntimeException("usage: [zip file] [paths to delete...]");
    }

    Map<String, String> properties = new HashMap<>();
    properties.put("create", "false");

    Path zip = Paths.get(args[0]).toAbsolutePath();
    URI uri = new URI("jar", zip.toUri().toString(), null);
    // URI uri = URI.create("jar:file:" + zip);
    try (FileSystem zipfs = FileSystems.newFileSystem(uri, properties)) {
      System.out.println("Opened " + args[0]);
      for (int i = 1; i < args.length; i++) {
        Path path = zipfs.getPath(args[i]);
        if (Files.isDirectory(path)) {
          MoreFiles.deleteRecursively(path, RecursiveDeleteOption.ALLOW_INSECURE);
          System.out.println("Deleted directory " + args[i]);
        } else if (Files.exists(path)) {
          Files.delete(path);
          System.out.println("Deleted file " + args[i]);
        }
      }
    }
  }
}
