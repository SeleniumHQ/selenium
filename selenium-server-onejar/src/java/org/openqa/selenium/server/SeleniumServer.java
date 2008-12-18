/*
 * Copyright 2008 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.openqa.selenium.server;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class SeleniumServer {

	public static void main(String[] args) throws Throwable {
		ClassLoader loader = Thread.currentThread().getContextClassLoader();
		Class boot = loader.loadClass("com.simontuffs.onejar.Boot");
		Method main = boot.getMethod("main", new Class[] { String[].class });
		try {
		    main.invoke(null, new Object[] { args });
	    } catch (InvocationTargetException e) {
			throw e.getTargetException();
		}
	}

}