using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace Selenium.Internal.SeleniumEmulation
{
    abstract class Waiter
    {
        public Waiter()
        {
        }

        public Waiter(string messageToShowIfTimeout)
        {
            Wait(messageToShowIfTimeout, DefaultTimeout, DefaultInterval);
        }

        /** Returns true when it's time to stop waiting */
        public abstract bool Until();

        /** The amount of time to wait before giving up; the default is 30 seconds */
        public static long DefaultTimeout = 30000L;

        /** The interval to pause between checking; the default is 500 milliseconds */
        public static long DefaultInterval = 500L;

        /** Wait Until the "Until" condition returns true or time runs out.
         * 
         * @param message the failure message
         * @param timeoutInMilliseconds the amount of time to wait before giving up
         * @throws WaitTimedOutException if "Until" doesn't return true Until the timeout
         * @see #Until()
         */

        public void Wait(string message)
        {
            Wait(message, DefaultTimeout, DefaultInterval);
        }

        /** Wait Until the "Until" condition returns true or time runs out.
     * 
     * @param message the failure message
     * @param timeoutInMilliseconds the amount of time to wait before giving up
     * @throws WaitTimedOutException if "Until" doesn't return true Until the timeout
     * @see #Until()
     */

        public void Wait(string message, long timeoutInMilliseconds)
        {
            Wait(message, timeoutInMilliseconds, DefaultInterval);
        }

        /** Wait Until the "Until" condition returns true or time runs out.
     * 
     * @param message the failure message
     * @param timeoutInMilliseconds the amount of time to wait before giving up
     * @param intervalInMilliseconds the interval to pause between checking "Until"
     * @throws WaitTimedOutException if "Until" doesn't return true Until the timeout
     * @see #Until()
     */

        public void Wait(string message, long timeoutInMilliseconds, long intervalInMilliseconds)
        {
            DateTime end = DateTime.Now.AddMilliseconds(timeoutInMilliseconds);
            ParameterizedThreadStart executionFunction = new ParameterizedThreadStart(CheckForConditionUntilTimeout);
            Thread workerThread = new Thread(executionFunction);
            workerThread.Name = "WebDriver";
            workerThread.Start(intervalInMilliseconds);
            workerThread.Join((int)timeoutInMilliseconds);
            if (workerThread.IsAlive)
            {
                workerThread.Abort();
                throw new WaitTimedOutException(message);
            }
        }

        public class WaitTimedOutException : Exception
        {
            public WaitTimedOutException(string message)
            {
            }
        }

        private void CheckForConditionUntilTimeout(object intervalInMilliseconds)
        {
            long sleepInterval = (long)intervalInMilliseconds;
            if (!Until())
            {
                Thread.Sleep(TimeSpan.FromMilliseconds(sleepInterval));
            }
        }
    }
}
