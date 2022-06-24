using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using BenderProxy;
using BenderProxy.Writers;
using NUnit.Framework;
using OpenQA.Selenium.Environment;
using OpenQA.Selenium.IE;

namespace OpenQA.Selenium
{
    [Ignore("Proxy Tests are not working")]
    [TestFixture]
    public class ProxySettingTest : DriverTestFixture
    {
        private IWebDriver localDriver;
        private ProxyServer proxyServer;

        [SetUp]
        public void RestartOriginalDriver()
        {
            driver = EnvironmentManager.Instance.GetCurrentDriver();
            proxyServer = new ProxyServer();
            EnvironmentManager.Instance.DriverStarting += EnvironmentManagerDriverStarting;
        }

        [TearDown]
        public void QuitAdditionalDriver()
        {
            if (localDriver != null)
            {
                localDriver.Quit();
                localDriver = null;
            }

            if (proxyServer != null)
            {
                proxyServer.Quit();
                proxyServer = null;
            }

            EnvironmentManager.Instance.DriverStarting -= EnvironmentManagerDriverStarting;
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "SafariDriver does not support setting proxy")]
        public void CanConfigureManualHttpProxy()
        {
            proxyServer.EnableLogResourcesOnResponse();
            Proxy proxyToUse = proxyServer.AsProxy();
            InitLocalDriver(proxyToUse);

            localDriver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("simpleTest.html");
            Assert.That(proxyServer.HasBeenCalled("simpleTest.html"), Is.True);
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "SafariDriver does not support setting proxy")]
        public void CanConfigureNoProxy()
        {
            proxyServer.EnableLogResourcesOnResponse();
            Proxy proxyToUse = proxyServer.AsProxy();
            proxyToUse.AddBypassAddresses(EnvironmentManager.Instance.UrlBuilder.HostName);

            if (TestUtilities.IsInternetExplorer(driver))
            {
                proxyToUse.AddBypassAddress("<-localhost>");
            }

            InitLocalDriver(proxyToUse);

            localDriver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("simpleTest.html");
            Assert.That(proxyServer.HasBeenCalled("simpleTest.html"), Is.False);

            localDriver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIsViaNonLoopbackAddress("simpleTest.html");
            Assert.That(proxyServer.HasBeenCalled("simpleTest.html"), Is.True);
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "SafariDriver does not support setting proxy")]
        public void CanConfigureProxyThroughAutoConfigFile()
        {
            StringBuilder pacFileContentBuilder = new StringBuilder();
            pacFileContentBuilder.AppendLine("function FindProxyForURL(url, host) {");
            pacFileContentBuilder.AppendFormat("  return 'PROXY {0}';\n", proxyServer.BaseUrl);
            pacFileContentBuilder.AppendLine("}");
            string pacFileContent = pacFileContentBuilder.ToString();

            using (ProxyAutoConfigServer pacServer = new ProxyAutoConfigServer(pacFileContent))
            {
                proxyServer.EnableContentOverwriteOnRequest();
                Proxy proxyToUse = new Proxy();
                proxyToUse.ProxyAutoConfigUrl = string.Format("http://{0}:{1}/proxy.pac", pacServer.HostName, pacServer.Port);
                InitLocalDriver(proxyToUse);
                localDriver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("simpleTest.html");
                Assert.That(localDriver.FindElement(By.TagName("h3")).Text, Is.EqualTo("Hello, world!"));
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "ChromeDriver is hanging")]
        [IgnoreBrowser(Browser.Safari, "SafariDriver does not support setting proxy")]
        public void CanUseAutoConfigFileThatOnlyProxiesCertainHosts()
        {
            StringBuilder pacFileContentBuilder = new StringBuilder();
            pacFileContentBuilder.AppendLine("function FindProxyForURL(url, host) {");
            pacFileContentBuilder.AppendFormat("  if (url.indexOf('{0}') != -1) {{\n", EnvironmentManager.Instance.UrlBuilder.HostName);
            pacFileContentBuilder.AppendFormat("    return 'PROXY {0}';\n", proxyServer.BaseUrl);
            pacFileContentBuilder.AppendLine("  }");
            pacFileContentBuilder.AppendLine("  return 'DIRECT';");
            pacFileContentBuilder.AppendLine("}");
            string pacFileContent = pacFileContentBuilder.ToString();

            using (ProxyAutoConfigServer pacServer = new ProxyAutoConfigServer(pacFileContent))
            {
                proxyServer.EnableContentOverwriteOnRequest();
                Proxy proxyToUse = new Proxy();
                proxyToUse.ProxyAutoConfigUrl = string.Format("http://{0}:{1}/proxy.pac", pacServer.HostName, pacServer.Port);
                InitLocalDriver(proxyToUse);
                localDriver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("simpleTest.html");
                Assert.That(localDriver.FindElement(By.TagName("h3")).Text, Is.EqualTo("Hello, world!"));
                localDriver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIsViaNonLoopbackAddress("simpleTest.html");
                Assert.That(localDriver.FindElement(By.TagName("h1")).Text, Is.EqualTo("Heading"));
            }
        }

        private void EnvironmentManagerDriverStarting(object sender, DriverStartingEventArgs e)
        {
            InternetExplorerOptions ieOptions = e.Options as InternetExplorerOptions;
            if (ieOptions != null)
            {
                ieOptions.EnsureCleanSession = true;
            }
        }

        private void InitLocalDriver(Proxy proxy)
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            if (localDriver != null)
            {
                localDriver.Quit();
            }

            ProxyOptions options = new ProxyOptions();
            options.Proxy = proxy;
            localDriver = EnvironmentManager.Instance.CreateDriverInstance(options);
        }

        private class ProxyOptions : DriverOptions
        {
            public override void AddAdditionalOption(string capabilityName, object capabilityValue)
            {
            }

            public override ICapabilities ToCapabilities()
            {
                return null;
            }
        }

        private class ProxyAutoConfigServer : IDisposable
        {
            private int listenerPort;
            private string hostName;
            private string pacFileContent;
            private bool disposedValue = false; // To detect redundant calls
            private bool keepRunning = true;
            private HttpListener listener;
            private Thread listenerThread;

            public ProxyAutoConfigServer(string pacFileContent)
                : this(pacFileContent, "localhost")
            {
            }

            public ProxyAutoConfigServer(string pacFileContent, string hostName)
            {
                this.pacFileContent = pacFileContent;
                this.hostName = hostName;

                //get an empty port
                TcpListener l = new TcpListener(IPAddress.Loopback, 0);
                l.Start();
                this.listenerPort = ((IPEndPoint)l.LocalEndpoint).Port;
                l.Stop();

                this.listenerThread = new Thread(this.Listen);
                this.listenerThread.Start();
            }

            public string HostName
            {
                get { return hostName; }
            }

            public int Port
            {
                get { return listenerPort; }
            }

            public void Dispose()
            {
                Dispose(true);
            }

            protected virtual void Dispose(bool disposing)
            {
                if (!disposedValue)
                {
                    if (disposing)
                    {
                        this.keepRunning = false;
                        this.listenerThread.Join(TimeSpan.FromSeconds(5));
                        this.listener.Stop();
                    }

                    disposedValue = true;
                }
            }

            private void ProcessContext(HttpListenerContext context)
            {
                if (context.Request.Url.AbsoluteUri.ToLowerInvariant().Contains("proxy.pac"))
                {
                    byte[] pacFileBuffer = Encoding.ASCII.GetBytes(this.pacFileContent);
                    context.Response.ContentType = "application/x-javascript-config";
                    context.Response.ContentLength64 = pacFileBuffer.LongLength;
                    context.Response.ContentEncoding = Encoding.ASCII;
                    context.Response.StatusCode = 200;
                    context.Response.OutputStream.Write(pacFileBuffer, 0, pacFileBuffer.Length);
                    context.Response.OutputStream.Flush();
                }
            }

            private void Listen()
            {
                listener = new HttpListener();
                listener.Prefixes.Add("http://" + this.HostName + ":" + this.listenerPort.ToString() + "/");
                listener.Start();
                while (this.keepRunning)
                {
                    try
                    {
                        HttpListenerContext context = listener.GetContext();
                        this.ProcessContext(context);
                    }
                    catch (HttpListenerException)
                    {
                    }
                }
            }
        }

        private class ProxyServer
        {
            private HttpProxyServer server;
            private List<string> uris = new List<string>();
            int port;
            string hostName = string.Empty;

            public ProxyServer()
                : this("127.0.0.1")
            {

            }

            public ProxyServer(string hostName)
            {
                this.hostName = hostName;
                this.server = new HttpProxyServer(this.hostName, new HttpProxy());
                this.server.Start().WaitOne();
                this.port = this.server.ProxyEndPoint.Port;
                // this.server.Log += OnServerLog;
            }

            public string BaseUrl
            {
                get { return string.Format("{0}:{1}", this.hostName, this.port); }
            }

            public HttpProxyServer Server
            {
                get { return this.server; }
            }

            public string HostName
            {
                get { return hostName; }
            }

            public int Port
            {
                get { return port; }
            }

            public void EnableLogResourcesOnResponse()
            {
                this.server.Proxy.OnResponseSent = this.LogRequestedResources;
            }

            public void DisableLogResourcesOnResponse()
            {
                this.server.Proxy.OnResponseSent = null;
            }

            public void EnableContentOverwriteOnRequest()
            {
                this.server.Proxy.OnRequestReceived = this.OverwriteRequestedContent;
            }

            public void DisableContentOverwriteOnRequest()
            {
                this.server.Proxy.OnRequestReceived = null;
            }

            public bool HasBeenCalled(string resourceName)
            {
                return this.uris.Contains(resourceName);
            }

            public void Quit()
            {
                this.server.Proxy.OnResponseSent = null;
                this.server.Stop();
            }

            public Proxy AsProxy()
            {
                Proxy proxy = new Proxy();
                proxy.HttpProxy = this.BaseUrl;
                return proxy;
            }

            private void OnServerLog(object sender, BenderProxy.Logging.LogEventArgs e)
            {
                Console.WriteLine(e.LogMessage);
            }

            private void LogRequestedResources(ProcessingContext context)
            {
                string[] parts = context.RequestHeader.RequestURI.Split(new char[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length != 0)
                {
                    string finalPart = parts[parts.Length - 1];
                    uris.Add(finalPart);
                }
            }

            private void OverwriteRequestedContent(ProcessingContext context)
            {
                StringBuilder pageContentBuilder = new StringBuilder("<!DOCTYPE html>");
                pageContentBuilder.AppendLine("<html>");
                pageContentBuilder.AppendLine("<head>");
                pageContentBuilder.AppendLine("  <title>Hello</title>");
                pageContentBuilder.AppendLine("</head>");
                pageContentBuilder.AppendLine("<body>");
                pageContentBuilder.AppendLine("  <h3>Hello, world!</h3>");
                pageContentBuilder.AppendLine("</body>");
                pageContentBuilder.AppendLine("</html>");
                string pageContent = pageContentBuilder.ToString();

                context.StopProcessing();
                MemoryStream responseStream = new MemoryStream(Encoding.UTF8.GetBytes(pageContent));
                var responseHeader = new BenderProxy.Headers.HttpResponseHeader(200, "OK", "1.1");
                responseHeader.EntityHeaders.ContentType = "text/html";
                responseHeader.EntityHeaders.ContentEncoding = "utf-8";
                responseHeader.EntityHeaders.ContentLength = responseStream.Length;
                new HttpResponseWriter(context.ClientStream).Write(responseHeader, responseStream, responseStream.Length);
            }
        }
    }
}
