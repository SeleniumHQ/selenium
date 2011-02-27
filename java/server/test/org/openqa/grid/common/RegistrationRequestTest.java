package org.openqa.grid.common;

import org.junit.Assert;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

import static org.openqa.grid.common.RegistrationRequest.CLEAN_UP_CYCLE;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_URL;


public class RegistrationRequestTest {

	@Test
	public void getConfigAsTests() {
		RegistrationRequest req = new RegistrationRequest();
		String url = "http://a.c:2";

		Map<String, Object> config = new HashMap<String, Object>();
		config.put(CLEAN_UP_CYCLE, 1);
		config.put(REMOTE_URL, url);

		req.setConfiguration(config);

		int c = req.getConfigAsInt(CLEAN_UP_CYCLE, -1);
		Assert.assertTrue(c == 1);

		int e = req.getConfigAsInt("doesn't exist", 20);
		Assert.assertTrue(e == 20);

		String url2 = req.getConfigAsString(REMOTE_URL);
		Assert.assertEquals(url2, url);
	}

	@Test
	public void json() {
		RegistrationRequest req = new RegistrationRequest();
		req.setId("id");
		req.setName("Franзois");
		req.setDescription("a\nb\nc");

		String name = "%super !";
		String value = "%з // \\";

		Map<String, Object> config = new HashMap<String, Object>();
		config.put(name, value);

		req.setConfiguration(config);

		for (int i = 0; i < 5; i++) {
			Map<String, Object> cap = new HashMap<String, Object>();
			cap.put("browser", "firefox");
			cap.put("version", i);
			req.addDesiredCapabilitiy(cap);
		}

		String json = req.toJSON();

		RegistrationRequest req2 = RegistrationRequest.getNewInstance(json);

		Assert.assertEquals(req2.getId(), req.getId());
		Assert.assertEquals(req2.getName(), req.getName());
		Assert.assertEquals(req2.getDescription(), req.getDescription());

		Assert.assertEquals(req2.getConfigAsString(name), req.getConfigAsString(name));
		Assert.assertEquals(req2.getCapabilities().size(), req.getCapabilities().size());

	}

}
