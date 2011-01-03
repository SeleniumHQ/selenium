using System;

namespace OpenQA.Selenium.Support.UI
{
    public interface IClock
    {
        DateTime Now { get; }

        DateTime LaterBy(TimeSpan delay);

        bool IsNowBefore(DateTime then);
    }
}