using System;
using System.Collections.Generic;
using System.Configuration;
using System.Reflection;
using System.Text;
using OpenQA.Selenium;
using System.IO;

namespace OpenQA.Selenium.Environment
{
    public class EnvironmentManager
    {
        private static readonly EnvironmentManager instance = new EnvironmentManager();
        private Type driverType;
        private Browser browser;
        private IWebDriver driver;
        private UrlBuilder urlBuilder;
        private TestWebServer webServer;
        private string remoteCapabilities;

        private EnvironmentManager()
        {
            // TODO(andre.nogueira): Error checking to guard against malformed config files
            string driverClassName = GetSettingValue("Driver");
            string assemblyName = GetSettingValue("Assembly");
            Assembly assembly = Assembly.Load(assemblyName);
            driverType = assembly.GetType(driverClassName);
            browser = (Browser)Enum.Parse(typeof(Browser), GetSettingValue("DriverName"));
            remoteCapabilities = GetSettingValue("RemoteCapabilities");

            urlBuilder = new UrlBuilder();

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
            DirectoryInfo info = new DirectoryInfo(currentDirectory);
            while (info != info.Root && string.Compare(info.Name, "build", StringComparison.OrdinalIgnoreCase) != 0)
            {
                info = info.Parent;
            }

            info = info.Parent;
            webServer = new TestWebServer(info.FullName);
        }

        ~EnvironmentManager()
        {
            webServer.Stop();
            if (driver != null)
            {
                driver.Quit();
            }
        }

        public static string GetSettingValue(string key)
        {
            return System.Configuration.ConfigurationManager.AppSettings.GetValues(key)[0];
        }

        public Browser Browser 
        {
            get { return browser; }
        }

        public TestWebServer WebServer
        {
            get { return webServer; }
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

        public IWebDriver CreateSecondDriver()
        {
            return (IWebDriver)Activator.CreateInstance(driverType);
        }

        public IWebDriver CreateFreshDriver()
        {
            CloseCurrentDriver();
            driver = (IWebDriver)Activator.CreateInstance(driverType);
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
