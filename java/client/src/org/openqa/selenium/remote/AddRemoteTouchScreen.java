package org.openqa.selenium.remote;

import org.openqa.selenium.interactions.HasTouchScreen;

import java.lang.reflect.Method;

/** Provides the RemoteTouchScreen for getTouch method to the proxy. */
public class AddRemoteTouchScreen implements AugmenterProvider {

  @Override
  public Class<?> getDescribedInterface() {
    return HasTouchScreen.class;
  }

  @Override
  public InterfaceImplementation getImplementation(Object value) {
    return new InterfaceImplementation() {

      @Override
      public Object invoke(ExecuteMethod executeMethod, Object self,
          Method method, Object... args) {
        if ("getTouch".equals(method.getName())) {
          return new RemoteTouchScreen(executeMethod);
        }
        return null;
      }
    };
  }
}
