using System.Collections.Generic;
using System.Collections.ObjectModel;
using NMock;
using NUnit.Framework;
using System.Reflection;
using System;

namespace OpenQA.Selenium.Support.UI
{
    [TestFixture]
    public class SelectTests
    {
        private MockFactory mocks;
        private Mock<IWebElement> webElement;

        [SetUp]
        public void SetUp()
        {
            mocks = new MockFactory();
            webElement = mocks.CreateMock<IWebElement>();
        }

        [Test]
        public void ThrowUnexpectedTagNameExceptionWhenNotSelectTag()
        {
            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("form");
            Assert.Throws<UnexpectedTagNameException>(() => new SelectElement(webElement.MockObject));
        }

        [Test]
        public void CanCreateNewInstanceOfSelectWithNormalSelectElement()
        {
            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn(null);

            Assert.IsFalse(new SelectElement(webElement.MockObject).IsMultiple);
        }

        [Test]
        public void CanCreateNewInstanceOfSelectWithMultipleSelectElement()
        {
            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");

            Assert.IsTrue(new SelectElement(webElement.MockObject).IsMultiple);
        }

        [Test]
        public void CanGetListOfOptions()
        {
            IList<IWebElement> options = new List<IWebElement>();
            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));

            Assert.AreEqual(options, new SelectElement(webElement.MockObject).Options);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanGetSingleSelectedOption()
        {
            Mock<IWebElement> selected = mocks.CreateMock<IWebElement>();
            Mock<IWebElement> notSelected = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(notSelected.MockObject);
            options.Add(selected.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");
            notSelected.Expects.One.GetProperty<bool>(_ => _.Selected).WillReturn(false);
            selected.Expects.One.GetProperty<bool>(_ => _.Selected).WillReturn(true);
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));

            IWebElement option = new SelectElement(webElement.MockObject).SelectedOption;
            Assert.AreEqual(selected.MockObject, option);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanGetAllSelectedOptions()
        {
            Mock<IWebElement> selected = mocks.CreateMock<IWebElement>();
            Mock<IWebElement> notSelected = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(selected.MockObject);
            options.Add(notSelected.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");
            selected.Expects.One.GetProperty<bool>(_ => _.Selected).WillReturn(true);
            notSelected.Expects.One.GetProperty<bool>(_ => _.Selected).WillReturn(false);
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));

            IList<IWebElement> returnedOption = new SelectElement(webElement.MockObject).AllSelectedOptions;
            Assert.That(returnedOption.Count == 1);
            Assert.AreEqual(selected.MockObject, returnedOption[0]);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetSingleOptionSelectedByText()
        {
            Mock<IWebElement> option1 = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn(null);
            option1.Expects.One.GetProperty(_ => _.Selected).WillReturn(false);
            option1.Expects.One.Method(_ => _.Click());
            webElement.Expects.One.Method(_ => _.FindElements(null)).With(By.XPath(".//option[normalize-space(.) = \"Select Me\"]")).WillReturn(new ReadOnlyCollection<IWebElement>(options));


            new SelectElement(webElement.MockObject).SelectByText("Select Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetSingleOptionSelectedByValue()
        {
            Mock<IWebElement> option1 = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1.MockObject);


            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn(null);
            option1.Expects.One.GetProperty(_ => _.Selected).WillReturn(false);
            option1.Expects.One.Method(_ => _.Click());
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));

            new SelectElement(webElement.MockObject).SelectByValue("Select Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetSingleOptionSelectedByIndex()
        {
            Mock<IWebElement> option1 = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn(null);
            option1.Expects.One.Method(_ => _.GetAttribute(null)).WithAnyArguments().WillReturn("2");
            option1.Expects.One.GetProperty(_ => _.Selected).WillReturn(false);
            option1.Expects.One.Method(_ => _.Click());
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));

            new SelectElement(webElement.MockObject).SelectByIndex(2);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetMultipleOptionSelectedByText()
        {
            Mock<IWebElement> option1 = mocks.CreateMock<IWebElement>();
            Mock<IWebElement> option2 = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1.MockObject);
            options.Add(option2.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");
            option1.Expects.One.GetProperty(_ => _.Selected).WillReturn(false);
            option1.Expects.One.Method(_ => _.Click());
            option2.Expects.One.GetProperty(_ => _.Selected).WillReturn(false);
            option2.Expects.One.Method(_ => _.Click());
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));

            new SelectElement(webElement.MockObject).SelectByText("Select Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetMultipleOptionSelectedByValue()
        {
            Mock<IWebElement> option1 = mocks.CreateMock<IWebElement>();
            Mock<IWebElement> option2 = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1.MockObject);
            options.Add(option2.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");
            option1.Expects.One.GetProperty(_ => _.Selected).WillReturn(false);
            option1.Expects.One.Method(_ => _.Click());
            option2.Expects.One.GetProperty(_ => _.Selected).WillReturn(false);
            option2.Expects.One.Method(_ => _.Click());
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));

            new SelectElement(webElement.MockObject).SelectByValue("Select Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetMultipleOptionSelectedByIndex()
        {
            Mock<IWebElement> option1 = mocks.CreateMock<IWebElement>();
            Mock<IWebElement> option2 = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1.MockObject);
            options.Add(option2.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");
            option1.Expects.One.Method(_ => _.GetAttribute(null)).WithAnyArguments().WillReturn("2");
            option1.Expects.One.GetProperty(_ => _.Selected).WillReturn(false);
            option1.Expects.One.Method(_ => _.Click());
            option2.Expects.One.Method(_ => _.GetAttribute(null)).WithAnyArguments().WillReturn("2");
            option2.Expects.One.GetProperty(_ => _.Selected).WillReturn(false);
            option2.Expects.One.Method(_ => _.Click());
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));


            new SelectElement(webElement.MockObject).SelectByIndex(2);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectSingleOptionSelectedByText()
        {
            Mock<IWebElement> option1 = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");
            option1.Expects.One.GetProperty(_ => _.Selected).WillReturn(true);
            option1.Expects.One.Method(_ => _.Click());
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));


            new SelectElement(webElement.MockObject).DeselectByText("Deselect Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectSingleOptionSelectedByValue()
        {
            Mock<IWebElement> option1 = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");
            option1.Expects.One.GetProperty(_ => _.Selected).WillReturn(true);
            option1.Expects.One.Method(_ => _.Click());
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));

            new SelectElement(webElement.MockObject).DeselectByValue("Deselect Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectSingleOptionSelectedByIndex()
        {
            Mock<IWebElement> option1 = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");
            option1.Expects.One.Method(_ => _.GetAttribute(null)).WithAnyArguments().WillReturn("2");
            option1.Expects.One.GetProperty(_ => _.Selected).WillReturn(true);
            option1.Expects.One.Method(_ => _.Click());
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));

            new SelectElement(webElement.MockObject).DeselectByIndex(2);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectMultipleOptionSelectedByText()
        {
            Mock<IWebElement> option1 = mocks.CreateMock<IWebElement>();
            Mock<IWebElement> option2 = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1.MockObject);
            options.Add(option2.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");
            option1.Expects.One.GetProperty(_ => _.Selected).WillReturn(true);
            option1.Expects.One.Method(_ => _.Click());
            option2.Expects.One.GetProperty(_ => _.Selected).WillReturn(true);
            option2.Expects.One.Method(_ => _.Click());
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));


            new SelectElement(webElement.MockObject).DeselectByText("Deselect Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectMultipleOptionSelectedByValue()
        {
            Mock<IWebElement> option1 = mocks.CreateMock<IWebElement>();
            Mock<IWebElement> option2 = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1.MockObject);
            options.Add(option2.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");
            option1.Expects.One.GetProperty(_ => _.Selected).WillReturn(true);
            option1.Expects.One.Method(_ => _.Click());
            option2.Expects.One.GetProperty(_ => _.Selected).WillReturn(true);
            option2.Expects.One.Method(_ => _.Click());
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));

            new SelectElement(webElement.MockObject).DeselectByValue("Deselect Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectMultipleOptionSelectedByIndex()
        {
            Mock<IWebElement> option1 = mocks.CreateMock<IWebElement>();
            Mock<IWebElement> option2 = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1.MockObject);
            options.Add(option2.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");
            option1.Expects.One.Method(_ => _.GetAttribute(null)).WithAnyArguments().WillReturn("2");
            option1.Expects.One.GetProperty(_ => _.Selected).WillReturn(true);
            option1.Expects.One.Method(_ => _.Click());
            option2.Expects.One.Method(_ => _.GetAttribute(null)).WithAnyArguments().WillReturn("2");
            option2.Expects.One.GetProperty(_ => _.Selected).WillReturn(true);
            option2.Expects.One.Method(_ => _.Click());
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));

            new SelectElement(webElement.MockObject).DeselectByIndex(2);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void SelectedOptionPropertyShouldThrowExceptionWhenNoOptionSelected()
        {
            Mock<IWebElement> selected = mocks.CreateMock<IWebElement>();
            Mock<IWebElement> notSelected = mocks.CreateMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(notSelected.MockObject);

            webElement.Expects.Any.GetProperty<string>(_ => _.TagName).WillReturn("select");
            webElement.Expects.Any.Method(_ => _.GetAttribute(null)).With("multiple").WillReturn("true");
            notSelected.Expects.One.GetProperty(_ => _.Selected).WillReturn(false);
            webElement.Expects.One.Method(_ => _.FindElements(null)).WithAnyArguments().WillReturn(new ReadOnlyCollection<IWebElement>(options));

            SelectElement element = new SelectElement(webElement.MockObject);
            Assert.Throws<NoSuchElementException>(() => { IWebElement selectedOption = element.SelectedOption; });
        }

        [Test]
        public void ShouldConvertAnUnquotedStringIntoOneWithQuotes()
        {
            string result = EscapeQuotes("foo");

            Assert.AreEqual("\"foo\"", result);
        }

        [Test]
        public void ShouldConvertAStringWithATickIntoOneWithQuotes()
        {
            string result = EscapeQuotes("f'oo");

            Assert.AreEqual("\"f'oo\"", result);
        }

        [Test]
        public void ShouldConvertAStringWithAQuotIntoOneWithTicks()
        {
            string result = EscapeQuotes("f\"oo");

            Assert.AreEqual("'f\"oo'", result);
        }

        [Test]
        public void ShouldProvideConcatenatedStringsWhenStringToEscapeContainsTicksAndQuotes()
        {
            string result = EscapeQuotes("f\"o'o");

            Assert.AreEqual("concat(\"f\", '\"', \"o'o\")", result);
        }

        /**
         * Tests that escapeQuotes returns concatenated strings when the given
         * string contains a tick and and ends with a quote.
         */
        [Test]
        public void ShouldProvideConcatenatedStringsWhenStringEndsWithQuote()
        {
            string result = EscapeQuotes("Bar \"Rock'n'Roll\"");

            Assert.AreEqual("concat(\"Bar \", '\"', \"Rock'n'Roll\", '\"')", result);
        }

        private string EscapeQuotes(string toEscape)
        {
            Type selectElementType = typeof(SelectElement);
            MethodInfo escapeQuotesMethod = selectElementType.GetMethod("EscapeQuotes", BindingFlags.Static | BindingFlags.NonPublic);
            string result = escapeQuotesMethod.Invoke(null, new object[] { toEscape }).ToString();
            return result;
        }
    }
}
