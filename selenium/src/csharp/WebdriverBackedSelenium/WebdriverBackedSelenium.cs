/*
 * Created by SharpDevelop.
 * User: anog
 * Date: 07-04-2010
 * Time: 22:15
 * 
 * To change this template use Tools | Options | Coding | Edit Standard Headers.
 */
using System;
using OpenQA.Selenium;

namespace Selenium
{
	/// <summary>
	/// Description of WebdriverBackedSelenium.
	/// </summary>
	public class WebDriverBackedSelenium : DefaultSelenium
	{
//		public WebDriverBackedSelenium(Supplier<IWebDriver> maker, String baseUrl) {
//			super(new WebDriverCommandProcessor(baseUrl, maker));
//		}
		
		public WebDriverBackedSelenium(IWebDriver baseDriver, String baseUrl) : 
            base(new WebDriverCommandProcessor(baseUrl, baseDriver)) 
		{
			
		}
		
		public IWebDriver GetUnderlyingWebDriver() 
		{
			return ((WebDriverCommandProcessor) commandProcessor).GetUnderlyingWebDriver();
		}
	}
}
