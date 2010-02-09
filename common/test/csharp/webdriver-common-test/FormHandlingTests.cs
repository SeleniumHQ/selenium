using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class FormHandlingTests : DriverTestFixture
    {
        [Test]
        public void ShouldClickOnSubmitInputElements()
        {
            driver.Url = formsPage;
            driver.FindElement(By.Id("submitButton")).Click();
            //TODO (jimevan): this is an ugly sleep. Remove when implicit waiting is implemented.
            System.Threading.Thread.Sleep(500);
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ClickingOnUnclickableElementsDoesNothing()
        {
            driver.Url = formsPage;
            driver.FindElement(By.XPath("//body")).Click();
        }

        [Test]
        public void ShouldBeAbleToClickImageButtons()
        {
            driver.Url = formsPage;
            driver.FindElement(By.Id("imageButton")).Click();
            //TODO (jimevan): this is an ugly sleep. Remove when implicit waiting is implemented.
            System.Threading.Thread.Sleep(500);
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldBeAbleToSubmitForms()
        {
            driver.Url = formsPage;
            driver.FindElement(By.Name("login")).Submit();
            //TODO (jimevan): this is an ugly sleep. Remove when implicit waiting is implemented.
            System.Threading.Thread.Sleep(500);
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldSubmitAFormWhenAnyInputElementWithinThatFormIsSubmitted()
        {
            driver.Url = formsPage;
            driver.FindElement(By.Id("checky")).Submit();
            //TODO (jimevan): this is an ugly sleep. Remove when implicit waiting is implemented.
            System.Threading.Thread.Sleep(500);
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldSubmitAFormWhenAnyElementWihinThatFormIsSubmitted()
        {
            driver.Url = formsPage;
            driver.FindElement(By.XPath("//form/p")).Submit();
            //TODO (jimevan): this is an ugly sleep. Remove when implicit waiting is implemented.
            System.Threading.Thread.Sleep(500);
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void ShouldNotBeAbleToSubmitAFormThatDoesNotExist()
        {
            driver.Url = formsPage;
            driver.FindElement(By.Name("there is no spoon")).Submit();
        }

        [Test]
        public void ShouldBeAbleToEnterTextIntoATextAreaBySettingItsValue()
        {
            driver.Url = javascriptPage;
            IWebElement textarea = driver.FindElement(By.Id("keyUpArea"));
            String cheesey = "Brie and cheddar";
            textarea.SendKeys(cheesey);
            Assert.AreEqual(textarea.Value, cheesey);
        }

        [Test]
        [IgnoreBrowser(Browser.ChromeNonWindows)]
        public void ShouldSubmitAFormUsingTheNewlineLiteral()
        {
            driver.Url = formsPage;
            IWebElement nestedForm = driver.FindElement(By.Id("nested_form"));
            IWebElement input = nestedForm.FindElement(By.Name("x"));
            input.SendKeys("\n");
            //TODO (jimevan): this is an ugly sleep. Remove when implicit waiting is implemented.
            System.Threading.Thread.Sleep(500);
            Assert.AreEqual("We Arrive Here", driver.Title);
            Assert.IsTrue(driver.Url.EndsWith("?x=name"));
        }

        [Test]
        [IgnoreBrowser(Browser.ChromeNonWindows)]
        public void ShouldSubmitAFormUsingTheEnterKey()
        {
            driver.Url = formsPage;
            IWebElement nestedForm = driver.FindElement(By.Id("nested_form"));
            IWebElement input = nestedForm.FindElement(By.Name("x"));
            input.SendKeys(Keys.Enter);
            //TODO (jimevan): this is an ugly sleep. Remove when implicit waiting is implemented.
            System.Threading.Thread.Sleep(500);
            Assert.AreEqual("We Arrive Here", driver.Title);
            Assert.IsTrue(driver.Url.EndsWith("?x=name"));
        }

        [Test]
        public void ShouldEnterDataIntoFormFields()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.XPath("//form[@name='someForm']/input[@id='username']"));
            String originalValue = element.Value;
            Assert.AreEqual(originalValue, "change");

            element.Clear();
            element.SendKeys("some text");

            element = driver.FindElement(By.XPath("//form[@name='someForm']/input[@id='username']"));
            String newFormValue = element.Value;
            Assert.AreEqual(newFormValue, "some text");
        }

        [Test]
        public void ShouldBeAbleToSelectACheckBox()
        {
            driver.Url = formsPage;
            IWebElement checkbox = driver.FindElement(By.Id("checky"));
            Assert.AreEqual(checkbox.Selected, false);
            checkbox.Select();
            Assert.AreEqual(checkbox.Selected, true);
            checkbox.Select();
            Assert.AreEqual(checkbox.Selected, true);
        }

        [Test]
        public void ShouldToggleTheCheckedStateOfACheckbox()
        {
            driver.Url = formsPage;
            IWebElement checkbox = driver.FindElement(By.Id("checky"));
            Assert.AreEqual(checkbox.Selected, false);
            checkbox.Toggle();
            Assert.AreEqual(checkbox.Selected, true);
            checkbox.Toggle();
            Assert.AreEqual(checkbox.Selected, false);
        }

        [Test]
        public void TogglingACheckboxShouldReturnItsCurrentState()
        {
            driver.Url = formsPage;
            IWebElement checkbox = driver.FindElement(By.Id("checky"));
            Assert.AreEqual(checkbox.Selected, false);
            bool isChecked = checkbox.Toggle();
            Assert.AreEqual(isChecked, true);
            isChecked = checkbox.Toggle();
            Assert.AreEqual(isChecked, false);
        }

        [Test]
        [ExpectedException(typeof(NotSupportedException))]
        public void ShouldNotBeAbleToSelectSomethingThatIsDisabled()
        {
            driver.Url = formsPage;
            IWebElement radioButton = driver.FindElement(By.Id("nothing"));
            Assert.AreEqual(radioButton.Enabled, false);
            radioButton.Select();
        }

        [Test]
        public void ShouldBeAbleToSelectARadioButton()
        {
            driver.Url = formsPage;
            IWebElement radioButton = driver.FindElement(By.Id("peas"));
            Assert.AreEqual(radioButton.Selected, false);
            radioButton.Select();
            Assert.AreEqual(radioButton.Selected, true);
        }

        [Test]
        public void ShouldBeAbleToSelectARadioButtonByClickingOnIt()
        {
            driver.Url = formsPage;
            IWebElement radioButton = driver.FindElement(By.Id("peas"));
            Assert.AreEqual(radioButton.Selected, false);
            radioButton.Click();
            Assert.AreEqual(radioButton.Selected, true);
        }

        [Test]
        public void ShouldReturnStateOfRadioButtonsBeforeInteration()
        {
            driver.Url = formsPage;
            IWebElement radioButton = driver.FindElement(By.Id("cheese_and_peas"));
            Assert.AreEqual(radioButton.Selected, true);

            radioButton = driver.FindElement(By.Id("cheese"));
            Assert.AreEqual(radioButton.Selected, false);
        }

        [Test]
        [ExpectedException(typeof(NotImplementedException))]
        public void ShouldThrowAnExceptionWhenTogglingTheStateOfARadioButton()
        {
            driver.Url = formsPage;
            IWebElement radioButton = driver.FindElement(By.Id("cheese"));
            radioButton.Toggle();
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE allows toggling of an option not in a multiselect")]
        [ExpectedException(typeof(NotImplementedException))]
        public void TogglingAnOptionShouldThrowAnExceptionIfTheOptionIsNotInAMultiSelect()
        {
            driver.Url = formsPage;

            IWebElement select = driver.FindElement(By.Name("selectomatic"));
            IWebElement option = select.FindElements(By.TagName("option"))[0];
            option.Toggle();
        }

        [Test]
        public void TogglingAnOptionShouldToggleOptionsInAMultiSelect()
        {
            driver.Url = formsPage;

            IWebElement select = driver.FindElement(By.Name("multi"));
            IWebElement option = select.FindElements(By.TagName("option"))[0];

            bool selected = option.Selected;
            bool current = option.Toggle();
            Assert.IsFalse(selected == current);

            current = option.Toggle();
            Assert.IsTrue(selected == current);
        }


        [Test]
        [IgnoreBrowser(Browser.Chrome, "ChromeDriver does not yet support file uploads")]
        public void ShouldBeAbleToAlterTheContentsOfAFileUploadInputElement()
        {
            driver.Url = formsPage;
            IWebElement uploadElement = driver.FindElement(By.Id("upload"));
            Assert.IsTrue(string.IsNullOrEmpty(uploadElement.Value));

            System.IO.FileInfo inputFile = new System.IO.FileInfo("test.txt");
            System.IO.StreamWriter inputFileWriter = inputFile.CreateText();
            inputFileWriter.WriteLine("Hello world");
            inputFileWriter.Close();

            uploadElement.SendKeys(inputFile.FullName);

            System.IO.FileInfo outputFile = new System.IO.FileInfo(uploadElement.Value);
            Assert.AreEqual(inputFile.FullName, outputFile.FullName);
            inputFile.Delete();
        }

        [Test]
        [ExpectedException(typeof(NotSupportedException))]
        public void ShouldThrowAnExceptionWhenSelectingAnUnselectableElement()
        {
            driver.Url = formsPage;

            IWebElement element = driver.FindElement(By.XPath("//title"));
            element.Select();
        }

        [Test]
        public void SendingKeyboardEventsShouldAppendTextInInputs()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("working"));
            element.SendKeys("Some");
            String value = element.Value;
            Assert.AreEqual(value, "Some");

            element.SendKeys(" text");
            value = element.Value;
            Assert.AreEqual(value, "Some text");
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Not implemented going to the end of the line first")]
        [IgnoreBrowser(Browser.HtmlUnit, "Not implemented going to the end of the line first")]
        [IgnoreBrowser(Browser.Chrome, "Not implemented going to the end of the line first")]
        public void SendingKeyboardEventsShouldAppendTextinTextAreas()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("withText"));

            element.SendKeys(". Some text");
            String value = element.Value;

            Assert.AreEqual(value, "Example text. Some text");
        }

        [Test]
        public void ShouldBeAbleToClearTextFromInputElements()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("working"));
            element.SendKeys("Some text");
            String value = element.Value;
            Assert.IsTrue(value.Length > 0);

            element.Clear();
            value = element.Value;

            Assert.AreEqual(value.Length, 0);
        }

        [Test]
        public void EmptyTextBoxesShouldReturnAnEmptyStringNotNull()
        {
            driver.Url = formsPage;
            IWebElement emptyTextBox = driver.FindElement(By.Id("working"));
            Assert.AreEqual(emptyTextBox.Value, "");

            IWebElement emptyTextArea = driver.FindElement(By.Id("emptyTextArea"));
            Assert.AreEqual(emptyTextBox.Value, "");
        }

        [Test]
        public void ShouldBeAbleToClearTextFromTextAreas()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("withText"));
            element.SendKeys("Some text");
            String value = element.Value;
            Assert.IsTrue(value.Length > 0);

            element.Clear();
            value = element.Value;

            Assert.AreEqual(value.Length, 0);
        }
    }
}
