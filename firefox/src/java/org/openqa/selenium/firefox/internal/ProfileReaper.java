/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.firefox.internal;

import java.io.File;
import java.util.HashSet;
import java.util.Set;

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
