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

import com.sun.jna.Native;
import com.sun.jna.Pointer;
import com.sun.jna.Structure;
import com.sun.jna.platform.win32.WinBase;
import com.sun.jna.platform.win32.WinNT;
import com.sun.jna.win32.W32APIOptions;
import org.openqa.selenium.Beta;

@Beta
public interface Kernel32 extends com.sun.jna.platform.win32.Kernel32 {
  Kernel32 INSTANCE = (Kernel32) Native.loadLibrary(
      "kernel32", Kernel32.class, W32APIOptions.UNICODE_OPTIONS);

  WinNT.HANDLE CreateJobObject(WinBase.SECURITY_ATTRIBUTES attrs, String name);
  boolean SetInformationJobObject(HANDLE hJob, int JobObjectInfoClass, Pointer lpJobObjectInfo, int cbJobObjectInfoLength);
  boolean AssignProcessToJobObject(HANDLE hJob, HANDLE hProcess);
  boolean TerminateJobObject(HANDLE hJob, long uExitCode);
  int ResumeThread(HANDLE hThread);

  // 0x00000800
  int JOB_OBJECT_LIMIT_BREAKAWAY_OK = 2048;
  // 0x00002000
  int JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 8192;

  int JobObjectExtendedLimitInformation = 9;

  static class JOBJECT_BASIC_LIMIT_INFORMATION extends Structure {
    public LARGE_INTEGER PerProcessUserTimeLimit;
    public LARGE_INTEGER PerJobUserTimeLimit;
    public int LimitFlags;
    public SIZE_T MinimumWorkingSetSize;
    public SIZE_T MaximumWorkingSetSize;
    public int ActiveProcessLimit;
    public ULONG_PTR Affinity;
    public int PriorityClass;
    public int SchedulingClass;
  }

  static class IO_COUNTERS extends Structure {
    public ULONGLONG ReadOperationCount;
    public ULONGLONG WriteOperationCount;
    public ULONGLONG OtherOperationCount;
    public ULONGLONG ReadTransferCount;
    public ULONGLONG WriteTransferCount;
    public ULONGLONG OtherTransferCount;
  }

  static class JOBJECT_EXTENDED_LIMIT_INFORMATION extends Structure {
    public JOBJECT_EXTENDED_LIMIT_INFORMATION() {}

    public JOBJECT_EXTENDED_LIMIT_INFORMATION(Pointer memory) {
      super(memory);
    }

    public JOBJECT_BASIC_LIMIT_INFORMATION BasicLimitInformation;
    public IO_COUNTERS IoInfo;
    public SIZE_T ProcessMemoryLimit;
    public SIZE_T JobMemoryLimit;
    public SIZE_T PeakProcessMemoryUsed;
    public SIZE_T PeakJobMemoryUsed;

    public static class ByReference extends JOBJECT_EXTENDED_LIMIT_INFORMATION implements Structure.ByReference {
      public ByReference() {}

      public ByReference(Pointer memory) {
        super(memory);
      }
    }
  }
}
