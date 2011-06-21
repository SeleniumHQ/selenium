package org.openqa.grid.internal;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.grid.internal.configuration.Grid1ConfigurationLoaderTest;
import org.openqa.grid.internal.listener.RegistrationListenerTest;
import org.openqa.grid.internal.listener.SessionListenerTest;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcherTest;
import org.openqa.grid.plugin.RemoteProxyInheritanceTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    RemoteProxyInheritanceTest.class,
	SmokeTest.class,
	SessionTimesOutTest.class,
	RemoteProxyTest.class,
	RemoteProxySlowSetup.class,
	RegistryTest.class,
	RegistryStateTest.class,
	PriorityTestLoad.class,
	PriorityTest.class,
	ParallelTest.class,
	LoadBalancedTests.class,
	DefaultToFIFOPriorityTest.class,
	ConcurrencyLock.class,
	AddingProxyAgainFreesResources.class,
	DefaultCapabilityMatcherTest.class,
	SessionListenerTest.class,
	RegistrationListenerTest.class,
	StatusServletTests.class,
	Grid1ConfigurationLoaderTest.class
}
)
public class GridInternalTestSuite {

}
