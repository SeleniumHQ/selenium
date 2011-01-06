using System;
using System.Threading;

namespace OpenQA.Selenium.Support.UI
{
    // Example usage:
    // IWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(3))
    // IWebElement element = wait.until(driver => driver.FindElement(By.Name("q")));
    public class WebDriverWait : IWait<IWebDriver>
    {
        private static readonly TimeSpan DEFAULT_SLEEP_TIMEOUT = TimeSpan.FromMilliseconds(500);
    
        private readonly IClock clock;
        private readonly IWebDriver driver;
        private readonly TimeSpan timeout;
        private readonly TimeSpan sleepTimeout;

        public WebDriverWait(IWebDriver driver, TimeSpan timeout) : this(new SystemClock(), driver, timeout, DEFAULT_SLEEP_TIMEOUT)
        {
        }

        public WebDriverWait(IClock clock, IWebDriver driver, TimeSpan timeout, TimeSpan sleepTimeout)
        {
            this.clock = clock;
            this.driver = driver;
            this.timeout = timeout;
            this.sleepTimeout = sleepTimeout;
        }

        public TResult Until<TResult>(Func<IWebDriver, TResult> condition)
        {
            var resultType = typeof(TResult);
            if ((resultType.IsValueType && resultType != typeof(bool)) || !resultType.IsSubclassOf(typeof(object)))
            {
                throw new ArgumentException("Can only wait on an object or boolean response, tried to use type: " + resultType.ToString(), "condition");
            }

            NotFoundException lastException = null;
            var endTime = clock.LaterBy(timeout);
            while (clock.IsNowBefore(endTime))
            {
                try
                {
                    var result = condition(driver);
                    if (resultType == typeof(bool))
                    {
                        var boolResult = result as bool?;
                        if (boolResult.HasValue && boolResult.Value)
                        {
                            return result;
                        }
                    }
                    else
                    {
                        if (result != null)
                        {
                            return result;
                        }
                    }
                }
                catch (NotFoundException e)
                {
                    lastException = e;
                }

                Thread.Sleep(sleepTimeout);
            }

            throw new TimeoutException(string.Format("Timed out after {0} seconds", timeout.TotalSeconds), lastException);
        }
    
        protected virtual void ThrowTimeoutException(string message, Exception lastExcetpion)
        {
            throw new TimeoutException(message, lastExcetpion);
        }
    }
}