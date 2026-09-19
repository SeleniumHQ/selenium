// <copyright file="DriverServiceProcessLifetimeTests.cs" company="Selenium Committers">
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
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Text;
using OpenQA.Selenium.Chrome;

namespace OpenQA.Selenium.Tests;

/// <summary>
/// Exercises the process-lifetime guarantees of <see cref="DriverService"/> through
/// its real startup and disposal flow, using a copy of ping.exe as a stand-in for
/// the driver server executable and a minimal HTTP server that satisfies the
/// service initialization status polling.
/// </summary>
[TestFixture]
[NonParallelizable]
public class DriverServiceProcessLifetimeTests
{
    [Test]
    [Platform("Win")]
    public async Task DisposingDriverServiceTerminatesTheDriverProcess()
    {
        string stubExePath = CreateStubExecutable();
        try
        {
            int port = GetFreeTcpPort();
            using StubDriverHttpServer httpServer = new(port);
            using StubDriverService service = new(
                Path.GetDirectoryName(stubExePath)!, port, Path.GetFileName(stubExePath), "-n 120 127.0.0.1");

            await service.StartAsync();

            Assert.That(service.IsRunning, Is.True, "The stub driver process should be running after the service has started");
            int driverProcessId = service.ProcessId;

            service.Dispose();

            Assert.That(IsProcessRunning(driverProcessId), Is.False, "Disposing the service must terminate its driver process");
        }
        finally
        {
            File.Delete(stubExePath);
        }
    }

    [Test]
    [Platform("Win")]
    public async Task ProcessStartedByDriverThatIsStillRunningSurvivesServiceDisposal()
    {
        // A process spawned by the driver and still alive when the service is
        // disposed models a browser kept running by the user through
        // ChromiumOptions.LeaveBrowserRunning: it must not be terminated by the
        // disposal of the service.
        string stubExePath = CreateStubExecutable();
        string stubExeName = Path.GetFileNameWithoutExtension(stubExePath);
        try
        {
            int port = GetFreeTcpPort();
            using StubDriverHttpServer httpServer = new(port);

            string powerShellPath = Path.Combine(Environment.SystemDirectory, "WindowsPowerShell", "v1.0", "powershell.exe");
            string spawnChildCommand = $"Start-Process -FilePath '{stubExePath}' -ArgumentList '-n','120','127.0.0.1' -NoNewWindow; Start-Sleep -Seconds 120";
            using StubDriverService service = new(
                Path.GetDirectoryName(powerShellPath)!, port, Path.GetFileName(powerShellPath), $"-NoProfile -Command \"{spawnChildCommand}\"");

            await service.StartAsync();

            // The driver only spawns its child after it has started up, so wait
            // for the child to be alive before disposing of the service.
            Assert.That(
                () => Process.GetProcessesByName(stubExeName).Length,
                Is.GreaterThan(0).After(30000, 100),
                "The stub driver process should spawn its child process");

            service.Dispose();

            Assert.That(
                Process.GetProcessesByName(stubExeName).Length,
                Is.GreaterThan(0),
                "A process started by the driver that is still running must survive the disposal of the service, like a browser kept running by LeaveBrowserRunning");
        }
        finally
        {
            // Terminate every surviving child and wait for the termination to
            // complete before deleting the executable: a kill alone does not
            // release the file, which would fail the deletion.
            KillAllProcessesNamed(stubExeName);
            File.Delete(stubExePath);
        }
    }

    [Test]
    [Platform("Win")]
    public void ProcessExitFallbackTerminatesDriverProcessesThatWereNotTrackedInAJobObject()
    {
        // Job assignment failure cannot be forced on demand, so this drives
        // the fallback path through the same private entry points that
        // TrackDriverProcessLifetime uses when the job object is unavailable.
        string stubExePath = CreateStubExecutable();
        string stubExeName = Path.GetFileNameWithoutExtension(stubExePath);
        try
        {
            ProcessStartInfo startInfo = new(stubExePath, "-n 120 127.0.0.1")
            {
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using Process process = Process.Start(startInfo)!;
            using StubDriverService service = new(
                Path.GetDirectoryName(stubExePath)!, GetFreeTcpPort(), Path.GetFileName(stubExePath), "-n 120 127.0.0.1");

            MethodInfo registerForTermination = typeof(DriverService).GetMethod(
                "TrackDriverProcessForTerminationOnProcessExit",
                BindingFlags.Instance | BindingFlags.NonPublic);
            MethodInfo terminateOnProcessExit = typeof(DriverService).GetMethod(
                "TerminateUntrackedDriverProcessesOnProcessExit",
                BindingFlags.Static | BindingFlags.NonPublic);

            Assert.That(registerForTermination, Is.Not.Null, "The DriverService fallback registration entry point should exist");
            Assert.That(terminateOnProcessExit, Is.Not.Null, "The DriverService process exit handler should exist");

            registerForTermination.Invoke(service, new object[] { process });

            // The exit handler disposes the registered processes, so the id
            // must be captured before it runs.
            int processId = process.Id;

            terminateOnProcessExit.Invoke(null, new object[] { null, EventArgs.Empty });

            // Kill only initiates termination, so give the operating system
            // time to complete it before asserting.
            Assert.That(
                () => IsProcessRunning(processId),
                Is.False.After(10000, 50),
                "The ProcessExit fallback should terminate a driver process that no job object tracks");
        }
        finally
        {
            KillAllProcessesNamed(stubExeName);
            File.Delete(stubExePath);
        }
    }

    [Test]
    [Platform("Win")]
    public void FinalizerOfAbandonedDriverServiceTerminatesTheDriverProcess()
    {
        // A service that is garbage collected without ever being disposed, as
        // reported by the issue this change fixes, relies on its finalizer as
        // the last resort: it must terminate the driver process even though no
        // disposal code ever runs.
        string stubExePath = CreateStubExecutable();
        string stubExeName = Path.GetFileNameWithoutExtension(stubExePath);
        try
        {
            int port = GetFreeTcpPort();
            using StubDriverHttpServer httpServer = new(port);
            int driverProcessId = StartAbandonedDriverService(stubExePath, port, out WeakReference serviceReference);

            // The only remaining path to cleanup is finalization, so wait for
            // it to run before asserting on the driver process.
            for (int attempt = 0; serviceReference.IsAlive && attempt < 10; attempt++)
            {
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }

            Assert.That(serviceReference.IsAlive, Is.False, "The abandoned driver service should have been garbage collected");
            Assert.That(
                () => IsProcessRunning(driverProcessId),
                Is.False.After(10000, 50),
                "The finalizer of an abandoned driver service must terminate its driver process");
        }
        finally
        {
            KillAllProcessesNamed(stubExeName);
            File.Delete(stubExePath);
        }
    }

    /// <summary>
    /// Creates a uniquely named copy of ping.exe that runs for a while, standing in
    /// for a driver executable. The unique name lets the tests find their own
    /// processes without disturbing ping processes owned by other tests.
    /// </summary>
    private static string CreateStubExecutable()
    {
        string stubExePath = Path.Combine(Path.GetTempPath(), $"selenium-stub-driver-{Guid.NewGuid():N}.exe");
        File.Copy(Path.Combine(Environment.SystemDirectory, "ping.exe"), stubExePath);
        return stubExePath;
    }

    /// <summary>
    /// Starts a stub driver service and returns without keeping any reference to
    /// it, modeling a service abandoned by user code: once the caller has no
    /// strong reference either, only its finalizer can clean up after it.
    /// </summary>
    private static int StartAbandonedDriverService(string stubExePath, int port, out WeakReference serviceReference)
    {
        StubDriverService service = new(
            Path.GetDirectoryName(stubExePath)!, port, Path.GetFileName(stubExePath), "-n 120 127.0.0.1");
        service.StartAsync().GetAwaiter().GetResult();
        int driverProcessId = service.ProcessId;
        serviceReference = new WeakReference(service);
        return driverProcessId;
    }

    private static int GetFreeTcpPort()
    {
        using Socket socket = new(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        socket.Bind(new IPEndPoint(IPAddress.Loopback, 0));
        return ((IPEndPoint)socket.LocalEndPoint!).Port;
    }

    private static bool IsProcessRunning(int processId)
    {
        try
        {
            using Process process = Process.GetProcessById(processId);
            return !process.HasExited;
        }
        catch (ArgumentException)
        {
            return false;
        }
    }

    private static void KillAllProcessesNamed(string processName)
    {
        foreach (Process process in Process.GetProcessesByName(processName))
        {
            using (process)
            {
                try
                {
                    if (!process.HasExited)
                    {
                        process.Kill();
                        process.WaitForExit(5000);
                    }
                }
                catch (System.ComponentModel.Win32Exception)
                {
                    // The process exited concurrently; nothing more to do.
                }
                catch (InvalidOperationException)
                {
                    // The process exited concurrently; nothing more to do.
                }
            }
        }
    }

    /// <summary>
    /// A <see cref="DriverService"/> that launches an arbitrary executable instead
    /// of a real driver server, so process-lifetime behavior can be tested without
    /// a browser. Health checks succeed through <see cref="StubDriverHttpServer"/>.
    /// </summary>
    private sealed class StubDriverService : DriverService
    {
        private readonly string commandLineArguments;

        public StubDriverService(string servicePath, int port, string driverServiceExecutableName, string commandLineArguments)
            : base(servicePath, port, driverServiceExecutableName)
        {
            // Bind to IPv4 explicitly, because the stub status server listens on
            // the IPv4 loopback address only.
            this.HostName = "127.0.0.1";
            this.commandLineArguments = commandLineArguments;
        }

        protected override string CommandLineArguments => this.commandLineArguments;

        // The stub executable has no shutdown endpoint; disposing the service
        // must terminate it by force, which is exactly the path whose
        // process-lifetime behavior is under test.
        protected override bool HasShutdown => false;

        protected override DriverOptions GetDefaultDriverOptions() => new ChromeOptions();
    }

    /// <summary>
    /// Responds with HTTP 200 to every request, satisfying the status polling that
    /// <see cref="DriverService.StartAsync"/> performs while waiting for the
    /// driver server to initialize.
    /// </summary>
    private sealed class StubDriverHttpServer : IDisposable
    {
        private readonly TcpListener listener;
        private readonly CancellationTokenSource cancellation = new();
        private readonly Task serveLoop;

        public StubDriverHttpServer(int port)
        {
            this.listener = new TcpListener(IPAddress.Loopback, port);
            this.listener.Start();
            this.serveLoop = Task.Run(() => this.ServeConnectionsAsync(this.cancellation.Token));
        }

        public void Dispose()
        {
            this.cancellation.Cancel();
            this.listener.Stop();
            try
            {
                this.serveLoop.Wait(TimeSpan.FromSeconds(2));
            }
            catch (AggregateException)
            {
                // The accept loop was cancelled; nothing more to do.
            }
        }

        private async Task ServeConnectionsAsync(CancellationToken cancellationToken)
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                TcpClient client;
                try
                {
                    client = await this.listener.AcceptTcpClientAsync(cancellationToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (SocketException)
                {
                    continue;
                }
                catch (ObjectDisposedException)
                {
                    break;
                }

                _ = Task.Run(() => RespondAsync(client), CancellationToken.None);
            }
        }

        private static async Task RespondAsync(TcpClient client)
        {
            using (client)
            {
                try
                {
                    NetworkStream stream = client.GetStream();
                    byte[] requestBuffer = new byte[1024];
                    int totalBytesRead = 0;

                    // Consume the request head only: the status polls sent by
                    // DriverService carry no body.
                    while (totalBytesRead < requestBuffer.Length)
                    {
                        int bytesRead = await stream.ReadAsync(requestBuffer.AsMemory(totalBytesRead));
                        if (bytesRead == 0)
                        {
                            return;
                        }

                        totalBytesRead += bytesRead;
                        if (Encoding.ASCII.GetString(requestBuffer, 0, totalBytesRead).Contains("\r\n\r\n", StringComparison.Ordinal))
                        {
                            break;
                        }
                    }

                    byte[] response = "HTTP/1.1 200 OK\r\nContent-Length: 2\r\nConnection: close\r\n\r\nok"u8.ToArray();
                    await stream.WriteAsync(response);
                    await stream.FlushAsync();
                }
                catch (IOException)
                {
                    // The client closed the connection before the response was sent.
                }
                catch (SocketException)
                {
                    // The client closed the connection before the response was sent.
                }
            }
        }
    }
}
