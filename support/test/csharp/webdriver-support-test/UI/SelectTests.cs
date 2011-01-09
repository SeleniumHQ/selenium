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
            new Select(webElement);
        }

        [Test]
        public void CanCreateNewInstanceOfSelectWithNormalSelectElement()
        {
            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value(null));
            
            Assert.IsFalse(new Select(webElement).Multiple);
        }

        [Test]
        public void CanCreateNewInstanceOfSelectWithMultipleSelectElement()
        {
            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value("multiple"));
            
            Assert.IsTrue(new Select(webElement).Multiple);  
        }

        [Test]
        public void CanGetListOfOptions()
        {
            IList<IWebElement> options = new List<IWebElement>();
            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value("multiple"));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));
            
            Assert.AreEqual(options, new Select(webElement).GetOptions());
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
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value("multiple"));
            Stub.On(selected).GetProperty("Selected").Will(Return.Value(true));
            Stub.On(notSelected).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));

            IWebElement option = new Select(webElement).GetSelected();
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
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value(null));
            Stub.On(selected).GetProperty("Selected").Will(Return.Value(true));
            Stub.On(notSelected).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));

            IList<IWebElement> returnedOption = new Select(webElement).GetAllSelectedOption();
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
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value(null));
            Expect.Once.On(option1).GetProperty("Text").Will(Return.Value("Select Me"));
            Expect.Once.On(option1).Method("Select");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new Select(webElement).SelectByText("Select Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetSingleOptionSelectedByValue()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value(null));
            Expect.Once.On(option1).GetProperty("Value").Will(Return.Value("Select Me"));
            Expect.Once.On(option1).Method("Select");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new Select(webElement).SelectByValue("Select Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanSetSingleOptionSelectedByIndex()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value(null));
            Expect.Once.On(option1).Method("GetAttribute").Will(Return.Value("2"));
            Expect.Once.On(option1).Method("Select");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new Select(webElement).SelectByIndex(2);
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
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value("multiple"));
            Expect.Once.On(option1).GetProperty("Text").Will(Return.Value("Select Me"));
            Expect.Once.On(option1).Method("Select");
            Expect.Once.On(option2).GetProperty("Text").Will(Return.Value("Select Me"));
            Expect.Once.On(option2).Method("Select");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new Select(webElement).SelectByText("Select Me");
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
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value("multiple"));
            Expect.Once.On(option1).GetProperty("Value").Will(Return.Value("Select Me"));
            Expect.Once.On(option1).Method("Select");
            Expect.Once.On(option2).GetProperty("Value").Will(Return.Value("Select Me"));
            Expect.Once.On(option2).Method("Select");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new Select(webElement).SelectByValue("Select Me");
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
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value("multiple"));
            Expect.Once.On(option1).Method("GetAttribute").Will(Return.Value("2"));
            Expect.Once.On(option1).Method("Select");
            Expect.Once.On(option2).Method("GetAttribute").Will(Return.Value("2"));
            Expect.Once.On(option2).Method("Select");
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new Select(webElement).SelectByIndex(2);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectSingleOptionSelectedByText()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value(null));
            Expect.Once.On(option1).GetProperty("Text").Will(Return.Value("Deselect Me"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option1).Method("Toggle").Will(Return.Value(true));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new Select(webElement).DeselectByText("Deselect Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectSingleOptionSelectedByValue()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value(null));
            Expect.Once.On(option1).GetProperty("Value").Will(Return.Value("Deselect Me"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option1).Method("Toggle").Will(Return.Value(true));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new Select(webElement).DeselectByValue("Deselect Me");
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void CanDeselectSingleOptionSelectedByIndex()
        {
            IWebElement option1 = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(option1 = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value(null));
            Expect.Once.On(option1).Method("GetAttribute").Will(Return.Value("2"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option1).Method("Toggle").Will(Return.Value(true));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new Select(webElement).DeselectByIndex(2);
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
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value("multiple"));
            Expect.Once.On(option1).GetProperty("Text").Will(Return.Value("Deselect Me"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option1).Method("Toggle").Will(Return.Value(true));
            Expect.Once.On(option2).GetProperty("Text").Will(Return.Value("Deselect Me"));
            Expect.Once.On(option2).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option2).Method("Toggle").Will(Return.Value(true));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new Select(webElement).DeselectByText("Deselect Me");
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
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value("multiple"));
            Expect.Once.On(option1).GetProperty("Value").Will(Return.Value("Deselect Me"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option1).Method("Toggle").Will(Return.Value(true));
            Expect.Once.On(option2).GetProperty("Value").Will(Return.Value("Deselect Me"));
            Expect.Once.On(option2).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option2).Method("Toggle").Will(Return.Value(true));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new Select(webElement).DeselectByValue("Deselect Me");
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
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value("multiple"));
            Expect.Once.On(option1).Method("GetAttribute").Will(Return.Value("2"));
            Expect.Once.On(option1).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option1).Method("Toggle").Will(Return.Value(true));
            Expect.Once.On(option2).Method("GetAttribute").Will(Return.Value("2"));
            Expect.Once.On(option2).GetProperty("Selected").Will(Return.Value(true));
            Expect.Once.On(option2).Method("Toggle").Will(Return.Value(true));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));


            new Select(webElement).DeselectByIndex(2);
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void ThrowNoSuchElementExceptionWhenNoOptionSelected()
        {
            IWebElement selected = mocks.NewMock<IWebElement>();
            IWebElement notSelected = mocks.NewMock<IWebElement>();
            IList<IWebElement> options = new List<IWebElement>();
            options.Add(notSelected = mocks.NewMock<IWebElement>());

            Stub.On(webElement).GetProperty("TagName").Will(Return.Value("select"));
            Stub.On(webElement).Method("GetAttribute").Will(Return.Value("multiple"));
            Stub.On(notSelected).GetProperty("Selected").Will(Return.Value(false));
            Expect.Once.On(webElement).Method("FindElements").Will(Return.Value(new ReadOnlyCollection<IWebElement>(options)));

            new Select(webElement).GetSelected();

        }

    }
}
