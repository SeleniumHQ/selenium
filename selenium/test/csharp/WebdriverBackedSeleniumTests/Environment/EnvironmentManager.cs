using System;
using System.Collections.Generic;
using System.Configuration;
using System.Reflection;
using System.Text;
using OpenQA.Selenium;
using System.IO;

namespace Selenium.Tests.Environment
{
    public class EnvironmentManager
    {
        private static readonly EnvironmentManager instance = new EnvironmentManager();
        private Type driverType;
        private IWebDriver driver;
        SeleniumServer remoteServer;
        private int port = 6000;

        private EnvironmentManager()
        {
            // TODO(andre.nogueira): Error checking to guard against malformed config files
            string driverClassName = GetSettingValue("Driver");
            string assemblyName = GetSettingValue("Assembly");
            Assembly assembly = Assembly.Load(assemblyName);
            driverType = assembly.GetType(driverClassName);

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
            remoteServer = new SeleniumServer(info.FullName, true, port);
        }

        ~EnvironmentManager()
        {
            remoteServer.Stop();
        }

        public static string GetSettingValue(string key)
        {
            return System.Configuration.ConfigurationManager.AppSettings.GetValues(key)[0];
        }

        public SeleniumServer RemoteServer
        {
            get { return remoteServer; }
        }

        public int Port
        {
            get { return port; }
        }

        public IWebDriver StartDriver()
        {
            IWebDriver driver = (IWebDriver)Activator.CreateInstance(driverType);
            return driver;
        }

        public static EnvironmentManager Instance
        {
            get
            {
                return instance;
            }
        }
    }
}
