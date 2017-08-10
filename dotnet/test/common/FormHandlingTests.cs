using System;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

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
            WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
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
            WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldBeAbleToSubmitForms()
        {
            driver.Url = formsPage;
            driver.FindElement(By.Name("login")).Submit();
            WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldSubmitAFormWhenAnyInputElementWithinThatFormIsSubmitted()
        {
            driver.Url = formsPage;
            driver.FindElement(By.Id("checky")).Submit();
            WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldSubmitAFormWhenAnyElementWithinThatFormIsSubmitted()
        {
            driver.Url = formsPage;
            driver.FindElement(By.XPath("//form/p")).Submit();
            WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.PhantomJS)]
        //[IgnoreBrowser(Browser.Safari)]
        public void ShouldNotBeAbleToSubmitAFormThatDoesNotExist()
        {
            driver.Url = formsPage;
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.Name("SearchableText")).Submit());
        }

        [Test]
        public void ShouldBeAbleToEnterTextIntoATextAreaBySettingItsValue()
        {
            driver.Url = javascriptPage;
            IWebElement textarea = driver.FindElement(By.Id("keyUpArea"));
            string cheesey = "Brie and cheddar";
            textarea.SendKeys(cheesey);
            Assert.AreEqual(textarea.GetAttribute("value"), cheesey);
        }

        [Test]
        public void SendKeysKeepsCapitalization()
        {
            driver.Url = javascriptPage;
            IWebElement textarea = driver.FindElement(By.Id("keyUpArea"));
            string cheesey = "BrIe And CheDdar";
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

            WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
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

            WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
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
        [IgnoreBrowser(Browser.Android, "Does not yet support file uploads")]
        [IgnoreBrowser(Browser.IPhone, "Does not yet support file uploads")]
        //[IgnoreBrowser(Browser.Safari, "Does not yet support file uploads")]
        [IgnoreBrowser(Browser.WindowsPhone, "Does not yet support file uploads")]
        public void ShouldBeAbleToAlterTheContentsOfAFileUploadInputElement()
        {
            driver.Url = formsPage;
            IWebElement uploadElement = driver.FindElement(By.Id("upload"));
            Assert.IsTrue(string.IsNullOrEmpty(uploadElement.GetAttribute("value")));

            string filePath = System.IO.Path.Combine(EnvironmentManager.Instance.CurrentDirectory, "test.txt");
            System.IO.FileInfo inputFile = new System.IO.FileInfo(filePath);
            System.IO.StreamWriter inputFileWriter = inputFile.CreateText();
            inputFileWriter.WriteLine("Hello world");
            inputFileWriter.Close();

            uploadElement.SendKeys(inputFile.FullName);

            System.IO.FileInfo outputFile = new System.IO.FileInfo(uploadElement.GetAttribute("value"));
            Assert.AreEqual(inputFile.Name, outputFile.Name);
            inputFile.Delete();
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Does not yet support file uploads")]
        [IgnoreBrowser(Browser.IPhone, "Does not yet support file uploads")]
        //[IgnoreBrowser(Browser.Safari, "Does not yet support file uploads")]
        [IgnoreBrowser(Browser.WindowsPhone, "Does not yet support file uploads")]
        public void ShouldBeAbleToSendKeysToAFileUploadInputElementInAnXhtmlDocument()
        {
            // IE before 9 doesn't handle pages served with an XHTML content type, and just prompts for to
            // download it
            if (TestUtilities.IsOldIE(driver))
            {
                return;
            }

            driver.Url = xhtmlFormPage;
            IWebElement uploadElement = driver.FindElement(By.Id("file"));
            Assert.AreEqual(string.Empty, uploadElement.GetAttribute("value"));

            string filePath = System.IO.Path.Combine(EnvironmentManager.Instance.CurrentDirectory, "test.txt");
            System.IO.FileInfo inputFile = new System.IO.FileInfo(filePath);
            System.IO.StreamWriter inputFileWriter = inputFile.CreateText();
            inputFileWriter.WriteLine("Hello world");
            inputFileWriter.Close();

            uploadElement.SendKeys(inputFile.FullName);

            System.IO.FileInfo outputFile = new System.IO.FileInfo(uploadElement.GetAttribute("value"));
            Assert.AreEqual(inputFile.Name, outputFile.Name);
            inputFile.Delete();
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Does not yet support file uploads")]
        [IgnoreBrowser(Browser.IPhone, "Does not yet support file uploads")]
        //[IgnoreBrowser(Browser.Safari, "Does not yet support file uploads")]
        [IgnoreBrowser(Browser.WindowsPhone, "Does not yet support file uploads")]
        public void ShouldBeAbleToUploadTheSameFileTwice()
        {
            string filePath = System.IO.Path.Combine(EnvironmentManager.Instance.CurrentDirectory, "test.txt");
            System.IO.FileInfo inputFile = new System.IO.FileInfo(filePath);
            System.IO.StreamWriter inputFileWriter = inputFile.CreateText();
            inputFileWriter.WriteLine("Hello world");
            inputFileWriter.Close();

            for (int i = 0; i < 2; ++i)
            {
                driver.Url = formsPage;
                IWebElement uploadElement = driver.FindElement(By.Id("upload"));
                Assert.IsTrue(string.IsNullOrEmpty(uploadElement.GetAttribute("value")));

                uploadElement.SendKeys(inputFile.FullName);
                uploadElement.Submit();
            }

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

        [Test]
        [IgnoreBrowser(Browser.IE, "Hangs")]
        [IgnoreBrowser(Browser.Android, "Untested")]
        [IgnoreBrowser(Browser.HtmlUnit, "Untested")]
        [IgnoreBrowser(Browser.IPhone, "Untested")]
        [IgnoreBrowser(Browser.Opera, "Untested")]
        [IgnoreBrowser(Browser.PhantomJS, "Untested")]
        [IgnoreBrowser(Browser.Safari, "Untested")]
        [IgnoreBrowser(Browser.WindowsPhone, "Does not yet support alert handling")]
        [IgnoreBrowser(Browser.Firefox, "Dismissing alert causes entire window to close.")]
        public void HandleFormWithJavascriptAction()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("form_handling_js_submit.html");
            driver.Url = url;
            IWebElement element = driver.FindElement(By.Id("theForm"));
            element.Submit();
            IAlert alert = driver.SwitchTo().Alert();
            string text = alert.Text;
            alert.Dismiss();

            Assert.AreEqual("Tasty cheese", text);
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested")]
        [IgnoreBrowser(Browser.IPhone, "Untested")]
        //[IgnoreBrowser(Browser.Safari, "Untested")]
        public void CanClickOnASubmitButton()
        {
            CheckSubmitButton("internal_explicit_submit");
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested")]
        [IgnoreBrowser(Browser.IPhone, "Untested")]
       // [IgnoreBrowser(Browser.Safari, "Untested")]
        public void CanClickOnAnImplicitSubmitButton()
        {
            CheckSubmitButton("internal_implicit_submit");
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested")]
        [IgnoreBrowser(Browser.IPhone, "Untested")]
        //[IgnoreBrowser(Browser.Safari, "Untested")]
        [IgnoreBrowser(Browser.HtmlUnit, "Fails on HtmlUnit")]
        [IgnoreBrowser(Browser.IE, "Fails on IE")]
        public void CanClickOnAnExternalSubmitButton()
        {
            CheckSubmitButton("external_explicit_submit");
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested")]
        [IgnoreBrowser(Browser.IPhone, "Untested")]
       // [IgnoreBrowser(Browser.Safari, "Untested")]
        [IgnoreBrowser(Browser.HtmlUnit, "Fails on HtmlUnit")]
        [IgnoreBrowser(Browser.IE, "Fails on IE")]
        public void CanClickOnAnExternalImplicitSubmitButton()
        {
            CheckSubmitButton("external_implicit_submit");
        }

        private void CheckSubmitButton(string buttonId)
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/html5_submit_buttons.html");
            string name = "Gromit";

            driver.FindElement(By.Id("name")).SendKeys(name);
            driver.FindElement(By.Id(buttonId)).Click();

            WaitFor(TitleToBe("Submitted Successfully!"), "Browser title is not 'Submitted Successfully!'");

            Assert.That(driver.Url.Contains("name=" + name), "URL does not contain 'name=" + name + "'. Actual URL:" + driver.Url);
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
