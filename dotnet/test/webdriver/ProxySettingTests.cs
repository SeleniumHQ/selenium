// <copyright file="ProxySettingTests.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using BenderProxy;
using BenderProxy.Writers;
using OpenQA.Selenium.IE;
using OpenQA.Selenium.Tests.Infrastructure.Environment;

namespace OpenQA.Selenium.Tests;

[Ignore("Proxy Tests are not working")]
[TestFixture]
public class ProxySettingTests : DriverTestFixture
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
        if (e.Options is InternetExplorerOptions ieOptions)
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
        private readonly string pacFileContent;
        private bool disposedValue = false; // To detect redundant calls
        private bool keepRunning = true;
        private HttpListener listener;
        private readonly Thread listenerThread;

        public ProxyAutoConfigServer(string pacFileContent)
            : this(pacFileContent, "localhost")
        {
        }

        public ProxyAutoConfigServer(string pacFileContent, string hostName)
        {
            this.pacFileContent = pacFileContent;
            HostName = hostName;
            Port = DetectEmptyPort();
            this.listenerThread = StartListeningThread();
        }

        public string HostName { get; }

        public int Port { get; }

        private static int DetectEmptyPort()
        {
            TcpListener l = new TcpListener(IPAddress.Loopback, 0);
            l.Start();
            var port = ((IPEndPoint)l.LocalEndpoint).Port;
            l.Stop();
            return port;
        }

        private Thread StartListeningThread()
        {
            var thread = new Thread(Listen);
            thread.Start();
            return thread;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
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

        ~ProxyAutoConfigServer()
        {
            Dispose(false);
        }

        private void ProcessContext(HttpListenerContext context)
        {
            if (context.Request.Url.AbsoluteUri.Contains("proxy.pac", StringComparison.InvariantCultureIgnoreCase))
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
            listener.Prefixes.Add("http://" + this.HostName + ":" + Port.ToString() + "/");
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
        private readonly List<string> uris = new List<string>();

        public ProxyServer()
            : this("127.0.0.1")
        {

        }

        public ProxyServer(string hostName)
        {
            HostName = hostName;
            Server = new HttpProxyServer(HostName, new HttpProxy());
            Server.Start().WaitOne();
            Port = Server.ProxyEndPoint.Port;
            // this.Server.Log += OnServerLog;
        }

        public string BaseUrl => string.Format("{0}:{1}", HostName, Port);

        public HttpProxyServer Server { get; }

        public string HostName { get; } = string.Empty;

        public int Port { get; }

        public void EnableLogResourcesOnResponse()
        {
            Server.Proxy.OnResponseSent = this.LogRequestedResources;
        }

        public void DisableLogResourcesOnResponse()
        {
            Server.Proxy.OnResponseSent = null;
        }

        public void EnableContentOverwriteOnRequest()
        {
            Server.Proxy.OnRequestReceived = this.OverwriteRequestedContent;
        }

        public void DisableContentOverwriteOnRequest()
        {
            Server.Proxy.OnRequestReceived = null;
        }

        public bool HasBeenCalled(string resourceName)
        {
            return this.uris.Contains(resourceName);
        }

        public void Quit()
        {
            Server.Proxy.OnResponseSent = null;
            Server.Stop();
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
