using NUnit.Framework;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Edge;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.IE;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Environment
{
    public class DriverFactory
    {
        string driverPath;

        public DriverFactory(string driverPath)
        {
            if (string.IsNullOrEmpty(driverPath))
            {
                this.driverPath = TestContext.CurrentContext.TestDirectory;
            }
            else
            {
                this.driverPath = driverPath;
            }
        }

        public string DriverServicePath
        {
            get { return this.driverPath; }
        }

        public IWebDriver CreateDriver(Type driverType)
        {
            List<Type> constructorArgTypeList = new List<Type>();
            IWebDriver driver = null;
            if (typeof(ChromeDriver).IsAssignableFrom(driverType))
            {
                ChromeDriverService service = ChromeDriverService.CreateDefaultService(this.driverPath);
                constructorArgTypeList.Add(typeof(ChromeDriverService));
                ConstructorInfo ctorInfo = driverType.GetConstructor(constructorArgTypeList.ToArray());
                return (IWebDriver)ctorInfo.Invoke(new object[] { service });
            }

            if (typeof(InternetExplorerDriver).IsAssignableFrom(driverType))
            {
                InternetExplorerDriverService service = InternetExplorerDriverService.CreateDefaultService(this.driverPath);
                constructorArgTypeList.Add(typeof(InternetExplorerDriverService));
                ConstructorInfo ctorInfo = driverType.GetConstructor(constructorArgTypeList.ToArray());
                return (IWebDriver)ctorInfo.Invoke(new object[] { service });
            }

            if (typeof(EdgeDriver).IsAssignableFrom(driverType))
            {
                EdgeDriverService service = EdgeDriverService.CreateDefaultService(this.driverPath);
                constructorArgTypeList.Add(typeof(EdgeDriverService));
                ConstructorInfo ctorInfo = driverType.GetConstructor(constructorArgTypeList.ToArray());
                return (IWebDriver)ctorInfo.Invoke(new object[] { service });
            }

            if (typeof(FirefoxDriver).IsAssignableFrom(driverType))
            {
                FirefoxDriverService service = FirefoxDriverService.CreateDefaultService(this.driverPath);
                constructorArgTypeList.Add(typeof(FirefoxDriverService));
                ConstructorInfo ctorInfo = driverType.GetConstructor(constructorArgTypeList.ToArray());
                return (IWebDriver)ctorInfo.Invoke(new object[] { service });
            }

            driver = (IWebDriver)Activator.CreateInstance(driverType);
            return driver;
        }
    }
}
