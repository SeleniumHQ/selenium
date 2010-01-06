using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium
{
    public class Speed
    {
        public static readonly Speed Slow = new Speed("Slow", 1000);

        public static readonly Speed Medium = new Speed("Medium", 500);

        public static readonly Speed Fast = new Speed("Fast", 0);

        private int speedTimeout = 0;
        private string speedDescription = string.Empty;

        public static Speed FromString(string speedName)
        {
            Speed toReturn = Fast;
            if (string.Compare(speedName, "medium", StringComparison.OrdinalIgnoreCase) == 0)
            {
                toReturn = Medium;
            }
            if (string.Compare(speedName, "slow", StringComparison.OrdinalIgnoreCase) == 0)
            {
                toReturn = Slow;
            }
            return toReturn;
        }

        private Speed(string description, int timeout)
        {
            speedDescription = description;
            speedTimeout = timeout;
        }

        public int Timeout
        {
            get { return speedTimeout; }
        }

        public string Description
        {
            get { return speedDescription; }
        }
    }
}
