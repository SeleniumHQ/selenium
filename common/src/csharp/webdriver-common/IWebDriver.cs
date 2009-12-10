using System;
using System.Collections.Generic;
using System.Text;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
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

        ReadOnlyCollection<IWebElement> FindElements(By mechanism);

        String PageSource
        {
            get;
        }

        void Close();

        void Quit();

        IOptions Manage();

        INavigation Navigate();

        ITargetLocator SwitchTo();

        ReadOnlyCollection<String> GetWindowHandles();

        String GetWindowHandle();
    }
}
