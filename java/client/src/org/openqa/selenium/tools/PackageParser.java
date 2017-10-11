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
      Path source = Paths.get(args[i]);
      if (!source.getFileName().toString().endsWith(".java")) {
        continue;
      }

      try {
        CompilationUnit unit = JavaParser.parse(source);
        String packageName = unit.getPackageDeclaration()
            .map(decl -> decl.getName().asString())
            .orElse("");
        Path target = Paths.get(packageName.replace('.', File.separatorChar))
            .resolve(source.getFileName());

        outToIn.put(target.toString(), source);
      } catch (ParseProblemException ignored) {
        // carry on
      }
    }

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
