using System;
using System.Reflection;
using OpenQA.Selenium;
using System.IO;

namespace Selenium.Tests.Environment
{
    public class EnvironmentManager
    {
        private static readonly EnvironmentManager instance = new EnvironmentManager();
        private Type driverType;
        SeleniumServer remoteServer;
        private int port = 2310;

        private ISelenium selenium;

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
            return string.Empty;
        }

        public SeleniumServer RemoteServer
        {
            get { return remoteServer; }
        }

        public int Port
        {
            get { return port; }
        }

        public ISelenium GetCurrentSelenium()
        {
            if (selenium == null)
            {
                selenium = new WebDriverBackedSelenium(StartDriver(), "http://localhost:" + this.port.ToString() + "/selenium-server/tests");
                selenium.Start();
            }

            return selenium;
        }

        public void ShutdownSelenium()
        {
            if (selenium != null)
            {
                selenium.Stop();
                selenium = null;
            }
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
