using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using NUnit.Mocks;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ByTest
    {
        [Test]
        public void ShouldUseFindsByNameToLocateElementsByName() 
        {
            DynamicMock driver = new DynamicMock(typeof(IAllDriver));

            driver.Expect("FindElementByName", new object[] { "cheese" });

            By by = By.Name("cheese");
            by.FindElement(driver.MockInstance as IAllDriver);
        }

        // TODO (jimevan): This test is disabled in the Java implementation unit tests.
        // Is the functionality not implemented?
        public void ShouldUseXPathToFindByNameIfDriverDoesNotImplementFindsByName()
        {
            DynamicMock driver = new DynamicMock(typeof(IOnlyXPath));

            driver.Expect("FindElementByXPath", new object[] { "//*[@name='cheese']" });

            By by = By.Name("cheese");

            by.FindElement(driver.MockInstance as IOnlyXPath);
        }

        private interface IAllDriver : IFindsById, IFindsByLinkText, IFindsByName, IFindsByXPath, ISearchContext
        {
        }

        private interface IOnlyXPath : IFindsByXPath, ISearchContext
        {
        }
    }
}
