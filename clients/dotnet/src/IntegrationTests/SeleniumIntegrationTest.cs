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
using System;
using System.Threading;
using NUnit.Framework;
using Selenium;

namespace ThoughtWorks.Selenium.IntegrationTests
{
	[TestFixture]
	public class SeleniumIntegrationTest
	{
		private ISelenium selenium;

		[SetUp]
		public void SetupTest()
		{
			selenium = new DefaultSelenium("localhost", 4444, "*firefox", "http://www.irian.at");
			selenium.Start();
		}

		[TearDown]
		public void TeardownTest()
		{
			try
			{
				selenium.Stop();
			}
			catch (Exception)
			{
				// Ignore errors if unable to close the browser
			}
		}

		[Test]
		public void IISIntegrationTest()
		{
			selenium.Open("http://www.irian.at/myfaces-sandbox/inputSuggestAjax.jsf");
			selenium.AssertTextPresent("suggest");
			String elementID = "_idJsp0:_idJsp3";
			selenium.Type(elementID, "foo");
			// DGF On Mozilla a keyPress is needed, and types a letter.
			// On IE6, a keyDown is needed, and no letter is typed. :-p
			// NS On firefox, keyPress needed, no letter typed.
        
			String verificationText = "regexp:foox?1";
			selenium.KeyDown(elementID, "120");
			selenium.KeyPress(elementID, "120");
			Thread.Sleep(2000);
			selenium.AssertTextPresent(verificationText);
		}
	}
}