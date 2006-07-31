/*
 * Copyright 2006 ThoughtWorks, Inc.
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
using NMock;
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
		private Mock mockProcessor;

		[SetUp]
		public void SetupTest()
		{
			mockProcessor = new DynamicMock(typeof (ICommandProcessor));
			processor = (ICommandProcessor) mockProcessor.MockInstance;
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
			mockProcessor.Expect("Stop");
			selenium.Stop();
		}

		[Test]
		public void ChooseCancelOnNextConfirmationShouldWork()
		{
			mockProcessor.ExpectAndReturn("DoCommand", "OK", new object[]{"chooseCancelOnNextConfirmation", new String[]{}});
			selenium.ChooseCancelOnNextConfirmation();
		}

		[Test]
		[ExpectedException(typeof(SeleniumException))]
		public void ChooseCancelOnNextConfirmationFailsIfResultIsNotOK()
		{
			mockProcessor.ExpectAndThrow("DoCommand", new SeleniumException("Error"), 
				new object[]{"chooseCancelOnNextConfirmation", new String[]{}});
			selenium.ChooseCancelOnNextConfirmation();
		}

		[Test]
		public void ClickShouldWork()
		{
			string fieldname= "somefieldname";
			mockProcessor.ExpectAndReturn("DoCommand", "OK", new object[] {"click", new string[]{fieldname}});
			selenium.Click(fieldname);
		}

		
		[Test]
		[ExpectedException (typeof(SeleniumException))]
		public void ClickShouldFailWhenOKIsNotReturned()
		{
			string fieldname = "fieldname";

			mockProcessor.ExpectAndThrow("DoCommand", new SeleniumException("Error"), new object[]{"click", new string[]{fieldname}});
			selenium.Click(fieldname);
		}

		[Test]
		public void VerifySelectedOptionsShouldWork()
		{
			string[] values = {"1","2","3","4","5","6"};
			string fieldname = "fieldname";
			mockProcessor.ExpectAndReturn("GetStringArray",new string[] {"1","2","3","4","5","6"}, new object[]{"getSelectOptions", new string[]{fieldname}} );
			string[] actualResult = selenium.GetSelectOptions(fieldname);
			Assert.AreEqual(new string[] {"1","2","3","4","5","6"}, actualResult);
		}

		[Test]
		public void GetAllButtonsShouldWork()
		{
			string[] values = {"1","2","3","4","5","6"};
			mockProcessor.ExpectAndReturn("GetStringArray",new string[] {"1","2","3","4","5","6"}, new object[]{"getAllButtons", new string[]{}} );
			string[] actualResult = selenium.GetAllButtons();
			Assert.AreEqual(new string[] {"1","2","3","4","5","6"}, actualResult);
		}

		[Test]
		public void GetAllLinksShouldWork()
		{
			string[] values = {"1","2","3","4","5","6"};
			mockProcessor.ExpectAndReturn("GetStringArray",new string[] {"1","2","3","4","5","6"}, new object[]{"getAllLinks", new string[]{}} );
			string[] actualResult = selenium.GetAllLinks();
			Assert.AreEqual(new string[] {"1","2","3","4","5","6"}, actualResult);
		}

		[Test]
		public void GetAllFieldsShouldWork()
		{
			string[] values = {"1","2","3","4","5","6"};
			mockProcessor.ExpectAndReturn("GetStringArray",new string[] {"1","2","3","4","5","6"}, new object[]{"getAllFields", new string[]{}} );
			string[] actualResult = selenium.GetAllFields();
			Assert.AreEqual(new string[] {"1","2","3","4","5","6"}, actualResult);
		}


	}
}
