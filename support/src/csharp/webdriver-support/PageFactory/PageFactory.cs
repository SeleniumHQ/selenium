using System.Collections.Generic;
using System.Reflection;
using Castle.DynamicProxy;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Support.PageFactory
{
    public sealed class PageFactory
    {
        public static void InitElements(IWebDriver driver, object page)
        {
            const BindingFlags bindingFlags = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Static | BindingFlags.FlattenHierarchy;
            var type = page.GetType();
            var fields = type.GetFields(bindingFlags);
            var properties = type.GetProperties(bindingFlags);
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
                    
                    var interceptor = new ProxiedWebElementInterceptor(driver, castedAttribute.Bys, cache);

                    var options = new ProxyGenerationOptions
                        {
                            BaseTypeForInterfaceProxy = typeof(ProxiedWebElementComparator)
                        };
                    if (member is FieldInfo)
                    {
                        var field = member as FieldInfo;
                        var proxyElement = generator.CreateInterfaceProxyWithoutTarget(typeof (IWrapsElement),
                                                                                       new[] {field.FieldType},
                                                                                       options,
                                                                                       interceptor);
                        field.SetValue(page, proxyElement);
                    }
                    else if (member is PropertyInfo)
                    {
                        var property = member as PropertyInfo;
                        var proxyElement = generator.CreateInterfaceProxyWithoutTarget(typeof(IWrapsElement),
                                                                                       new[] { property.PropertyType },
                                                                                       options,
                                                                                       interceptor);
                        property.SetValue(page, proxyElement, null);
                    }
                }
            }
        }

        private sealed class ProxiedWebElementInterceptor : IInterceptor, IWrapsElement
        {
            private readonly IWebDriver driver;
            private readonly List<By> bys;
            private readonly bool cache;
            private IWebElement cachedElement;

            public ProxiedWebElementInterceptor(IWebDriver driver, List<By> bys, bool cache)
            {
                this.driver = driver;
                this.bys = bys;
                this.cache = cache;
            }

            public void Intercept(IInvocation invocation)
            {
                if (invocation.Method.Name == "get_WrappedElement")
                {
                    invocation.ReturnValue = WrappedElement;
                }
                else
                {
                    invocation.ReturnValue = invocation.GetConcreteMethod().Invoke(WrappedElement, invocation.Arguments);
                }
            }

            public IWebElement WrappedElement
            {
                get
                {
                    if (cache && cachedElement != null)
                    {
                        return cachedElement;
                    }
                    string errorString = null;
                    foreach (var by in bys)
                    {
                        try
                        {
                            cachedElement = driver.FindElement(by);
                            return cachedElement;
                        }
                        catch (NoSuchElementException)
                        {
                            errorString = (errorString == null ? ("Could not find element by: ") : errorString + ", or: ") + by;
                        }
                    }
                    throw new NoSuchElementException(errorString);
                }
            }
        }

        //Boilerplate to pass equality checks on to proxied object
        public class ProxiedWebElementComparator
        {
            public override bool Equals(object obj)
            {
                var wrapper = this as IWrapsElement;
                if (wrapper == null)
                {
                    return base.Equals(obj);
                }
                return wrapper.WrappedElement.Equals(obj);
            }

            public override int GetHashCode()
            {
                var wrapper = this as IWrapsElement;
                if (wrapper == null)
                {
                    return base.GetHashCode();
                }
                return wrapper.WrappedElement.GetHashCode();
            }
        }
    }
}