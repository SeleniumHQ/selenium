/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.os;

import com.sun.jna.platform.win32.WinBase;
import com.sun.jna.platform.win32.WinDef;
import com.sun.jna.platform.win32.WinNT;
import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriverException;

import java.io.File;
import java.io.OutputStream;
import java.util.Map;

// This is a rewrite of
// http://svn.openqa.org/svn/selenium-rc/trunk/killableprocess/killableprocess.cpp
// in Java using JNA.

/**
 * Utility class for grouping a set of processes into a process group on
 * Windows. This is primarily used for processes that spawn child processes and
 * then disconnect from them: killing the parent process should kill the
 * children too. That sounds a bit more sinsiter than it actually is.
 */
@Beta
public class WindowsProcessGroup implements OsProcess {
  private Kernel32 Kernel32;
  private String cmd;
  private WinNT.HANDLE hJob;
  private String workingDirectory = null;

  public WindowsProcessGroup(String executable, String... args) {
    Kernel32 = Kernel32.INSTANCE;

    StringBuilder toExecute = new StringBuilder();
    toExecute.append(executable);

    for (String arg : args) {
      toExecute.append(" ");
      toExecute.append(quote(arg));
    }

    cmd = toExecute.toString();
  }

  private String quote(String toQuote) {
    if (toQuote.indexOf(' ') != -1) {
      return '"' + toQuote + '"';
    }
    return toQuote;
  }

  public Map<String, String> getEnvironment() {
    throw new UnsupportedOperationException("getEnvironment");
  }

  public void setEnvironmentVariable(String name, String value) {
    throw new UnsupportedOperationException("setEnvironmentVariable");
  }

  public void copyOutputTo(OutputStream out) {
    throw new UnsupportedOperationException("copyOutputTo");
  }

  public void setInput(String allInput) {
    throw new UnsupportedOperationException("setInput");
  }

  public void setWorkingDirectory(File workingDirectory) {
    this.workingDirectory = workingDirectory.getAbsolutePath();
  }

  public void executeAsync() {
    WinBase.STARTUPINFO si = new WinBase.STARTUPINFO();
    si.clear();
    WinBase.PROCESS_INFORMATION.ByReference pi = new WinBase.PROCESS_INFORMATION.ByReference();
    pi.clear();
    Kernel32.JOBJECT_EXTENDED_LIMIT_INFORMATION jeli =
        new Kernel32.JOBJECT_EXTENDED_LIMIT_INFORMATION.ByReference();
    jeli.clear();

    // Call SetHandleInformation. Take a look in SocketLock.cs

    hJob = Kernel32.CreateJobObject(null, null);
    if (hJob.getPointer() == null) {
      throw new WebDriverException("Cannot create job object");
    }

    // Hopefully, Windows will kill the job automatically if this process dies
    // But beware!  Process Explorer can break this by keeping open a handle to all jobs!
    // http://forum.sysinternals.com/forum_posts.asp?TID=4094
    jeli.BasicLimitInformation.LimitFlags = Kernel32.JOB_OBJECT_LIMIT_BREAKAWAY_OK |
        Kernel32.JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;

    if (!Kernel32.SetInformationJobObject(hJob, Kernel32.JobObjectExtendedLimitInformation, jeli.getPointer(), jeli.size())) {
      throw new WebDriverException("Unable to set information on the job object");
    }

    // Start the child process
    boolean result = Kernel32.CreateProcess(null, // No module name (use command line).
        cmd,   // Command line.
        null,  // Process handle not inheritable.
        null,  // Thread handle not inheritable.
        false, // Set handle inheritance to FALSE.
        new WinDef.DWORD(4 | 16777216), // Suspend so we can add to job | Allow ourselves to breakaway from Vista's PCA if necessary
        null,  // Use parent's environment block.
        workingDirectory,  // Use provided working directory, parent's directory if null.
        si,    // Pointer to STARTUPINFO structure.
        pi);   // Pointer to PROCESS_INFORMATION structure.
    if (!result) {
      throw new WebDriverException("Failed to create the process");
    }

    if (!Kernel32.AssignProcessToJobObject(hJob, pi.hProcess)) {
      throw new WebDriverException("Cannot assign process to job: " + Kernel32.GetLastError());
    }

    if (Kernel32.ResumeThread(pi.hThread) == 0) {
      throw new WebDriverException("Cannot resume thread");
    }

    Kernel32.CloseHandle(pi.hThread);
    Kernel32.CloseHandle(pi.hProcess);
  }

  public void waitFor() throws InterruptedException {
    // no-op
  }

  public int destroy() {
    if (!isRunning()) {
      return 0; // Hard code the return value
    }

    // This seems a trifle brutal. Oh well. Brutal it is.
    Kernel32.TerminateJobObject(hJob, 666);
    Kernel32.CloseHandle(hJob);
    hJob = null;

    return 0;
  }

  public int getExitCode() {
    return 0;
  }
  
  public boolean isRunning() {
    return hJob != null;
  }

  public String getStdOut() {
    throw new UnsupportedOperationException("getStdOut");
  }
}
