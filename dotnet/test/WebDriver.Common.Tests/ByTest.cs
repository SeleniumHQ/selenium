using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using NMock2;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ByTest
    {
        private Mockery mocks = new Mockery();

        [Test]
        public void ShouldUseFindsByNameToLocateElementsByName() 
        {
            var mockDriver = mocks.NewMock<IAllDriver>();
            var mockElement = mocks.NewMock<IWebElement>();
            Expect.Once.On(mockDriver).Method("FindElementByName").With("cheese").Will(Return.Value(mockElement));

            By by = By.Name("cheese");
            by.FindElement(mockDriver);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        // TODO (jimevan): This test is disabled in the Java implementation unit tests.
        // Is the functionality not implemented?
        public void ShouldUseXPathToFindByNameIfDriverDoesNotImplementFindsByName()
        {
            var mockDriver = mocks.NewMock<IOnlyXPath>();
            var mockElement = mocks.NewMock<IWebElement>();
            Expect.Once.On(mockDriver).Method("FindElementByXPath").With("//*[@name='cheese']").Will(Return.Value(mockElement));

            By by = By.Name("cheese");
            by.FindElement(mockDriver);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        public interface IAllDriver : IFindsById, IFindsByLinkText, IFindsByName, IFindsByXPath, ISearchContext
        {
        }

        public interface IOnlyXPath : IFindsByXPath, ISearchContext
        {
        }
    }
}
