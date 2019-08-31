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

package org.openqa.selenium.tools.modules;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.Provider;
import com.github.javaparser.Providers;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.Modifier;
import com.github.javaparser.ast.NodeList;
import com.github.javaparser.ast.expr.Name;
import com.github.javaparser.ast.modules.ModuleDeclaration;
import com.github.javaparser.ast.modules.ModuleExportsDirective;
import com.github.javaparser.ast.modules.ModuleOpensDirective;
import com.github.javaparser.ast.modules.ModuleProvidesDirective;
import com.github.javaparser.ast.modules.ModuleRequiresDirective;
import com.github.javaparser.ast.modules.ModuleUsesDirective;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import net.bytebuddy.jar.asm.ClassWriter;
import net.bytebuddy.jar.asm.ModuleVisitor;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.nio.file.attribute.FileTime;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Predicate;
import java.util.jar.Attributes;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;
import java.util.jar.Manifest;
import java.util.regex.Pattern;
import java.util.spi.ToolProvider;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static com.github.javaparser.ParseStart.COMPILATION_UNIT;
import static net.bytebuddy.jar.asm.Opcodes.ACC_MANDATED;
import static net.bytebuddy.jar.asm.Opcodes.ACC_MODULE;
import static net.bytebuddy.jar.asm.Opcodes.ACC_OPEN;
import static net.bytebuddy.jar.asm.Opcodes.ACC_TRANSITIVE;

public class ModuleGenerator {

  // Starts at 1980-01-01. We'll match what buck uses
  private static final long DOS_EPOCH = Instant.parse("1985-02-01T00:00:00.00Z").toEpochMilli();

  public static void main(String[] args) throws IOException {
    Path outJar = null;
    Path inJar = null;
    String modulePath = null;
    String coordinates = null;
    Set<Pattern> excludes = new HashSet<>();

    for (int i = 0; i < args.length; i++) {
      String flag = args[i];
      String next = args[++i];
      switch (flag) {
        case "--coordinates":
          coordinates = next;
          break;

        case "--exclude":
          excludes.add(Pattern.compile(next));
          break;

        case "--in":
          inJar = Paths.get(next);
          break;

        case "--module-path":
          modulePath = next;
          break;

        case "--out":
          outJar = Paths.get(next);
          break;

        default:
          throw new IllegalArgumentException("Unknown argument: " + Arrays.toString(args));
      }
    }
    Objects.requireNonNull(coordinates, "Maven coordinates must be set.");
    Objects.requireNonNull(outJar, "Output jar must be set.");
    Objects.requireNonNull(inJar, "Input jar must be set.");

    String moduleName = deriveModuleName(coordinates);

    ToolProvider jdeps = ToolProvider.findFirst("jdeps").orElseThrow();
    Path tempDir = Files.createTempDirectory("module-dir");


    // It doesn't matter what we use for writing to the stream: jdeps doesn't use it. *facepalm*
    List<String> jdepsArgs = new LinkedList<>(
      List.of(
        "--api-only",
        "--multi-release", "11",
        "--generate-module-info", tempDir.toAbsolutePath().toString()));
    if (modulePath != null) {
      jdepsArgs.addAll(List.of("--module-path", modulePath.replace(':', File.pathSeparatorChar)));
    }
    jdepsArgs.add(inJar.toAbsolutePath().toString());

    PrintStream origOut = System.out;
    PrintStream origErr = System.err;

    ByteArrayOutputStream bos = new ByteArrayOutputStream();
    PrintStream printStream = new PrintStream(bos);

    int result;
    try {
      System.setOut(printStream);
      System.setErr(printStream);
      result = jdeps.run(printStream, printStream, jdepsArgs.toArray(new String[0]));
    } finally {
      System.setOut(origOut);
      System.setErr(origErr);
    }
    if (result != 0) {
      throw new RuntimeException(
        "Unable to process module:\n" +
          "jdeps " + String.join(" ", jdepsArgs) + "\n" +
          new String(bos.toByteArray()));
    }

    AtomicReference<Path> moduleInfo = new AtomicReference<>();
    // Fortunately, we know the directory where the output is written
    Files.walkFileTree(tempDir, new SimpleFileVisitor<>() {
      @Override
      public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
        if ("module-info.java".equals(file.getFileName().toString())) {
          moduleInfo.set(file);
        }
        return FileVisitResult.TERMINATE;
      }
    });

    if (moduleInfo.get() == null) {
      throw new RuntimeException("Unable to read module info");
    }

    ParserConfiguration parserConfig = new ParserConfiguration()
      .setLanguageLevel(ParserConfiguration.LanguageLevel.JAVA_11);

    Provider provider = Providers.provider(moduleInfo.get());

    ParseResult<CompilationUnit> parseResult = new JavaParser(parserConfig)
      .parse(COMPILATION_UNIT, provider);

    CompilationUnit unit = parseResult.getResult()
      .orElseThrow(() -> new RuntimeException("Unable to parse " + moduleInfo.get()));

    ModuleDeclaration moduleDeclaration = unit.getModule()
      .orElseThrow(() -> new RuntimeException("No module declaration in " + moduleInfo.get()));

    moduleDeclaration = moduleDeclaration.setName(moduleName);

    // Prepare a classloader to help us find classes.
    ClassLoader classLoader;
    if (modulePath != null) {
      URL[] urls = Stream.concat(Stream.of(inJar.toAbsolutePath().toString()), Arrays.stream(modulePath.split(File.pathSeparator)))
        .map(path -> {
          try {
            return Paths.get(path).toUri().toURL();
          } catch (MalformedURLException e) {
            throw new UncheckedIOException(e);
          }
        })
        .toArray(URL[]::new);

      classLoader = new URLClassLoader(urls);
    } else {
      classLoader = new URLClassLoader(new URL[0]);
    }

    ClassWriter classWriter = new ClassWriter(0);
    classWriter.visit(
      /* version 9 */
      53,
      ACC_MODULE,
      "module-info",
      null,
      null,
      null);
    ModuleVisitor moduleVisitor = classWriter.visitModule(moduleName, ACC_OPEN, null);
    moduleVisitor.visitRequire("java.base", ACC_MANDATED, null);

    Predicate<String> excludePredicate = excludes.stream()
      .map(Pattern::asMatchPredicate)
      .reduce(Predicate::or)
      .orElse(str -> true);

    moduleDeclaration.accept(new MyModuleVisitor(classLoader, excludePredicate, moduleVisitor), null);

    moduleVisitor.visitEnd();

    classWriter.visitEnd();

    Manifest manifest = new Manifest();
    manifest.getMainAttributes().put(Attributes.Name.MANIFEST_VERSION, "1.0");
    manifest.getMainAttributes().put(Attributes.Name.MULTI_RELEASE, "true");

    try (OutputStream os = Files.newOutputStream(outJar);
         JarOutputStream jos = new JarOutputStream(os, manifest)) {
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

  private static String deriveModuleName(String coordinates) {
    String[] split = coordinates.split(":");
    String[] parts = split[0].split("\\.");

    String finalName = parts[parts.length - 1] + "-";
    String name = String.format(
      "%s.%s",
      split[0],
      split[1].startsWith(finalName) ? split[1].substring(finalName.length()) : split[1]);

    return name.replace("-", "_");
  }

  private static class MyModuleVisitor extends VoidVisitorAdapter<Void> {

    private final ClassLoader classLoader;
    private Predicate<String> excludedExports;
    private final ModuleVisitor byteBuddyVisitor;

    MyModuleVisitor(ClassLoader classLoader, Predicate<String> excludedExports, ModuleVisitor byteBuddyVisitor) {
      this.classLoader = classLoader;
      this.excludedExports = excludedExports;
      this.byteBuddyVisitor = byteBuddyVisitor;
    }

    @Override
    public void visit(ModuleRequiresDirective n, Void arg) {
      byteBuddyVisitor.visitRequire(
        n.getNameAsString(),
        getByteBuddyModifier(n.getModifiers()),
        null);
    }

    @Override
    public void visit(ModuleExportsDirective n, Void arg) {
      if (excludedExports.test(n.getNameAsString())) {
        return;
      }
      byteBuddyVisitor.visitExport(
        n.getNameAsString().replace('.', '/'),
        0,
        n.getModuleNames().stream().map(Name::asString).toArray(String[]::new));
    }

    @Override
    public void visit(ModuleProvidesDirective n, Void arg) {
      byteBuddyVisitor.visitProvide(
        getClassName(n.getNameAsString()),
        n.getWith().stream()
          .map(type -> getClassName(type.asString()))
          .toArray(String[]::new));
    }

    @Override
    public void visit(ModuleUsesDirective n, Void arg) {
      byteBuddyVisitor.visitUse(n.getNameAsString().replace('.', '/'));
    }

    @Override
    public void visit(ModuleOpensDirective n, Void arg) {
      throw new UnsupportedOperationException(n.toString());
    }

    private int getByteBuddyModifier(NodeList<Modifier> modifiers) {
      return modifiers.stream()
        .mapToInt(mod -> {
          if (mod.getKeyword() == Modifier.Keyword.TRANSITIVE) {
            return ACC_TRANSITIVE;
          }
          throw new RuntimeException("Unknown modifier: " + mod);
        })
        .reduce(0, (l, r) -> l | r);
    }

    private String getClassName(String possibleClassName) {
      String name = possibleClassName.replace('/', '.');
      if (lookup(name)) {
        return name.replace('.', '/');
      }

      int index = name.lastIndexOf('.');
      if (index != -1) {
        name = name.substring(0, index) + "$" + name.substring(index + 1);
        if (lookup(name)) {
          return name.replace('.', '/');
        }
      }

      throw new RuntimeException("Cannot find class: " + name);
    }

    private boolean lookup(String className) {
      try {
        Class.forName(className, false, classLoader);
        return true;
      } catch (ClassNotFoundException e) {
        return false;
      }
    }
  }
}
