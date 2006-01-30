/*
 * Copyright (c) 2003-2005, Wiley & Sons, Joe Walnes,Ara Abrahamian,
 * Mike Cannon-Brookes,Patrick A Lightbody
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the distribution.
 *     * Neither the name of the 'Wiley & Sons', 'Java Open Source
 * Programming' nor the names of the authors may be used to endorse or
 * promote products derived from this software without specific prior
 * written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

package org.petsoar.acceptance;

import com.opensymphony.xwork.interceptor.component.ComponentConfiguration;
import com.opensymphony.xwork.interceptor.component.ComponentManager;
import com.opensymphony.xwork.interceptor.component.DefaultComponentManager;
import org.petsoar.persistence.AbstractPersistentTest;

import java.io.InputStream;

/**
 * Base TestCase class for acceptance tests.
 *
 * Upon first use, the ComponentManager is setup using the same configuration
 * as the 'real' deployment.
 *
 * Any request scoped components shell be initialized/disposed before/after each
 * test method.
 *
 * Any actions that are instantiated in the test case should be passed into the
 * init() method to setup their dependencies.
 */
class AbstractAcceptanceTest extends AbstractPersistentTest {
    private ComponentManager componentManager;

    private static ComponentManager applicationComponentManager;
    private static ComponentConfiguration config;

    protected void setUp() throws Exception {
        super.setUp();
        if (applicationComponentManager == null) {
            ComponentManager newManager = new DefaultComponentManager();
            config = new ComponentConfiguration();
            InputStream configXml = Thread.currentThread().getContextClassLoader()
                    .getResourceAsStream("components.xml");

            config.loadFromXml(configXml);
            config.configure(newManager, "application");
            config.configure(newManager, "session");
            applicationComponentManager = newManager;
        }
        componentManager = new DefaultComponentManager();
        componentManager.setFallback(applicationComponentManager);
        config.configure(componentManager, "request");
    }

    protected void tearDown() throws Exception {
        componentManager.dispose();
        super.tearDown();
    }

    protected void init(Object component) {
        componentManager.initializeObject(component);
    }
}
