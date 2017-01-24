/*
 * Copyright 2011 Software Freedom Conservancy.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
using Moq;
//using NMock;
using NUnit.Framework;
using System;
using Selenium;

namespace ThoughtWorks.Selenium.UnitTests
{
	/// <summary>
	/// Summary description for DefaultSeleniumTestCase.
	/// </summary>
	[TestFixture]
	public class DefaultSeleniumTest
	{
		private DefaultSelenium selenium;
		private ICommandProcessor processor;
        private Mock<ICommandProcessor> mockProcessor;

		[SetUp]
		public void SetupTest()
		{
			mockProcessor = new Mock<ICommandProcessor>(MockBehavior.Loose);
            processor = (ICommandProcessor) mockProcessor.Object;
			selenium = new DefaultSelenium(processor);
		}

		[TearDown]
		public void TeardownTest()
		{
			mockProcessor.Verify();
		}

		[Test]
		public void InstantiateSeleniumShouldWork()
		{
			Assert.AreSame(processor, selenium.Processor);
		}

		[Test]
		public void StopSeleniumShouldWork()
		{
			selenium.Stop();
            mockProcessor.Verify(processor => processor.Stop());
		}

		[Test]
		public void ChooseCancelOnNextConfirmationShouldWork()
		{
            mockProcessor.Setup(processor => processor.DoCommand("chooseCancelOnNextConfirmation", It.Is<string[]>(arg => arg.Length == 0))).Returns("Ok");
			selenium.ChooseCancelOnNextConfirmation();
            mockProcessor.Verify(processor => processor.DoCommand("chooseCancelOnNextConfirmation", It.Is<string[]>(arg => arg.Length == 0)));
		}

		[Test]
		public void ChooseCancelOnNextConfirmationFailsIfResultIsNotOK()
		{
            mockProcessor.Setup(processor => processor.DoCommand("chooseCancelOnNextConfirmation", It.IsAny<string[]>())).Throws(new SeleniumException("Error"));
            Assert.Throws<SeleniumException>(() => selenium.ChooseCancelOnNextConfirmation());
            mockProcessor.Verify(processor => processor.DoCommand("chooseCancelOnNextConfirmation", It.IsAny<string[]>()));
        }

        [Test]
        public void ClickShouldWork()
        {
            string fieldname = "somefieldname";
            mockProcessor.Setup(processor => processor.DoCommand("click", It.Is<string[]>(arg => arg[0] == fieldname))).Returns("Ok");
            selenium.Click(fieldname);
            mockProcessor.Verify(processor => processor.DoCommand("click", It.Is<string[]>(arg => arg[0] == fieldname)));
        }


        [Test]
		public void ClickShouldFailWhenOKIsNotReturned()
		{
			string fieldname = "fieldname";

            mockProcessor.Setup(processor => processor.DoCommand("click", It.Is<string[]>(arg => arg[0] == fieldname))).Throws(new SeleniumException("Error"));
            Assert.Throws<SeleniumException>(() => selenium.Click(fieldname));
            mockProcessor.Verify(processor => processor.DoCommand("click", It.Is<string[]>(arg => arg[0] == fieldname)));
        }

        [Test]
		public void VerifySelectedOptionsShouldWork()
		{
			string[] values = {"1","2","3","4","5","6"};
			string fieldname = "fieldname";
            mockProcessor.Setup(processor => processor.GetStringArray("getSelectOptions", It.Is<string[]>(arg => arg[0] == fieldname))).Returns(values);
			string[] actualResult = selenium.GetSelectOptions(fieldname);
            mockProcessor.Verify(processor => processor.GetStringArray("getSelectOptions", It.Is<string[]>(arg => arg[0] == fieldname)));
            Assert.AreEqual(values, actualResult);
		}

		[Test]
		public void GetAllButtonsShouldWork()
		{
			string[] values = {"1","2","3","4","5","6"};
            mockProcessor.Setup(processor => processor.GetStringArray("getAllButtons", It.Is<string[]>(arg => arg.Length == 0))).Returns(values);
			string[] actualResult = selenium.GetAllButtons();
            mockProcessor.Verify(processor => processor.GetStringArray("getAllButtons", It.Is<string[]>(arg => arg.Length == 0)));
            Assert.AreEqual(values, actualResult);
		}

		[Test]
		public void GetAllLinksShouldWork()
		{
			string[] values = {"1","2","3","4","5","6"};
            mockProcessor.Setup(processor => processor.GetStringArray("getAllLinks", It.Is<string[]>(arg => arg.Length == 0))).Returns(values);
			string[] actualResult = selenium.GetAllLinks();
            mockProcessor.Verify(processor => processor.GetStringArray("getAllLinks", It.Is<string[]>(arg => arg.Length == 0)));
			Assert.AreEqual(values, actualResult);
		}

		[Test]
		public void GetAllFieldsShouldWork()
		{
			string[] values = {"1","2","3","4","5","6"};
            mockProcessor.Setup(processor => processor.GetStringArray("getAllFields", It.Is<string[]>(arg => arg.Length == 0))).Returns(values);
			string[] actualResult = selenium.GetAllFields();
            mockProcessor.Verify(processor => processor.GetStringArray("getAllFields", It.Is<string[]>(arg => arg.Length == 0)));
			Assert.AreEqual(values, actualResult);
		}


	}
}
