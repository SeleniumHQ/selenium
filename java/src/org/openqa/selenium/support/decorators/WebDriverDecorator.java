// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.support.decorators;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import net.bytebuddy.ByteBuddy;
import net.bytebuddy.description.modifier.Visibility;
import net.bytebuddy.dynamic.loading.ClassLoadingStrategy;
import net.bytebuddy.implementation.FieldAccessor;
import net.bytebuddy.implementation.InvocationHandlerAdapter;
import net.bytebuddy.matcher.ElementMatchers;
import org.openqa.selenium.Alert;
import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrapsDriver;
import org.openqa.selenium.WrapsElement;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticator;

/**
 * This class helps to create decorators for instances of {@link WebDriver} and derived objects,
 * such as {@link WebElement}s and {@link Alert}, that can extend or modify their "regular"
 * behavior. It provides a flexible alternative to subclassing WebDriver.
 *
 * <p>Here is a general usage pattern:
 *
 * <ol>
 *   <li>implement a subclass of WebDriverDecorator that adds something to WebDriver behavior:<br>
 *       <pre><code>
 * public class MyWebDriverDecorator extends WebDriverDecorator { ... }
 *     </code></pre>
 *       (see below for details)
 *   <li>use a decorator instance to decorate a WebDriver object:<br>
 *       <pre><code>
 * WebDriver original = new FirefoxDriver();
 * WebDriver decorated = new MyWebDriverDecorator().decorate(original);
 *     </code></pre>
 *   <li>use the decorated WebDriver instead of the original one:<br>
 *       <pre><code>
 * decorated.get("http://example.com/");
 * ...
 * decorated.quit();
 *    </code></pre>
 * </ol>
 *
 * By subclassing WebDriverDecorator you can define what code should be executed
 *
 * <ul>
 *   <li>before executing a method of the underlying object,
 *   <li>after executing a method of the underlying object,
 *   <li>instead of executing a method of the underlying object,
 *   <li>when an exception is thrown by a method of the underlying object.
 * </ul>
 *
 * The same decorator is used under the hood to decorate all the objects derived from the underlying
 * WebDriver instance. For example, <code>decorated.findElement(someLocator)</code> automatically
 * decorates the returned WebElement.
 *
 * <p>Instances created by the decorator implement all the same interfaces as the original objects.
 *
 * <p>When you implement a decorator there are two main options (that can be used both separately
 * and together):
 *
 * <ul>
 *   <li>if you want to apply the same behavior modification to all methods of a WebDriver instance
 *       and its derived objects you can subclass WebDriverDecorator and override some of the
 *       following methods: {@link #beforeCall(Decorated, Method, Object[])}, {@link
 *       #afterCall(Decorated, Method, Object[], Object)}, {@link #call(Decorated, Method,
 *       Object[])} and {@link #onError(Decorated, Method, Object[], InvocationTargetException)}
 *   <li>if you want to modify behavior of a specific class instances only (e.g. behaviour of
 *       WebElement instances) you can override one of the overloaded <code>createDecorated</code>
 *       methods to create a non-trivial decorator for the specific class only.
 * </ul>
 *
 * Let's consider both approaches by examples.
 *
 * <p>One of the most widely used decorator examples is a logging decorator. In this case we want to
 * add the same piece of logging code before and after each invoked method:
 *
 * <pre><code>
 *   public class LoggingDecorator extends WebDriverDecorator {
 *     final Logger logger = LoggerFactory.getLogger(Thread.currentThread().getName());
 *
 *     &#x40;Override
 *     public void beforeCall(Decorated&lt;?&gt; target, Method method, Object[] args) {
 *       logger.debug("before {}.{}({})", target, method, args);
 *     }
 *     &#x40;Override
 *     public void afterCall(Decorated&lt;?&gt; target, Method method, Object[] args, Object res) {
 *       logger.debug("after {}.{}({}) =&gt; {}", target, method, args, res);
 *     }
 *   }
 * </code></pre>
 *
 * For the second example let's implement a decorator that implicitly waits for an element to be
 * visible before any click or sendKeys method call.
 *
 * <pre><code>
 *   public class ImplicitlyWaitingDecorator extends WebDriverDecorator {
 *     private WebDriverWait wait;
 *
 *     &#x40;Override
 *     public Decorated&lt;WebDriver&gt; createDecorated(WebDriver driver) {
 *       wait = new WebDriverWait(driver, Duration.ofSeconds(10));
 *       return super.createDecorated(driver);
 *     }
 *     &#x40;Override
 *     public Decorated&lt;WebElement&gt; createDecorated(WebElement original) {
 *       return new DefaultDecorated&lt;&gt;(original, this) {
 *         &#x40;Override
 *         public void beforeCall(Method method, Object[] args) {
 *           String methodName = method.getName();
 *           if ("click".equals(methodName) || "sendKeys".equals(methodName)) {
 *             wait.until(d -&gt; getOriginal().isDisplayed());
 *           }
 *         }
 *       };
 *     }
 *   }
 * </code></pre>
 *
 * This class is not a pure decorator, it allows to not only add new behavior but also replace
 * "normal" behavior of a WebDriver or derived objects.
 *
 * <p>Let's suppose you want to use JavaScript-powered clicks instead of normal ones (yes, this
 * allows to interact with invisible elements, it's a bad practice in general but sometimes it's
 * inevitable). This behavior change can be achieved with the following "decorator":
 *
 * <pre><code>
 *   public class JavaScriptPoweredDecorator extends WebDriverDecorator {
 *     &#x40;Override
 *     public Decorated&lt;WebElement&gt; createDecorated(WebElement original) {
 *       return new DefaultDecorated&lt;&gt;(original, this) {
 *         &#x40;Override
 *         public Object call(Method method, Object[] args) throws Throwable {
 *           String methodName = method.getName();
 *           if ("click".equals(methodName)) {
 *             JavascriptExecutor executor = (JavascriptExecutor) getDecoratedDriver().getOriginal();
 *             executor.executeScript("arguments[0].click()", getOriginal());
 *             return null;
 *           } else {
 *             return super.call(method, args);
 *           }
 *         }
 *       };
 *     }
 *   }
 * </code></pre>
 *
 * It is possible to apply multiple decorators to compose behaviors added by each of them. For
 * example, if you want to log method calls and implicitly wait for elements visibility you can use
 * two decorators:
 *
 * <pre><code>
 *   WebDriver original = new FirefoxDriver();
 *   WebDriver decorated =
 *     new ImplicitlyWaitingDecorator().decorate(
 *       new LoggingDecorator().decorate(original));
 * </code></pre>
 */
@Beta
public class WebDriverDecorator<T extends WebDriver> {

  protected static class Definition {
    private final Class<?> decoratedClass;
    private final Class<?> originalClass;

    public Definition(Decorated<?> decorated) {
      this.decoratedClass = decorated.getClass();
      this.originalClass = unwrapOriginal(decorated).getClass();
    }

    @Override
    public boolean equals(Object o) {
      if (o == null || getClass() != o.getClass()) return false;
      Definition definition = (Definition) o;
      // intentionally an identity check, to ensure we get no false positive lookup due to an
      // unknown implementation of decoratedClass.equals or originalClass.equals
      return (decoratedClass == definition.decoratedClass)
          && (originalClass == definition.originalClass);
    }

    @Override
    public int hashCode() {
      return Arrays.hashCode(
          new int[] {
            System.identityHashCode(decoratedClass), System.identityHashCode(originalClass)
          });
    }
  }

  private static Object unwrapOriginal(Decorated<?> decorated) {
    return unwrapWebdriver(decorated.getOriginal());
  }

  private static Object unwrapWebdriver(Object webDriver) {
    if (webDriver instanceof WebDriver && webDriver instanceof WrapsDriver) {
      return unwrapWebdriver(((WrapsDriver) webDriver).getWrappedDriver());
    }
    return webDriver;
  }

  public interface HasTarget<Z> {
    Decorated<Z> getTarget();

    void setTarget(Decorated<Z> target);
  }

  protected static class ProxyFactory<T> {
    private final Class<? extends T> clazz;

    private ProxyFactory(Class<? extends T> clazz) {
      this.clazz = clazz;
    }

    public T newInstance(Decorated<T> target) {
      T instance;
      try {
        instance = (T) clazz.newInstance();
      } catch (ReflectiveOperationException e) {
        throw new AssertionError("Unable to create new proxy", e);
      }

      // ensure we can later find the target to call
      //noinspection unchecked
      ((HasTarget<T>) instance).setTarget(target);

      return instance;
    }
  }

  private final ConcurrentMap<Definition, ProxyFactory<?>> cache;

  private final Class<T> targetWebDriverClass;

  private Decorated<T> decorated;

  @SuppressWarnings("unchecked")
  public WebDriverDecorator() {
    this((Class<T>) WebDriver.class);
  }

  public WebDriverDecorator(Class<T> targetClass) {
    this.targetWebDriverClass = targetClass;
    this.cache = new ConcurrentHashMap<>();
  }

  public final T decorate(T original) {
    Require.nonNull("WebDriver", original);

    decorated = createDecorated(original);
    return createProxy(decorated, targetWebDriverClass);
  }

  public Decorated<T> getDecoratedDriver() {
    return decorated;
  }

  public Decorated<T> createDecorated(T driver) {
    return new DefaultDecorated<>(driver, this);
  }

  public Decorated<WebElement> createDecorated(WebElement original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<WebDriver.TargetLocator> createDecorated(WebDriver.TargetLocator original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<WebDriver.Navigation> createDecorated(WebDriver.Navigation original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<WebDriver.Options> createDecorated(WebDriver.Options original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<WebDriver.Timeouts> createDecorated(WebDriver.Timeouts original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<WebDriver.Window> createDecorated(WebDriver.Window original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<Alert> createDecorated(Alert original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<VirtualAuthenticator> createDecorated(VirtualAuthenticator original) {
    return new DefaultDecorated<>(original, this);
  }

  public void beforeCall(Decorated<?> target, Method method, Object[] args) {}

  public Object call(Decorated<?> target, Method method, Object[] args) throws Throwable {
    return decorateResult(method.invoke(target.getOriginal(), args));
  }

  public void afterCall(Decorated<?> target, Method method, Object[] args, Object res) {}

  public Object onError(
      Decorated<?> target, Method method, Object[] args, InvocationTargetException e)
      throws Throwable {
    throw e.getTargetException();
  }

  private Object decorateResult(Object toDecorate) {
    if (toDecorate instanceof WebDriver) {
      return createProxy(getDecoratedDriver(), targetWebDriverClass);
    }
    if (toDecorate instanceof WebElement) {
      return createProxy(createDecorated((WebElement) toDecorate), WebElement.class);
    }
    if (toDecorate instanceof Alert) {
      return createProxy(createDecorated((Alert) toDecorate), Alert.class);
    }
    if (toDecorate instanceof VirtualAuthenticator) {
      return createProxy(
          createDecorated((VirtualAuthenticator) toDecorate), VirtualAuthenticator.class);
    }
    if (toDecorate instanceof WebDriver.Navigation) {
      return createProxy(
          createDecorated((WebDriver.Navigation) toDecorate), WebDriver.Navigation.class);
    }
    if (toDecorate instanceof WebDriver.Options) {
      return createProxy(createDecorated((WebDriver.Options) toDecorate), WebDriver.Options.class);
    }
    if (toDecorate instanceof WebDriver.TargetLocator) {
      return createProxy(
          createDecorated((WebDriver.TargetLocator) toDecorate), WebDriver.TargetLocator.class);
    }
    if (toDecorate instanceof WebDriver.Timeouts) {
      return createProxy(
          createDecorated((WebDriver.Timeouts) toDecorate), WebDriver.Timeouts.class);
    }
    if (toDecorate instanceof WebDriver.Window) {
      return createProxy(createDecorated((WebDriver.Window) toDecorate), WebDriver.Window.class);
    }
    if (toDecorate instanceof List) {
      return ((List<?>) toDecorate).stream().map(this::decorateResult).collect(Collectors.toList());
    }
    return toDecorate;
  }

  protected final <Z> Z createProxy(final Decorated<Z> decorated, Class<? extends Z> clazz) {
    @SuppressWarnings("unchecked")
    ProxyFactory<Z> factory =
        (ProxyFactory<Z>)
            cache.computeIfAbsent(
                new Definition(decorated), (key) -> createProxyFactory(key, decorated, clazz));

    return factory.newInstance(decorated);
  }

  protected final <Z> ProxyFactory<? extends Z> createProxyFactory(
      Definition definition, final Decorated<Z> sample, Class<? extends Z> clazz) {
    Set<Class<?>> decoratedInterfaces = extractInterfaces(definition.decoratedClass);
    Set<Class<?>> originalInterfaces = extractInterfaces(definition.originalClass);
    // all samples with the same definition should have the same derivedInterfaces
    Map<Class<?>, Function<Z, InvocationHandler>> derivedInterfaces =
        deriveAdditionalInterfaces(sample.getOriginal());

    final InvocationHandler handler =
        (proxy, method, args) -> {
          // Lookup the instance to call, to reuse the clazz and handler.
          @SuppressWarnings("unchecked")
          Decorated<Z> instance = ((HasTarget<Z>) proxy).getTarget();
          if (instance == null) {
            throw new AssertionError("Failed to get instance to call");
          }
          try {
            if (method.getDeclaringClass().equals(Object.class)
                || decoratedInterfaces.contains(method.getDeclaringClass())) {
              return method.invoke(instance, args);
            }
            // Check if the class in which the method resides, implements any one of the
            // interfaces that we extracted from the decorated class.
            boolean isCompatible =
                originalInterfaces.stream()
                    .anyMatch(
                        eachInterface ->
                            eachInterface.isAssignableFrom(method.getDeclaringClass()));

            if (isCompatible) {
              instance.beforeCall(method, args);
              Object result = instance.call(method, args);
              instance.afterCall(method, result, args);
              return result;
            }

            // Check if the class in which the current method resides, implements any of the
            // additional interfaces that we extracted from the decorated class.
            // E.g., of additional interfaces include WrapsDriver,WrapsElement,JsonSerializer
            isCompatible =
                derivedInterfaces.keySet().stream()
                    .anyMatch(
                        eachInterface ->
                            eachInterface.isAssignableFrom(method.getDeclaringClass()));

            if (isCompatible) {
              return derivedInterfaces
                  .get(method.getDeclaringClass())
                  .apply(instance.getOriginal())
                  .invoke(proxy, method, args);
            }

            return method.invoke(instance.getOriginal(), args);
          } catch (InvocationTargetException e) {
            return instance.onError(method, e, args);
          }
        };

    Set<Class<?>> allInterfaces = new HashSet<>();
    allInterfaces.addAll(decoratedInterfaces);
    allInterfaces.addAll(originalInterfaces);
    allInterfaces.addAll(derivedInterfaces.keySet());
    // ensure a decorated driver can get decorated again
    allInterfaces.remove(HasTarget.class);
    Class<?>[] allInterfacesArray = allInterfaces.toArray(new Class<?>[0]);

    Class<? extends Z> proxy =
        new ByteBuddy()
            .subclass(clazz.isInterface() ? Object.class : clazz)
            .implement(allInterfacesArray)
            .method(ElementMatchers.any())
            .intercept(InvocationHandlerAdapter.of(handler))
            .defineField("target", Decorated.class, Visibility.PRIVATE)
            .implement(HasTarget.class)
            .intercept(FieldAccessor.ofField("target"))
            .make()
            .load(clazz.getClassLoader(), ClassLoadingStrategy.Default.WRAPPER)
            .getLoaded()
            .asSubclass(clazz);

    return new ProxyFactory<Z>(proxy);
  }

  private static Set<Class<?>> extractInterfaces(final Class<?> clazz) {
    Set<Class<?>> allInterfaces = new HashSet<>();
    extractInterfaces(allInterfaces, clazz);

    return allInterfaces;
  }

  private static void extractInterfaces(final Set<Class<?>> collector, final Class<?> clazz) {
    if (clazz == null || Object.class.equals(clazz)) {
      return;
    }

    final Class<?>[] classes = clazz.getInterfaces();
    for (Class<?> interfaceClass : classes) {
      collector.add(interfaceClass);
      for (Class<?> superInterface : interfaceClass.getInterfaces()) {
        collector.add(superInterface);
        extractInterfaces(collector, superInterface);
      }
    }
    extractInterfaces(collector, clazz.getSuperclass());
  }

  private <Z> Map<Class<?>, Function<Z, InvocationHandler>> deriveAdditionalInterfaces(Z sample) {
    Map<Class<?>, Function<Z, InvocationHandler>> handlers = new HashMap<>();

    if (sample instanceof WebDriver) {
      handlers.put(
          WrapsDriver.class,
          (instance) ->
              (proxy, method, args) -> {
                if ("getWrappedDriver".equals(method.getName())) {
                  return unwrapWebdriver(instance);
                }
                if (sample instanceof WrapsDriver) {
                  return instance;
                }
                throw new UnsupportedOperationException(method.getName());
              });
    }

    if (sample instanceof WebElement && !(sample instanceof WrapsElement)) {
      handlers.put(
          WrapsElement.class,
          (instance) ->
              (proxy, method, args) -> {
                if ("getWrappedElement".equals(method.getName())) {
                  return instance;
                }
                throw new UnsupportedOperationException(method.getName());
              });
    }

    try {
      Method toJson = sample.getClass().getDeclaredMethod("toJson");
      toJson.setAccessible(true);

      handlers.put(
          JsonSerializer.class,
          (instance) ->
              ((proxy, method, args) -> {
                if ("toJson".equals(method.getName())) {
                  return toJson.invoke(instance);
                }
                throw new UnsupportedOperationException(method.getName());
              }));
    } catch (NoSuchMethodException e) {
      // Fine. Just fall through
    }

    return handlers;
  }

  @FunctionalInterface
  protected interface JsonSerializer {
    Object toJson();
  }
}
