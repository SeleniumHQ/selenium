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
