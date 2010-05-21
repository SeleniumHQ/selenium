/*
 * Created on Oct 17, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import org.openqa.selenium.browserlaunchers.NullTrace;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.Trace;

import static org.openqa.selenium.server.browserlaunchers.LauncherUtils.getSeleniumResourceAsStream;


public class ResourceExtractor {
    private static Trace log = new NullTrace();
    private static final int BUF_SIZE = 8192;
    
    public static File extractResourcePath(String resourcePath, File dest) throws IOException {
        return extractResourcePath(ResourceExtractor.class, resourcePath, dest);
    }
    
    public static File extractResourcePath(Class cl, String resourcePath, File dest)
            throws IOException {
        boolean alwaysExtract = true;
        URL url = cl.getResource(resourcePath);
        if (url == null) {
            throw new IllegalArgumentException("Resource not found: " + resourcePath);
        }
        if ("jar".equalsIgnoreCase(url.getProtocol())) {
            File jarFile = getJarFileFromUrl(url);
            extractResourcePathFromJar(cl, jarFile, resourcePath, dest);
        } else {
            try {
                File resourceFile = new File(new URI(url.toExternalForm()));
                if (!alwaysExtract) {
                    return resourceFile;
                }
                if (resourceFile.isDirectory()) {
                    LauncherUtils.copyDirectory(resourceFile, dest);
                } else {
                    FileHandler.copy(resourceFile, dest);
                }
            } catch (URISyntaxException e) {
                throw new RuntimeException("Couldn't convert URL to File:" + url, e);
            }
        }
        return dest;
    }
    
    private static void extractResourcePathFromJar(Class cl, File jarFile, String resourcePath, File dest) throws IOException {
        ZipFile z = new ZipFile(jarFile, ZipFile.OPEN_READ);
        String zipStyleResourcePath = resourcePath.substring(1) + "/"; 
        ZipEntry ze = z.getEntry(zipStyleResourcePath);
        log.debug( "Extracting "+resourcePath+" to " + dest.getAbsolutePath() );
        if (ze != null) {
            // DGF If it's a directory, then we need to look at all the entries
            for (Enumeration entries = z.entries(); entries.hasMoreElements();) {
                ze = (ZipEntry) entries.nextElement();
                if (ze.getName().startsWith(zipStyleResourcePath)) {
                    String relativePath = ze.getName().substring(zipStyleResourcePath.length());
                    File destFile = new File(dest, relativePath);
                    if (ze.isDirectory()) {
                        destFile.mkdirs();
                    } else {
                        FileOutputStream fos = new FileOutputStream(destFile);
                        copyStream(z.getInputStream(ze), fos);
                    }
                }
            }
        } else {
            FileOutputStream fos = new FileOutputStream(dest);
            copyStream(getSeleniumResourceAsStream(resourcePath), fos);
            
        }
    }

  public static void traceWith(Trace log) {
    ResourceExtractor.log = log;
  }

  private static File getJarFileFromUrl(URL url) {
        if (!"jar".equalsIgnoreCase(url.getProtocol()))
            throw new IllegalArgumentException("This is not a Jar URL:"
                    + url.toString());
        String resourceFilePath = url.getFile();
        int index = resourceFilePath.indexOf("!");
        if (index == -1) {
            throw new RuntimeException("Bug! " + url.toExternalForm()
                    + " does not have a '!'");
        }
        String jarFileURI = resourceFilePath.substring(0, index).replace(" ", "%20");
        try {
            File jarFile = new File(new URI(jarFileURI));
            return jarFile;
        } catch (URISyntaxException e) {
            throw new RuntimeException("Bug! URI failed to parse: " + jarFileURI, e);
        }

    }
    
    private static void copyStream(InputStream in, OutputStream out) throws IOException {
        try {
            
            byte[] buffer = new byte[BUF_SIZE];
            int count = 0;
            do {
                out.write(buffer, 0, count);
                count = in.read(buffer, 0, buffer.length);
            } while (count != -1);
        } finally {
            if (out != null) {
                try {
                    out.close();
                } catch (IOException e) {}
            }
            if (in != null) {
                try {
                    in.close();
                } catch (IOException e) {}
            }
        }

    }
}
