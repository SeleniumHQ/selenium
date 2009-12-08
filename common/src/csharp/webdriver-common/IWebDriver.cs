using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public interface IWebDriver : IDisposable
    {
        string Url
        {
            get;
            set;
        }

        string Title
        {
            get;
        }

        IWebElement FindElement(By mechanism);

        List<IWebElement> FindElements(By mechanism);

        String PageSource
        {
            get;
        }

        void Close();

        void Quit();

        IOptions Manage();

        INavigation Navigate();

        ITargetLocator SwitchTo();

        List<String> GetWindowHandles();

        String GetWindowHandle();
    }
}
