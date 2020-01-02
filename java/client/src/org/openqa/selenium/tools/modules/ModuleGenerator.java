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
import org.openqa.selenium.tools.zip.StableZipEntry;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
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
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.concurrent.atomic.AtomicReference;
import java.util.jar.Attributes;
import java.util.jar.JarEntry;
import java.util.jar.JarInputStream;
import java.util.jar.JarOutputStream;
import java.util.jar.Manifest;
import java.util.spi.ToolProvider;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static com.github.javaparser.ParseStart.COMPILATION_UNIT;
import static net.bytebuddy.jar.asm.Opcodes.ACC_MANDATED;
import static net.bytebuddy.jar.asm.Opcodes.ACC_MODULE;
import static net.bytebuddy.jar.asm.Opcodes.ACC_OPEN;
import static net.bytebuddy.jar.asm.Opcodes.ACC_TRANSITIVE;

public class ModuleGenerator {
  
  public static void main(String[] args) throws IOException {
    Path outJar = null;
    Path inJar = null;
    String moduleName = null;
    Set<Path> modulePath = new TreeSet<>();
    Set<String> exports = new TreeSet<>();
    Set<String> hides = new TreeSet<>();
    Set<String> uses = new TreeSet<>();

    // There is no way at all these two having similar names will cause problems
    Map<String, Set<String>> opensTo = new TreeMap<>();
    Set<String> openTo = new TreeSet<>();
    boolean isOpen = false;

    for (int i = 0; i < args.length; i++) {
      String flag = args[i];
      String next = args[++i];
      switch (flag) {
        case "--exports":
          exports.add(next);
          break;

        case "--hides":
          hides.add(next);
          break;

        case "--in":
          inJar = Paths.get(next);
          break;

        case "--is-open":
          isOpen = Boolean.parseBoolean(next);
          break;

        case "--module-name":
          moduleName = next;
          break;

        case "--module-path":
          modulePath.add(Paths.get(next));
          break;

        case "--open-to":
          openTo.add(next);
          break;

        case "--opens-to":
          opensTo.computeIfAbsent(next, str -> new TreeSet<>()).add(args[++i]);
          break;

        case "--output":
          outJar = Paths.get(next);
          break;

        case "--uses":
          uses.add(next);
          break;

        default:
          throw new IllegalArgumentException(String.format("Unknown argument: %s", flag));
      }
    }
    Objects.requireNonNull(moduleName, "Module name must be set.");
    Objects.requireNonNull(outJar, "Output jar must be set.");
    Objects.requireNonNull(inJar, "Input jar must be set.");

    ToolProvider jdeps = ToolProvider.findFirst("jdeps").orElseThrow();
    Path tempDir = Files.createTempDirectory("module-dir");

    // It doesn't matter what we use for writing to the stream: jdeps doesn't use it. *facepalm*
    List<String> jdepsArgs = new LinkedList<>(
      List.of(
        "--api-only",
        "--multi-release", "9"));
    if (!modulePath.isEmpty()) {
      jdepsArgs.addAll(List.of("--module-path", modulePath.stream().map(Object::toString).collect(Collectors.joining(File.pathSeparator))));
    }
    jdepsArgs.addAll(List.of("--generate-module-info", tempDir.toAbsolutePath().toString()));
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

    moduleDeclaration.setName(moduleName);
    moduleDeclaration.setOpen(isOpen);

    uses.forEach(service -> moduleDeclaration.addDirective(new ModuleUsesDirective(new Name(service))));

    // Prepare a classloader to help us find classes.
    ClassLoader classLoader;
    if (modulePath != null) {
      URL[] urls = Stream.concat(Stream.of(inJar.toAbsolutePath()), modulePath.stream())
        .map(path -> {
          try {
            return path.toUri().toURL();
          } catch (MalformedURLException e) {
            throw new UncheckedIOException(e);
          }
        })
        .toArray(URL[]::new);

      classLoader = new URLClassLoader(urls);
    } else {
      classLoader = new URLClassLoader(new URL[0]);
    }

    Set<String> packages = inferPackages(inJar);

    // Determine packages to export
    Set<String> exportedPackages = new HashSet<>();
    if (!isOpen) {
      if (!exports.isEmpty()) {
        exports.forEach(export -> {
          if (!packages.contains(export)) {
            throw new RuntimeException(String.format("Exported package '%s' not found in jar. %s", export, packages));
          }
          exportedPackages.add(export);
          moduleDeclaration.addDirective(new ModuleExportsDirective(new Name(export), new NodeList<>()));
        });
      } else {
        packages.forEach(export -> {
          if (!hides.contains(export)) {
            exportedPackages.add(export);
            moduleDeclaration.addDirective(new ModuleExportsDirective(new Name(export), new NodeList<>()));
          }
        });
      }
    }

    openTo.forEach(module -> moduleDeclaration.addDirective(new ModuleOpensDirective(new Name(module), new NodeList(exportedPackages.stream().map(Name::new).collect(Collectors.toSet())))));

    ClassWriter classWriter = new ClassWriter(0);
    classWriter.visit(
      /* version 9 */
      53,
      ACC_MODULE,
      "module-info",
      null,
      null,
      null);
    ModuleVisitor moduleVisitor = classWriter.visitModule(moduleName, isOpen ? ACC_OPEN : 0, null);
    moduleVisitor.visitRequire("java.base", ACC_MANDATED, null);

    moduleDeclaration.accept(new MyModuleVisitor(classLoader, hides, moduleVisitor), null);

    moduleVisitor.visitEnd();

    classWriter.visitEnd();

    Manifest manifest = new Manifest();
    manifest.getMainAttributes().put(Attributes.Name.MANIFEST_VERSION, "1.0");
    manifest.getMainAttributes().put(Attributes.Name.MULTI_RELEASE, "true");

    try (OutputStream os = Files.newOutputStream(outJar);
         JarOutputStream jos = new JarOutputStream(os, manifest)) {
      jos.setLevel(ZipOutputStream.STORED);

      ZipEntry dir = new StableZipEntry("META-INF/");
      jos.putNextEntry(dir);

      dir = new StableZipEntry("META-INF/versions/");
      jos.putNextEntry(dir);

      dir = new StableZipEntry("META-INF/versions/9/");
      jos.putNextEntry(dir);

      byte[] bytes = classWriter.toByteArray();

      ZipEntry entry = new StableZipEntry("META-INF/versions/9/module-info.class");
      entry.setSize(bytes.length);

      jos.putNextEntry(entry);
      jos.write(bytes);
      jos.closeEntry();
    }
  }

  private static Set<String> inferPackages(Path inJar) {
    Set<String> packageNames = new TreeSet<>();

    try (InputStream is = Files.newInputStream(inJar);
         JarInputStream jis = new JarInputStream(is)) {
      for (JarEntry entry = jis.getNextJarEntry(); entry != null; entry = jis.getNextJarEntry()) {

        if (entry.isDirectory()) {
          continue;
        }

        if (!entry.getName().endsWith(".class")) {
          continue;
        }

        String name = entry.getName();

        int index = name.lastIndexOf('/');
        if (index == -1) {
          continue;
        }
        name = name.substring(0, index);

        // If we've a multi-release jar, remove that too
        if (name.startsWith("META-INF/versions/")) {
          String[] segments = name.split("/");
          if (segments.length < 3) {
            continue;
          }

          name = Arrays.stream(Arrays.copyOfRange(segments, 3, segments.length)).collect(Collectors.joining("/"));
        }

        name = name.replace("/", ".");

        packageNames.add(name);
      }

      return packageNames;
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private static class MyModuleVisitor extends VoidVisitorAdapter<Void> {

    private final ClassLoader classLoader;
    private Set<String> seenExports;
    private final ModuleVisitor byteBuddyVisitor;

    MyModuleVisitor(ClassLoader classLoader, Set<String> excluded, ModuleVisitor byteBuddyVisitor) {
      this.classLoader = classLoader;
      this.byteBuddyVisitor = byteBuddyVisitor;
      // Set is modifiable
      this.seenExports = new HashSet<>(excluded);
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
      if (seenExports.contains(n.getNameAsString())) {
        return;
      }

      seenExports.add(n.getNameAsString());

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
