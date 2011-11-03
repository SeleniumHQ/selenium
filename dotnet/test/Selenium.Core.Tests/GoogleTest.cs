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
    [Ignore("Integration tests require set up of a Selenium server.")]
    public class GoogleTest
	{
		private ISelenium selenium;

		[SetUp]
		public void SetupTest()
		{
			selenium = new DefaultSelenium("localhost", 4444, "*firefox", "http://www.google.com");
			selenium.Start();
		}

		[TearDown]
		public void TeardownTest()
		{
			selenium.Stop();
		}

		[Test]
		public void GoogleSearch()
		{
			selenium.Open("http://www.google.com/webhp");
			Assert.AreEqual("Google", selenium.GetTitle());
			selenium.Type("q", "Selenium OpenQA");
			Assert.AreEqual("Selenium OpenQA", selenium.GetValue("q"));
			selenium.Click("btnG");
			selenium.WaitForPageToLoad("5000");
			Assert.IsTrue(selenium.IsTextPresent("openqa.org"));
			Assert.AreEqual("Selenium OpenQA - Google Search", selenium.GetTitle());
		}
	}
}
