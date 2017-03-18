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

package org.openqa.grid.internal;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.grid.internal.listener.CommandListenerTest;
import org.openqa.grid.internal.listener.RegistrationListenerTest;
import org.openqa.grid.internal.listener.SessionListenerTest;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcherTest;
import org.openqa.grid.internal.utils.SelfRegisteringRemoteTest;
import org.openqa.grid.internal.utils.configuration.GridConfigurationTest;
import org.openqa.grid.internal.utils.configuration.GridHubConfigurationTest;
import org.openqa.grid.internal.utils.configuration.GridNodeConfigurationTest;
import org.openqa.grid.internal.utils.configuration.StandaloneConfigurationTest;
import org.openqa.grid.plugin.RemoteProxyInheritanceTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    AddingProxyAgainFreesResources.class,
    BaseRemoteProxyTest.class,
    CommandListenerTest.class,
    ConcurrencyLockTest.class,
    DefaultCapabilityMatcherTest.class,
    GridConfigurationTest.class,
    GridNodeConfigurationTest.class,
    GridHubConfigurationTest.class,
    GridShutdownTest.class,
    LoadBalancedTests.class,
    NewRequestCrashesDuringNewSessionTest.class,
    NewSessionRequestTimeout.class,
// ParallelTests fail when run via command line with buck
    ParallelTest.class,
    PriorityTest.class,
    PriorityTestLoad.class,
    RegistrationListenerTest.class,
    RegistryStateTest.class,
    RegistryTest.class,
    RemoteProxyInheritanceTest.class,
    RemoteProxySlowSetup.class,
    SelfRegisteringRemoteTest.class,
    SessionTimesOutTest.class,
    SessionListenerTest.class,
    SmokeTest.class,
    StandaloneConfigurationTest.class,
    StatusServletTests.class,
    UserDefinedCapabilityMatcherTests.class
})
public class GridInternalTests {
}
