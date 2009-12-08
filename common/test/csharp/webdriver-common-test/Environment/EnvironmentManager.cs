using System;
using System.Collections.Generic;
using System.Configuration;
using System.Reflection;
using System.Text;
using OpenQa.Selenium;

namespace OpenQa.Selenium.Environment
{
    public class EnvironmentManager
    {
        
        Type driverType;
        static readonly EnvironmentManager instance = new EnvironmentManager();
        private Browser browser;
        IWebDriver driver;
        UrlBuilder urlBuilder;

        private EnvironmentManager()
        {
            // TODO(andre.nogueira): Error checking to guard against malformed config files
            String driverClassName = GetSettingValue("Driver");
            String assemblyName = GetSettingValue("Assembly");
            Assembly assembly = Assembly.Load(assemblyName);
            driverType = assembly.GetType(driverClassName);
            browser = (Browser) Enum.Parse(
                typeof(Browser), 
                GetSettingValue("DriverName"));

            urlBuilder = new UrlBuilder();
        }

        ~EnvironmentManager()
        {
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

        public IWebDriver GetCurrentDriver()
        {
            if (driver != null) { return driver; }
            else { return CreateFreshDriver(); }
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
            if (driver != null) {
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
