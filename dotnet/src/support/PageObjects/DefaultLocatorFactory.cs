using OpenQA.Selenium.Support.PageObjects.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// The default ILocatorFactory implementor
    /// </summary>
    public class DefaultLocatorFactory: ILocatorFactory, IAdjustableByTimeSpan
    {

        private static readonly TimeSpan DefaultWaitingTime = TimeSpan.FromSeconds(5);
        private static readonly TimeSpan DefaultSleepingTime = TimeSpan.FromMilliseconds(500);

        protected TimeSpan WaitingTime;
        protected TimeSpan SleepingTime;
        protected readonly ISearchContext SearchContext;

        /// <summary>
        /// It uses the given ISearchContext (IWebdriver or IWebElement) instance and 
        /// the waiting/sleeping timeouts
        /// </summary>
        /// <param name="searchContext">IWebdriver or IWebElement instance</param>
        /// <param name="waitingTime">The waiting timeout</param>
        /// <param name="sleepingTime">The sleeping/polling timeout</param>
        public DefaultLocatorFactory(ISearchContext searchContext, TimeSpan waitingTime, TimeSpan sleepingTime)
        {
            this.SearchContext = searchContext;
            this.WaitingTime = waitingTime;
            this.SleepingTime = sleepingTime;
        }

        /// <summary>
        /// It uses the given ISearchContext (IWebdriver or IWebElement) instance. The default waiting
        /// timeout is 5 seconds. The default sleeping/polling timeout is 500 milliseconds.
        /// </summary>
        /// <param name="searchContext">IWebdriver or IWebElement instance</param>
        public DefaultLocatorFactory(ISearchContext searchContext)
            :this(searchContext, DefaultWaitingTime, DefaultSleepingTime)
        {
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="member"></param>
        /// <returns></returns>
        public IElementLocator CreateElementLocator(MemberInfo member)
        {
            return new DefaultElementLocator(member, SearchContext, this);
        }

        public TimeSpan WaitingTimeSpan
        {
            get
            {
               return WaitingTime;
            }
            set
            {
                WaitingTime = value;
            }
        }

        public TimeSpan TimeForSleeping
        {
            get
            {
                return SleepingTime;
            }
            set
            {
                SleepingTime = value;
            }
        }
    }
}
