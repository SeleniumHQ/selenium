using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public class Speed
    {
        public static readonly Speed Slow = new Speed(1000);
        public static readonly Speed Medium = new Speed(500);
        public static readonly Speed Fast = new Speed(0);

        private int _timeout = 0;

        private Speed(int timeout)
        {
            _timeout = timeout;
        }

        public int Timeout
        {
            get { return _timeout; }
        }
    }
}
