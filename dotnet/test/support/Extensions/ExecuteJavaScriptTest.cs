using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;

using NMock;

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

        private MockFactory mocks;
        private Mock<IJavaScriptExecutingWebDriver> driver;

        [SetUp]
        public void TestSetUp()
        {
            mocks = new MockFactory();

            driver = mocks.CreateMock<IJavaScriptExecutingWebDriver>();
        }

        [Test]
        public void ShouldConvertToIEnumerable()
        {
            var expected = new ReadOnlyCollection<object>(new List<object>());

            driver.Expects.One
                .Method(_ => _.ExecuteScript(null, null))
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(expected));

            Assert.That(() => driver.MockObject.ExecuteJavaScript<IEnumerable>(JavaScript, JavaScriptParameters), Throws.Nothing);
        }

        [Test]
        public void ShouldConvertToIEnumerableOfObject()
        {
            var expected = new ReadOnlyCollection<object>(new List<object>());

            driver.Expects.One
                .Method(_ => _.ExecuteScript(null, null))
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(expected));

            Assert.That(() => driver.MockObject.ExecuteJavaScript<IEnumerable<object>>(JavaScript, JavaScriptParameters), Throws.Nothing);
        }

        [Test]
        public void ShouldNotConvertToIEnumerableOfInteger()
        {
            var expected = new ReadOnlyCollection<object>(new List<object>());

            driver.Expects.One
                .Method(_ => _.ExecuteScript(null, null))
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(expected));

            Assert.That(() => driver.MockObject.ExecuteJavaScript<IEnumerable<int>>(JavaScript, JavaScriptParameters), Throws.InstanceOf<WebDriverException>());
        }

        [Test]
        public void ShouldConvertToReadOnlyCollectionOfObject()
        {
            var expected = new ReadOnlyCollection<object>(new List<object>());

            driver.Expects.One
                .Method(_ => _.ExecuteScript(null, null))
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(expected));

            Assert.That(() => driver.MockObject.ExecuteJavaScript<ReadOnlyCollection<object>>(JavaScript, JavaScriptParameters), Throws.Nothing);
        }

        [Test]
        public void ShouldNotConvertToSubClassOfReadOnlyCollectionOfObject()
        {
            var expected = new ReadOnlyCollection<object>(new List<object>());

            driver.Expects.One
                .Method(_ => _.ExecuteScript(null, null))
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(expected));

            Assert.That(() => driver.MockObject.ExecuteJavaScript<SubClassOfReadOnlyCollectionOfObject>(JavaScript, JavaScriptParameters), Throws.InstanceOf<WebDriverException>());
        }

        [Test]
        public void ShouldNotThrowWhenNullIsReturned()
        {
            driver.Expects.One
                .Method(_ => _.ExecuteScript(null, null))
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(null));

            Assert.That(() => driver.MockObject.ExecuteJavaScript<string>(JavaScript, JavaScriptParameters), Throws.Nothing);
        }

        [Test]
        public void ShouldNotThrowWhenNullIsReturnedForNullableValueType()
        {
            driver.Expects.One
                .Method(_ => _.ExecuteScript(null, null))
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(null));

            Assert.That(() => driver.MockObject.ExecuteJavaScript<int?>(JavaScript, JavaScriptParameters), Throws.Nothing);
        }

        [Test]
        public void ShouldThrowWhenNullIsReturnedForValueType()
        {
            driver.Expects.One
                .Method(_ => _.ExecuteScript(null, null))
                .With(JavaScript, JavaScriptParameters)
                .Will(Return.Value(null));

            Assert.That(() => driver.MockObject.ExecuteJavaScript<int>(JavaScript, JavaScriptParameters), Throws.InstanceOf<WebDriverException>());
        }

        [Test]
        public void ShouldAllowExecutingJavaScriptWithoutReturningResult()
        {
            driver.Expects.One
                .Method(_ => _.ExecuteScript(null, null))
                .With(JavaScript, JavaScriptParameters)
                .WillReturn(null);

            Assert.That(() => driver.MockObject.ExecuteJavaScript(JavaScript, JavaScriptParameters), Throws.Nothing);
        }
    }
}
