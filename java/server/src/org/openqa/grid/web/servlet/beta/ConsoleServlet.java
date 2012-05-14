/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.grid.web.servlet.beta;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Properties;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.grid.common.GridDocHelper;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.HtmlRenderer;
import org.openqa.grid.web.servlet.RegistryBasedServlet;
import org.openqa.selenium.remote.DesiredCapabilities;

import com.google.common.io.ByteStreams;

public class ConsoleServlet extends RegistryBasedServlet {

  private static final long serialVersionUID = 8484071790930378855L;
  private static final Logger log = Logger.getLogger(ConsoleServlet.class.getName());
  private static String coreVersion;
  private static String coreRevision;

  public ConsoleServlet() {
    this(null);
  }

  public ConsoleServlet(Registry registry) {
    super(registry);
    getVersion();
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    process(request, response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    process(request, response);
  }

  protected void process(HttpServletRequest request, HttpServletResponse response)
      throws IOException {

    int refresh = -1;

    if (request.getParameter("refresh") != null) {
      try {
        refresh = Integer.parseInt(request.getParameter("refresh"));
      } catch (NumberFormatException e) {
        // ignore wrong param
      }

    }

    response.setContentType("text/html");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);

    StringBuilder builder = new StringBuilder();

    builder.append("<html>");
    builder.append("<head>");
    builder
        .append("<script src='http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js'></script>");

    builder.append("<script src='/grid/resources/images/console-beta.js'></script>");

    builder
        .append("<link href='/grid/resources/images/console-beta.css' rel='stylesheet' type='text/css' />");


    if (refresh != -1) {
      builder.append(String.format("<meta http-equiv='refresh' content='%d' />", refresh));
    }
    builder.append("<title>Grid overview</title>");

    builder.append("<style>");
    builder.append(".busy {");
    builder.append(" opacity : 0.4;");
    builder.append("filter: alpha(opacity=40);");
    builder.append("}");
    builder.append("</style>");
    builder.append("</head>");

    builder.append("<body>");

    builder.append("<div id='main_content'>");

    builder.append(getHeader());

    // TODO freynaud : registry to return a copy of proxies ? 
    List<String> nodes = new ArrayList<String>();
    for (RemoteProxy proxy : getRegistry().getAllProxies()) {
      HtmlRenderer beta = new WebProxyHtmlRendererBeta(proxy);
      nodes.add(beta.renderSummary());
    }

    int size = nodes.size();
    int rightColumnSize = size / 2;
    int leftColumnSize = size - rightColumnSize;



    builder.append("<div id='leftColumn'>");
    for (int i = 0; i < leftColumnSize; i++) {
      builder.append(nodes.get(i));
    }


    builder.append("</div>");

    builder.append("<div id='rightColumn'>");
    for (int i = leftColumnSize; i < nodes.size(); i++) {
      builder.append(nodes.get(i));
    }


    builder.append("</div>");

    builder.append("<div class='clearfix'></div>");

    builder.append(getRequestQueue());


    if (request.getParameter("config") != null) {
      builder.append(getConfigInfo(request.getParameter("configDebug") != null));
    } else {
      builder.append("<a href='?config=true&configDebug=true'>view config</a>");
    }

   
    builder.append("</div>");
    builder.append("</body>");
    builder.append("</html>");

    InputStream in = new ByteArrayInputStream(builder.toString().getBytes("UTF-8"));
    try {
      ByteStreams.copy(in, response.getOutputStream());
    } finally {
      in.close();
      response.getOutputStream().close();
    }
  }

  private Object getRequestQueue() {
    StringBuilder builder = new StringBuilder();
    builder.append("<div>");
    int numUnprocessedRequests = getRegistry().getNewSessionRequestCount();

    if (numUnprocessedRequests > 0) {
      builder.append(String.format("%d requests waiting for a slot to be free.",
          numUnprocessedRequests));
    }

    builder.append("<ul>");
    for (DesiredCapabilities req : getRegistry().getDesiredCapabilities()) {
      builder.append("<li>").append(req.asMap()).append("</li>");
    }
    builder.append("</ul>");
    builder.append("</div>");
    return builder.toString();
  }

  private Object getHeader() {
    StringBuilder builder = new StringBuilder();
    builder.append("<div id='header'>");
    builder.append("<h1><a href='http://code.google.com/p/selenium/wiki/Grid2' >Selenium</a></h1>");
    builder.append("<h2>Hub console - (beta) ");
    builder.append(coreVersion).append(coreRevision);
    builder.append("</h2>");
    builder.append("<div>.</div>");
    builder.append("</div>");
    builder.append("");
    return builder.toString();
  }
  

  /**
   * retracing how the hub config was built to help debugging.
   * 
   * @return
   */
  private String getConfigInfo(boolean verbose) {
    
    StringBuilder builder = new StringBuilder();

    GridHubConfiguration config = getRegistry().getConfiguration();
    builder.append("<div  id='hubConfig'>");
    builder.append("<b>Config for the hub :</b><br/>");
    builder.append(prettyHtmlPrint(config));

    if (verbose) {

      GridHubConfiguration tmp = new GridHubConfiguration();
      tmp.loadDefault();

      builder.append("<b>Config details :</b><br/>");
      builder.append("<b>hub launched with :</b>");
      for (int i = 0; i < config.getArgs().length; i++) {
        builder.append(config.getArgs()[i]).append(" ");
      }

      builder.append("<br/><b>the final configuration comes from :</b><br/>");
      builder.append("<b>the default :</b><br/>");
      builder.append(prettyHtmlPrint(tmp));

      builder.append("<b>updated with grid1 config :</b>");
      if (config.getGrid1Yml() != null) {
        builder.append(config.getGrid1Yml()).append("<br/>");
        tmp.loadFromGridYml(config.getGrid1Yml());
        builder.append(prettyHtmlPrint(tmp));
      } else {
        builder
            .append("No grid1 file specified. To specify one, use -grid1Yml XXX.yml where XXX.yml is a grid1 config file</br>");
      }

      builder.append("<br/><b>updated with grid2 config : </b>");
      if (config.getGrid2JSON() != null) {
        builder.append(config.getGrid2JSON()).append("<br/>");
        tmp.loadFromJSON(config.getGrid2JSON());
        builder.append(prettyHtmlPrint(tmp));
      } else {
        builder
            .append("No hub config file specified. To specify one, use -hubConfig XXX.json where XXX.json is a hub config file</br>");
      }

      builder.append("<br/><b>updated with params :</b></br>");
      tmp.loadFromCommandLine(config.getArgs());
      builder.append(prettyHtmlPrint(tmp));
    }
    builder.append("</div>");
    return builder.toString();
  }

  private String key(String key) {
    return "<abbr title='" + GridDocHelper.getGridParam(key) + "'>" + key + " : </abbr>";
  }

  private String prettyHtmlPrint(GridHubConfiguration config) {
    StringBuilder b = new StringBuilder();

    b.append(key("host")).append(config.getHost()).append("</br>");
    b.append(key("port")).append(config.getPort()).append("</br>");
    b.append(key("cleanUpCycle")).append(config.getCleanupCycle()).append("</br>");
    b.append(key("timeout")).append(config.getTimeout()).append("</br>");
    b.append(key("browserTimeout")).append(config.getBrowserTimeout()).append("</br>");

    b.append(key("newSessionWaitTimeout")).append(config.getNewSessionWaitTimeout())
        .append("</br>");
    b.append(key("grid1Mapping")).append(config.getGrid1Mapping()).append("</br>");
    b.append(key("throwOnCapabilityNotPresent")).append(config.isThrowOnCapabilityNotPresent())
        .append("</br>");

    b.append(key("capabilityMatcher"))
        .append(
            config.getCapabilityMatcher() == null ? "null" : config.getCapabilityMatcher()
                .getClass().getCanonicalName()).append("</br>");
    b.append(key("prioritizer"))
        .append(
            config.getPrioritizer() == null ? "null" : config.getPrioritizer().getClass()
                .getCanonicalName()).append("</br>");
    b.append(key("servlets"));
    for (String s : config.getServlets()) {
      b.append(s.getClass().getCanonicalName()).append(",");
    }
    b.append("</br></br>");
    b.append("<u>all params :</u></br></br>");
    List<String> keys = new ArrayList<String>();
    keys.addAll(config.getAllParams().keySet());
    Collections.sort(keys);
    for (String s : keys) {
      b.append(key(s.replaceFirst("-", ""))).append(config.getAllParams().get(s)).append("</br>");
    }
    b.append("</br>");
    return b.toString();
  }

  private void getVersion() {
    final Properties p = new Properties();

    InputStream stream =
        Thread.currentThread().getContextClassLoader().getResourceAsStream("VERSION.txt");
    if (stream == null) {
      log.severe("Couldn't determine version number");
      return;
    }
    try {
      p.load(stream);
    } catch (IOException e) {
      log.severe("Cannot load version from VERSION.txt" + e.getMessage());
    }
    coreVersion = p.getProperty("selenium.core.version");
    coreRevision = p.getProperty("selenium.core.revision");
    if (coreVersion == null) {
      log.severe("Cannot load selenium.core.version from VERSION.txt");
    }
  }

}
