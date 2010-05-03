using OpenQA.Selenium;

namespace Selenium
{
	public interface ILookupStrategy
	{
		IWebElement Find(IWebDriver driver, string use);
	}
}
