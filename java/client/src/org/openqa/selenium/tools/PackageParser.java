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

import com.google.common.collect.ImmutableMap;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseProblemException;
import com.github.javaparser.ast.CompilationUnit;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Calendar;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class PackageParser {
  private final static long TIME_STAMP;
  static {
    Calendar c = Calendar.getInstance();
    c.set(1985, 1, 1, 0, 0, 0);
    TIME_STAMP = c.getTimeInMillis();
  }

  public static void main(String[] args) throws IOException {
    Path out = Paths.get(args[0]);

    Map<String, Path> outToIn = new TreeMap<>();

    for (int i = 1; i < args.length; i++) {
      if (args[i].startsWith("@")) {
        Path macro = Paths.get(args[i].substring(1));
        Stream.of(Files.lines(macro).collect(Collectors.joining(" ")).split(" "))
            .forEach(line -> outToIn.putAll(processSingleSourceFile(Paths.get(line))));

      } else {
        outToIn.putAll(processSingleSourceFile(Paths.get(args[i])));
      }
    }

    zip(outToIn, out);
  }

  private static Map<String, Path> processSingleSourceFile(Path source) {
    if (!source.getFileName().toString().endsWith(".java")) {
      return ImmutableMap.of();
    }
    try {
      CompilationUnit unit = JavaParser.parse(source);
      String packageName = unit.getPackageDeclaration()
          .map(decl -> decl.getName().asString())
          .orElse("");
      Path target = Paths.get(packageName.replace('.', File.separatorChar))
          .resolve(source.getFileName());
      return ImmutableMap.of(target.toString(), source);
    } catch (ParseProblemException|IOException ignored) {
      return ImmutableMap.of();
    }
  }

  private static void zip(Map<String, Path> outToIn, Path out) throws IOException {
    try (ZipOutputStream zos = new ZipOutputStream(Files.newOutputStream(out))) {
      outToIn.forEach((target, source) -> {
        ZipEntry entry = new ZipEntry(target);
        entry.setMethod(ZipEntry.DEFLATED);
        entry.setTime(TIME_STAMP);
        try {
          zos.putNextEntry(entry);
          Files.copy(source, zos);
          zos.closeEntry();
        } catch (IOException e) {
          throw new RuntimeException(e);
        }
      });
    }
  }

}
