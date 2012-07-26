using System;
using System.Collections.Generic;
using System.Text;
using System.Diagnostics;
using System.Net;

namespace Selenium.Tests.Environment
{
    public class SeleniumServer
    {
        private Process serverProcess;
        private string serverJarName = @"build\java\server\test\org\openqa\selenium\server-with-tests-standalone.jar";
        private string projectRootPath;
        private bool autoStart;
        private int port = 4444;

        public SeleniumServer(string projectRoot, bool autoStartServer, int port)
        {
            projectRootPath = projectRoot;
            autoStart = autoStartServer;
            if (port != 0)
            {
                this.port = port;
            }
        }

        public void Start()
        {
            if (autoStart && (serverProcess == null || serverProcess.HasExited))
            {
                serverProcess = new Process();
                serverProcess.StartInfo.FileName = "java.exe";
                serverProcess.StartInfo.Arguments = "-jar " + serverJarName + " -port " + port.ToString();
                serverProcess.StartInfo.WorkingDirectory = projectRootPath;
                serverProcess.Start();
                DateTime timeout = DateTime.Now.Add(TimeSpan.FromSeconds(30));
                bool isRunning = false;
                while (!isRunning && DateTime.Now < timeout)
                {
                    // Poll until the webserver is correctly serving pages.
                    HttpWebRequest request = WebRequest.Create("http://localhost:" + port.ToString() + "/selenium-server/driver?cmd=getLogMessages") as HttpWebRequest;
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
            if (autoStart && (serverProcess != null && !serverProcess.HasExited))
            {
                HttpWebRequest request = WebRequest.Create("http://localhost:" + port.ToString() + "/selenium-server/driver?cmd=shutDownSeleniumServer") as HttpWebRequest;
                try
                {
                    request.GetResponse();
                }
                catch (WebException)
                {
                }

                serverProcess.WaitForExit(10000);
                if (!serverProcess.HasExited)
                {
                    serverProcess.Kill();
                }

                serverProcess.Dispose();
                serverProcess = null;
            }
        }
    }
}
