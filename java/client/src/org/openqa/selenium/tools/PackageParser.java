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
