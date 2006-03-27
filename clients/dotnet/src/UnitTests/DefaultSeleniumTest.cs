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
			Assert.AreEqual(processor, selenium.Processor);
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