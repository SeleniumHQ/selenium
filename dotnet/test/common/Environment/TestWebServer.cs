using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Diagnostics;
using System.Text;

namespace OpenQA.Selenium.Environment
{
    public class TestWebServer
    {
        private Process webserverProcess;

        private string standaloneTestJar = @"java/client/test/org/openqa/selenium/environment/WebServer_deploy.jar";
        private string projectRootPath;

        private StringBuilder outputData = new StringBuilder();

        public TestWebServer(string projectRoot)
        {
            projectRootPath = projectRoot;
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
                            "bazel build //java/client/test/org/openqa/selenium/environment:WebServer_deploy.jar",
                            projectRootPath));
                }

                string javaExecutableName = "java";
                if (System.Environment.OSVersion.Platform == PlatformID.Win32NT || System.Environment.OSVersion.Platform == PlatformID.Win32Windows)
                {
                    javaExecutableName = javaExecutableName + ".exe";
                }

                List<string> javaSystemProperties = new List<string>();
                javaSystemProperties.Add("org.openqa.selenium.environment.webserver.ignoreMissingJsRoots=true");

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
                webserverProcess.StartInfo.FileName = javaExecutableName;
                webserverProcess.StartInfo.Arguments = processArgsBuilder.ToString();
                webserverProcess.StartInfo.WorkingDirectory = projectRootPath;
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
                    string errorMessage = string.Format("Could not start the test web server in {0} seconds. Process Args: {1}", timeout.TotalSeconds, processArgsBuilder);
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
