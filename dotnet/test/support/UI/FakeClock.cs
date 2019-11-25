using System;

namespace OpenQA.Selenium.Support.UI
{

    public class FakeClock : IClock
    {

        private DateTime fakeNow = new DateTime(50000);
        public DateTime Now
        {
            get
            {
                return fakeNow;
            }
        }

        public DateTime LaterBy(TimeSpan delay)
        {
            return Now + delay;

        }

        public bool IsNowBefore(DateTime otherDateTime)
        {
            return Now < otherDateTime;
        }

        public void TimePasses(TimeSpan timespan)
        {
            fakeNow = fakeNow + timespan;
        }
    }

}
