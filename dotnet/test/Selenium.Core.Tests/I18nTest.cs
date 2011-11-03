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
using System;
using NUnit.Framework;
using Selenium;

namespace ThoughtWorks.Selenium.IntegrationTests
{
	[TestFixture]
	[Category("Headless")]
    [Ignore("Integration tests require set up of a Selenium server.")]
    public class I18nTest
	{
		private ISelenium selenium;
		private String startURL = "http://localhost:4444";

		[SetUp]
		public void SetupTest()
		{
			selenium = new DefaultSelenium("localhost", 4444, "*mock", startURL);
			selenium.Start();
			selenium.Open(startURL + "/selenium-server/tests/html/test_i18n.html");
		}

		[TearDown]
		public void TeardownTest()
		{
			selenium.Stop();
		}

		[Test]
		public void Internationalization()
		{
			String romance = "\u00FC\u00F6\u00E4\u00DC\u00D6\u00C4 \u00E7\u00E8\u00E9 \u00BF\u00F1 \u00E8\u00E0\u00F9\u00F2";
			String korean = "\uC5F4\uC5D0";
			String chinese = "\u4E2D\u6587";
			String japanese = "\u307E\u3077";
			String dangerous = "&%?\\+|,%*";
			VerifyText(romance, "romance");
			VerifyText(korean, "korean");
			VerifyText(chinese, "chinese");
			VerifyText(japanese, "japanese");
			VerifyText(dangerous, "dangerous");
		}

		public void VerifyText(String expected, String id)
		{
			//Console.Out.WriteLine(expected);
			Assert.IsTrue(selenium.IsTextPresent(expected));
			String actual = selenium.GetText(id);
			Assert.AreEqual(expected, actual, id + " didn't match");
		}
	}
}
