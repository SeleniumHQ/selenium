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
            var fields = page.GetType().GetFields(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Static | BindingFlags.FlattenHierarchy);
            
            foreach (var field in fields)
            {
                var attributes = field.GetCustomAttributes(typeof(FindsByAttribute), true);
                foreach (var attribute in attributes)
                {
                    var castedAttribute = (FindsByAttribute)attribute;
                    var generator = new ProxyGenerator();
                    var interceptor = new ProxiedWebElementInterceptor(driver, castedAttribute.Bys);

                    var options = new ProxyGenerationOptions
                        {
                            BaseTypeForInterfaceProxy = typeof(ProxiedWebElementComparator)
                        };
                    var proxyElement = generator.CreateInterfaceProxyWithoutTarget(typeof(IWrapsElement), new[] {field.FieldType}, options, interceptor);
                    field.SetValue(page, proxyElement);
                }
            }
        }

        private sealed class ProxiedWebElementInterceptor : IInterceptor, IWrapsElement
        {
            private readonly IWebDriver driver;
            private readonly List<By> bys;

            public ProxiedWebElementInterceptor(IWebDriver driver, List<By> bys)
            {
                this.driver = driver;
                this.bys = bys;
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
                    string errorString = null;
                    foreach (var by in bys)
                    {
                        try
                        {
                            return driver.FindElement(by);
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