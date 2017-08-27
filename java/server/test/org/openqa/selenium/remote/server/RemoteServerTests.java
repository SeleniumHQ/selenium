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

package org.openqa.selenium.remote.server;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.selenium.remote.server.handler.ConfigureTimeoutTest;
import org.openqa.selenium.remote.server.handler.UploadFileTest;
import org.openqa.selenium.remote.server.handler.html5.UtilsTest;
import org.openqa.selenium.remote.server.handler.interactions.SendKeyToActiveElementTest;
import org.openqa.selenium.remote.server.rest.ResultConfigTest;
import org.openqa.selenium.remote.server.xdrpc.CrossDomainRpcLoaderTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    ActiveSessionsTest.class,
    ActiveSessionFactoryTest.class,
    AllHandlersTest.class,
    CapabilitiesComparatorTest.class,
    CrossDomainRpcLoaderTest.class,
    DefaultSessionTest.class,
    DriverFactoryTest.class,
    DriverServletTest.class,
    DriverSessionTest.class,
    NewSessionPayloadTest.class,
    PassthroughTest.class,
    ProtocolConverterTest.class,
    ResultConfigTest.class,
    SendKeyToActiveElementTest.class,
    SessionLogsTest.class,
    SyntheticNewSessionPayloadTest.class,
    TeeReaderTest.class,
    UploadFileTest.class,
    org.openqa.selenium.remote.server.commandhandler.UploadFileTest.class,
    ConfigureTimeoutTest.class,
    UrlTemplateTest.class,
    UtilsTest.class
})
public class RemoteServerTests {
}
