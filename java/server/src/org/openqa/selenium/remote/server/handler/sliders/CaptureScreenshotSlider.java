/*
Copyright 2007-2010 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.remote.server.handler.sliders;

import static org.openqa.selenium.OutputType.BASE64;

import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.CaptureScreenshot;
import org.openqa.selenium.remote.server.rest.ResultType;

public class CaptureScreenshotSlider extends CaptureScreenshot {

	public CaptureScreenshotSlider(Session session) {
		super(session);
	}

	public ResultType call() throws Exception {
		WebDriver driver = getUnwrappedDriver();
		SessionId sessionId = getSessionId();
		new ScreenSliders(driver, null, "Capture Screenshot", sessionId)
				.append();

		response.setValue(((TakesScreenshot) driver).getScreenshotAs(BASE64));
		return ResultType.SUCCESS;
	}

}
