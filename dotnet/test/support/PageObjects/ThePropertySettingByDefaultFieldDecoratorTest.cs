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
    public class ThePropertySettingByDefaultFieldDecoratorTest
    {
        private static Mockery mocks = new Mockery();
        private ISearchContext mockDriver = mocks.NewMock<ISearchContext>();

        private object mockElement1;
        private object mockElement2;
        private object mockElement3;

        private object mockElements1;
        private object mockElements2;
        private object mockElements3;

        private object unmarkedField2;
        private object unmarkedField1;
        private object unmarkedField3;

        private object unmarkedField5;
        private object unmarkedField4;
        private object unmarkedField6;

        [FindsBy(How = How.Id, Using = "SomeId")]
        private IWebElement mockProperty1
        {
            set
            {
                mockElement1 = value;
            }
        }

        [FindsBy(How = How.Id, Using = "SomeId")]
        private IWebDriver mockProperty2
        {
            set
            {
                mockElement2 = value;
            }
        }

        [FindsBy(How = How.Id, Using = "SomeId")]
        private IFindsById mockProperty3
        {
            set
            {
                mockElement3 = value;
            }
        }
        
        [FindsBy(How = How.Id, Using = "SomeId")]
        private IList<IWebElement> mockListProperty1
        {
            set
            {
                mockElements1 = value;
            }
        }

        [FindsBy(How = How.Id, Using = "SomeId")]
        private IList<IWebDriver> mockListProperty2
        {
            set
            {
                mockElements2 = value;
            }
        }

        [FindsBy(How = How.Id, Using = "SomeId")]
        private IList<IFindsById> mockListProperty3
        {
            set
            {
                mockElements3 = value;
            }
        }

        private IWebElement mockUnmarkedProperty1
        {
            set
            {
                unmarkedField1 = value;
            }
        }

        private IWebDriver mockUnmarkedProperty2
        {
            set
            {
                unmarkedField2 = value;
            }
        }

        private IFindsById mockUnmarkedProperty3
        {
            set
            {
                unmarkedField3 = value;
            }
        }

        private IList<IWebElement> mockUnmarkedListProperty1
        {
            set
            {
                unmarkedField6 = value;
            }
        }

        private IList<IWebDriver> mockUnmarkedListProperty2
        {
            set
            {
                unmarkedField5 = value;
            }
        }

        private IList<IFindsById> mockUnmarkedListProperty3
        {
            set
            {
                unmarkedField4 = value;
            }
        }

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
