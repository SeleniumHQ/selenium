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
            //TODO(dawagner): This type-checking is ugly, I'd love a better way...
            var type = typeof(TResult);
            if (type.IsClass || type.IsInterface)
            {
                return Until(condition, x => x != null);
            }
            if (type.IsValueType)
            {
                if (type == typeof(bool))
                {
                    return Until(condition, x => Boolean.Parse("" + x));
                }
            }
            throw new ArgumentException("Can only wait on an object or boolean response, tried to use type: " + typeof(TResult));
        }
        
        private TResult Until<TResult>(Func<IWebDriver, TResult> condition, Func<TResult, bool> check)
        {
            var end = clock.LaterBy(timeout);
            NotFoundException lastException = null;

            while (clock.IsNowBefore(end))
            {
                try
                {
                    var value = condition.Invoke(driver);

                    if (check(value))
                    {
                        return value;
                    }
                }
                catch (NotFoundException e) {
                    // Common case in many conditions, so swallow here, but be ready to
                    // rethrow if it the element never appears.
                    lastException = e;
                }
                Thread.Sleep(sleepTimeout);
            }
            ThrowTimeoutException(String.Format("Timed out after {0} seconds", timeout), lastException);
            throw new WebDriverException("ThrowTimeoutException should have thrown an exception");
        }
    
        protected virtual void ThrowTimeoutException(string message, Exception lastExcetpion)
        {
            throw new TimeoutException(message, lastExcetpion);
        }
    }
}