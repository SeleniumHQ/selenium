package org.openqa.selenium.safari.helpers;

import static com.google.common.io.Files.copy;

import com.google.common.collect.Maps;

import org.openqa.selenium.io.TemporaryFilesystem;

import java.io.File;
import java.io.IOException;
import java.util.Map;

public class ExtensionBackup {

  private final TemporaryFilesystem filesystem = TemporaryFilesystem.getDefaultTmpFS();
  private final Map<File, File> backups = Maps.newHashMap();

  private File backupDir;

  public File backup(File file) throws IOException {
    if (backupDir == null) {
      backupDir = filesystem.createTempDir("SafariBackups", "webdriver");
    }
    File backup = new File(backupDir, file.getName());
    copy(file, backup);
    backups.put(file, backup);
    return backup;
  }

  public void restoreAll() throws IOException {
    for (Map.Entry<File, File> entry : backups.entrySet()) {
      File originalLocation = entry.getKey();
      File backup = entry.getValue();
      copy(backup, originalLocation);
    }
  }

}
