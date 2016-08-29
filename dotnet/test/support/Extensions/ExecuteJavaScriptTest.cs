using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;

using NMock2;

using NUnit.Framework;

namespace OpenQA.Selenium.Support.Extensions
{
    public interface IJavaScriptExecutingWebDriver : IWebDriver, IJavaScriptExecutor
    {
    }

    public class SubClassOfReadOnlyCollectionOfObject : ReadOnlyCollection<object>
    {
        public SubClassOfReadOnlyCollectionOfObject(IList<object> list) : base(list)
        {
        }
    }

    [TestFixture]
    public class ExecuteJavaScriptTest
    {
        private const string JavaScript = "Hello, World";
        private static readonly object[] JavaScriptParameters = new object[0];

        private Mockery mocks;
        private IJavaScriptExecutingWebDriver driver;

        [SetUp]
        public void TestSetUp()
        {
            mocks = new Mockery();

            driver = mocks.NewMock<IJavaScriptExecutingWebDriver>();
        }

        [Test]
        public void ShouldConvertToIEnumerable()
        {
            var expected = new ReadOnlyCollection<object>(new List<object>());

            Expect.Once.On(driver)
                .Method("ExecuteScript")
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(expected));

            Assert.That(() => driver.ExecuteJavaScript<IEnumerable>(JavaScript, JavaScriptParameters), Throws.Nothing);
        }

        [Test]
        public void ShouldConvertToIEnumerableOfObject()
        {
            var expected = new ReadOnlyCollection<object>(new List<object>());

            Expect.Once.On(driver)
                .Method("ExecuteScript")
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(expected));

            Assert.That(() => driver.ExecuteJavaScript<IEnumerable<object>>(JavaScript, JavaScriptParameters), Throws.Nothing);
        }

        [Test]
        public void ShouldNotConvertToIEnumerableOfInteger()
        {
            var expected = new ReadOnlyCollection<object>(new List<object>());

            Expect.Once.On(driver)
                .Method("ExecuteScript")
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(expected));

            Assert.That(() => driver.ExecuteJavaScript<IEnumerable<int>>(JavaScript, JavaScriptParameters), Throws.InstanceOf<WebDriverException>());
        }

        [Test]
        public void ShouldConvertToReadOnlyCollectionOfObject()
        {
            var expected = new ReadOnlyCollection<object>(new List<object>());

            Expect.Once.On(driver)
                .Method("ExecuteScript")
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(expected));

            Assert.That(() => driver.ExecuteJavaScript<ReadOnlyCollection<object>>(JavaScript, JavaScriptParameters), Throws.Nothing);
        }

        [Test]
        public void ShouldNotConvertToSubClassOfReadOnlyCollectionOfObject()
        {
            var expected = new ReadOnlyCollection<object>(new List<object>());

            Expect.Once.On(driver)
                .Method("ExecuteScript")
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(expected));

            Assert.That(() => driver.ExecuteJavaScript<SubClassOfReadOnlyCollectionOfObject>(JavaScript, JavaScriptParameters), Throws.InstanceOf<WebDriverException>());
        }

        [Test]
        public void ShouldNotThrowWhenNullIsReturned()
        {
            Expect.Once.On(driver)
                .Method("ExecuteScript")
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(null));

            Assert.That(() => driver.ExecuteJavaScript<string>(JavaScript, JavaScriptParameters), Throws.Nothing);
        }

        [Test]
        public void ShouldNotThrowWhenNullIsReturnedForNullableValueType()
        {
            Expect.Once.On(driver)
                .Method("ExecuteScript")
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(null));

            Assert.That(() => driver.ExecuteJavaScript<int?>(JavaScript, JavaScriptParameters), Throws.Nothing);
        }

        [Test]
        public void ShouldThrowWhenNullIsReturnedForValueType()
        {
            Expect.Once.On(driver)
                .Method("ExecuteScript")
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(null));

            Assert.That(() => driver.ExecuteJavaScript<int>(JavaScript, JavaScriptParameters), Throws.InstanceOf<WebDriverException>());
        }

        [Test]
        public void ShouldAllowExecutingJavaScriptWithoutReturningResult()
        {
            Expect.Once.On(driver)
                .Method("ExecuteScript")
                .With(JavaScript, JavaScriptParameters);

            Assert.That(() => driver.ExecuteJavaScript(JavaScript, JavaScriptParameters), Throws.Nothing);
        }
    }
}
