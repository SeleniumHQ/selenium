using OpenQA.Selenium;
using OpenQA.Selenium.Edge;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;

namespace WebDriver.Edge.Tests
{
    public class EdgeDriverTestFixture: DriverTestFixture
    {
        protected string SIDELOAD_PATH = System.Environment.GetFolderPath(System.Environment.SpecialFolder.LocalApplicationData) + @"\Packages\Microsoft.MicrosoftEdge_8wekyb3d8bbwe\LocalState\Extensions";
        protected string DLL_PATH = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);

        protected EdgeDriver localDriver;

        protected string CopyExtensionForSideload(string extensionPath)
        {
            Process.Start("xcopy", string.Format(@"""{0}"" ""{1}"" /q/s/c/y/i", DLL_PATH + extensionPath, SIDELOAD_PATH + extensionPath));
            return SIDELOAD_PATH + extensionPath;
        }

        protected void RemoveSideloadDirectory()
        {
            if (Directory.Exists(SIDELOAD_PATH))
            {
                Directory.Delete(SIDELOAD_PATH, true);
            }
        }

        protected void CreateDriverWithExtension(string[] extensionsPathsToSideload)
        {
            if (localDriver != null)
            {
                return;
            }

            List<string> extensionPaths = new List<string>();
            EdgeOptions options = new EdgeOptions();

            foreach (string extensionPath in extensionsPathsToSideload)
            {
                extensionPaths.Add(CopyExtensionForSideload(extensionPath));
            }

            options.AddAdditionalCapability("extensionPaths", extensionPaths.ToArray());
            localDriver = new EdgeDriver(options);
            Thread.Sleep(5000);
        }

    }
}
