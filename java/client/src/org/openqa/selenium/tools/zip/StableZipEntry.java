package org.openqa.selenium.tools.zip;

import java.nio.file.attribute.FileTime;
import java.time.Instant;
import java.util.zip.ZipEntry;

public class StableZipEntry extends ZipEntry {

  // Starts at 1980-01-01. We'll match what buck uses
  private static final long DOS_EPOCH = Instant.parse("1985-02-01T00:00:00.00Z").toEpochMilli();

  public StableZipEntry(String name) {
    super(name);

    setTime(DOS_EPOCH);
    setCreationTime(FileTime.fromMillis(DOS_EPOCH));
    setLastModifiedTime(FileTime.fromMillis(DOS_EPOCH));
  }
}
