
using System;
using OpenQA.Selenium;

namespace Selenium
{


	public class IdentifierLookupStrategy : ILookupStrategy
	{

		public OpenQA.Selenium.IWebElement Find(OpenQA.Selenium.IWebDriver driver, string use)
		{
            return driver.FindElement(By.Id(use));
		}
	}
}
