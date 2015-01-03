using Castle.DynamicProxy;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Support.PageObjects.Interfaces;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Reflection;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Default decorator for use with <see cref="PageFactory"/>. Will decorate 1) all of the
    /// <see cref="IWebElement"/> fields/properties and 2) IList of <see cref="IWebElement"/> fields/properties that have 
    /// <see cref="FindsByAttribute"/>, <see cref="FindsBySequenceAttribute"/>,
    /// attributes with a proxy that locates the elements using the passed
    /// in <see cref="ILocatorFactory"/>.
    /// 
    /// Note!!! Your own attributes and <see cref="ILocatorFactory"/> are appreciated. 
    /// </summary>
    public class DefaultFieldDecorator: IFieldDecorator, IAdjustableByTimeSpan
    {

        private readonly ILocatorFactory Factory;
        private readonly List<Type> InterfacesThatCanBeProxiedAsWebElement = new List<Type>();

        /// <summary>
        /// This decorator uses ILocatorFactory instance in order to 
        /// populate fields / set properties
        /// </summary>
        /// <param name="factory"></param>
        public DefaultFieldDecorator(ILocatorFactory factory)
        {
            if (factory == null)
            {
                throw new ArgumentNullException("The given Locator factory should not be NULL!");
            }
            this.Factory = factory;
            InterfacesThatCanBeProxiedAsWebElement.AddRange(typeof(RemoteWebElement).GetInterfaces());
            InterfacesThatCanBeProxiedAsWebElement.Add(typeof(IWrapsElement));
        }

        /// <summary>
        /// This method can be used by external for Selenium projects where IWebElement implementors
        /// implement more interfaces than it does RemoteWebElement
        /// </summary>
        /// <param name="interfacesToByProxied">Additional interfaces which have to be proxied. They should be related to
        /// IWebElement implentors at external for Selenium projects</param>
        public void AddInterfacesToByProxied(List<Type> interfacesToByProxied)
        {
            foreach (var type in interfacesToByProxied)
            {
                if (type.IsInterface)
                {
                    continue;
                }
                throw new ArgumentException("One of given types is not interface. It is " + type.Name, "interfacesToByProxied");
            }
            InterfacesThatCanBeProxiedAsWebElement.AddRange(interfacesToByProxied);
        }

        /// <summary>
        /// This decorator returns values if :
        /// - The declared type of field or property is IWebElement or any interface implemented by <see cref="RemoteWebElement"/>
        /// - The declared type of field or property is IList. The declared 
        /// generic parameter type should be IWebElement or any interface implemented by <see cref="RemoteWebElement"/>.
        /// </summary>
        /// <param name="member"></param>
        /// <returns></returns>
        public object Decorate(MemberInfo member)
        {
            return CreateProxy(member);
        }

        /// <summary>
        /// This method creates proxies in order to populate 
        /// fields/set properties of page object. It can be overridden when it is needed.
        /// </summary>
        /// <param name="member"></param>
        /// <returns></returns>
        protected virtual Object CreateProxy(MemberInfo member)
        {
            FieldInfo field = member as FieldInfo;
            PropertyInfo property = member as PropertyInfo;

            Type targetType = null;
            if (field != null)
            {
                targetType = field.FieldType;
            }

            bool hasPropertySet = false;
            if (property != null)
            {
                hasPropertySet = (property.CanWrite);
                targetType = property.PropertyType;
            }

            if (field == null & (property == null | !hasPropertySet))
            {
                return null;
            }

            IElementLocator locator = Factory.CreateElementLocator(member);
            ProxyGenerator proxyGenerator = new ProxyGenerator();

            if (InterfacesThatCanBeProxiedAsWebElement.Contains(targetType))
            {
                return proxyGenerator.CreateInterfaceProxyWithoutTarget(typeof(IWebElement), 
                    InterfacesThatCanBeProxiedAsWebElement.ToArray(),
                    new ElementInterceptor(locator));
            }

            foreach (var type in InterfacesThatCanBeProxiedAsWebElement)
            {
                Type listType = typeof(IList<>).MakeGenericType(type);
                if (listType.Equals(targetType))
                {
                    return proxyGenerator.CreateInterfaceProxyWithoutTarget(targetType,
                        new ElementCollectionInterceptor(locator));
                }
            }
            return null;
        }

        /// <summary>
        /// This property gets/sets waiting time at if the given 
        /// <see cref="ILocatorFactory"/> implements <see cref="IAdjustableByTimeSpan"/>.
        /// Otherwise it does nothing (set) and returns TimeSpan.MinVlue.
        /// </summary>
        public TimeSpan WaitingTimeSpan
        {
            get
            {
                IAdjustableByTimeSpan adjustableByTimeSpan = Factory as IAdjustableByTimeSpan;
                if (adjustableByTimeSpan != null)
                {
                    return adjustableByTimeSpan.WaitingTimeSpan;
                }
                return TimeSpan.MinValue;
            }
            set
            {
                IAdjustableByTimeSpan adjustableByTimeSpan = Factory as IAdjustableByTimeSpan;
                if (adjustableByTimeSpan != null)
                {
                    adjustableByTimeSpan.WaitingTimeSpan = value;
                }
            }
        }

        /// <summary>
        /// This property gets/sets sleeping (polling) time at if the given 
        /// <see cref="ILocatorFactory"/> implements <see cref="IAdjustableByTimeSpan"/>.
        /// Otherwise it does nothing (set) and returns TimeSpan.MinVlue.
        /// </summary>
        public TimeSpan TimeForSleeping
        {
            get
            {
                IAdjustableByTimeSpan adjustableByTimeSpan = Factory as IAdjustableByTimeSpan;
                if (adjustableByTimeSpan != null)
                {
                    return adjustableByTimeSpan.TimeForSleeping;
                }
                return TimeSpan.MinValue;
            }
            set
            {
                IAdjustableByTimeSpan adjustableByTimeSpan = Factory as IAdjustableByTimeSpan;
                if (adjustableByTimeSpan != null)
                {
                    adjustableByTimeSpan.TimeForSleeping = value;
                }
            }
        }

        /// <returns>True if if the given 
        /// <see cref="ILocatorFactory"/> implements <see cref="IAdjustableByTimeSpan"/>.</returns>
        public bool IsAdjustableByTimeSpan()
        {
            return ((Factory as IAdjustableByTimeSpan) != null);
        }
    }
}
