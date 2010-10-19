package org.openqa.selenium.server;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.IO;
import org.openqa.jetty.util.URLResource;

/**
 * Represents a sessioned extension Javascript resource. This class provides
 * just enough canned return values for the purpose of being passed into
 * ResourceHandler.sendData(), and is not guaranteed to hold water for anything
 * else!
 */
class SessionExtensionJsResource extends URLResource {
    private String extensionJs;
    
    public SessionExtensionJsResource(String extensionJs)
        throws MalformedURLException
    {
        super(new URL("http://seleniumhq.org"), null);
        this.extensionJs = extensionJs;
    }
    
    @Override
    public boolean exists() {
        return true;
    }
    
    @Override
    public boolean isDirectory() {
        return false;
    }
    
    /**
     * Returns the lastModified time, which is always in the distant future to
     * prevent caching. This comes from <code>FutureFileResource</code>
     * originally.
     */
    @Override
    public long lastModified() {
        return System.currentTimeMillis() + (1000L * 3600L * 24L * 365L * 12L);
    }
    
    @Override
    public long length() {
        return extensionJs.length();
    }
    
    /**
     * This is basically a copy of Resource.writeTo() .
     */
    @Override
    public void writeTo(OutputStream out, long start, long count)
        throws IOException
    {
        // TODO(flight): I think this is equivalent.
        // The original code used a StringInputStream from Ant

        InputStream in = new ByteArrayInputStream(extensionJs.getBytes());

        try {
            in.skip(start);
            if (count<0)
                IO.copy(in, out);
            else
                IO.copy(in, out, (int)count);
        }
        finally {
            in.close();
        }
    }
}
