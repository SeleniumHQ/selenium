// <copyright file="FormHandlingTests.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using OpenQA.Selenium.Tests.Infrastructure.Environment;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class FormHandlingTests : DriverTestFixture
{
    [Test]
    public void ShouldClickOnSubmitInputElements()
    {
        Driver.Url = Urls.FormsPage;
        Driver.FindElement(By.Id("submitButton")).Click();
        WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
    }

    [Test]
    public void ClickingOnUnclickableElementsDoesNothing()
    {
        Driver.Url = Urls.FormsPage;
        Driver.FindElement(By.XPath("//body")).Click();
    }

    [Test]
    public void ShouldBeAbleToClickImageButtons()
    {
        Driver.Url = Urls.FormsPage;
        Driver.FindElement(By.Id("imageButton")).Click();
        WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
    }

    [Test]
    public void ShouldBeAbleToSubmitForms()
    {
        Driver.Url = Urls.FormsPage;
        Driver.FindElement(By.Name("login")).Submit();
        WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
    }

    [Test]
    public void ShouldSubmitAFormWhenAnyInputElementWithinThatFormIsSubmitted()
    {
        Driver.Url = Urls.FormsPage;
        Driver.FindElement(By.Id("checky")).Submit();
        WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
    }

    [Test]
    public void ShouldSubmitAFormWhenAnyElementWithinThatFormIsSubmitted()
    {
        Driver.Url = Urls.FormsPage;
        Driver.FindElement(By.XPath("//form/p")).Submit();
        WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
    }

    [Test]
    public void ShouldSubmitAFormWithIdSubmit()
    {
        Driver.Url = Urls.FormsPage;
        Driver.FindElement(By.Id("submit")).Submit();
        WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Does not work")]
    public void ShouldSubmitAFormWithNameSubmit()
    {
        Driver.Url = Urls.FormsPage;
        Driver.FindElement(By.Name("submit")).Submit();
        WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
    }

    [Test]
    public void ShouldNotBeAbleToSubmitAnInputOutsideAForm()
    {
        Driver.Url = Urls.FormsPage;
        Assert.That(() => Driver.FindElement(By.Name("SearchableText")).Submit(), Throws.InstanceOf<WebDriverException>());
    }

    [Test]
    public void ShouldBeAbleToEnterTextIntoATextAreaBySettingItsValue()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement textarea = Driver.FindElement(By.Id("keyUpArea"));
        string cheesey = "Brie and cheddar";
        textarea.SendKeys(cheesey);
        Assert.That(textarea.GetAttribute("value"), Is.EqualTo(cheesey));
    }

    [Test]
    public void SendKeysKeepsCapitalization()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement textarea = Driver.FindElement(By.Id("keyUpArea"));
        string cheesey = "BrIe And CheDdar";
        textarea.SendKeys(cheesey);
        Assert.That(textarea.GetAttribute("value"), Is.EqualTo(cheesey));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox)]
    public void ShouldSubmitAFormUsingTheNewlineLiteral()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement nestedForm = Driver.FindElement(By.Id("nested_form"));
        IWebElement input = nestedForm.FindElement(By.Name("x"));
        input.SendKeys("\n");

        WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
        Assert.That(Driver.Url, Does.EndWith("?x=name"));
    }

    [Test]
    public void ShouldSubmitAFormUsingTheEnterKey()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement nestedForm = Driver.FindElement(By.Id("nested_form"));
        IWebElement input = nestedForm.FindElement(By.Name("x"));
        input.SendKeys(Keys.Enter);

        WaitFor(TitleToBe("We Arrive Here"), "Browser title is not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
        Assert.That(Driver.Url, Does.EndWith("?x=name"));
    }

    [Test]
    public void ShouldEnterDataIntoFormFields()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement element = Driver.FindElement(By.XPath("//form[@name='someForm']/input[@id='username']"));
        String originalValue = element.GetAttribute("value");
        Assert.That(originalValue, Is.EqualTo("change"));

        element.Clear();
        element.SendKeys("some text");

        element = Driver.FindElement(By.XPath("//form[@name='someForm']/input[@id='username']"));
        String newFormValue = element.GetAttribute("value");
        Assert.That(newFormValue, Is.EqualTo("some text"));
    }

    [Test]
    public void ShouldBeAbleToAlterTheContentsOfAFileUploadInputElement()
    {
        string testFileName = string.Format("test-{0}.txt", Guid.NewGuid().ToString("D"));
        Driver.Url = Urls.FormsPage;
        IWebElement uploadElement = Driver.FindElement(By.Id("upload"));
        Assert.That(uploadElement.GetAttribute("value"), Is.Null.Or.Empty);

        string filePath = System.IO.Path.Combine(EnvironmentManager.Instance.CurrentDirectory, testFileName);
        System.IO.FileInfo inputFile = new System.IO.FileInfo(filePath);
        System.IO.StreamWriter inputFileWriter = inputFile.CreateText();
        inputFileWriter.WriteLine("Hello world");
        inputFileWriter.Close();

        uploadElement.SendKeys(inputFile.FullName);

        string uploadElementValue = uploadElement.GetAttribute("value");
        System.IO.FileInfo outputFile = new System.IO.FileInfo(uploadElementValue.Replace('\\', System.IO.Path.DirectorySeparatorChar));
        Assert.That(inputFile.Name, Is.EqualTo(outputFile.Name));
        inputFile.Delete();
    }

    [Test]
    public void ShouldBeAbleToSendKeysToAFileUploadInputElementInAnXhtmlDocument()
    {
        // IE before 9 doesn't handle pages served with an XHTML content type, and just prompts for to
        // download it
        if (TestUtilities.IsOldIE(Driver))
        {
            return;
        }

        Driver.Url = Urls.XhtmlFormPage;
        IWebElement uploadElement = Driver.FindElement(By.Id("file"));
        Assert.That(uploadElement.GetAttribute("value"), Is.Empty);

        string testFileName = string.Format("test-{0}.txt", Guid.NewGuid().ToString("D"));
        string filePath = System.IO.Path.Combine(EnvironmentManager.Instance.CurrentDirectory, testFileName);
        System.IO.FileInfo inputFile = new System.IO.FileInfo(filePath);
        System.IO.StreamWriter inputFileWriter = inputFile.CreateText();
        inputFileWriter.WriteLine("Hello world");
        inputFileWriter.Close();

        uploadElement.SendKeys(inputFile.FullName);

        string uploadElementValue = uploadElement.GetAttribute("value");
        System.IO.FileInfo outputFile = new System.IO.FileInfo(uploadElementValue.Replace('\\', System.IO.Path.DirectorySeparatorChar));
        Assert.That(outputFile.Name, Is.EqualTo(inputFile.Name));
        inputFile.Delete();
    }

    [Test]
    [IgnoreBrowser(Browser.Safari, "Driver does not allow uploading same file multiple times.")]
    public void ShouldBeAbleToUploadTheSameFileTwice()
    {
        string testFileName = string.Format("test-{0}.txt", Guid.NewGuid().ToString("D"));
        string filePath = System.IO.Path.Combine(EnvironmentManager.Instance.CurrentDirectory, testFileName);
        System.IO.FileInfo inputFile = new System.IO.FileInfo(filePath);
        System.IO.StreamWriter inputFileWriter = inputFile.CreateText();
        inputFileWriter.WriteLine("Hello world");
        inputFileWriter.Close();

        for (int i = 0; i < 2; ++i)
        {
            Driver.Url = Urls.FormsPage;
            IWebElement uploadElement = Driver.FindElement(By.Id("upload"));
            Assert.That(uploadElement.GetAttribute("value"), Is.Null.Or.EqualTo(string.Empty));

            uploadElement.SendKeys(inputFile.FullName);
            uploadElement.Submit();

            // Explicitly wait next page to be loaded, Firefox is not handling elements submitting
            WaitFor(() => Driver.Url.EndsWith("resultPage.html"), "We are not redirected to the resultPage after submitting web element");
        }

        inputFile.Delete();
        // If we get this far, then we're all good.
    }

    [Test]
    public void SendingKeyboardEventsShouldAppendTextInInputs()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Id("working"));
        element.SendKeys("Some");
        String value = element.GetAttribute("value");
        Assert.That(value, Is.EqualTo("Some"));

        element.SendKeys(" text");
        value = element.GetAttribute("value");
        Assert.That(value, Is.EqualTo("Some text"));
    }

    [Test]
    public void SendingKeyboardEventsShouldAppendTextInInputsWithExistingValue()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Id("inputWithText"));
        element.SendKeys(". Some text");
        string value = element.GetAttribute("value");

        Assert.That(value, Is.EqualTo("Example text. Some text"));
    }

    [Test]
    public void SendingKeyboardEventsShouldAppendTextInTextAreas()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Id("withText"));

        element.SendKeys(". Some text");
        String value = element.GetAttribute("value");

        Assert.That(value, Is.EqualTo("Example text. Some text"));
    }

    [Test]
    public void EmptyTextBoxesShouldReturnAnEmptyStringNotNull()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement emptyTextBox = Driver.FindElement(By.Id("working"));
        Assert.That(emptyTextBox.GetAttribute("value"), Is.Empty);

        IWebElement emptyTextArea = Driver.FindElement(By.Id("emptyTextArea"));
        Assert.That(emptyTextBox.GetAttribute("value"), Is.Empty);
    }

    [Test]
    public void HandleFormWithJavascriptAction()
    {
        string url = Urls.WhereIs("form_handling_js_submit.html");
        Driver.Url = url;
        IWebElement element = Driver.FindElement(By.Id("theForm"));
        element.Submit();
        IAlert alert = WaitFor<IAlert>(() =>
        {
            try
            {
                return Driver.SwitchTo().Alert();
            }
            catch (NoAlertPresentException)
            {
                return null;
            }
        }, "No alert found before timeout.");

        string text = alert.Text;
        alert.Dismiss();

        Assert.That(text, Is.EqualTo("Tasty cheese"));
    }

    [Test]
    public void CanClickOnASubmitButton()
    {
        CheckSubmitButton("internal_explicit_submit");
    }

    [Test]
    public void CanClickOnASubmitButtonNestedSpan()
    {
        CheckSubmitButton("internal_span_submit");
    }

    [Test]
    public void CanClickOnAnImplicitSubmitButton()
    {
        CheckSubmitButton("internal_implicit_submit");
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "IE does not support the HTML5 'form' attribute on <button> elements")]
    public void CanClickOnAnExternalSubmitButton()
    {
        CheckSubmitButton("external_explicit_submit");
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "IE does not support the HTML5 'form' attribute on <button> elements")]
    public void CanClickOnAnExternalImplicitSubmitButton()
    {
        CheckSubmitButton("external_implicit_submit");
    }

    [Test]
    [IgnoreTarget("net48", "Cannot create inline page with UrlBuilder")]
    public void CanSubmitFormWithSubmitButtonIdEqualToSubmit()
    {
        string blank = Urls.CreateInlinePage(new InlinePage()
            .WithTitle("Submitted Successfully!"));
        Driver.Url = Urls.CreateInlinePage(new InlinePage()
            .WithBody(string.Format("<form action='{0}'>", blank),
            "  <input type='submit' id='submit' value='Submit'>",
            "</form>"));

        Driver.FindElement(By.Id("submit")).Submit();
        WaitFor(TitleToBe("Submitted Successfully!"), "Title was not expected value");
    }

    [Test]
    [IgnoreTarget("net48", "Cannot create inline page with UrlBuilder")]
    public void CanSubmitFormWithSubmitButtonNameEqualToSubmit()
    {
        string blank = Urls.CreateInlinePage(new InlinePage()
            .WithTitle("Submitted Successfully!"));
        Driver.Url = Urls.CreateInlinePage(new InlinePage()
            .WithBody(string.Format("<form action='{0}'>", blank),
            "  <input type='submit' name='submit' value='Submit'>",
            "</form>"));

        Driver.FindElement(By.Name("submit")).Submit();
        WaitFor(TitleToBe("Submitted Successfully!"), "Title was not expected value");
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    public void ShouldBeAbleToClearTextFromInputElements()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Id("working"));
        element.SendKeys("Some text");
        String value = element.GetAttribute("value");
        Assert.That(value, Is.Not.Empty);

        element.Clear();
        value = element.GetAttribute("value");

        Assert.That(value, Is.Empty);
    }

    [Test]
    public void ShouldBeAbleToClearTextFromTextAreas()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Id("withText"));
        element.SendKeys("Some text");
        String value = element.GetAttribute("value");
        Assert.That(value, Is.Not.Empty);

        element.Clear();
        value = element.GetAttribute("value");

        Assert.That(value, Is.Empty);
    }

    private void CheckSubmitButton(string buttonId)
    {
        Driver.Url = Urls.WhereIs("click_tests/html5_submit_buttons.html");
        string name = "Gromit";

        Driver.FindElement(By.Id("name")).SendKeys(name);
        Driver.FindElement(By.Id(buttonId)).Click();

        WaitFor(TitleToBe("Submitted Successfully!"), "Browser title is not 'Submitted Successfully!'");

        Assert.That(Driver.Url, Does.Contain("name=" + name), "URL does not contain 'name=" + name + "'. Actual URL:" + Driver.Url);
    }

    private Func<bool> TitleToBe(string desiredTitle)
    {
        return () =>
        {
            return Driver.Title == desiredTitle;
        };
    }
}
