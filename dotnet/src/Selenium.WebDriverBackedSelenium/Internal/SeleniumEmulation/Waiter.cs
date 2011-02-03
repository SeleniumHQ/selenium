using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;
using System.Threading;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Provides methods to wait for a condition to be true.
    /// </summary>
    internal abstract class Waiter
    {
        /** The amount of time to wait before giving up; the default is 30 seconds */
        private const long DefaultTimeout = 30000L;

        /** The interval to pause between checking; the default is 500 milliseconds */
        private const long DefaultInterval = 500L;

        /// <summary>
        /// Initializes a new instance of the <see cref="Waiter"/> class.
        /// </summary>
        public Waiter()
        {
        }
        
        /// <summary>
        /// Wait Until the "Until" condition returns true or time runs out.
        /// </summary>
        /// <param name="message">the failure message</param>
        public void Wait(string message)
        {
            this.Wait(message, DefaultTimeout, DefaultInterval);
        }

        /// <summary>
        /// Wait Until the "Until" condition returns true or time runs out.
        /// </summary>
        /// <param name="message">the failure message</param>
        /// <param name="timeoutInMilliseconds">the amount of time to wait before giving up</param>
        /// <exception cref="WaitTimedOutException">if "Until" doesn't return true Until the timeout</exception>
        public void Wait(string message, long timeoutInMilliseconds)
        {
            this.Wait(message, timeoutInMilliseconds, DefaultInterval);
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
            ParameterizedThreadStart executionFunction = new ParameterizedThreadStart(this.CheckForConditionUntilTimeout);
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
            if (!this.Until())
            {
                Thread.Sleep(TimeSpan.FromMilliseconds(sleepInterval));
            }
        }

        /// <summary>
        /// The exception that is thrown when the time allotted for a wait has expired.
        /// </summary>
        [Serializable]
        public class WaitTimedOutException : Exception
        {
            /// <summary>
            /// Initializes a new instance of the <see cref="WaitTimedOutException"/> class with the specified error message.
            /// </summary>
            /// <param name="message">The message used as part of the exception.</param>
            public WaitTimedOutException(string message)
                : base(message)
            {
            }

            /// <summary>
            /// Initializes a new instance of the <see cref="WaitTimedOutException"/> class with serialized data.
            /// </summary>
            /// <param name="info">The <see cref="SerializationInfo"/> object that contains serialized object data about the exception being thrown.</param>
            /// <param name="context">The <see cref="StreamingContext"/> object that contains contextual information about the source or destination.</param>
            protected WaitTimedOutException(SerializationInfo info, StreamingContext context)
                : base(info, context)
            {
            }
        }
    }
}
