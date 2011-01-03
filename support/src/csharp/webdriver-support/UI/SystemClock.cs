using System;

namespace OpenQA.Selenium.Support.UI
{
    public class SystemClock : IClock
    {
        public DateTime LaterBy(TimeSpan delay)
        {
            return DateTime.Now + delay;
        }

        public bool IsNowBefore(DateTime then)
        {
            return DateTime.Now < then;
        }

        public DateTime Now {
            get { return DateTime.Now; }
        }
    }
}
