using System;
using System.Diagnostics;
using System.IO;
using System.Net;

namespace OpenQA.Selenium.Environment
{
    public class RemoteSeleniumServer
    {
        private Process webserverProcess;
        private string serverJarName = @"java/src/org/openqa/selenium/grid/selenium_server_deploy.jar";
        private string projectRootPath;
        private bool autoStart;

        public RemoteSeleniumServer(string projectRoot, bool autoStartServer)
        {
            projectRootPath = projectRoot;
            autoStart = autoStartServer;
        }

        public void Start()
        {
            if (autoStart && (webserverProcess == null || webserverProcess.HasExited))
            {
                serverJarName = serverJarName.Replace('/', Path.DirectorySeparatorChar);
                if (!File.Exists(Path.Combine(projectRootPath, serverJarName)))
                {
                    throw new FileNotFoundException(
                        string.Format(
                            "Selenium server jar at {0} didn't exist - please build it using something like {1}",
                            serverJarName,
                            "go //java/src/org/openqa/grid/selenium:selenium"));
                }

                webserverProcess = new Process();
                webserverProcess.StartInfo.FileName = "java.exe";
                webserverProcess.StartInfo.Arguments = " -jar " + serverJarName
                                                                + " standalone --port 6000 --selenium-manager true";
                webserverProcess.StartInfo.WorkingDirectory = projectRootPath;
                webserverProcess.Start();
                DateTime timeout = DateTime.Now.Add(TimeSpan.FromSeconds(30));
                bool isRunning = false;
                while (!isRunning && DateTime.Now < timeout)
                {
                    // Poll until the webserver is correctly serving pages.
                    HttpWebRequest request = WebRequest.Create("http://localhost:6000/wd/hub/status") as HttpWebRequest;
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
                    throw new TimeoutException("Could not start the remote selenium server in 30 seconds");
                }
            }
        }

        public void Stop()
        {
            if (autoStart && (webserverProcess != null && !webserverProcess.HasExited))
            {
                HttpWebRequest request = WebRequest.Create("http://localhost:6000/selenium-server/driver?cmd=shutDownSeleniumServer") as HttpWebRequest;
                try
                {
                    request.GetResponse();
                }
                catch (WebException)
                {
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
    }
}
