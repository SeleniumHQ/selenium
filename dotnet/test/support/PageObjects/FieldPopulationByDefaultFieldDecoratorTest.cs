using NMock2;
using NUnit.Framework;
using OpenQA.Selenium.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Support.PageObjects
{
    [TestFixture]
    public class FieldPopulationByDefaultFieldDecoratorTest
    {
        private static Mockery mocks = new Mockery();
        private ISearchContext mockDriver = mocks.NewMock<ISearchContext>();

        [FindsBy(How = How.Id, Using = "SomeId")]
        private IWebElement mockElement1;

        [FindsBy(How = How.Id, Using = "SomeId")]
        private IWebDriver mockElement2;

        [FindsBy(How = How.Id, Using = "SomeId")]
        private IFindsById mockElement3;

        [FindsBy(How = How.Id, Using = "SomeId")]
        private IList<IWebElement> mockElements1;

        [FindsBy(How = How.Id, Using = "SomeId")]
        private IList<IWebDriver> mockElements2;

        [FindsBy(How = How.Id, Using = "SomeId")]
        private IList<IFindsById> mockElements3;

        private IWebDriver unmarkedField2;

        private IWebElement unmarkedField1;

        private IFindsById unmarkedField3;

        private IList<IWebDriver> unmarkedField5;

        private IList<IFindsById> unmarkedField4;

        private IList<IWebElement> unmarkedField6;

        [SetUp]
        public void SetUp()
        {
            PageFactory.InitElements(mockDriver, this);
        }

        [Test]
        public void IsPopulatedMarkedWebElementField()
        {
            Assert.NotNull(mockElement1);
        }

        [Test]
        public void IsNotPopulatedMarkedNotWebElementField()
        {
            Assert.IsNull(mockElement2);
        }

        [Test]
        public void IsPopulatedMarkedFieldWithInterfaceImplementedByRemoteWebElementent()
        {
            Assert.NotNull(mockElement3);
        }

        [Test]
        public void IsPopulatedMarkedListOfWebElementField()
        {
            Assert.NotNull(mockElements1);
        }

        [Test]
        public void IsNotPopulatedMarkedNotWebElementListField()
        {
            Assert.IsNull(mockElements2);
        }

        [Test]
        public void IsPopulatedMarkedListFieldWithInterfaceImplementedByRemoteWebElementent()
        {
            Assert.NotNull(mockElements3);
        }

        [Test(Description = "At this case ByIdOrName locator strategy should be used")]
        public void IsPopulatedWebElementFieldWithoutAttributes()
        {
            Assert.NotNull(unmarkedField1);
        }

        [Test]
        public void IsNotPopulatedNotWebElementFieldWithoutAttributes()
        {
            Assert.IsNull(unmarkedField2);
        }

        [Test(Description = "At this case ByIdOrName locator strategy should be used")]
        public void IsPopulatedFieldWithInterfaceImplementedByRemoteWebElemententWithoutAttributes()
        {
            Assert.NotNull(unmarkedField3);
        }

       [Test(Description = "At this case ByIdOrName locator strategy should be used")]
        public void IsPopulatedListOfWebElementFieldWithoutAttributes()
        {
            Assert.NotNull(unmarkedField6);
        }

        [Test]
        public void IsNotPopulatedNotWebElementListFieldWithoutAttributes()
        {
            Assert.IsNull(unmarkedField5);
        }

        [Test(Description = "At this case ByIdOrName locator strategy should be used")]
        public void IsPopulatedListFieldWithInterfaceImplementedByRemoteWebElemententWithoutAttributes()
        {
            Assert.NotNull(unmarkedField4);
        }
    }
}
