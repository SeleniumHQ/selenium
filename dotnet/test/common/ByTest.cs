using NUnit.Framework;
using OpenQA.Selenium.Internal;
using Moq;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ByTest
    {
        [Test]
        public void ShouldUseFindsByNameToLocateElementsByName() 
        {
            var mockDriver = new Mock<IAllDriver>();
            var mockElement = new Mock<IWebElement>();

            mockDriver.Setup(_ => _.FindElementByName(It.Is<string>(x => x == "cheese"))).Returns(mockElement.Object);

            By by = By.Name("cheese");
            var element = by.FindElement(mockDriver.Object);
            Assert.AreEqual(mockElement.Object, element);
            mockDriver.Verify(x => x.FindElementByName("cheese"), Times.Once);
        }

        // TODO (jimevan): This test is disabled in the Java implementation unit tests.
        // Is the functionality not implemented?*
        public void ShouldUseXPathToFindByNameIfDriverDoesNotImplementFindsByName()
        {
            var mockDriver = new Mock<IOnlyXPath>();
            var mockElement = new Mock<IWebElement>();

            mockDriver.Setup(_ => _.FindElementByXPath(It.Is<string>(x => x == "//*[@name='cheese']"))).Returns(mockElement.Object);

            By by = By.Name("cheese");
            var element = by.FindElement(mockDriver.Object);
            Assert.AreEqual(mockElement.Object, element);
        }

        public interface IAllDriver : IFindsElement, IFindsById, IFindsByLinkText, IFindsByName, IFindsByXPath, ISearchContext
        {
        }

        public interface IOnlyXPath : IFindsElement, IFindsByXPath, ISearchContext
        {
        }
    }
}
