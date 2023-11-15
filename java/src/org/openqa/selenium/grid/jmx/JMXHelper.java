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

import java.lang.management.ManagementFactory;
import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;

public class JMXHelper {

  public MBean register(Object bean) {
    MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
    MBean mBean = new MBean(bean);
    try {
      mbs.registerMBean(mBean, mBean.getObjectName());
      return mBean;
    } catch (InstanceAlreadyExistsException t) {
      return mBean;
    } catch (Throwable t) {
      t.printStackTrace();
      return null;
    }
  }

  public void unregister(ObjectName objectName) {
    if (objectName != null) {
      MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
      try {
        mbs.unregisterMBean(objectName);
      } catch (Throwable ignore) {
      }
    }
  }
}
