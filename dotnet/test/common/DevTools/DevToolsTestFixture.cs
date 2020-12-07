using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools
{
    public class DevToolsTestFixture : DriverTestFixture
    {
        protected IDevTools devTools;
        protected IDevToolsSession session;

        public bool IsDevToolsSupported
        {
            get { return devTools != null; }
        }

        [SetUp]
        public void Setup()
        {
            driver = EnvironmentManager.Instance.GetCurrentDriver();
            devTools = driver as IDevTools;
            if (devTools == null)
            {
                Assert.Ignore("{0} does not support Chrome DevTools Protocol", EnvironmentManager.Instance.Browser);
                return;
            }

            session = devTools.GetDevToolsSession();
        }

        [TearDown]
        public void Teardown()
        {
            if (session != null)
            {
                session.Dispose();
                EnvironmentManager.Instance.CloseCurrentDriver();
                driver = null;
            }
        }
    }
}
