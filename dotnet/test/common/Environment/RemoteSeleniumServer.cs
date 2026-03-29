// <copyright file="RemoteSeleniumServer.cs" company="Selenium Committers">
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

using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Threading.Tasks;
using Bazel;
using NUnit.Framework;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Environment;

#nullable enable

public class RemoteSeleniumServer
{
    private Process? webserverProcess;
    private readonly string serverJarName = @"java/src/org/openqa/selenium/grid/selenium_server_deploy.jar";
    private readonly string gridExecutableName = @"java/src/org/openqa/selenium/grid/selenium";
    private readonly string projectRoot;
    private readonly bool autoStartServer;
    private int serverPort;

    public static Uri ServerUri { get; private set; } = new Uri("http://127.0.0.1:6000/wd/hub/");

    public RemoteSeleniumServer(string projectRoot, bool autoStartServer)
    {
        this.projectRoot = projectRoot;
        this.autoStartServer = autoStartServer;
        serverPort = autoStartServer ? FindAvailablePort() : ServerUri.Port;
        if (autoStartServer)
        {
            UpdateServerUri(serverPort);
        }
    }

    public async Task StartAsync()
    {
        if (webserverProcess == null || webserverProcess.HasExited)
        {
            if (!autoStartServer)
            {
                serverPort = FindAvailablePort();
                UpdateServerUri(serverPort);
            }

            const int maxAttempts = 5;
            Exception? lastStartException = null;
            for (int attempt = 1; attempt <= maxAttempts; attempt++)
            {
                var (executable, arguments) = FindServer(serverPort);

                webserverProcess = new Process();
                webserverProcess.StartInfo.FileName = executable;
                webserverProcess.StartInfo.Arguments = arguments;
                webserverProcess.StartInfo.WorkingDirectory = projectRoot;
                webserverProcess.Start();
                DateTime timeout = DateTime.Now.Add(TimeSpan.FromSeconds(30));
                bool isRunning = false;
                // Poll until the webserver is correctly serving pages.
                using var httpClient = new HttpClient();

                while (!isRunning && DateTime.Now < timeout)
                {
                    try
                    {
                        using var response = await httpClient.GetAsync(StatusUri);

                        if (response.StatusCode == HttpStatusCode.OK)
                        {
                            isRunning = true;
                        }
                    }
                    catch (Exception ex) when (ex is HttpRequestException || ex is TimeoutException)
                    {
                        lastStartException = ex;
                    }
                }

                if (isRunning)
                {
                    return;
                }

                TestContext.Progress.WriteLine(
                    $"Remote Selenium server not ready on {StatusUri} (attempt {attempt}/{maxAttempts}). " +
                    $"Last error: {lastStartException?.Message ?? "none"}");

                if (webserverProcess != null && !webserverProcess.HasExited)
                {
                    webserverProcess.Kill();
                    webserverProcess = null;
                }

                if (attempt < maxAttempts)
                {
                    serverPort = FindAvailablePort();
                    UpdateServerUri(serverPort);
                }
            }

            throw new TimeoutException(
                $"Could not start the remote selenium server in 30 seconds on port {serverPort}. " +
                $"Last error: {lastStartException?.Message ?? "none"}");
        }
    }

    private (string executable, string arguments) FindServer(int port)
    {
        string serverArgs =
            $"standalone --port {port} --selenium-manager true --enable-managed-downloads true";

        // Check Bazel runfiles first (for bazel test)
        Exception? runfilesException = null;
        try
        {
            var runfiles = Runfiles.Create();

            // Check for grid executable in runfiles (use java -jar for all platforms)
            string gridPath = runfiles.Rlocation("_main/" + gridExecutableName);
            if (!string.IsNullOrEmpty(gridPath) && File.Exists(gridPath))
            {
                return ("java", $"-jar \"{gridPath}\" {serverArgs}");
            }
        }
        catch (Exception ex)
        {
            // Runfiles not available (not running under Bazel)
            runfilesException = ex;
        }

        // Check bazel-bin path for grid executable
        string bazelBinGridPath = Path.Combine(projectRoot, "bazel-bin", gridExecutableName.Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(bazelBinGridPath))
        {
            return ("java", $"-jar \"{bazelBinGridPath}\" {serverArgs}");
        }

        // Check traditional path for JAR (for non-Bazel runs)
        string traditionalPath = Path.Combine(projectRoot, serverJarName.Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(traditionalPath))
        {
            return ("java", $"-jar \"{traditionalPath}\" {serverArgs}");
        }

        string runfilesDetail = runfilesException == null
            ? string.Empty
            : $" Runfiles error: {runfilesException.Message}";
        throw new FileNotFoundException(
            $"Selenium server not found - please build it using: bazel build grid.{runfilesDetail}");
    }

    public async Task StopAsync()
    {
        if (webserverProcess != null && !webserverProcess.HasExited)
        {
            using (var httpClient = new HttpClient())
            {
                Exception? shutdownException = null;
                try
                {
                    using var response = await httpClient.GetAsync(ShutdownUri);
                }
                catch (Exception ex) when (ex is HttpRequestException || ex is TimeoutException)
                {
                    shutdownException = ex;
                }
                if (shutdownException != null)
                {
                    TestContext.Progress.WriteLine(
                        $"Remote Selenium server shutdown request failed at {ShutdownUri}: {shutdownException.Message}");
                }
            }

            webserverProcess.WaitForExit(10000);
            if (!webserverProcess.HasExited)
            {
                webserverProcess.Kill();
            }

            webserverProcess.Dispose();
            webserverProcess = null;
        }
    }

    private Uri StatusUri => new Uri($"http://localhost:{serverPort}/wd/hub/status");

    private Uri ShutdownUri =>
        new Uri($"http://localhost:{serverPort}/selenium-server/driver?cmd=shutDownSeleniumServer");

    private static int FindAvailablePort()
    {
        for (int attempt = 0; attempt < 10; attempt++)
        {
            int port = PortUtilities.FindFreePort();
            if (IsPortAvailable(port))
            {
                return port;
            }
        }

        return PortUtilities.FindFreePort();
    }

    private static bool IsPortAvailable(int port)
    {
        try
        {
            using var socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            socket.Bind(new IPEndPoint(IPAddress.Loopback, port));
            return true;
        }
        catch (SocketException)
        {
            return false;
        }
    }

    private static void UpdateServerUri(int port)
    {
        ServerUri = new Uri($"http://127.0.0.1:{port}/wd/hub/");
    }
}
