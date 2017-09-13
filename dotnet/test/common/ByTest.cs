using NUnit.Framework;
using NMock;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ByTest
    {
        private MockFactory mocks = new MockFactory();

        [Test]
        public void ShouldUseFindsByNameToLocateElementsByName() 
        {
            var mockDriver = mocks.CreateMock<IAllDriver>();
            var mockElement = mocks.CreateMock<IWebElement>();

            mockDriver.Expects.One.Method(_ => _.FindElementByName(null)).With("cheese").Will(Return.Value(mockElement.MockObject));

            By by = By.Name("cheese");
            by.FindElement(mockDriver.MockObject);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        // TODO (jimevan): This test is disabled in the Java implementation unit tests.
        // Is the functionality not implemented?*
        public void ShouldUseXPathToFindByNameIfDriverDoesNotImplementFindsByName()
        {
            var mockDriver = mocks.CreateMock<IOnlyXPath>();
            var mockElement = mocks.CreateMock<IWebElement>();
            mockDriver.Expects.One.Method(_ => _.FindElementByXPath("//*[@name='cheese']")).WillReturn(mockElement.MockObject);

            By by = By.Name("cheese");
            by.FindElement(mockDriver.MockObject);
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
