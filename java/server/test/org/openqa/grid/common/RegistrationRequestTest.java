package org.openqa.grid.common;

import static org.openqa.grid.common.RegistrationRequest.CLEAN_UP_CYCLE;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_URL;

import java.util.HashMap;
import java.util.Map;

import org.junit.Assert;
import org.junit.Test;


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

    @Test
    public void seleniumGrid1Request() {
        RegistrationRequest request = RegistrationRequest.getNewInstance("host=localhost&port=5000&environment=Firefox%3A+4%3B+MacOS+X%3A+10.6.7");

        Assert.assertEquals(null, request.getId());
        Assert.assertEquals(null, request.getName());
        Assert.assertEquals(null, request.getDescription());

        // Verify the capabilities were set up properly.
        Assert.assertEquals(1, request.getCapabilities().size());
        Map<String, Object> caps = request.getCapabilities().get(0);

        //Assert.assertEquals(Platform.LINUX.toString(), caps.get("platform"));
        Assert.assertEquals("Firefox: 4; MacOS X: 10.6.7", caps.get("browserName"));


        // Verify the configuration was set up properly.
        Assert.assertEquals("org.openqa.grid.selenium.proxy.SeleniumRemoteProxy", request.getConfiguration().get("proxy"));
        Assert.assertEquals("http://localhost:5000/selenium-server/driver", request.getConfiguration().get("url"));
    }
}
