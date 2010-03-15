using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ExecutingJavascriptTest : DriverTestFixture
    {

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAString()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;

            object result = ExecuteScript("return document.title;");

            Assert.IsTrue(result is String);
            Assert.AreEqual("XHTML Test Page", result);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnALong()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;

            object result = ExecuteScript("return document.title.length;");

            Assert.IsTrue(result is long, result.GetType().Name);
            Assert.AreEqual((long)"XHTML Test Page".Length, (long)result);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAWebElement()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;

            object result = ExecuteScript("return document.getElementById('id1');");

            Assert.IsNotNull(result);
            Assert.IsTrue(result is IWebElement);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnABoolean()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;

            object result = ExecuteScript("return true;");

            Assert.IsNotNull(result);
            Assert.IsTrue(result is Boolean);
            Assert.IsTrue((Boolean)result);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToExecuteSimpleJavascriptAndReturnAnArray()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            List<object> expectedResult = new List<object>();
            expectedResult.Add("zero");
            List<object> subList = new List<object>();
            subList.Add(true);
            subList.Add(false);
            expectedResult.Add(subList);
            object result = ExecuteScript("return ['zero', [true, false]];");
            Assert.IsTrue(result is ReadOnlyCollection<object>, "result was: " + result + " (" + result.GetType().Name + ")");
            ReadOnlyCollection<object> list = (ReadOnlyCollection<object>)result;
            //Assert.IsTrue(CompareLists(expectedResult, list));
        }

        //private boolean CompareLists(List<object> first, List<object> second)
        //{
        //  if (first.Count != second.Count) 
        //  {
        //    return false;
        //  }
        //  for (int i = 0; i < first.Count; ++i) {
        //    if (first[i] is List<?>) {
        //      if (!(second instanceof List<?>)) {
        //        return false;
        //      } else {
        //        if (!compareLists((List<?>) first.get(i), (List<?>) second.get(i))) {
        //          return false;
        //        }
        //      }
        //    } else {
        //      if (!first.get(i).equals(second.get(i))) {
        //        return false;
        //      }
        //    }
        //  }
        //  return true;
        //}

        [Test]
        [Category("Javascript")]
        public void PassingAndReturningALongShouldReturnAWholeNumber()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            long expectedResult = 1L;
            object result = ExecuteScript("return arguments[0];", expectedResult);
            Assert.IsTrue(result is int || result is long, "Expected result to be an Integer or Long but was a " + result.GetType().Name);
            Assert.AreEqual((long)expectedResult, result);
        }

        [Test]
        [Category("Javascript")]
        public void PassingAndReturningADoubleShouldReturnADecimal()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            double expectedResult = 1.2;
            object result = ExecuteScript("return arguments[0];", expectedResult);
            Assert.IsTrue(result is float || result is double, "Expected result to be a Double or Float but was a " + result.GetType().Name);
            Assert.AreEqual((double)expectedResult, result);
        }

        [Test]
        [Category("Javascript")]
        [ExpectedException(typeof(InvalidOperationException))]
        public void ShouldThrowAnExceptionWhenTheJavascriptIsBad()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = xhtmlTestPage;
            ExecuteScript("return squiggle();");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToCallFunctionsDefinedOnThePage()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;
            ExecuteScript("displayMessage('I like cheese');");
            string text = driver.FindElement(By.Id("result")).Text;

            Assert.AreEqual("I like cheese", text.Trim());
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassAStringAsAnArgument()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript("displayMessage(arguments[0]);", "Hello!");
            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("Hello!", text);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassMoreThanOneStringAsArguments()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;
            ExecuteScript("displayMessage(arguments[0] + arguments[1] + arguments[2] + arguments[3]);", "Hello,", " ", "world", "!");

            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("Hello, world!", text);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassABooleanAsAnArgument()
        {

            string function = "displayMessage(arguments[0] ? 'True' : 'False');";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript(function, true);
            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("True", text);

            ExecuteScript(function, false);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("False", text);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassMoreThanOneBooleanAsArguments()
        {

            string function = "displayMessage((arguments[0] ? 'True' : 'False') + (arguments[1] ? 'True' : 'False'));";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript(function, true, true);
            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("TrueTrue", text);

            ExecuteScript(function, false, true);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("FalseTrue", text);

            ExecuteScript(function, true, false);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("TrueFalse", text);

            ExecuteScript(function, false, false);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("FalseFalse", text);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassANumberAsAnArgument()
        {
            string function = "displayMessage(arguments[0]);";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript(function, 3);
            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("3", text);

            ExecuteScript(function, -3);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-3", text);

            ExecuteScript(function, 2147483647);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("2147483647", text);

            ExecuteScript(function, -2147483647);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-2147483647", text);

        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassMoreThanOneNumberAsArguments()
        {
            string function = "displayMessage(arguments[0]+arguments[1]);";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript(function, 30, 12);
            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("42", text);

            ExecuteScript(function, -30, -12);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-42", text);

            ExecuteScript(function, 2147483646, 1);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("2147483647", text);

            ExecuteScript(function, - 2147483646, -1);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-2147483647", text);

        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassADoubleAsAnArgument()
        {
            string function = "displayMessage(arguments[0]);";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript(function, (double)4.2);
            string text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("4.2", text);

            ExecuteScript(function, (double)-4.2);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-4.2", text);

            ExecuteScript(function, (float)4.2);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("4.2", text);

            ExecuteScript(function, (float)-4.2);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-4.2", text);

            ExecuteScript(function, (double)4.0);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("4", text);

            ExecuteScript(function, (double)-4.0);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-4", text);

        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassMoreThanOneDoubleAsArguments()
        {
            String function = "displayMessage(arguments[0]+arguments[1]);";

            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;

            ExecuteScript(function, 30, 12);
            String text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("42", text);

            ExecuteScript(function, -30, -12);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-42", text);

            ExecuteScript(function, 2147483646, 1);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("2147483647", text);

            ExecuteScript(function, -2147483646, -1);
            text = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual("-2147483647", text);

        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassAWebElementAsArgument()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;
            IWebElement button = driver.FindElement(By.Id("plainButton"));
            string value = (string)ExecuteScript("arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'];", button);

            Assert.AreEqual("plainButton", value);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassAnArrayAsArgument()
        {
            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            driver.Url = javascriptPage;
            object[] array = new object[] { "zero", 1, true, 3.14159 };
            long length = (long)ExecuteScript("return arguments[0].length", array);
            Assert.AreEqual(array.Length, length);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassMoreThanOneWebElementAsArguments()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;
            IWebElement button = driver.FindElement(By.Id("plainButton"));
            IWebElement dynamo = driver.FindElement(By.Id("dynamo"));
            string value = (string)ExecuteScript("arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'] + arguments[1].innerHTML;", button, dynamo);

            Assert.AreEqual("plainButtonWhat's for dinner?", value);
        }

        [Test]
        [Category("Javascript")]
        [ExpectedException(typeof(ArgumentException))]
        public void ShouldThrowAnExceptionIfAnArgumentIsNotValid()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;
            ExecuteScript("return arguments[0];", new List<IWebElement>());
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToPassInMixedArguments()
        {
            if (!(driver is IJavaScriptExecutor))
                return;

            driver.Url = javascriptPage;
            
            IWebElement dynamo = driver.FindElement(By.Id("dynamo"));
            string result = (string)ExecuteScript("return arguments[0].innerHTML + arguments[1].toString() + arguments[2].toString() + arguments[3] + arguments[4]",
                dynamo,
                42,
                4.2,
                "Hello, World!",
                true);

            Assert.AreEqual("What's for dinner?424.2Hello, World!true", result);

        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome, "Frames not implemented")]
        public void ShouldBeAbleToGrabTheBodyOfFrameOnceSwitchedTo()
        {
            driver.Url = richTextPage;

            driver.SwitchTo().Frame("editFrame");
            IWebElement body = (IWebElement)((IJavaScriptExecutor)driver).ExecuteScript("return document.body");

            Assert.AreEqual("", body.Text);
        }

        [Test]
        [Category("Javascript")]
        public void JavascriptStringHandlingShouldWorkAsExpected()
        {
            driver.Url = javascriptPage;

            string value = (string)ExecuteScript("return '';");
            Assert.AreEqual("", value);

            value = (string)ExecuteScript("return undefined;");
            Assert.IsNull(value);

            value = (string)ExecuteScript("return ' '");
            Assert.AreEqual(" ", value);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome)]
        public void ShouldBeAbleToExecuteABigChunkOfJavascriptCode()
        {
            driver.Url = javascriptPage;
            string[] fileList = System.IO.Directory.GetFiles("..\\..", "jquery-1.2.6.min.js", System.IO.SearchOption.AllDirectories);
            if (fileList.Length > 0)
            {
                string jquery = System.IO.File.ReadAllText(fileList[0]);
                Assert.IsTrue(jquery.Length > 50000);
                ExecuteScript(jquery, null);
            }
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.IPhone)]
        public void ShouldBeAbleToExecuteScriptAndReturnElementsList()
        {
            driver.Url = formsPage;
            String scriptToExec = "return document.getElementsByName('snack');";

            object resultObject = ((IJavaScriptExecutor)driver).ExecuteScript(scriptToExec);

            ReadOnlyCollection<IWebElement> resultsList = (ReadOnlyCollection<IWebElement>)resultObject;

            Assert.Greater(resultsList.Count, 0);
        }

        [Test]
        [NeedsFreshDriver(BeforeTest = true, AfterTest = true)]
        [Ignore("Reason for ignore: Failure indicates hang condition, which would break the test suite. Really needs a timeout set.")]
        public void ShouldThrowExceptionIfExecutingOnNoPage()
        {
            bool exceptionCaught = false;
            try
            {
                ((IJavaScriptExecutor)driver).ExecuteScript("return 1;");
            }
            catch (WebDriverException)
            {
                exceptionCaught = true;
            }

            if (!exceptionCaught)
            {
                Assert.Fail("Expected an exception to be caught");
            }
        }

        private object ExecuteScript(String script, params Object[] args)
        {
            return ((IJavaScriptExecutor)driver).ExecuteScript(script, args);
        }

    }
}
