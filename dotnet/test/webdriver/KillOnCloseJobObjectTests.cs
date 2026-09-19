// <copyright file="KillOnCloseJobObjectTests.cs" company="Selenium Committers">
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

using System.Diagnostics;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class KillOnCloseJobObjectTests
{
    [Test]
    [Platform("Win")]
    public void ProcessAddedToJobObjectIsTerminatedWhenJobObjectIsDisposed()
    {
        ProcessStartInfo startInfo = new("ping", "-n 30 127.0.0.1")
        {
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using Process process = Process.Start(startInfo)!;

        try
        {
            using (KillOnCloseJobObject jobObject = new())
            {
                if (!jobObject.AddProcess(process))
                {
                    // Assignment is best-effort in production too; when the
                    // host does not allow it there is no job to test here.
                    Assert.Ignore("Nested job assignment is not supported by this host, so the kill-on-close contract cannot be verified here.");
                }
            }

            // Disposing the job object closes the last job handle, and the operating
            // system must terminate every process still associated with the job.
            bool exitedWithinTimeout = ProcessTerminatedWithin(process);

            Assert.That(exitedWithinTimeout, Is.True, "The process added to the job object should be terminated when the job object is disposed");
        }
        finally
        {
            if (!process.HasExited)
            {
                process.Kill();
            }
        }
    }

    [Test]
    [Platform("Win")]
    public void ProcessAddedToJobObjectIsTerminatedWhenJobObjectIsGarbageCollected()
    {
        ProcessStartInfo startInfo = new("ping", "-n 30 127.0.0.1")
        {
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using Process process = Process.Start(startInfo)!;

        try
        {
            // A job object that is never disposed of explicitly models a driver
            // service abandoned by user code: its handle must eventually be
            // released by finalization, and the operating system terminates every
            // process still associated with the job once that happens.
            WeakReference jobObjectReference = AddToAbandonedJobObject(process, out bool assigned);
            if (!assigned)
            {
                Assert.Ignore("Nested job assignment is not supported by this host, so the kill-on-close contract cannot be verified here.");
            }

            for (int attempt = 0; jobObjectReference.IsAlive && attempt < 10; attempt++)
            {
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }

            Assert.That(jobObjectReference.IsAlive, Is.False, "The abandoned job object should have been garbage collected");

            bool exitedWithinTimeout = ProcessTerminatedWithin(process);

            Assert.That(exitedWithinTimeout, Is.True, "The process added to the abandoned job object should be terminated once it is garbage collected");
        }
        finally
        {
            if (!process.HasExited)
            {
                process.Kill();
            }
        }
    }

    private static WeakReference AddToAbandonedJobObject(Process process, out bool assigned)
    {
        KillOnCloseJobObject jobObject = new();
        assigned = jobObject.AddProcess(process);
        return new WeakReference(jobObject);
    }

    /// <summary>
    /// Waits briefly for the process to terminate. A failed wait does not
    /// prove termination, so the process state is checked independently
    /// instead of being assumed.
    /// </summary>
    private static bool ProcessTerminatedWithin(Process process)
    {
        try
        {
            return process.WaitForExit(5000);
        }
        catch (System.ComponentModel.Win32Exception)
        {
            // WaitForExit can throw if the process handle is already invalid.
            return !IsProcessRunning(process.Id);
        }
    }

    private static bool IsProcessRunning(int processId)
    {
        try
        {
            using Process running = Process.GetProcessById(processId);
            return !running.HasExited;
        }
        catch (ArgumentException)
        {
            return false;
        }
    }

    [Test]
    [Platform("Win")]
    public void JobObjectIsOnlyReleasedWhenItsTrackedProcessesHaveExited()
    {
        ProcessStartInfo startInfo = new("ping", "-n 30 127.0.0.1")
        {
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using Process process = Process.Start(startInfo)!;

        try
        {
            using KillOnCloseJobObject jobObject = new();
            if (!jobObject.AddProcess(process))
            {
                Assert.Ignore("Nested job assignment is not supported by this host, so the kill-on-close contract cannot be verified here.");
            }

            Assert.That(jobObject.TryDisposeIfEmpty(), Is.False, "The job object should not be released while a tracked process is still alive");

            process.Kill();
            process.WaitForExit(5000);

            Assert.That(jobObject.TryDisposeIfEmpty(), Is.True, "The job object should be released once all tracked processes have exited");
        }
        finally
        {
            if (!process.HasExited)
            {
                process.Kill();
            }
        }
    }
}
