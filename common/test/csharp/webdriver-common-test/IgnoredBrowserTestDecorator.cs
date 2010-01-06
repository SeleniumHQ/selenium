using System.Reflection;
using NUnit.Core;
using NUnit.Core.Extensibility;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
	[NUnitAddin(Description="Ignores a given test on a given browser")]
	public class IgnoredBrowserTestDecorator : ITestDecorator, IAddin
	{
		private static readonly string IgnoreBrowserAttributeTypeFullName = 
            typeof(IgnoreBrowserAttribute).FullName;

		public bool Install(IExtensionHost host)
		{
			IExtensionPoint decorators = host.GetExtensionPoint( "TestDecorators" );
			if ( decorators == null )
				return false;
				
			decorators.Install( this );
			return true;
		}

		public Test Decorate(Test test, MemberInfo member)
		{
			if ( member == null )
				return test;

			TestCase testCase = test as TestCase;
			if ( testCase == null )
				return test;

			System.Attribute[] ignoreAttr = 
                Reflect.GetAttributes( member, IgnoreBrowserAttributeTypeFullName, true );

			if ( ignoreAttr == null )
				return test;

            // A test case might be ignored in more than one browser
            foreach (System.Attribute attr in ignoreAttr)
            {
                // TODO(andre.nogueira): Check if a reason has been entered
                // in the annotation, and if so include it in IgnoreReason.
                object propVal = Reflect.GetPropertyValue(attr, "Value",
                    BindingFlags.Public | BindingFlags.Instance);

                if (propVal == null)
                    return test;

                Browser browser = (Browser)propVal;

                if (browser.Equals(EnvironmentManager.Instance.Browser) ||
                    browser.Equals(Browser.All) || IsRemoteInstanceOfBrowser(browser))
                {   
                    testCase.RunState = RunState.Ignored;
                    testCase.IgnoreReason = "Ignoring browser " +
                        EnvironmentManager.Instance.Browser.ToString() + ".";
                    
                    return testCase;
                }
            }

            return test;
		}

        private bool IsRemoteInstanceOfBrowser(Browser desiredBrowser)
        {
            bool isRemoteInstance = false;
            switch (desiredBrowser)
            {
                case Browser.IE:
                    if (EnvironmentManager.Instance.RemoteCapabilities == "internet explorer")
                    {
                        isRemoteInstance = true;
                    }
                    break;

                case Browser.Firefox:
                    if (EnvironmentManager.Instance.RemoteCapabilities == "firefox")
                    {
                        isRemoteInstance = true;
                    }
                    break;

                case Browser.HtmlUnit:
                    if (EnvironmentManager.Instance.RemoteCapabilities == "htmlunit")
                    {
                        isRemoteInstance = true;
                    }
                    break;

                case Browser.Chrome:
                case Browser.ChromeNonWindows:
                    if (EnvironmentManager.Instance.RemoteCapabilities == "chrome")
                    {
                        isRemoteInstance = true;
                    }
                    break;

                case Browser.IPhone:
                    if (EnvironmentManager.Instance.RemoteCapabilities == "iphone")
                    {
                        isRemoteInstance = true;
                    }
                    break;
            }
            return isRemoteInstance;
        }
    }
}
