using System.Collections.Generic;
using System.Collections.ObjectModel;
using NMock2;
using NUnit.Framework;

namespace OpenQA.Selenium.Support.UI
{
    [TestFixture]
    public class SelectTests
    {
        private Mockery mocks;
        private IWebElement webElement;

        [SetUp]
        public void SetUp()
        {
            mocks = new Mockery();
            webElement = mocks.NewMock<IWebElement>();
        }
        
        [Test]
        [ExpectedException(typeof(UnexpectedTagNameException))]
        public void ThrowUnexpectedTagNameExceptionWhenNotSelectTag()
        {
            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("form"));
            new SelectElement(webElement);
        }

        [Test]
        public void CanCreateNewInstanceOfSelectWithNormalSelectElement()
        {
            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value(null));
            
            Assert.IsFalse(new SelectElement(webElement).IsMultiple);
        }

        [Test]
        public void CanCreateNewInstanceOfSelectWithMultipleSelectElement()
        {
            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value("true"));
            
            Assert.IsTrue(new SelectElement(webElement).IsMultiple);  
        }

        [Test]
        public void CanGetListOfOptions()
        {
            IList<IWebElement> options = new List<IWebElement>();
            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value("true"));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));
            
            Assert.AreEqual(options, new SelectElement(webElement).Options);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanGetSingleSelectedOption()
        {
            IWebElement selected = mocks.NewMock<IWebElement>();
            IWebElement notSelected = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(selected = mocks.NewMock<IWebElement>());
            options.Add(notSelected = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value("true"));
            Stub.On(selected).GetProperty("Selected").Will(Return.Value(true));
            Stub.On(notSelected).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));

            IWebElement option = new SelectElement(webElement).SelectedOption;
            Assert.AreEqual(selected, option);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanGetAllSelectedOptions()
        {
            IWebElement selected = mocks.NewMock<IWebElement>();
            IWebElement notSelected = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(selected = mocks.NewMock<IWebElement>());
            options.Add(notSelected = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value(null));
            Stub.On(selected).GetProperty("Selected").Will(Return.Value(true));
            Stub.On(notSelected).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));

            IList<IWebElement> returnedOption = new SelectElement(webElement).AllSelectedOptions;
            Assert.That(returnedOption.Count == 1);
            Assert.AreEqual(selected, returnedOption[0]);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetSingleOptionSelectedByText()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value(null));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(option1).Method("Click");
            Expect.Once.On(webElement).Method("FindElements").With(By.XPath(".//option[normalize-space(.) = \"Select Me\"]")).Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new SelectElement(webElement).SelectByText("Select Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetSingleOptionSelectedByValue()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value(null));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(option1).Method("Click");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new SelectElement(webElement).SelectByValue("Select Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetSingleOptionSelectedByIndex()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value(null));
            Expect.Once.On(option1).Method("GetAttribute").Will(Return.Value("2"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(option1).Method("Click");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new SelectElement(webElement).SelectByIndex(2);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetMultipleOptionSelectedByText()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IWebElement option2 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());
            options.Add(option2 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value("true"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(option1).Method("Click");
            Expect.Once.On(option2).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(option2).Method("Click");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new SelectElement(webElement).SelectByText("Select Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetMultipleOptionSelectedByValue()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IWebElement option2 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());
            options.Add(option2 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value("true"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(option1).Method("Click");
            Expect.Once.On(option2).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(option2).Method("Click");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new SelectElement(webElement).SelectByValue("Select Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetMultipleOptionSelectedByIndex()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IWebElement option2 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());
            options.Add(option2 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value("true"));
            Expect.Once.On(option1).Method("GetAttribute").Will(Return.Value("2"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(option1).Method("Click");
            Expect.Once.On(option2).Method("GetAttribute").Will(Return.Value("2"));
            Expect.Once.On(option2).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(option2).Method("Click");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new SelectElement(webElement).SelectByIndex(2);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectSingleOptionSelectedByText()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value(null));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option1).Method("Click");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new SelectElement(webElement).DeselectByText("Deselect Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectSingleOptionSelectedByValue()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value(null));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option1).Method("Click");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new SelectElement(webElement).DeselectByValue("Deselect Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectSingleOptionSelectedByIndex()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value(null));
            Expect.Once.On(option1).Method("GetAttribute").Will(Return.Value("2"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option1).Method("Click");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new SelectElement(webElement).DeselectByIndex(2);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectMultipleOptionSelectedByText()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IWebElement option2 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());
            options.Add(option2 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value("true"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option1).Method("Click");
            Expect.Once.On(option2).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option2).Method("Click");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new SelectElement(webElement).DeselectByText("Deselect Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectMultipleOptionSelectedByValue()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IWebElement option2 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());
            options.Add(option2 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value("true"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option1).Method("Click");
            Expect.Once.On(option2).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option2).Method("Click");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new SelectElement(webElement).DeselectByValue("Deselect Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectMultipleOptionSelectedByIndex()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IWebElement option2 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());
            options.Add(option2 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value("true"));
            Expect.Once.On(option1).Method("GetAttribute").Will(Return.Value("2"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option1).Method("Click");
            Expect.Once.On(option2).Method("GetAttribute").Will(Return.Value("2"));
            Expect.Once.On(option2).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option2).Method("Click");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new SelectElement(webElement).DeselectByIndex(2);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void SelectedOptionPropertyShouldThrowExceptionWhenNoOptionSelected()
        {
            IWebElement selected = mocks.NewMock<IWebElement>();
            IWebElement notSelected = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(notSelected = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").With("multiple").Will(Return.Value("true"));
            Stub.On(notSelected).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));

            SelectElement element = new SelectElement(webElement);
            IWebElement selectedOption = element.SelectedOption;
        }
    }
}
