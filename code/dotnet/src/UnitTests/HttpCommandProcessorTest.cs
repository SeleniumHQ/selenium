using System;
using NUnit.Framework;
using ThoughtWorks.Selenium.Core;

namespace ThoughtWorks.Selenium.UnitTests
{
	/// <summary>
	/// Summary description for HTTPCommandProcessorTest.
	/// </summary>
	[TestFixture]
	public class HttpCommandProcessorTest
	{
		private HttpCommandProcessor processor;

		[Test]
		public void ShouldCreateWithValidUrl()
		{
			string Url = "http://localhost/selenium/driver.sel";
			processor = new HttpCommandProcessor(Url);
			Assert.AreEqual(Url, processor.Url);
		}

		[Test]
		[ExpectedException(typeof (ArgumentNullException))]
		public void ShouldNotCreateWithNullUrl()
		{
			processor = new HttpCommandProcessor(null);
		}
	}
}