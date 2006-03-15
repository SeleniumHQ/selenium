using NMock;
using NUnit.Framework;
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
			mockProcessor.ExpectAndReturn("DoCommand", "OK", new string[]{"chooseCancelOnNextConfirmation", "", ""});
			selenium.ChooseCancelOnNextConfirmation();
		}

		[Test]
		[ExpectedException(typeof(SeleniumException))]
		public void ChooseCancelOnNextConfirmationFailsIfResultIsNotOK()
		{
			mockProcessor.ExpectAndReturn("DoCommand", "Error", new string[]{"chooseCancelOnNextConfirmation", "", ""});
			selenium.ChooseCancelOnNextConfirmation();
		}

		[Test]
		public void ClickShouldWork()
		{
			string fieldname= "somefieldname";
			mockProcessor.ExpectAndReturn("DoCommand", "OK", new string[] {"click", fieldname, ""});
			selenium.Click(fieldname);
		}

		
		[Test]
		[ExpectedException (typeof(SeleniumException))]
		public void ClickShouldFailWhenOKIsNotReturned()
		{
			string fieldname = "fieldname";

			mockProcessor.ExpectAndReturn("DoCommand", "Error", new string[]{"click", fieldname, ""});
			selenium.Click(fieldname);
		}

		[Test]
		public void VerifySelectedOptionsShouldWork()
		{
			string[] values = {"1","2","3","4","5","6"};
			string fieldname = "fieldname";
			mockProcessor.ExpectAndReturn("DoCommand","PASSED", new object[]{"verifySelectOptions", fieldname, "1,2,3,4,5,6"} );
			selenium.VerifySelectOptions(fieldname, values);
		}

		[Test]
		public void GetAllButtonsShouldWork()
		{
			mockProcessor.ExpectAndReturn("DoCommand", "1,2,3,4,5,6", new object[]{"getAllButtons", "", ""});
			string[] actualResult = selenium.GetAllButtons();
			Assert.AreEqual(new string[] {"1","2","3","4","5","6"}, actualResult);
		}

		[Test]
		public void GetAllLinksShouldWork()
		{
			mockProcessor.ExpectAndReturn("DoCommand", "1,2,3,4,5,6", new object[]{"getAllLinks", "", ""});
			string[] actualResult = selenium.GetAllLinks();
			Assert.AreEqual(new string[] {"1","2","3","4","5","6"}, actualResult);
		}

		[Test]
		public void GetAllFieldsShouldWork()
		{
			mockProcessor.ExpectAndReturn("DoCommand", "1,2,3,4,5,6", new object[]{"getAllFields", "", ""});
			string[] actualResult = selenium.GetAllFields();
			Assert.AreEqual(new string[] {"1","2","3","4","5","6"}, actualResult);
		}


	}
}