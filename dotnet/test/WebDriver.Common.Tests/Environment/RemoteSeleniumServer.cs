using System;
using System.Collections.Generic;
using System.Text;
using System.Diagnostics;
using System.Net;

namespace OpenQA.Selenium.Environment
{
    public class RemoteSeleniumServer
    {
        private Process webserverProcess;
        private string serverJarName = @"build\java\server\src\org\openqa\selenium\server\server-standalone.jar";
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
                webserverProcess = new Process();
                webserverProcess.StartInfo.FileName = "java.exe";
                webserverProcess.StartInfo.Arguments = "-jar " + serverJarName + " -port 6000";
                webserverProcess.StartInfo.WorkingDirectory = projectRootPath;
                webserverProcess.Start();
                DateTime timeout = DateTime.Now.Add(TimeSpan.FromSeconds(30));
                bool isRunning = false;
                while (!isRunning && DateTime.Now < timeout)
                {
                    // Poll until the webserver is correctly serving pages.
                    HttpWebRequest request = WebRequest.Create("http://localhost:6000/selenium-server/driver?cmd=getLogMessages") as HttpWebRequest;
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
