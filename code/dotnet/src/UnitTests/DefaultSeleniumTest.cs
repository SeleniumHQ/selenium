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
		private IBrowserLauncher launcher;
		private Mock mockProcessor;
		private Mock mockLauncher;

		[SetUp]
		public void SetupTest()
		{
			mockProcessor = new DynamicMock(typeof (ICommandProcessor));
			processor = (ICommandProcessor) mockProcessor.MockInstance;
			mockLauncher = new DynamicMock(typeof(IBrowserLauncher));
			launcher = (IBrowserLauncher) mockLauncher.MockInstance;
			selenium = new DefaultSelenium(processor, launcher);
		}

		[TearDown]
		public void TeardownTest()
		{
			mockProcessor.Verify();
			mockLauncher.Verify();
		}

		[Test]
		public void InstantiateSeleniumShouldWork()
		{
			Assert.AreEqual(processor, selenium.Processor);
			Assert.AreEqual(launcher, selenium.Launcher);
		}

		[Test]
		public void StartSeleniumShouldWork()
		{
			mockLauncher.Expect("Launch", DefaultSelenium.SELENIUM_DRIVER_URL);
			selenium.Start();
		}

		[Test]
		public void StopSeleniumShouldWork()
		{
			mockLauncher.Expect("Close");
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