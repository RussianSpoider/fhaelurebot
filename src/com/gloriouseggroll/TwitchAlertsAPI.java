/* 
 * Copyright (C) 2015 www.quorrabot.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package com.gloriouseggroll;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.SocketTimeoutException;
import java.net.URL;
import javax.net.ssl.HttpsURLConnection;
import org.apache.commons.io.IOUtils;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author GloriousEggroll
 */
public class TwitchAlertsAPI {
    private static final TwitchAlertsAPI instance = new TwitchAlertsAPI();
    private static final String base_url = "http://www.twitchalerts.com/api/donations?access_token=";
    private String clientid = "4S5Ml50i5g9lUvvpV85qUmXRF0KyvgkiS6F3g6st";
    private String oauth = "";
    private String access_token = "7258CD7F6EE034A12D1D";
    private static final String header_accept = "application/json";
    private static final int timeout = 2 * 1000;

    
    private enum request_type
    {

        GET, POST, PUT, DELETE
    };
        
    public static TwitchAlertsAPI instance()
    {
        return instance;
    }
    
    private TwitchAlertsAPI()
    {
        Thread.setDefaultUncaughtExceptionHandler(com.gmt2001.UncaughtExceptionHandler.instance());
    }
        
    private JSONObject GetData(request_type type, String url, boolean isJson)
    {
        return GetData(type, url, "", isJson);
    }

    private JSONObject GetData(request_type type, String url, String post, boolean isJson)
    {
        return GetData(type, url, post, "", isJson);
    }
    
    @SuppressWarnings("UseSpecificCatch")
    private JSONObject GetData(request_type type, String url, String post, String oauth, boolean isJson)
    {
        JSONObject j = new JSONObject("{}");
        InputStream i = null;
        String rawcontent = "";

        try
        {
            if (url.contains("?"))
            {
                url += "&utcnow=" + System.currentTimeMillis();
            } else
            {
                url += "?utcnow=" + System.currentTimeMillis();
            }

            URL u = new URL(url);
            HttpsURLConnection c = (HttpsURLConnection) u.openConnection();

            c.addRequestProperty("Accept", header_accept);

            if (isJson)
            {
                c.addRequestProperty("Content-Type", "application/json");
            } else
            {
                c.addRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            }

            if (!clientid.isEmpty())
            {
                c.addRequestProperty("Client-ID", clientid);
            }

            if (!oauth.isEmpty())
            {
                c.addRequestProperty("Authorization", "OAuth " + oauth);
            }

            c.setRequestMethod(type.name());

            c.setUseCaches(false);
            c.setDefaultUseCaches(false);
            c.setConnectTimeout(timeout);
            c.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.52 Safari/537.36 QuorraBot/2015");

            if (!post.isEmpty())
            {
                c.setDoOutput(true);
            }

            c.connect();

            if (!post.isEmpty())
            {
                try (OutputStream o = c.getOutputStream())
                {
                    IOUtils.write(post, o);
                }
            }

            String content;

            if (c.getResponseCode() == 200)
            {
                i = c.getInputStream();
            } else
            {
                i = c.getErrorStream();
            }

            if (c.getResponseCode() == 204 || i == null)
            {
                content = "{}";
            } else
            {
                content = IOUtils.toString(i, c.getContentEncoding());
            }

            rawcontent = content;

            j = new JSONObject(content);
            j.put("_success", true);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", c.getResponseCode());
            j.put("_exception", "");
            j.put("_exceptionMessage", "");
            j.put("_content", content);
        } catch (JSONException ex)
        {
            if (ex.getMessage().contains("A JSONObject text must begin with"))
            {
                j = new JSONObject("{}");
                j.put("_success", true);
                j.put("_type", type.name());
                j.put("_url", url);
                j.put("_post", post);
                j.put("_http", 0);
                j.put("_exception", "");
                j.put("_exceptionMessage", "");
                j.put("_content", rawcontent);
            } else
            {
                com.gmt2001.Console.err.logStackTrace(ex);
            }
        } catch (NullPointerException ex)
        {
            com.gmt2001.Console.err.printStackTrace(ex);
        } catch (MalformedURLException ex)
        {
            j.put("_success", false);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", 0);
            j.put("_exception", "MalformedURLException");
            j.put("_exceptionMessage", ex.getMessage());
            j.put("_content", "");
            com.gmt2001.Console.err.logStackTrace(ex);
        } catch (SocketTimeoutException ex)
        {
            j.put("_success", false);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", 0);
            j.put("_exception", "SocketTimeoutException");
            j.put("_exceptionMessage", ex.getMessage());
            j.put("_content", "");
            com.gmt2001.Console.err.logStackTrace(ex);
        } catch (IOException ex)
        {
            j.put("_success", false);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", 0);
            j.put("_exception", "IOException");
            j.put("_exceptionMessage", ex.getMessage());
            j.put("_content", "");
            com.gmt2001.Console.err.logStackTrace(ex);
        } catch (Exception ex)
        {
            j.put("_success", false);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", 0);
            j.put("_exception", "Exception [" + ex.getClass().getName() + "]");
            j.put("_exceptionMessage", ex.getMessage());
            j.put("_content", "");
            com.gmt2001.Console.err.logStackTrace(ex);
        }

        if (i != null)
        {
            try
            {
                i.close();
            } catch (IOException ex)
            {
                j.put("_success", false);
                j.put("_type", type.name());
                j.put("_url", url);
                j.put("_post", post);
                j.put("_http", 0);
                j.put("_exception", "IOException");
                j.put("_exceptionMessage", ex.getMessage());
                j.put("_content", "");
                com.gmt2001.Console.err.logStackTrace(ex);
            }
        }

        return j;
    }

    /**
     * Sets the TwitchAlerts API Client-ID header
     *
     * @param clientid
     */
    public void SetClientID(String clientid)
    {
        this.clientid = clientid;
    }

    /**
     * Sets the TwitchAlerts API OAuth header
     *
     * @param oauth
     */
    public void SetOAuth(String oauth)
    {
        this.oauth = oauth.replace("oauth:", "");
    }

    public boolean HasOAuth()
    {
        return !this.oauth.isEmpty();
    }
    
    public JSONObject GetChannelDonations(String channel, int limit, int offset, boolean ascending)
    {

        return GetData(request_type.GET, base_url + access_token, false);
    }

}
