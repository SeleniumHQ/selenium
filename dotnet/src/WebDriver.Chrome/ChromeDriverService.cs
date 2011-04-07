using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Text;
using System.Reflection;
using System.IO;
using System.Net.Sockets;
using System.Net;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Exposes the service provided by the native ChromeDriver executable.
    /// </summary>
    public sealed class ChromeDriverService
    {
        private const string ChromeDriverServiceFileName = "chromedriver.exe";

        private string driverServicePath;
        private int driverServicePort;
        private Process driverServiceProcess;
        private Uri serviceUrl;

        /// <summary>
        /// Initializes a new instance of the ChromeDriverService class.
        /// </summary>
        /// <param name="executable">The full path to the ChromeDriver executable.</param>
        /// <param name="port">The port on which the ChromeDriver executable should listen.</param>
        private ChromeDriverService(string executable, int port)
        {
            this.driverServicePath = executable;
            this.driverServicePort = port;
            this.serviceUrl = new Uri(string.Format(CultureInfo.InvariantCulture, "http://localhost:{0}", port));
        }

        /// <summary>
        /// Gets the Uri of the service.
        /// </summary>
        public Uri ServiceUrl
        {
            get { return this.serviceUrl; }
        }

        /// <summary>
        /// Gets a value indicating whether the service is running.
        /// </summary>
        public bool IsRunning
        {
            get { return this.driverServiceProcess != null && !this.driverServiceProcess.HasExited; }
        }

        /// <summary>
        /// Creates a default instance of the ChromeDriverService.
        /// </summary>
        /// <returns>A ChromeDriverService that implements default settings.</returns>
        public static ChromeDriverService CreateDefaultService()
        {
            Assembly executingAssembly = Assembly.GetExecutingAssembly();
            string currentDirectory = Path.GetDirectoryName(executingAssembly.Location);

            // If we're shadow copying, fiddle with 
            // the codebase instead 
            if (AppDomain.CurrentDomain.ShadowCopyFiles)
            {
                Uri uri = new Uri(executingAssembly.CodeBase);
                currentDirectory = Path.GetDirectoryName(uri.LocalPath);
            }

            return CreateDefaultService(currentDirectory);
        }

        /// <summary>
        /// Creates a default instance of the ChromeDriverService using a specified path to the ChromeDriver executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the ChromeDriver executable.</param>
        /// <returns>A ChromeDriverService using a random port.</returns>
        public static ChromeDriverService CreateDefaultService(string driverPath)
        {
            if (string.IsNullOrEmpty(driverPath))
            {
                throw new ArgumentException("Path to locate driver executable cannot be null or empty.", "driverPath");
            }

            string executablePath = Path.Combine(driverPath, ChromeDriverServiceFileName);
            if (!File.Exists(executablePath))
            {
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "The file {0} does not exist.", executablePath));
            }

            return new ChromeDriverService(executablePath, FindFreePort());
        }

        /// <summary>
        /// Starts the ChromeDriverService.
        /// </summary>
        public void Start()
        {
            this.driverServiceProcess = new Process();
            driverServiceProcess.StartInfo.FileName = this.driverServicePath;
            driverServiceProcess.StartInfo.Arguments = string.Format(CultureInfo.InvariantCulture, "--port={0}", this.driverServicePort);
            driverServiceProcess.StartInfo.UseShellExecute = false;
            this.driverServiceProcess.Start();
            DateTime timeout = DateTime.Now.Add(TimeSpan.FromSeconds(20));
            HttpWebRequest request = HttpWebRequest.Create(this.serviceUrl) as HttpWebRequest;
            bool processStarted = false;
            while (!processStarted && DateTime.Now < timeout)
            {
                try
                {
                    HttpWebResponse response = request.GetResponse() as HttpWebResponse;
                    processStarted = true;
                }
                catch (WebException)
                {
                }
            }
        }

        /// <summary>
        /// Stops the ChromeDriverService.
        /// </summary>
        public void Stop()
        {
            if (this.driverServiceProcess != null && !this.driverServiceProcess.HasExited)
            {
                Uri shutdownUrl = new Uri(this.serviceUrl, "/shutdown");
                DateTime timeout = DateTime.Now.Add(TimeSpan.FromSeconds(3));
                HttpWebRequest request = HttpWebRequest.Create(shutdownUrl) as HttpWebRequest;
                bool processStopped = false;
                while (!processStopped && DateTime.Now < timeout)
                {
                    try
                    {
                        HttpWebResponse response = request.GetResponse() as HttpWebResponse;
                    }
                    catch (WebException)
                    {
                        processStopped = true;
                    }
                }

                this.driverServiceProcess.WaitForExit();
                this.driverServiceProcess = null;
            }
        }

        private static int FindFreePort()
        {
            // Locate a free port on the local machine by binding a socket to
            // an IPEndPoint using IPAddress.Any and port 0. The socket will
            // select a free port.
            Socket portSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            IPEndPoint socketEndPoint = new IPEndPoint(IPAddress.Any, 0);
            portSocket.Bind(socketEndPoint);
            socketEndPoint = (IPEndPoint)portSocket.LocalEndPoint;
            int listeningPort = socketEndPoint.Port;
            portSocket.Close();
            return listeningPort;
        }
    }
}
