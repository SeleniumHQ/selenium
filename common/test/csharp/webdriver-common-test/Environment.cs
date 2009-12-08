using OpenQa.Selenium;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Reflection;
using System.Text;

namespace OpenQa.Selenium
{
    public class Environment
    {
        
        Type driverType;
        static readonly Environment instance = new Environment();
        private Browser browser;
        IWebDriver driver = null;


        private Environment()
        {
            String driverClassName = System.Configuration.ConfigurationManager.AppSettings.GetValues("Driver")[0];
            String assemblyName = System.Configuration.ConfigurationManager.AppSettings.GetValues("Assembly")[0];
            Assembly assembly = Assembly.Load(assemblyName);
            driverType = assembly.GetType(driverClassName);
            browser = (Browser) Enum.Parse(
                typeof(Browser), 
                System.Configuration.ConfigurationManager.AppSettings.GetValues("DriverName")[0]);
        }

        ~Environment()
        {
            if (driver != null)
            {
                driver.Quit();
            }
        }

        public Browser Browser 
        {
            get { return browser; }
        }

        public IWebDriver GetDriver()
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
            if (driver != null) { driver.Quit(); } 
            driver = (IWebDriver)Activator.CreateInstance(driverType);
            return driver;
        }

        public static Environment Instance
        {
            get
            {
                return instance;
            }
        }

    }
}
