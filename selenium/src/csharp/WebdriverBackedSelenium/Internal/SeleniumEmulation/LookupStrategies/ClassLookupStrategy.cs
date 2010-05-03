
using System;
using OpenQA.Selenium;
namespace Selenium
{


	public class ClassLookupStrategy : ILookupStrategy
	{
		
		public OpenQA.Selenium.IWebElement Find (OpenQA.Selenium.IWebDriver driver, string use)
		{
            return driver.FindElement(By.ClassName(use));
		}

		public ClassLookupStrategy ()
		{
		}
	}
}
