using System;
using System.Reflection;
using System.IO;
using Newtonsoft.Json;
using NUnit.Framework;
using System.Collections.Generic;

namespace OpenQA.Selenium.Environment
{
    public class EnvironmentManager
    {
        private static EnvironmentManager instance;
        private Type driverType;
        private Browser browser;
        private IWebDriver driver;
        private UrlBuilder urlBuilder;
        private TestWebServer webServer;
        private DriverFactory driverFactory;
        private RemoteSeleniumServer remoteServer;
        private string remoteCapabilities;

        private EnvironmentManager()
        {
            string currentDirectory = this.CurrentDirectory;
            string defaultConfigFile = Path.Combine(currentDirectory, "appconfig.json");
            string configFile = TestContext.Parameters.Get<string>("ConfigFile", defaultConfigFile).Replace('/', Path.DirectorySeparatorChar);

            string content = File.ReadAllText(configFile);
            TestEnvironment env = JsonConvert.DeserializeObject<TestEnvironment>(content);

            string activeDriverConfig = TestContext.Parameters.Get("ActiveDriverConfig", env.ActiveDriverConfig);
            string activeWebsiteConfig = TestContext.Parameters.Get("ActiveWebsiteConfig", env.ActiveWebsiteConfig);
            string driverServiceLocation = TestContext.Parameters.Get("DriverServiceLocation", env.DriverServiceLocation);
            DriverConfig driverConfig = env.DriverConfigs[activeDriverConfig];
            WebsiteConfig websiteConfig = env.WebSiteConfigs[activeWebsiteConfig];
            TestWebServerConfig webServerConfig = env.TestWebServerConfig;
            webServerConfig.CaptureConsoleOutput = TestContext.Parameters.Get<bool>("CaptureWebServerOutput", env.TestWebServerConfig.CaptureConsoleOutput);
            webServerConfig.HideCommandPromptWindow = TestContext.Parameters.Get<bool>("HideWebServerCommandPrompt", env.TestWebServerConfig.HideCommandPromptWindow);
            webServerConfig.JavaHomeDirectory = TestContext.Parameters.Get("WebServerJavaHome", env.TestWebServerConfig.JavaHomeDirectory);
            this.driverFactory = new DriverFactory(driverServiceLocation);
            this.driverFactory.DriverStarting += OnDriverStarting;

            Assembly driverAssembly = null;
            try
            {
                driverAssembly = Assembly.Load(driverConfig.AssemblyName);
            }
            catch (FileNotFoundException)
            {
                driverAssembly = Assembly.GetExecutingAssembly();
            }

            driverType = driverAssembly.GetType(driverConfig.DriverTypeName);
            browser = driverConfig.BrowserValue;
            remoteCapabilities = driverConfig.RemoteCapabilities;

            urlBuilder = new UrlBuilder(websiteConfig);

            // When run using the `bazel test` command, the following environment
            // variable will be set. If not set, we're running from a build system
            // outside Bazel, and need to locate the directory containing the jar.
            string projectRoot = System.Environment.GetEnvironmentVariable("TEST_SRCDIR");
            if (string.IsNullOrEmpty(projectRoot))
            {
                // Walk up the directory tree until we find ourselves in a directory
                // where the path to the Java web server can be determined.
                bool continueTraversal = true;
                DirectoryInfo info = new DirectoryInfo(currentDirectory);
                while (continueTraversal)
                {
                    if (info == info.Root)
                    {
                        break;
                    }

                    foreach (var childDir in info.EnumerateDirectories())
                    {
                        // Case 1: The current directory of this assembly is in the
                        // same direct sub-tree as the Java targets (usually meaning
                        // executing tests from the same build system as that which
                        // builds the Java targets).
                        // If we find a child directory named "java", then the web
                        // server should be able to be found under there.
                        if (string.Compare(childDir.Name, "java", StringComparison.OrdinalIgnoreCase) == 0)
                        {
                            continueTraversal = false;
                            break;
                        }

                        // Case 2: The current directory of this assembly is a different
                        // sub-tree as the Java targets (usually meaning executing tests
                        // from a different build system as that which builds the Java
                        // targets).
                        // If we travel to a place in the tree where there is a child
                        // directory named "bazel-bin", the web server should be found
                        // in the "java" subdirectory of that directory.
                        if (string.Compare(childDir.Name, "bazel-bin", StringComparison.OrdinalIgnoreCase) == 0)
                        {
                            string javaOutDirectory = Path.Combine(childDir.FullName, "java");
                            if (Directory.Exists(javaOutDirectory))
                            {
                                info = childDir;
                                continueTraversal = false;
                                break;
                            }
                        }
                    }

                    if (continueTraversal)
                    {
                        info = info.Parent;
                    }
                }

                projectRoot = info.FullName;
            }
            else
            {
                projectRoot += "/selenium";
            }

            webServer = new TestWebServer(projectRoot, webServerConfig);
            bool autoStartRemoteServer = false;
            if (browser == Browser.Remote)
            {
                autoStartRemoteServer = driverConfig.AutoStartRemoteServer;
            }

            remoteServer = new RemoteSeleniumServer(projectRoot, autoStartRemoteServer);
        }

        ~EnvironmentManager()
        {
            if (remoteServer != null)
            {
                remoteServer.Stop();
            }
            if (webServer != null)
            {
                webServer.Stop();
            }
            if (driver != null)
            {
                driver.Quit();
            }
        }

        public event EventHandler<DriverStartingEventArgs> DriverStarting;

        public static EnvironmentManager Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = new EnvironmentManager();
                }

                return instance;
            }
        }

        public Browser Browser 
        {
            get { return browser; }
        }

        public string DriverServiceDirectory
        {
            get { return this.driverFactory.DriverServicePath; }
        }

        public string CurrentDirectory
        {
            get
            {
                string assemblyLocation = Path.GetDirectoryName(typeof(EnvironmentManager).Assembly.Location);
                string testDirectory = TestContext.CurrentContext.TestDirectory;
                if (assemblyLocation != testDirectory)
                {
                    return assemblyLocation;
                }
                return testDirectory;
            }
        }
        
        public TestWebServer WebServer
        {
            get { return webServer; }
        }

        public RemoteSeleniumServer RemoteServer
        {
            get { return remoteServer; }
        }

        public string RemoteCapabilities
        {
            get { return remoteCapabilities; }
        }

        public UrlBuilder UrlBuilder
        {
            get
            {
                return urlBuilder;
            }
        }

        public IWebDriver GetCurrentDriver()
        {
            if (driver != null)
            { 
                return driver; 
            }
            else 
            { 
                return CreateFreshDriver(); 
            }
        }

        public IWebDriver CreateDriverInstance()
        {
            return driverFactory.CreateDriver(driverType);
        }

        public IWebDriver CreateDriverInstance(DriverOptions options)
        {
            return driverFactory.CreateDriverWithOptions(driverType, options);
        }

        public IWebDriver CreateFreshDriver()
        {
            CloseCurrentDriver();
            driver = CreateDriverInstance();
            return driver;
        }

        public void CloseCurrentDriver()
        {
            if (driver != null) 
            {
                driver.Quit(); 
            }
            driver = null;
        }

        protected void OnDriverStarting(object sender, DriverStartingEventArgs e)
        {
            if (this.DriverStarting != null)
            {
                this.DriverStarting(sender, e);
            }
        }
    }
}
