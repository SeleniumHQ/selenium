using Bazel;
using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text;

namespace OpenQA.Selenium.Environment
{
    public class TestWebServer
    {
        private Process webserverProcess;

        private string standaloneTestJar = @"_main/java/test/org/openqa/selenium/environment/appserver";
        private string projectRootPath;
        private bool captureWebServerOutput;
        private bool hideCommandPrompt;
        private string javaHomeDirectory;
        private string port;

        public TestWebServer(string projectRoot, TestWebServerConfig config)
        {
            this.projectRootPath = projectRoot;
            this.captureWebServerOutput = config.CaptureConsoleOutput;
            this.hideCommandPrompt = config.HideCommandPromptWindow;
            this.javaHomeDirectory = config.JavaHomeDirectory;
            if (string.IsNullOrEmpty(this.javaHomeDirectory))
            {
                this.javaHomeDirectory = System.Environment.GetEnvironmentVariable("JAVA_HOME");
            }
            this.port = config.Port;
        }

        public void Start()
        {
            if (webserverProcess == null || webserverProcess.HasExited)
            {
                try
                {
                    var runfiles = Runfiles.Create();
                    standaloneTestJar = runfiles.Rlocation(standaloneTestJar);
                    if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                    {
                        standaloneTestJar += ".exe";
                    }
                }
                catch (FileNotFoundException)
                {
                    var baseDirectory = AppContext.BaseDirectory;
                    if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                    {
                        standaloneTestJar = Path.Combine(baseDirectory, "../../../../../../bazel-bin/java/test/org/openqa/selenium/environment/appserver.exe");
                    }
                    else
                    {
                        standaloneTestJar = Path.Combine(baseDirectory, "../../../../../../bazel-bin/java/test/org/openqa/selenium/environment/appserver_deploy.jar");
                    }
                }

                Console.Write("Standalone jar is " + standaloneTestJar);

                if (!File.Exists(standaloneTestJar))
                {
                    throw new FileNotFoundException(
                        string.Format(
                            "Test webserver jar at {0} didn't exist. Project root is {2}. Please build it using something like {1}.",
                            standaloneTestJar,
                            "bazel build //java/test/org/openqa/selenium/environment:appserver",
                            projectRootPath));
                }

                StringBuilder processArgsBuilder = new StringBuilder();
                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    WorkingDirectory = projectRootPath,
                    UseShellExecute = !(hideCommandPrompt || captureWebServerOutput),
                    CreateNoWindow = hideCommandPrompt,
                    RedirectStandardOutput = captureWebServerOutput,
                    RedirectStandardError = captureWebServerOutput
                };

                if (standaloneTestJar != null && standaloneTestJar.EndsWith(".jar"))
                {
                    processArgsBuilder.AppendFormat("-jar \"{0}\" {1}", standaloneTestJar, this.port);
                    string javaExecutable = Path.Combine(javaHomeDirectory, "bin", "java");
                    if (!File.Exists(javaExecutable))
                    {
                        throw new FileNotFoundException($"Java executable not found at {javaExecutable}");
                    }

                    startInfo.FileName = javaExecutable;
                }
                else
                {
                    processArgsBuilder.AppendFormat(" {0}", this.port);
                    startInfo.FileName = standaloneTestJar;
                }

                Console.Write(processArgsBuilder.ToString());
                startInfo.Arguments = processArgsBuilder.ToString();
                if (!string.IsNullOrEmpty(this.javaHomeDirectory))
                {
                    startInfo.EnvironmentVariables["JAVA_HOME"] = this.javaHomeDirectory;
                }

                webserverProcess = new Process { StartInfo = startInfo };
                webserverProcess.Start();

                TimeSpan timeout = TimeSpan.FromSeconds(30);
                DateTime endTime = DateTime.Now.Add(timeout);
                bool isRunning = false;

                // Poll until the webserver is correctly serving pages.
                using var httpClient = new HttpClient();

                while (!isRunning && DateTime.Now < endTime)
                {
                    try
                    {
                        using var response = httpClient.GetAsync(EnvironmentManager.Instance.UrlBuilder.LocalWhereIs("simpleTest.html")).GetAwaiter().GetResult();

                        if (response.StatusCode == HttpStatusCode.OK)
                        {
                            isRunning = true;
                        }
                    }
                    catch (Exception ex) when (ex is HttpRequestException || ex is TimeoutException)
                    {
                    }
                }

                if (!isRunning)
                {
                    string output = "'CaptureWebServerOutput' parameter is false. Web server output not captured";
                    string error = "'CaptureWebServerOutput' parameter is false. Web server output not being captured.";
                    if (captureWebServerOutput)
                    {
                        error = webserverProcess.StandardError.ReadToEnd();
                        output = webserverProcess.StandardOutput.ReadToEnd();
                    }

                    string errorMessage = string.Format("Could not start the test web server in {0} seconds.\nWorking directory: {1}\nProcess Args: {2}\nstdout: {3}\nstderr: {4}", timeout.TotalSeconds, projectRootPath, processArgsBuilder, output, error);
                    throw new TimeoutException(errorMessage);
                }
            }
        }

        public void Stop()
        {
            if (webserverProcess != null)
            {
                using (var httpClient = new HttpClient())
                {
                    try
                    {
                        using (httpClient.GetAsync(EnvironmentManager.Instance.UrlBuilder.LocalWhereIs("quitquitquit")).GetAwaiter().GetResult())
                        {

                        }
                    }
                    catch (HttpRequestException)
                    {

                    }
                }

                try
                {
                    webserverProcess.WaitForExit(10000);
                    if (!webserverProcess.HasExited)
                    {
                        webserverProcess.Kill(entireProcessTree: true);
                    }
                }
                finally
                {
                    webserverProcess.Dispose();
                    webserverProcess = null;
                }
            }
        }
    }
}
