using System;
using NUnit.Framework;
using OpenQA.Selenium;
using System.Reflection;
using System.IO;
using Selenium.Tests.Environment;

namespace Selenium.Tests
{
    public class SeleniumTestCaseBase
    {
        protected ISelenium selenium;
        private string baseUrl = "http://localhost:" + EnvironmentManager.Instance.Port.ToString() + "/selenium-server";
        [OneTimeSetUp]
        public void FixtureSetUp()
        {
            //selenium = new WebDriverBackedSelenium(EnvironmentManager.Instance.StartDriver(), baseUrl + "/tests");
            //selenium.Start();
            selenium = EnvironmentManager.Instance.GetCurrentSelenium();
        }

        [OneTimeTearDown]
        public void FixtureTearDown()
        {
            //selenium.Stop();
            
        }

        [SetUp]
        public void SetUp()
        {
            string script = ReadSupportScript();
            IWebDriver driver = ((WebDriverBackedSelenium)selenium).UnderlyingWebDriver;
            driver.Url = baseUrl;
            ((IJavaScriptExecutor)driver).ExecuteScript(script);
        }

        private string ReadSupportScript()
        {
            string scriptFilePath = Path.Combine(GetExecutingDirectory(), "testHelpers.js");
            return File.ReadAllText(scriptFilePath);
        }

        private string GetExecutingDirectory()
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

            return Path.GetDirectoryName(assemblyLocation);
        }
    }
}
