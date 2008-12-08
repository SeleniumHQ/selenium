package org.openqa.selenium.firefox.internal;

import java.io.File;
import java.util.Set;
import java.util.HashSet;

public class ProfileReaper {
  private static final Object reaperLock = new Object();
  private static ProfileReaper theGrimReaper;

  private static Set<File> deleteDirs = new HashSet<File>();
  private static final Object cleanerLock = new Object();
  private static Thread cleaner;

  public static ProfileReaper getInstance() {
    if (theGrimReaper == null) {
      synchronized (reaperLock) {
        if (theGrimReaper == null) {
          theGrimReaper = new ProfileReaper();
        }
      }
    }

    return theGrimReaper;
  }

  public void deleteOnExit(File addToDeletes) {
    startCleaner();
    deleteDirs.add(addToDeletes);
  }

  private void startCleaner() {
    if (cleaner != null)
      return;

    synchronized (cleanerLock) {
      if (cleaner != null)
        return;

      Runnable deleteomatic = new Deleter(deleteDirs);
      cleaner = new Thread(deleteomatic);
      cleaner.setName("WebDriver Firefox profile cleaner thread");
      Runtime.getRuntime().addShutdownHook(cleaner);
    }
  }

  public void clean(Set<File> tempDirs) {
    Thread thread = new Thread(new Deleter(tempDirs));
    thread.run();
    try {
      thread.join();
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }

  private static class Deleter implements Runnable {
    private Set<File> deletes;

    public Deleter(Set<File> deleteDirs) {
      this.deletes = deleteDirs;
    }

    public void run() {
      String reap = System.getProperty("webdriver.firefox.reap_profile", "true");
      if (!Boolean.valueOf(reap)) {
        return;
      }
      
      Set<File> toDelete = new HashSet<File>(deletes);
      for (File deleteMe : toDelete) {
        deleteDirectoryRecursively(deleteMe);
      }
    }

    private void deleteDirectoryRecursively(File toDelete) {
      if (!toDelete.exists())
        return;

      if (toDelete.isFile() && toDelete.canWrite()) {
        toDelete.delete();
      } else if (toDelete.isDirectory() && toDelete.canWrite()) {
        for (File child : toDelete.listFiles()) {
          deleteDirectoryRecursively(child);
        }
        toDelete.delete();
      }
    }
  }

}
