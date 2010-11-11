using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using CassiniDev;
using System.Net;

namespace OpenQA.Selenium.Environment
{
    public class TestWebServer
    {
        private CassiniDevServerOP webServer = new CassiniDevServerOP();
        private string websitePhysicalPath = string.Empty;
        private string websiteVirtualPath = string.Empty;
        private bool isRunning;

        public TestWebServer(string path, string virtualDirectory)
        {
            websitePhysicalPath = path;
            websiteVirtualPath = virtualDirectory;
        }

        public bool IsRunning
        {
            get { return isRunning; }
        }

        public string RootUrl
        {
            get { return webServer.RootUrl; }
        }

        public string NormalizedUrl(string relativeUrl)
        {
            return webServer.NormalizeUrl(relativeUrl);
        }

        public void Start()
        {
            if (!isRunning)
            {
                int port = CassiniNetworkUtils.GetAvailablePort(8000, 10000, IPAddress.Loopback, true);
                webServer.StartServer(websitePhysicalPath, port, websiteVirtualPath, "localhost");
                isRunning = true;
            }
        }

        public void Stop()
        {
            if (isRunning)
            {
                webServer.StopServer();
                isRunning = false;
            }
        }
    }
}
