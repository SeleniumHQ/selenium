using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Diagnostics;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium.Environment
{
    public class TestWebServer
    {
        private Process webserverProcess;

        private string standaloneTestJar = @"java/test/org/openqa/selenium/environment/appserver_deploy.jar";
        private string projectRootPath;
        private bool captureWebServerOutput;
        private bool hideCommandPrompt;
        private string javaHomeDirectory;

        private StringBuilder outputData = new StringBuilder();

        public TestWebServer(string projectRoot, TestWebServerConfig config)
        {
            this.projectRootPath = projectRoot;
            this.captureWebServerOutput = config.CaptureConsoleOutput;
            this.hideCommandPrompt = config.HideCommandPromptWindow;
            this.javaHomeDirectory = config.JavaHomeDirectory;
        }

        public void Start()
        {
            if (webserverProcess == null || webserverProcess.HasExited)
            {
                standaloneTestJar = standaloneTestJar.Replace('/', Path.DirectorySeparatorChar);
                if (!File.Exists(Path.Combine(projectRootPath, standaloneTestJar)))
                {
                    throw new FileNotFoundException(
                        string.Format(
                            "Test webserver jar at {0} didn't exist. Project root is {2}. Please build it using something like {1}.",
                            standaloneTestJar,
                            "bazel build //java/test/org/openqa/selenium/environment:appserver_deploy.jar",
                            projectRootPath));
                }

                string javaExecutableName = "java";
                if (System.Environment.OSVersion.Platform == PlatformID.Win32NT || System.Environment.OSVersion.Platform == PlatformID.Win32Windows)
                {
                    javaExecutableName = javaExecutableName + ".exe";
                }

                string javaExecutablePath = string.Empty;
                if (!string.IsNullOrEmpty(this.javaHomeDirectory))
                {
                    javaExecutablePath = Path.Combine(this.javaHomeDirectory, "bin");
                }

                List<string> javaSystemProperties = new List<string>();

                StringBuilder processArgsBuilder = new StringBuilder();
                foreach (string systemProperty in javaSystemProperties)
                {
                    if (processArgsBuilder.Length > 0)
                    {
                        processArgsBuilder.Append(" ");
                    }

                    processArgsBuilder.AppendFormat("-D{0}", systemProperty);
                }

                if (processArgsBuilder.Length > 0)
                {
                    processArgsBuilder.Append(" ");
                }

                processArgsBuilder.AppendFormat("-jar {0}", standaloneTestJar);

                webserverProcess = new Process();
                if (!string.IsNullOrEmpty(javaExecutablePath))
                {
                    webserverProcess.StartInfo.FileName = Path.Combine(javaExecutablePath, javaExecutableName);
                }
                else
                {
                    webserverProcess.StartInfo.FileName = javaExecutableName;
                }

                webserverProcess.StartInfo.Arguments = processArgsBuilder.ToString();
                webserverProcess.StartInfo.WorkingDirectory = projectRootPath;
                webserverProcess.StartInfo.UseShellExecute = !(hideCommandPrompt || captureWebServerOutput);
                webserverProcess.StartInfo.CreateNoWindow = hideCommandPrompt;
                if (!string.IsNullOrEmpty(this.javaHomeDirectory))
                {
                    webserverProcess.StartInfo.EnvironmentVariables["JAVA_HOME"] = this.javaHomeDirectory;
                }

                if (captureWebServerOutput)
                {
                    webserverProcess.StartInfo.RedirectStandardOutput = true;
                    webserverProcess.StartInfo.RedirectStandardError = true;
                }

                webserverProcess.Start();

                TimeSpan timeout = TimeSpan.FromSeconds(30);
                DateTime endTime = DateTime.Now.Add(TimeSpan.FromSeconds(30));
                bool isRunning = false;
                while (!isRunning && DateTime.Now < endTime)
                {
                    // Poll until the webserver is correctly serving pages.
                    HttpWebRequest request = WebRequest.Create(EnvironmentManager.Instance.UrlBuilder.LocalWhereIs("simpleTest.html")) as HttpWebRequest;
                    try
                    {
                        HttpWebResponse response = request.GetResponse() as HttpWebResponse;
                        if (response.StatusCode == HttpStatusCode.OK)
                        {
                            isRunning = true;
                        }
                    }
                    catch (WebException)
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
            HttpWebRequest request = WebRequest.Create(EnvironmentManager.Instance.UrlBuilder.LocalWhereIs("quitquitquit")) as HttpWebRequest;
            try
            {
                request.GetResponse();
            }
            catch (WebException)
            {
            }

            if (webserverProcess != null)
            {
                try
                {
                    webserverProcess.WaitForExit(10000);
                    if (!webserverProcess.HasExited)
                    {
                        webserverProcess.Kill();
                    }
                }
                catch (Exception)
                {
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
