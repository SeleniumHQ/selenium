package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.BROWSER;
import static org.openqa.grid.common.RegistrationRequest.PLATFORM;
import static org.openqa.grid.common.RegistrationRequest.VERSION;

import java.util.HashMap;
import java.util.Map;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;


public class DefaultCapabilityMatcherTest {

	
	Map<String, Object> firefox = new HashMap<String, Object>();
	Map<String, Object> tl = new HashMap<String, Object>();
	
	Map<String, Object> firefox2 = new HashMap<String, Object>();
	Map<String, Object> tl2 = new HashMap<String, Object>();
	
	Map<String, Object> exotic = new HashMap<String, Object>();
	
	
	CapabilityMatcher helper = new DefaultCapabilityMatcher();
	
	@BeforeClass(alwaysRun=true)
	public void build(){
		tl.put(RegistrationRequest.APP, "A");
		tl.put(RegistrationRequest.VERSION, null);
		firefox.put(BROWSER, "B");
		firefox.put(PLATFORM, "XP");
		
		tl2.put(RegistrationRequest.APP, "A");
		tl2.put(RegistrationRequest.VERSION, "8.5.100.7");
		
		firefox2.put(BROWSER, "B");
		firefox2.put(PLATFORM, "Vista");
		firefox2.put(VERSION, "3.6");
		
		exotic.put("numberOfHead", 2);
	}
	
	@Test
	public void smokeTest(){
		Assert.assertTrue(helper.matches(tl, tl));
		Assert.assertTrue(helper.matches(tl, tl2));
		Assert.assertTrue(helper.matches(tl2, tl));
		Assert.assertTrue(helper.matches(tl2, tl2));
		
		Assert.assertTrue(helper.matches(firefox, firefox));
		Assert.assertTrue(helper.matches(firefox, firefox2));
		Assert.assertTrue(helper.matches(firefox2, firefox));
		Assert.assertTrue(helper.matches(firefox, firefox2));
		
		Assert.assertFalse(helper.matches(tl, null));
		Assert.assertFalse(helper.matches(null, null));
		Assert.assertFalse(helper.matches(tl, firefox));
		Assert.assertFalse(helper.matches(firefox, tl2));
	}
	
	@Test(expectedExceptions=GridException.class)
	public void notImplemented(){
		Assert.assertTrue(helper.matches(tl, exotic));
		
	}
}
