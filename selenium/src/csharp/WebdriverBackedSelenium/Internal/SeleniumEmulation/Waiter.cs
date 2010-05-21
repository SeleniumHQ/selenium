using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;
using System.Threading;

namespace Selenium.Internal.SeleniumEmulation
{
    internal abstract class Waiter
    {
        /** The amount of time to wait before giving up; the default is 30 seconds */
        private const long DefaultTimeout = 30000L;

        /** The interval to pause between checking; the default is 500 milliseconds */
        private const long DefaultInterval = 500L;

        public Waiter()
        {
        }
        
        /// <summary>
        /// Wait Until the "Until" condition returns true or time runs out.
        /// </summary>
        /// <param name="message">the failure message</param>
        public void Wait(string message)
        {
            Wait(message, DefaultTimeout, DefaultInterval);
        }

        /// <summary>
        /// Wait Until the "Until" condition returns true or time runs out.
        /// </summary>
        /// <param name="message">the failure message</param>
        /// <param name="timeoutInMilliseconds">the amount of time to wait before giving up</param>
        /// <exception cref="WaitTimedOutException">if "Until" doesn't return true Until the timeout</exception>
        public void Wait(string message, long timeoutInMilliseconds)
        {
            Wait(message, timeoutInMilliseconds, DefaultInterval);
        }

        /// <summary>
        /// Wait Until the "Until" condition returns true or time runs out.
        /// </summary>
        /// <param name="message">the failure message</param>
        /// <param name="timeoutInMilliseconds">the amount of time to wait before giving up</param>
        /// <param name="intervalInMilliseconds">intervalInMilliseconds the interval to pause between checking "Until"</param>
        /// <exception cref="WaitTimedOutException">if "Until" doesn't return true Until the timeout</exception>
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

        /// <summary>
        /// The function called to wait for the condition
        /// </summary>
        /// <returns>Returns true when it's time to stop waiting </returns>
        public abstract bool Until();

        private void CheckForConditionUntilTimeout(object intervalInMilliseconds)
        {
            long sleepInterval = (long)intervalInMilliseconds;
            if (!Until())
            {
                Thread.Sleep(TimeSpan.FromMilliseconds(sleepInterval));
            }
        }

        [Serializable]
        public class WaitTimedOutException : Exception
        {
            public WaitTimedOutException(string message)
                : base(message)
            {
            }

            protected WaitTimedOutException(SerializationInfo info, StreamingContext context)
                : base(info, context)
            {
            }
        }
    }
}
