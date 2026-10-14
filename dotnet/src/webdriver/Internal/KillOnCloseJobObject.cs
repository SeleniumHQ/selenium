// <copyright file="KillOnCloseJobObject.cs" company="Selenium Committers">
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
// </copyright>

using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.Internal;

/// <summary>
/// Adds processes to a Windows Job Object configured to terminate all of its
/// associated processes when the last handle to the job is closed. The job handle
/// is held by the current process, so when this process exits — including when it
/// is terminated abruptly — the operating system closes the handle and kills any
/// process still in the job, along with its children (e.g. the browser spawned by
/// a driver server process).
/// </summary>
/// <remarks>
/// <para>
/// This restores the lifetime coupling between the application and the driver
/// server process that was lost when driver services stopped attaching to the
/// parent's console (see https://github.com/SeleniumHQ/selenium/issues/17095).
/// Unlike the previous console-based behavior, this also works when the parent
/// process is killed without any chance to run cleanup code.
/// </para>
/// <para>
/// This class is implemented on top of Windows-only APIs: using it on any other
/// platform throws. Callers are responsible for checking the platform before
/// creating an instance.
/// </para>
/// <para>
/// Disposing of an instance closes the job handle, which immediately terminates
/// every process still associated with the job. Owners that need tracked
/// processes to outlive the instance must therefore keep the handle open and
/// let the operating system close it at process exit instead.
/// </para>
/// </remarks>
public sealed class KillOnCloseJobObject : IDisposable
{
    private const int JobObjectExtendedLimitInformationClass = 9;
    private const int JobObjectBasicAccountingInformationClass = 1;
    private const uint JobObjectLimitKillOnJobClose = 0x2000;

    private static readonly ILogger _logger = Log.GetLogger<KillOnCloseJobObject>();

    private readonly SafeFileHandle jobHandle;

    /// <summary>
    /// Initializes a new instance of the <see cref="KillOnCloseJobObject"/> class,
    /// creating the underlying job object.
    /// </summary>
    /// <exception cref="Win32Exception">If the job object cannot be created or configured.</exception>
    public KillOnCloseJobObject()
    {
        this.jobHandle = CreateJobObject(IntPtr.Zero, null);
        if (this.jobHandle.IsInvalid)
        {
            throw new Win32Exception("Unable to create a job object for tracking the driver process");
        }

        JOBOBJECT_EXTENDED_LIMIT_INFORMATION information = default;
        information.BasicLimitInformation.LimitFlags = JobObjectLimitKillOnJobClose;

        if (!SetInformationJobObject(this.jobHandle, JobObjectExtendedLimitInformationClass, ref information, (uint)Marshal.SizeOf<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>()))
        {
            // Release the handle this instance already owns so that a
            // configuration failure cannot leak it.
            this.jobHandle.Dispose();
            throw new Win32Exception("Unable to configure the job object to terminate processes on close");
        }
    }

    /// <summary>
    /// Adds the specified process to the job object, so that it is terminated
    /// when this application exits, and returns a value indicating whether the
    /// process is tracked by this job object. Adding a process is best-effort:
    /// if it fails (for example, when the process has already exited, or when
    /// nested jobs are not allowed by the host), the failure is logged and the
    /// process is left untracked rather than disrupting driver startup.
    /// </summary>
    /// <param name="process">The process to add to the job object.</param>
    /// <returns><see langword="true"/> if the process is tracked by this job object;
    /// otherwise, <see langword="false"/> and the failure has been logged.</returns>
    public bool AddProcess(Process process)
    {
        try
        {
            if (!AssignProcessToJobObject(this.jobHandle, process.Handle))
            {
                if (_logger.IsEnabled(LogEventLevel.Trace))
                {
                    _logger.Trace($"Unable to add process {process.Id} to the driver job object: {new Win32Exception().Message}");
                }

                return false;
            }

            return true;
        }
        catch (InvalidOperationException)
        {
            // The process has already exited; there is nothing to track.
            return false;
        }
        catch (System.ComponentModel.Win32Exception ex)
        {
            if (_logger.IsEnabled(LogEventLevel.Trace))
            {
                _logger.Trace($"Unable to retrieve the handle of process {process.Id} to add it to the driver job object: {ex.Message}");
            }

            return false;
        }
    }

    /// <summary>
    /// Releases the handle to the job object. Processes still associated with
    /// the job at this point are terminated by the operating system.
    /// </summary>
    public void Dispose()
    {
        this.jobHandle.Dispose();
    }

    /// <summary>
    /// Disposes of this instance if the job object no longer has any associated
    /// processes, and returns a value indicating whether the handle was released.
    /// </summary>
    /// <remarks>
    /// This lets owners that keep the handle open (to avoid terminating tracked
    /// processes that are still alive) release it once every process associated
    /// with the job has exited.
    /// </remarks>
    public bool TryDisposeIfEmpty()
    {
        if (!QueryInformationJobObject(this.jobHandle, JobObjectBasicAccountingInformationClass, out JOBOBJECT_BASIC_ACCOUNTING_INFORMATION accounting, (uint)Marshal.SizeOf<JOBOBJECT_BASIC_ACCOUNTING_INFORMATION>(), IntPtr.Zero))
        {
            if (_logger.IsEnabled(LogEventLevel.Trace))
            {
                _logger.Trace($"Unable to determine whether the driver job object is empty: {new Win32Exception().Message}");
            }

            return false;
        }

        if (accounting.ActiveProcesses > 0)
        {
            return false;
        }

        this.Dispose();
        return true;
    }

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern SafeFileHandle CreateJobObject(IntPtr lpJobAttributes, string? lpName);

    [DllImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool SetInformationJobObject(
        SafeFileHandle hJob,
        int jobObjectInformationClass,
        ref JOBOBJECT_EXTENDED_LIMIT_INFORMATION lpJobObjectInformation,
        uint cbJobObjectInformationLength);

    [DllImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool AssignProcessToJobObject(SafeFileHandle hJob, IntPtr hProcess);

    [DllImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool QueryInformationJobObject(
        SafeFileHandle hJob,
        int jobObjectInformationClass,
        out JOBOBJECT_BASIC_ACCOUNTING_INFORMATION lpJobObjectInformation,
        uint cbJobObjectInformationLength,
        IntPtr lpReturnLength);

    [StructLayout(LayoutKind.Sequential)]
    private struct JOBOBJECT_BASIC_ACCOUNTING_INFORMATION
    {
        public long TotalUserTime;
        public long TotalKernelTime;
        public long ThisPeriodTotalUserTime;
        public long ThisPeriodTotalKernelTime;
        public uint TotalPageFaultCount;
        public uint TotalProcesses;
        public uint ActiveProcesses;
        public uint TotalTerminatedProcesses;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct IO_COUNTERS
    {
        public ulong ReadOperationCount;
        public ulong WriteOperationCount;
        public ulong OtherOperationCount;
        public ulong ReadTransferCount;
        public ulong WriteTransferCount;
        public ulong OtherTransferCount;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct JOBOBJECT_BASIC_LIMIT_INFORMATION
    {
        public long PerProcessUserTimeLimit;
        public long PerJobUserTimeLimit;
        public uint LimitFlags;
        public UIntPtr MinimumWorkingSetSize;
        public UIntPtr MaximumWorkingSetSize;
        public uint ActiveProcessLimit;
        public UIntPtr Affinity;
        public uint PriorityClass;
        public uint SchedulingClass;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct JOBOBJECT_EXTENDED_LIMIT_INFORMATION
    {
        public JOBOBJECT_BASIC_LIMIT_INFORMATION BasicLimitInformation;
        public IO_COUNTERS IoInfo;
        public UIntPtr ProcessMemoryLimit;
        public UIntPtr JobMemoryLimit;
        public UIntPtr PeakProcessMemoryUsed;
        public UIntPtr PeakJobMemoryUsed;
    }
}
