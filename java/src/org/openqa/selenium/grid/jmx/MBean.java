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

package org.openqa.selenium.grid.jmx;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.management.Attribute;
import javax.management.AttributeList;
import javax.management.DynamicMBean;
import javax.management.IntrospectionException;
import javax.management.MBeanAttributeInfo;
import javax.management.MBeanInfo;
import javax.management.MBeanOperationInfo;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;

public class MBean implements DynamicMBean {

  private final Object bean;
  private final MBeanInfo beanInfo;
  private final Map<String, AttributeInfo> attributeMap = new HashMap<>();
  private final Map<String, OperationInfo> operationMap = new HashMap<>();
  private final ObjectName objectName;

  private static class AttributeInfo {
    final String name;
    final String description;
    final Method getter;
    final Method setter;

    AttributeInfo(String name, String description, Method getter, Method setter) {
      this.name = name;
      this.description = description;
      this.getter = getter;
      this.setter = setter;
    }

    MBeanAttributeInfo getMBeanAttributeInfo() {
      try {
        return new MBeanAttributeInfo(name, description, getter, setter);
      } catch (IntrospectionException e) {
        e.printStackTrace();
        return null;
      }
    }
  }

  private static class OperationInfo {
    final String name;
    final String description;
    final Method method;

    OperationInfo(String name, String description, Method method) {
      this.name = name;
      this.description = description;
      this.method = method;
    }

    MBeanOperationInfo getMBeanOperationInfo() {
      return new MBeanOperationInfo(description, method);
    }
  }

  MBean(Object bean) {
    this.bean = bean;

    ManagedService mBean = bean.getClass().getAnnotation(ManagedService.class);
    if (mBean == null) {
      throw new IllegalArgumentException(
          String.format("%s has no @ManagedService annotation", bean.getClass().getName()));
    }

    String name = bean.getClass().getName();
    String description = mBean.description();
    collectAttributeInfo(bean);
    MBeanAttributeInfo[] attributes =
        attributeMap.values().stream()
            .map(AttributeInfo::getMBeanAttributeInfo)
            .toArray(MBeanAttributeInfo[]::new);
    collectOperationInfo(bean);
    MBeanOperationInfo[] operations =
        operationMap.values().stream()
            .map(OperationInfo::getMBeanOperationInfo)
            .toArray(MBeanOperationInfo[]::new);

    beanInfo = new MBeanInfo(name, description, attributes, null, operations, null);
    objectName = generateObjectName(bean);
  }

  private void collectAttributeInfo(Object bean) {
    Stream.of(bean.getClass().getMethods())
        .map(this::getAttributeInfo)
        .filter(Objects::nonNull)
        .forEach(ai -> attributeMap.put(ai.name, ai));
  }

  private AttributeInfo getAttributeInfo(Method m) {
    ManagedAttribute ma = m.getAnnotation(ManagedAttribute.class);
    if (ma == null) {
      return null;
    }
    try {
      String name = "".equals(ma.name()) ? m.getName() : ma.name();
      return new AttributeInfo(name, ma.description(), findGetter(m), findSetter(m));
    } catch (Throwable t) {
      t.printStackTrace();
      return null;
    }
  }

  private Method findGetter(Method annotatedMethod) {
    ManagedAttribute ma = annotatedMethod.getAnnotation(ManagedAttribute.class);
    try {
      if (!"".equals(ma.getter())) {
        return annotatedMethod.getDeclaringClass().getMethod(ma.getter());
      } else {
        String name = annotatedMethod.getName();
        if (name.startsWith("get") || name.startsWith("is")) {
          return annotatedMethod;
        }
        if (name.startsWith("set")) {
          return annotatedMethod.getDeclaringClass().getMethod("g" + name.substring(1));
        }
      }
      return null;
    } catch (NoSuchMethodException e) {
      e.printStackTrace();
      return null;
    }
  }

  private Method findSetter(Method annotatedMethod) {
    ManagedAttribute ma = annotatedMethod.getAnnotation(ManagedAttribute.class);
    if (!"".equals(ma.setter())) {
      return findMethod(annotatedMethod.getDeclaringClass(), ma.setter());
    } else {
      String name = annotatedMethod.getName();
      if (name.startsWith("set")) {
        return annotatedMethod;
      }
      if (name.startsWith("get")) {
        findMethod(annotatedMethod.getDeclaringClass(), "s" + name.substring(1));
      }
      if (name.startsWith("is")) {
        findMethod(annotatedMethod.getDeclaringClass(), "set" + name.substring(2));
      }
    }
    return null;
  }

  private Method findMethod(Class<?> cls, String name) {
    return Stream.of(cls.getMethods())
        .filter(m -> m.getName().equals(name))
        .findFirst()
        .orElse(null);
  }

  private void collectOperationInfo(Object bean) {
    Stream.of(bean.getClass().getMethods())
        .map(this::getOperationInfo)
        .filter(Objects::nonNull)
        .forEach(oi -> operationMap.put(oi.name, oi));
  }

  private OperationInfo getOperationInfo(Method m) {
    ManagedOperation mo = m.getAnnotation(ManagedOperation.class);
    if (mo == null) {
      return null;
    }
    return new OperationInfo(m.getName(), mo.description(), m);
  }

  private ObjectName generateObjectName(Object bean) {
    ManagedService mBean = bean.getClass().getAnnotation(ManagedService.class);
    try {
      String name = mBean.objectName();
      if ("".equals(name)) {
        try {
          return (ObjectName) bean.getClass().getMethod("getObjectName").invoke(bean);
        } catch (IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
          return new ObjectName(
              String.format(
                  "%s:type=%s",
                  bean.getClass().getPackage().getName(), bean.getClass().getSimpleName()));
        }
      } else {
        return new ObjectName(mBean.objectName());
      }
    } catch (MalformedObjectNameException e) {
      throw new IllegalArgumentException("Cannot generate ObjectName for a bean", e);
    }
  }

  @Override
  public Object getAttribute(String attribute) {
    try {
      Object res = attributeMap.get(attribute).getter.invoke(bean);
      if (res instanceof Map<?, ?>) {
        return ((Map<?, ?>) res)
            .entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().toString()));
      } else {
        return res.toString();
      }
    } catch (IllegalAccessException | InvocationTargetException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public void setAttribute(Attribute attribute) {
    try {
      attributeMap.get(attribute.getName()).setter.invoke(bean, attribute.getValue());
    } catch (IllegalAccessException | InvocationTargetException e) {
      e.printStackTrace();
    }
  }

  @Override
  public AttributeList getAttributes(String[] attributes) {
    return null;
  }

  @Override
  public AttributeList setAttributes(AttributeList attributes) {
    return null;
  }

  @Override
  public Object invoke(String actionName, Object[] params, String[] signature) {
    try {
      return operationMap.get(actionName).method.invoke(bean, params);
    } catch (IllegalAccessException | InvocationTargetException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public MBeanInfo getMBeanInfo() {
    return beanInfo;
  }

  public ObjectName getObjectName() {
    return objectName;
  }
}
