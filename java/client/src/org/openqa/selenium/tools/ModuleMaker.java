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

import static com.github.javaparser.ParseStart.COMPILATION_UNIT;
import static net.bytebuddy.jar.asm.Opcodes.ACC_MANDATED;
import static net.bytebuddy.jar.asm.Opcodes.ACC_MODULE;
import static net.bytebuddy.jar.asm.Opcodes.ACC_TRANSITIVE;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.Provider;
import com.github.javaparser.Providers;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.Modifier;
import com.github.javaparser.ast.expr.Name;
import com.github.javaparser.ast.modules.ModuleDeclaration;
import com.github.javaparser.ast.modules.ModuleExportsStmt;
import com.github.javaparser.ast.modules.ModuleOpensStmt;
import com.github.javaparser.ast.modules.ModuleProvidesStmt;
import com.github.javaparser.ast.modules.ModuleRequiresStmt;
import com.github.javaparser.ast.modules.ModuleUsesStmt;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;

import net.bytebuddy.jar.asm.ClassWriter;
import net.bytebuddy.jar.asm.ModuleVisitor;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.FileTime;
import java.time.Instant;
import java.util.EnumSet;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ModuleMaker {

  // Starts at 1980-01-01. We'll match what buck uses
  private static final long DOS_EPOCH = Instant.parse("1985-02-01T00:00:00.00Z").toEpochMilli();

  public static void main(String[] args) throws IOException {
    Path in = Paths.get(args[0]);
    Path out = Paths.get(args[1]);

    ParserConfiguration parserConfig = new ParserConfiguration()
        .setLanguageLevel(ParserConfiguration.LanguageLevel.JAVA_9);

    Provider provider = Providers.provider(in);

    ParseResult<CompilationUnit> result = new JavaParser(parserConfig)
        .parse(COMPILATION_UNIT, provider);

    CompilationUnit unit = result.getResult()
        .orElseThrow(() -> new RuntimeException("Unable to parse " + in));

    ClassWriter classWriter = new ClassWriter(0);
    classWriter.visit(
        /* version 9 */
        53,
        ACC_MODULE,
        "module-info",
        null,
        null,
        null);

    ModuleDeclaration moduleDeclaration = unit.getModule()
        .orElseThrow(() -> new RuntimeException("No module declaration in " + in));
    String name = moduleDeclaration.getName().asString();
    ModuleVisitor moduleVisitor = classWriter.visitModule(name, 0, null);
    moduleVisitor.visitRequire("java.base", ACC_MANDATED, null);

    moduleDeclaration.accept(new MyModuleVisitor(moduleVisitor), null);

    moduleVisitor.visitEnd();
    classWriter.visitEnd();

    try (OutputStream os = Files.newOutputStream(out);
         JarOutputStream jos = new JarOutputStream(os)) {
      jos.setLevel(ZipOutputStream.STORED);

      ZipEntry dir = new ZipEntry("META-INF/");
      dir.setTime(DOS_EPOCH);
      dir.setCreationTime(FileTime.fromMillis(DOS_EPOCH));
      dir.setLastModifiedTime(FileTime.fromMillis(DOS_EPOCH));
      jos.putNextEntry(dir);

      dir = new ZipEntry("META-INF/versions/");
      dir.setTime(DOS_EPOCH);
      dir.setCreationTime(FileTime.fromMillis(DOS_EPOCH));
      dir.setLastModifiedTime(FileTime.fromMillis(DOS_EPOCH));
      jos.putNextEntry(dir);

      dir = new ZipEntry("META-INF/versions/9/");
      dir.setTime(DOS_EPOCH);
      dir.setCreationTime(FileTime.fromMillis(DOS_EPOCH));
      dir.setLastModifiedTime(FileTime.fromMillis(DOS_EPOCH));
      jos.putNextEntry(dir);

      byte[] bytes = classWriter.toByteArray();

      JarEntry entry = new JarEntry("META-INF/versions/9/module-info.class");
      entry.setTime(DOS_EPOCH);
      entry.setCreationTime(FileTime.fromMillis(DOS_EPOCH));
      entry.setLastModifiedTime(FileTime.fromMillis(DOS_EPOCH));
      entry.setSize(bytes.length);

      jos.putNextEntry(entry);
      jos.write(bytes);
      jos.closeEntry();
    }

  }

  private static class MyModuleVisitor extends VoidVisitorAdapter<Void> {

    private final ModuleVisitor byteBuddyVisitor;

    MyModuleVisitor(ModuleVisitor byteBuddyVisitor) {
      this.byteBuddyVisitor = byteBuddyVisitor;
    }

    @Override
    public void visit(ModuleRequiresStmt n, Void arg) {
      byteBuddyVisitor.visitRequire(
          n.getNameAsString(),
          getByteBuddyModifier(n.getModifiers()),
          null);
    }

    @Override
    public void visit(ModuleExportsStmt n, Void arg) {
      byteBuddyVisitor.visitExport(
          n.getNameAsString().replace('.', '/'),
          0,
          n.getModuleNames().stream().map(Name::asString).toArray(String[]::new));
    }

    @Override
    public void visit(ModuleProvidesStmt n, Void arg) {
      byteBuddyVisitor.visitProvide(
          n.getTypeAsString().replace('.', '/'),
          n.getWithTypes().stream()
              .map(type -> type.asString()
                  .replace('.', '/'))
              .toArray(String[]::new));
    }

    @Override
    public void visit(ModuleUsesStmt n, Void arg) {
      byteBuddyVisitor.visitUse(n.getTypeAsString().replace('.', '/'));
    }

    @Override
    public void visit(ModuleOpensStmt n, Void arg) {
      throw new UnsupportedOperationException(n.toString());
    }

    private int getByteBuddyModifier(EnumSet<Modifier> modifiers) {
      return modifiers.stream()
          .mapToInt(mod -> {
            switch (mod) {
              case TRANSITIVE:
                return ACC_TRANSITIVE;

              default:
                throw new RuntimeException("Unknown modifier: " + mod);
            }
          })
          .reduce(0, (l, r) -> l | r);
    }
  }
}
