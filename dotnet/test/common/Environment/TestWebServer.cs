using System;
using System.IO;
using System.Net;
using System.Diagnostics;

namespace OpenQA.Selenium.Environment
{
    public class TestWebServer
    {
        private Process webserverProcess;

        private string standaloneTestJar = @"buck-out/gen/java/client/test/org/openqa/selenium/environment/webserver.jar";
        private string webserverClassName = "org.openqa.selenium.environment.webserver.JettyAppServer";
        private string projectRootPath;

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
                            "Test webserver jar at {0} didn't exist - please build it using something like {1}",
                            standaloneTestJar,
                            "go //java/client/test/org/openqa/selenium/environment:webserver"));
                }

                string javaExecutableName = "java";
                if (System.Environment.OSVersion.Platform == PlatformID.Win32NT || System.Environment.OSVersion.Platform == PlatformID.Win32Windows)
                {
                    javaExecutableName = javaExecutableName + ".exe";
                }

                webserverProcess = new Process();
                webserverProcess.StartInfo.FileName = javaExecutableName;
                webserverProcess.StartInfo.Arguments = "-cp " + standaloneTestJar + " " + webserverClassName;
                webserverProcess.StartInfo.WorkingDirectory = projectRootPath;
                webserverProcess.Start();
                DateTime timeout = DateTime.Now.Add(TimeSpan.FromSeconds(30));
                bool isRunning = false;
                while (!isRunning && DateTime.Now < timeout)
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
                    throw new TimeoutException("Could not start the test web server in 15 seconds");
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
