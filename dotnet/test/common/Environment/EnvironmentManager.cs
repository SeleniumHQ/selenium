using System;
using System.Reflection;
using System.IO;

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
        RemoteSeleniumServer remoteServer;
        private string remoteCapabilities;

        private EnvironmentManager()
        {
            string configFile = AppDomain.CurrentDomain.SetupInformation.ConfigurationFile;
            try
            {
                string driverClassName = GetSettingValue("Driver");
                string assemblyName = GetSettingValue("Assembly");
                Assembly assembly = Assembly.Load(assemblyName);
                driverType = assembly.GetType(driverClassName);
                browser = (Browser)Enum.Parse(typeof(Browser), GetSettingValue("DriverName"));
                remoteCapabilities = GetSettingValue("RemoteCapabilities");
            }
            catch (Exception)
            {
            }

            urlBuilder = new UrlBuilder();

            string currentDirectory = this.CurrentDirectory;
            DirectoryInfo info = new DirectoryInfo(currentDirectory);
            while (info != info.Root && string.Compare(info.Name, "build", StringComparison.OrdinalIgnoreCase) != 0)
            {
                info = info.Parent;
            }

            info = info.Parent;
            webServer = new TestWebServer(info.FullName);
            bool autoStartRemoteServer = false;
            if (browser == Browser.Remote)
            {
                autoStartRemoteServer = bool.Parse(GetSettingValue("AutoStartRemoteServer"));
            }

            remoteServer = new RemoteSeleniumServer(info.FullName, autoStartRemoteServer);
        }

        ~EnvironmentManager()
        {
            remoteServer.Stop();
            webServer.Stop();
            if (driver != null)
            {
                driver.Quit();
            }
        }

        public static string GetSettingValue(string key)
        {
            string settingValue = string.Empty;
            try
            {
                settingValue = System.Configuration.ConfigurationManager.AppSettings.GetValues(key)[0];
            }
            catch (Exception)
            {
            }

            return settingValue;
        }

        public Browser Browser 
        {
            get { return browser; }
        }

        public string CurrentDirectory
        {
            get
            {
                Assembly executingAssembly = Assembly.GetExecutingAssembly();
                string assemblyLocation = executingAssembly.Location;

                // If we're shadow copying,. fiddle with 
                // the codebase instead 
                if (AppDomain.CurrentDomain.ShadowCopyFiles)
                {
                    Uri uri = new Uri(executingAssembly.CodeBase);
                    assemblyLocation = uri.LocalPath;
                }

                string currentDirectory = Path.GetDirectoryName(assemblyLocation);
                return currentDirectory;
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
            return (IWebDriver)Activator.CreateInstance(driverType);
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

        public UrlBuilder UrlBuilder
        {
            get
            {
                return urlBuilder;
            }
        }

    }
}
