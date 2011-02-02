using System.Collections.Generic;
using System.Reflection;
using Castle.DynamicProxy;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Provides the ability to produce Page Objects modeling a page. This class cannot be inherited.
    /// </summary>
    public sealed class PageFactory
    {
        /// <summary>
        /// Prevents a default instance of the PageFactory class from being created.
        /// </summary>
        private PageFactory()
        {
        }

        /// <summary>
        /// Initializes the elements in the Page Object.
        /// </summary>
        /// <param name="driver">The driver used to find elements on the page.</param>
        /// <param name="page">The Page Object to be populated with elements.</param>
        public static void InitElements(ISearchContext driver, object page)
        {
            const BindingFlags BindingOptions = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Static | BindingFlags.FlattenHierarchy;
            var type = page.GetType();
            var fields = type.GetFields(BindingOptions);
            var properties = type.GetProperties(BindingOptions);
            var members = new List<MemberInfo>(fields);
            members.AddRange(properties);
            
            foreach (var member in members)
            {
                var attributes = member.GetCustomAttributes(typeof(FindsByAttribute), true);
                foreach (var attribute in attributes)
                {
                    var castedAttribute = (FindsByAttribute)attribute;
                    var generator = new ProxyGenerator();

                    var cacheAttributeType = typeof(CacheLookupAttribute);
                    var cache = member.GetCustomAttributes(cacheAttributeType, true).Length != 0 || member.DeclaringType.GetCustomAttributes(cacheAttributeType, true).Length != 0;
                    
                    var interceptor = new ProxiedWebElementInterceptor(driver, castedAttribute.FindMethods, cache);

                    var options = new ProxyGenerationOptions
                        {
                            BaseTypeForInterfaceProxy = typeof(WebElementProxyComparer)
                        };

                    var field = member as FieldInfo;
                    var property = member as PropertyInfo;
                    if (field != null)
                    {
                        var proxyElement = generator.CreateInterfaceProxyWithoutTarget(
                            typeof(IWrapsElement),
                            new[] { field.FieldType },
                            options,
                            interceptor);

                        field.SetValue(page, proxyElement);
                    }
                    else if (property != null)
                    {
                        var proxyElement = generator.CreateInterfaceProxyWithoutTarget(
                            typeof(IWrapsElement),
                            new[] { property.PropertyType },
                            options,
                            interceptor);

                        property.SetValue(page, proxyElement, null);
                    }
                }
            }
        }

        /// <summary>
        /// Provides an interceptor to assist in creating the Page Object. This class cannot be inherited.
        /// </summary>
        private sealed class ProxiedWebElementInterceptor : IInterceptor, IWrapsElement
        {
            private readonly ISearchContext searchContext;
            private readonly List<By> bys;
            private readonly bool cache;
            private IWebElement cachedElement;

            /// <summary>
            /// Initializes a new instance of the ProxiedWebElementInterceptor class.
            /// </summary>
            /// <param name="searchContext">The driver used to search for element.</param>
            /// <param name="bys">The list of methods by which to search for the elements.</param>
            /// <param name="cache"><see langword="true"/> to cache the lookup to the element; otherwise, <see langword="false"/>.</param>
            public ProxiedWebElementInterceptor(ISearchContext searchContext, List<By> bys, bool cache)
            {
                this.searchContext = searchContext;
                this.bys = bys;
                this.cache = cache;
            }

            /// <summary>
            /// Gets the element wrapped by this ProxiedWebElementInterceptor.
            /// </summary>
            public IWebElement WrappedElement
            {
                get
                {
                    if (this.cache && this.cachedElement != null)
                    {
                        return this.cachedElement;
                    }

                    string errorString = null;
                    foreach (var by in this.bys)
                    {
                        try
                        {
                            this.cachedElement = this.searchContext.FindElement(by);
                            return this.cachedElement;
                        }
                        catch (NoSuchElementException)
                        {
                            errorString = (errorString == null ? "Could not find element by: " : errorString + ", or: ") + by;
                        }
                    }

                    throw new NoSuchElementException(errorString);
                }
            }

            /// <summary>
            /// Intercepts calls to methods on the class.
            /// </summary>
            /// <param name="invocation">An IInvocation object describing the actual implementation.</param>
            public void Intercept(IInvocation invocation)
            {
                if (invocation.Method.Name == "get_WrappedElement")
                {
                    invocation.ReturnValue = this.WrappedElement;
                }
                else
                {
                    invocation.ReturnValue = invocation.GetConcreteMethod().Invoke(this.WrappedElement, invocation.Arguments);
                }
            }
        }
    }
}