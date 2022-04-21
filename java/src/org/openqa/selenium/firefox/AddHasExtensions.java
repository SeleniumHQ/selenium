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

package org.openqa.selenium.firefox;

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.AdditionalHttpCommands;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.http.HttpMethod;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Base64;
import java.util.Map;
import java.util.function.Predicate;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.openqa.selenium.remote.Browser.FIREFOX;

@AutoService({AdditionalHttpCommands.class, AugmenterProvider.class})
public class AddHasExtensions implements AugmenterProvider<HasExtensions>, AdditionalHttpCommands {

  public static final String INSTALL_EXTENSION = "installExtension";
  public static final String UNINSTALL_EXTENSION = "uninstallExtension";

  private static final Map<String, CommandInfo> COMMANDS = ImmutableMap.of(
    INSTALL_EXTENSION, new CommandInfo("/session/:sessionId/moz/addon/install", HttpMethod.POST),
    UNINSTALL_EXTENSION, new CommandInfo("/session/:sessionId/moz/addon/uninstall", HttpMethod.POST));

  @Override
  public Map<String, CommandInfo> getAdditionalCommands() {
    return COMMANDS;
  }

  @Override
  public Predicate<Capabilities> isApplicable() {
    return FIREFOX::is;
  }

  @Override
  public Class<HasExtensions> getDescribedInterface() {
    return HasExtensions.class;
  }

  @Override
  public HasExtensions getImplementation(Capabilities capabilities, ExecuteMethod executeMethod) {
    return new HasExtensions() {
      @Override
      public String installExtension(Path path) {
        return installExtension(path, false);
      }

      @Override
      public String installExtension(Path path, Boolean temporary) {
        Require.nonNull("Extension Path", path);
        Require.nonNull("Temporary", temporary);

        String encoded;
        try {
          if (Files.isDirectory(path)) {
            encoded = Base64.getEncoder().encodeToString(Files.readAllBytes(zipDirectory(path)));
          }
          else {
            encoded = Base64.getEncoder().encodeToString(Files.readAllBytes(path));
          }
        } catch (IOException e) {
          throw new InvalidArgumentException(path + " is an invalid path", e);
        }

        return (String) executeMethod.execute(
          INSTALL_EXTENSION,
          ImmutableMap.of("addon", encoded, "temporary", temporary));
      }

      private Path zipDirectory(Path path) throws IOException {
        Path extZip = Paths.get(path.getFileName().toString()+".zip");
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(extZip.toFile()))) {
          Files.walkFileTree(path, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
              zos.putNextEntry(new ZipEntry(path.relativize(file).toString()));
              Files.copy(file, zos);
              zos.closeEntry();
              return FileVisitResult.CONTINUE;
            }
          });
        }
        return extZip;
      }

      @Override
      public void uninstallExtension(String extensionId) {
        Require.nonNull("Extension ID", extensionId);

        executeMethod.execute(UNINSTALL_EXTENSION, ImmutableMap.of("id", extensionId));
      }
    };
  }
}
