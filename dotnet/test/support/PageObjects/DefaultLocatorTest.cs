using NMock2;
using NUnit.Framework;
using OpenQA.Selenium.Support.PageObjects.Interfaces;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reflection;
using System.Text;

namespace OpenQA.Selenium.Support.PageObjects
{
    [TestFixture]
    public class DefaultLocatorTest
    {
        [FindsBy(How = How.Id, Using = "SomeId", Priority = 0)]
        [FindsBy(How = How.ClassName, Using = "SomeClass", Priority = 1)]
        [FindsBy(How = How.TagName, Using = "SomeTag", Priority = 2)]
        public IWebElement F1;

        [FindsBySequence]
        [FindsBy(How = How.Id, Using = "SomeId", Priority = 0)]
        [FindsBy(How = How.TagName, Using = "SomeTag", Priority = 2)]
        [FindsBy(How = How.ClassName, Using = "SomeClass", Priority = 1)]
        public IWebElement F2;

        public IWebElement F3;

        private static Mockery mocks = new Mockery();
        private static ISearchContext mockDriver = mocks.NewMock<ISearchContext>();
        private static TestLocatorFactory factory = new TestLocatorFactory(mockDriver);

        [Test]
        public void ShouldReturnCollectionOfBys()
        {
            FieldInfo f1 = this.GetType().GetField("F1");
            TestLocator tl = (TestLocator)factory.CreateElementLocator(f1);
            IList<By> result = tl.getSearchParameters().TheGivenBys;
            Assert.AreEqual(3, result.Count);

            Assert.IsTrue(result[0].ToString().Contains("SomeId"));
            Assert.IsTrue(result[1].ToString().Contains("SomeClass"));
            Assert.IsTrue(result[2].ToString().Contains("SomeTag"));
        }

        [Test]
        public void ShouldReturnByChained()
        {
            FieldInfo f2 = this.GetType().GetField("F2");
            TestLocator t2 = (TestLocator)factory.CreateElementLocator(f2);
            IList<By> result = t2.getSearchParameters().TheGivenBys;
            Assert.AreEqual(1, result.Count);
            Assert.IsTrue(result[0] as ByChained != null);
        }

        [Test]
        public void ShouldReturnByIdOrName()
        {
            FieldInfo f3 = this.GetType().GetField("F3");
            TestLocator t3 = (TestLocator)factory.CreateElementLocator(f3);
            IList<By> result = t3.getSearchParameters().TheGivenBys;
            Assert.AreEqual(1, result.Count);
            Assert.IsTrue(result[0] as ByIdOrName != null);
            Assert.IsTrue(result[0].ToString().Contains("F3"));
        }
    }

    public class TestLocator : DefaultElementLocator
    {

        public TestLocator(MemberInfo member, ISearchContext searchContext, IAdjustableByTimeSpan timeOutContainer)
            :base(member, searchContext, timeOutContainer)
        {}

        public SearchParameterContainer getSearchParameters()
        {
            return SearchParameters;
        }
    }

    public class TestLocatorFactory : DefaultLocatorFactory
    {
        public TestLocatorFactory(ISearchContext searchContext)
            :base(searchContext)
        {
        }

        public IElementLocator CreateElementLocator(MemberInfo member)
        {
            return new TestLocator(member, SearchContext, this);
        }
    }


}
