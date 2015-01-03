using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Support.PageObjects.Interfaces;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reflection;
using OpenQA.Selenium.Support.UI;
using System.Text;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// The default element locator, which will lazily locate an element or an element list on a page. This class is
    /// designed for use with the <see cref="PageFactory"/> and understands the
    /// annotations <see cref="FindsByAttribute"/> and <see cref="CacheLookupAttribute"/>.
    /// </summary>
    public class DefaultElementLocator: IElementLocator, IWrapsDriver
    {
        protected readonly MemberInfo Member;
        protected readonly ISearchContext SearchContext;
        protected readonly SearchParameterContainer SearchParameters;
        private readonly IAdjustableByTimeSpan TimeOutContainer;
        private IWebElement CachedElement;
        private ReadOnlyCollection<IWebElement> CachedElementCollection;
        private readonly bool ShouldCacheLookUp;


        public DefaultElementLocator(MemberInfo member, ISearchContext searchContext, IAdjustableByTimeSpan timeOutContainer)
        {
            this.Member = member;
            this.SearchContext = searchContext;
            this.TimeOutContainer = timeOutContainer;
            this.SearchParameters = new SearchParameterContainer();
            this.SearchParameters.Context = this.SearchContext;
            this.SearchParameters.TheGivenBys = CreateBys();
            ShouldCacheLookUp = ShouldCacheLookup();
        }

        /// <summary>
        /// An algorimthm which describes the waiting mechanism
        /// </summary>
        /// <returns>A read only collection of <see cref="IWebElement"/>s which are found. 
        /// If there is no relevant elements when the result is null</returns>
        private static Func<SearchParameterContainer, ReadOnlyCollection<IWebElement>> FindElements()
        {
            return (parameterContainer) => {
                ISearchContext context = parameterContainer.Context;
                ReadOnlyCollection<By> bys = parameterContainer.TheGivenBys;
                try
                {
                    List<IWebElement> collection = new List<IWebElement>();
                    foreach (var by in bys)
                    {
                        ReadOnlyCollection<IWebElement> list = context.FindElements(by);
                        collection.AddRange(list);
                    }
                    if (collection.Count > 0)
                    {
                        return collection.AsReadOnly();
                    }
                    return null;
                }
                catch (StaleElementReferenceException)
                {
                    return null;
                }

            };
        }

        /// <summary>
        /// </summary>
        /// <returns>IWebdriver instatnce which is wrapped by the given search context. This method could be overriden</returns>
        public IWebDriver WrappedDriver
        {
	        get { 
                    IWebDriver driver = SearchContext as IWebDriver;
                    if (driver != null)
                    {
                        return driver;
                    }
                    //RemoteWebElement implements IWrapsDriver and it is ISearchContext too
                    //So we can get IWebDriver from the element
                    //There can be something that wraps the original element
                    IWrapsElement wrapsElement = SearchContext as IWrapsElement;
                    IWebElement   element = SearchContext as IWebElement;

                    while (wrapsElement != null)
                    {
                        element = ((IWrapsElement) element).WrappedElement;
                        wrapsElement = element as IWrapsElement;
                    }

                    //so we get to the original RemoteWebElement instance
                    return ((IWrapsDriver) element).WrappedDriver;
            }
        }

        /// <summary>
        /// This method creates <see cref="By"/> strategies according to attributes
        /// which mark the target field. If it is nesessary you can make your own 
        /// subclass of DefaultElementLocator and override this method
        /// </summary>
        /// <returns></returns>
        protected virtual ReadOnlyCollection<By> CreateBys()
        {
            var useSequenceAttributes = Attribute.GetCustomAttributes(Member, typeof(FindsBySequenceAttribute), true);
            bool useSequence = useSequenceAttributes.Length > 0;

            List<By> bys = new List<By>();
            var attributes = Attribute.GetCustomAttributes(Member, typeof(FindsByAttribute), true);
            if (attributes.Length > 0)
            {
                Array.Sort(attributes);
                foreach (var attribute in attributes)
                {
                    var castedAttribute = (FindsByAttribute)attribute;
                    if (castedAttribute.Using == null)
                    {
                        castedAttribute.Using = Member.Name;
                    }

                    bys.Add(castedAttribute.Finder);
                }

                if (useSequence)
                {
                    ByChained chained = new ByChained(bys.ToArray());
                    bys.Clear();
                    bys.Add(chained);
                }
            }

            if (attributes.Length == 0)
            {
                bys.Add(new ByIdOrName(Member.Name));
            }
            return bys.AsReadOnly();
        }

        public IWebElement Element
        {
            get 
            {
                if (CachedElement != null && ShouldCacheLookUp)
                {
                    return CachedElement;
                }
                ReadOnlyCollection<IWebElement> result = WaitFor();
                if (result.Count == 0)
                {
                    throw new NoSuchElementException("Cann't locate an element by this strategies: " + SearchParameters.TheGivenBys.ToString());
                }

                if (ShouldCacheLookUp)
                {
                    CachedElement = result[0];
                }
                return result[0];
            }
        }

        /// <summary>
        /// This method checks the presence of <see cref="CacheLookupAttribute"/>
        /// attribute. Field or class are checked. 
        /// </summary>
        /// <returns>true if the given field or declaring class have attribute <see cref="CacheLookupAttribute"/>. False is returned otherwise.</returns>
        private bool ShouldCacheLookup()
        {
            var cacheAttributeType = typeof(CacheLookupAttribute);
            bool cache = Member.GetCustomAttributes(cacheAttributeType, true).Length != 0 ||
                Member.DeclaringType.GetCustomAttributes(cacheAttributeType, true).Length != 0;
            return cache;
        }

        private ReadOnlyCollection<IWebElement> WaitFor()
        {
            IWebDriver driver = WrappedDriver;
            ITimeouts timeOuts = driver.Manage().Timeouts();

            DefaultWait<SearchParameterContainer> wait = new DefaultWait<SearchParameterContainer>(SearchParameters);
            wait.Timeout = TimeOutContainer.WaitingTimeSpan;
            wait.PollingInterval = TimeOutContainer.TimeForSleeping;

            timeOuts.ImplicitlyWait(TimeSpan.MinValue);
            ReadOnlyCollection<IWebElement> result;
            try
            {
                result = wait.Until(FindElements());
            }
            catch (WebDriverTimeoutException)
            {
                result = new ReadOnlyCollection<IWebElement>(new List<IWebElement>());
            }
            finally
            {
                timeOuts.ImplicitlyWait(TimeOutContainer.WaitingTimeSpan);
            }
            return result;
        }

        public ReadOnlyCollection<IWebElement> Elements
        {
            get 
            {
                if (CachedElementCollection != null && ShouldCacheLookUp)
                {
                    return CachedElementCollection;
                }

                ReadOnlyCollection<IWebElement> result = WaitFor();

                if (ShouldCacheLookUp)
                {
                    CachedElementCollection = result;
                }
                return result;
            }

        }

        public class SearchParameterContainer
        {
            private ReadOnlyCollection<By> Bys;
            private ISearchContext SearchContext;

            public ReadOnlyCollection<By> TheGivenBys
            { 
                set 
                {
                    Bys = value;
                }
                get 
                {
                    return Bys;
                }
            }
            public ISearchContext Context
            {
                set
                {
                    SearchContext = value;
                }
                get
                {
                    return SearchContext;
                }
            }
        }
}
}
