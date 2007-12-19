package com.thoughtworks.webdriver;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Date;

public class Cookie {
    private final String name;
    private final String value;
    private final String domain;
    private final String path;
    private final Date expiry;
    private final boolean isSecure;

    /**
     * Creates a cookie
     *
     * @param name name cannot be null or empty string
     * @param value value can be an empty string but not be null
     * @param domain Domain can be an empty string but not be null.  Donot start with "." .
     * @param path path can be an empty string but not be null
     * @param expiry expiry can be null
     * @param isSecure
     */
    public Cookie(String name, String value, String domain, String path,
            Date expiry, boolean isSecure) {
        this.name = name;
        this.value = value;
        this.domain = domain;
        this.path = path;

        if(expiry != null) {
            //igonre the milliseconds because firefox only keeps the seconds
            this.expiry = new Date(expiry.getTime() / 1000 * 1000);
        } else {
            this.expiry = null;
        }
        this.isSecure = isSecure;

        validate();
    }

    public String getName() {
        return name;
    }

    public String getValue() {
        return value;
    }

    public String getDomain() {
        return domain;
    }

    public String getPath() {
        return path;
    }

    public boolean isSecure() {
        return isSecure;
    }

    public Date getExpiry() {
        return expiry;
    }

    // public static void parse(String )

    private void validate() {
        if (name == null || "".equals(name) || value == null || domain == null || path == null)
            throw new IllegalArgumentException("Required attribuets are not set or " +
                    "any non-null attribute set to null");

        if (name.indexOf(';') != -1)
            throw new IllegalArgumentException(
                    "Cookie names cannot contain a ';': " + name);
        if (!"".equals(domain)) {
            try {
                URL url = new URL("http://" + domain);
            } catch (MalformedURLException e) {
                throw new IllegalArgumentException("Invalid domain");
            }
        }

    }

    @Override
    public String toString() {
        return name + "=" + value + "; "
                + (expiry == null ? "" : "expires = " + expiry + "; ")
                + ("".equals(domain) ? "" : "domain = " + domain + "; ")
                + ("".equals(path) ? "" : "path = " + path + "; ")
                + (isSecure ? "secure;" : "");
    }

    /**
     *  Two cookies are equal if the domain, name and path match.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;

        Cookie cookie = (Cookie) o;
        if (!domain.equals(cookie.domain))
            return false;
        if (!name.equals(cookie.name))
            return false;
        if (!path.equals(cookie.path))
            return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result;
        result = name.hashCode();
        result = 31 * result + domain.hashCode();
        result = 31 * result + path.hashCode();
        return result;
    }
}
