package org.openqa.selenium.server;

import org.mortbay.http.*;
import org.mortbay.http.handler.ResourceHandler;
import org.mortbay.util.Resource;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

class StaticContentHandler extends ResourceHandler {

    private final boolean slowResources;
    private List<ResourceLocator> resourceLocators = new ArrayList<ResourceLocator>();
    public static final int SERVER_DELAY = 1000;

    public StaticContentHandler(boolean slowResources) {
        this.slowResources = slowResources;
    }

    public void handle(String pathInContext, String pathParams, HttpRequest httpRequest, HttpResponse httpResponse) throws HttpException, IOException {
        httpResponse.setField("Expires", "-1"); // never cached.
        if (pathInContext.equals("/core/SeleneseRunner.html") && SeleniumServer.isProxyInjectionMode()) {
            pathInContext = pathInContext.replaceFirst("/core/SeleneseRunner.html",
                    "/core/InjectedSeleneseRunner.html");
        }
        super.handle(pathInContext, pathParams, httpRequest, httpResponse);
    }


    protected Resource getResource(final String pathInContext) throws IOException {
        delayIfNeed(pathInContext);
        for (int i = 0; i < resourceLocators.size(); i++) {
            ResourceLocator resourceLocator = resourceLocators.get(i);
            Resource resource = resourceLocator.getResource(getHttpContext(), pathInContext);
            if (resource.exists()) return resource;
        }
        return Resource.newResource("MISSING RESOURCE");
    }

    private void delayIfNeed(String pathInContext) {
        if (slowResources) {
            pause(SERVER_DELAY);
            if (pathInContext != null && pathInContext.endsWith("slow.html")) {
                pause(SERVER_DELAY);
            }
        }
    }

    private void pause(int millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
        }
    }


    public void addStaticContent(ResourceLocator locator) {
        resourceLocators.add(locator);
    }

    public void sendData(HttpRequest request,
                         HttpResponse response,
                         String pathInContext,
                         Resource resource,
                         boolean writeHeaders) throws IOException {
        if (!SeleniumServer.isProxyInjectionMode()) {
            super.sendData(request, response, pathInContext, resource, writeHeaders);
            return;
        }
        ResourceCache.ResourceMetaData metaData = (ResourceCache.ResourceMetaData) resource.getAssociate();
        String mimeType = metaData.getMimeType();
        response.setContentType(mimeType);
        if (resource.length() != -1) {
            response.setField(HttpFields.__ContentLength, metaData.getLength());
        }
        boolean knownToBeHtml = (mimeType != null) && mimeType.equals("text/html");
        InjectionHelper.injectJavaScript(knownToBeHtml, response, resource.getInputStream(), response.getOutputStream());
        request.setHandled(true);
    }
}