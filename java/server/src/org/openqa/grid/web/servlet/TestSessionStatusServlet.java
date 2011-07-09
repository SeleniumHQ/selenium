package org.openqa.grid.web.servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.grid.internal.GridException;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;

public class TestSessionStatusServlet extends RegistryBasedServlet {

	private static final long serialVersionUID = 4325112892618707612L;

	public TestSessionStatusServlet() {
		super(null);
	}

	public TestSessionStatusServlet(Registry registry) {
		super(registry);
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		process(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		process(request, response);
	}

	protected void process(HttpServletRequest request, HttpServletResponse response) throws IOException {
		response.setContentType("text/html");
		response.setCharacterEncoding("UTF-8");
		response.setStatus(200);
		JSONObject res;
		try {
			res = getResponse(request);
			response.getWriter().print(res);
			response.getWriter().close();
		} catch (JSONException e) {
			throw new GridException(e.getMessage());
		}

	}

	private JSONObject getResponse(HttpServletRequest request) throws IOException, JSONException {
		JSONObject requestJSON = null;
		if (request.getInputStream() != null) {
			BufferedReader rd = new BufferedReader(new InputStreamReader(request.getInputStream()));
      StringBuilder s = new StringBuilder();
			String line;
			while ((line = rd.readLine()) != null) {
				s.append(line);
			}
			rd.close();
			String json = s.toString();
			if (json != null && !"".equals(json)) {
				requestJSON = new JSONObject(json);
			}

		}

		JSONObject res = new JSONObject();
		res.put("success", false);

		// the id can be specified via a param, or in the json request.
		String session = null;
		if (requestJSON == null) {
			session = request.getParameter("session");
		} else {
			if (!requestJSON.has("session")) {
				res.put("msg", "you need to specify at least a session or internalKey when call the test slot status service.");
				return res;
			}
			session = requestJSON.getString("session");
		}

		TestSession testSession = getRegistry().getSession(session);

		if (testSession == null) {
			res.put("msg", "Cannot find test slot running session " + session + " in the registry.");
			return res;
		} else {
			res.put("msg", "slot found !");
			res.put("success", true);
			res.put("session", testSession.getExternalKey());
			res.put("internalKey", testSession.getInternalKey());
			res.put("inactivityTime", testSession.getInactivityTime());
			RemoteProxy p = testSession.getSlot().getProxy();
			res.put("proxyId", p.getId());
			return res;
		}

	}

}
