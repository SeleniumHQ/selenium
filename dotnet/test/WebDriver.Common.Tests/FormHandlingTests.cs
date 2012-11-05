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
            WaitFor(TitleToBe("We Arrive Here"));
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
            WaitFor(TitleToBe("We Arrive Here"));
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldBeAbleToSubmitForms()
        {
            driver.Url = formsPage;
            driver.FindElement(By.Name("login")).Submit();
            WaitFor(TitleToBe("We Arrive Here"));
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldSubmitAFormWhenAnyInputElementWithinThatFormIsSubmitted()
        {
            driver.Url = formsPage;
            driver.FindElement(By.Id("checky")).Submit();
            WaitFor(TitleToBe("We Arrive Here"));
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldSubmitAFormWhenAnyElementWithinThatFormIsSubmitted()
        {
            driver.Url = formsPage;
            driver.FindElement(By.XPath("//form/p")).Submit();
            WaitFor(TitleToBe("We Arrive Here"));
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
            Assert.AreEqual(textarea.GetAttribute("value"), cheesey);
        }

        [Test]
        public void ShouldSubmitAFormUsingTheNewlineLiteral()
        {
            driver.Url = formsPage;
            IWebElement nestedForm = driver.FindElement(By.Id("nested_form"));
            IWebElement input = nestedForm.FindElement(By.Name("x"));
            input.SendKeys("\n");

            WaitFor(TitleToBe("We Arrive Here"));
            Assert.AreEqual("We Arrive Here", driver.Title);
            Assert.IsTrue(driver.Url.EndsWith("?x=name"));
        }

        [Test]
        public void ShouldSubmitAFormUsingTheEnterKey()
        {
            driver.Url = formsPage;
            IWebElement nestedForm = driver.FindElement(By.Id("nested_form"));
            IWebElement input = nestedForm.FindElement(By.Name("x"));
            input.SendKeys(Keys.Enter);

            WaitFor(TitleToBe("We Arrive Here"));
            Assert.AreEqual("We Arrive Here", driver.Title);
            Assert.IsTrue(driver.Url.EndsWith("?x=name"));
        }

        [Test]
        public void ShouldEnterDataIntoFormFields()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.XPath("//form[@name='someForm']/input[@id='username']"));
            String originalValue = element.GetAttribute("value");
            Assert.AreEqual(originalValue, "change");

            element.Clear();
            element.SendKeys("some text");

            element = driver.FindElement(By.XPath("//form[@name='someForm']/input[@id='username']"));
            String newFormValue = element.GetAttribute("value");
            Assert.AreEqual(newFormValue, "some text");
        }

        [Test]
        public void ShouldBeAbleToAlterTheContentsOfAFileUploadInputElement()
        {
            driver.Url = formsPage;
            IWebElement uploadElement = driver.FindElement(By.Id("upload"));
            Assert.IsTrue(string.IsNullOrEmpty(uploadElement.GetAttribute("value")));

            System.IO.FileInfo inputFile = new System.IO.FileInfo("test.txt");
            System.IO.StreamWriter inputFileWriter = inputFile.CreateText();
            inputFileWriter.WriteLine("Hello world");
            inputFileWriter.Close();

            uploadElement.SendKeys(inputFile.FullName);

            System.IO.FileInfo outputFile = new System.IO.FileInfo(uploadElement.GetAttribute("value"));
            Assert.AreEqual(inputFile.Name, outputFile.Name);
            inputFile.Delete();
        }

        [Test]
        public void ShouldBeAbleToUploadTheSameFileTwice()
        {
            System.IO.FileInfo inputFile = new System.IO.FileInfo("test.txt");
            System.IO.StreamWriter inputFileWriter = inputFile.CreateText();
            inputFileWriter.WriteLine("Hello world");
            inputFileWriter.Close();

            driver.Url = formsPage;
            IWebElement uploadElement = driver.FindElement(By.Id("upload"));
            Assert.IsTrue(string.IsNullOrEmpty(uploadElement.GetAttribute("value")));

            uploadElement.SendKeys(inputFile.FullName);
            uploadElement.Submit();

            driver.Url = formsPage;
            uploadElement = driver.FindElement(By.Id("upload"));
            Assert.IsTrue(string.IsNullOrEmpty(uploadElement.GetAttribute("value")));

            uploadElement.SendKeys(inputFile.FullName);
            uploadElement.Submit();
            // If we get this far, then we're all good.
        }

        [Test]
        public void SendingKeyboardEventsShouldAppendTextInInputs()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("working"));
            element.SendKeys("Some");
            String value = element.GetAttribute("value");
            Assert.AreEqual(value, "Some");

            element.SendKeys(" text");
            value = element.GetAttribute("value");
            Assert.AreEqual(value, "Some text");
        }

        [Test]
        public void SendingKeyboardEventsShouldAppendTextInInputsWithExistingValue()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("inputWithText"));
            element.SendKeys(". Some text");
            string value = element.GetAttribute("value");

            Assert.AreEqual("Example text. Some text", value);
        }

        [Test]
        [IgnoreBrowser(Browser.HtmlUnit, "Not implemented going to the end of the line first")]
        public void SendingKeyboardEventsShouldAppendTextInTextAreas()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("withText"));

            element.SendKeys(". Some text");
            String value = element.GetAttribute("value");

            Assert.AreEqual(value, "Example text. Some text");
        }

        [Test]
        public void ShouldBeAbleToClearTextFromInputElements()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("working"));
            element.SendKeys("Some text");
            String value = element.GetAttribute("value");
            Assert.IsTrue(value.Length > 0);

            element.Clear();
            value = element.GetAttribute("value");

            Assert.AreEqual(value.Length, 0);
        }

        [Test]
        public void EmptyTextBoxesShouldReturnAnEmptyStringNotNull()
        {
            driver.Url = formsPage;
            IWebElement emptyTextBox = driver.FindElement(By.Id("working"));
            Assert.AreEqual(emptyTextBox.GetAttribute("value"), "");

            IWebElement emptyTextArea = driver.FindElement(By.Id("emptyTextArea"));
            Assert.AreEqual(emptyTextBox.GetAttribute("value"), "");
        }

        [Test]
        public void ShouldBeAbleToClearTextFromTextAreas()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("withText"));
            element.SendKeys("Some text");
            String value = element.GetAttribute("value");
            Assert.IsTrue(value.Length > 0);

            element.Clear();
            value = element.GetAttribute("value");

            Assert.AreEqual(value.Length, 0);
        }

        private Func<bool> TitleToBe(string desiredTitle)
        {
            return () =>
            {
                return driver.Title == desiredTitle;
            };
        }
    }
}
