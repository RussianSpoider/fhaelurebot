/* 
 * Copyright (C) 2016 www.quorrabot.com
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
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.util.Date;
import java.net.MalformedURLException;
import java.net.SocketTimeoutException;
import java.net.URL;
import javax.net.ssl.HttpsURLConnection;
import org.apache.commons.io.IOUtils;
import org.json.JSONException;
import org.json.JSONArray;
import org.json.JSONObject;

import me.gloriouseggroll.quorrabot.Quorrabot;

/**
 *
 * @author GloriousEggroll
 */
public class DonationHandlerAPI {
    private static final DonationHandlerAPI instance = new DonationHandlerAPI();
    
    //Twitchalerts auth info
    private static String ta_access_token = "";
    private static final String ta_base_url = "https://www.twitchalerts.com/api/donations?access_token=";
    
    //Streamtip auth info
    private static String st_clientid = "";
    private static String st_access_token = "";
    private static final String st_base_url = "https://streamtip.com/api/tips?client_id=";
    
    //tipeeestream auth info
    private static String tpe_access_token = "";
    private static final String tpe_base_url = "https://api.tipeeestream.com/v1.0/events.json?apiKey=";

    
    private enum request_type
    {

        GET, POST, PUT, DELETE
    };
        
    public static DonationHandlerAPI instance()
    {
        return instance;
    }
    
    private DonationHandlerAPI()
    {
        Thread.setDefaultUncaughtExceptionHandler(com.gmt2001.UncaughtExceptionHandler.instance());
    }
        
    private JSONObject GetData(request_type type, String url)
    {
        return GetData(type, url, "");
    }
    
    @SuppressWarnings(
            {
                "null", "SleepWhileInLoop", "UseSpecificCatch"
            })
    private JSONObject GetData(request_type type, String url, String post)
    {
        Date start = new Date();
        Date preconnect = start;
        Date postconnect = start;
        Date prejson = start;
        Date postjson = start;
        JSONObject j = new JSONObject("{}");
        BufferedInputStream i = null;
        String rawcontent = "";
        int available = 0;
        int responsecode = 0;
        long cl = 0;

        try
        {

            URL u = new URL(url);
            HttpsURLConnection c = (HttpsURLConnection) u.openConnection();

            c.setRequestMethod(type.name());

            c.setUseCaches(false);
            c.setDefaultUseCaches(false);
            c.setConnectTimeout(5000);
            c.setReadTimeout(5000);
            c.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.52 Safari/537.36 QuorraBot/2015");
            c.setRequestProperty("Content-Type", "application/json-rpc");
            c.setRequestProperty("Content-length", "0");

            if (!post.isEmpty())
            {
                c.setDoOutput(true);
            }

            preconnect = new Date();
            c.connect();
            postconnect = new Date();

            if (!post.isEmpty())
            {
                try (BufferedOutputStream o = new BufferedOutputStream(c.getOutputStream()))
                {
                    IOUtils.write(post, o);
                }
            }

            String content;
            cl = c.getContentLengthLong();
            responsecode = c.getResponseCode();

            if (c.getResponseCode() == 200)
            {
                i = new BufferedInputStream(c.getInputStream());
            } else
            {
                i = new BufferedInputStream(c.getErrorStream());
            }

            /*
             * if (i != null) { available = i.available();
             *
             * while (available == 0 && (new Date().getTime() -
             * postconnect.getTime()) < 450) { Thread.sleep(500); available =
             * i.available(); }
             *
             * if (available == 0) { i = new
             * BufferedInputStream(c.getErrorStream());
             *
             * if (i != null) { available = i.available(); } } }
             *
             * if (available == 0) { content = "{}"; } else { content =
             * IOUtils.toString(i, c.getContentEncoding()); }
             */
            content = IOUtils.toString(i, c.getContentEncoding());
            rawcontent = content;
            prejson = new Date();
            j = new JSONObject(content);
            j.put("_success", true);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", c.getResponseCode());
            j.put("_available", available);
            j.put("_exception", "");
            j.put("_exceptionMessage", "");
            j.put("_content", content);
            postjson = new Date();
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
                j.put("_available", available);
                j.put("_exception", "MalformedJSONData (HTTP " + responsecode + ")");
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
            j.put("_available", available);
            j.put("_exception", "MalformedURLException");
            j.put("_exceptionMessage", ex.getMessage());
            j.put("_content", "");

            if (Quorrabot.enableDebugging)
            {
                com.gmt2001.Console.err.printStackTrace(ex);
            } else
            {
                com.gmt2001.Console.err.logStackTrace(ex);
            }
        } catch (SocketTimeoutException ex)
        {
            j.put("_success", false);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", 0);
            j.put("_available", available);
            j.put("_exception", "SocketTimeoutException");
            j.put("_exceptionMessage", ex.getMessage());
            j.put("_content", "");

            if (Quorrabot.enableDebugging)
            {
                com.gmt2001.Console.err.printStackTrace(ex);
            } else
            {
                com.gmt2001.Console.err.logStackTrace(ex);
            }
        } catch (IOException ex)
        {
            j.put("_success", false);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", 0);
            j.put("_available", available);
            j.put("_exception", "IOException");
            j.put("_exceptionMessage", ex.getMessage());
            j.put("_content", "");

            if (Quorrabot.enableDebugging)
            {
                com.gmt2001.Console.err.printStackTrace(ex);
            } else
            {
                com.gmt2001.Console.err.logStackTrace(ex);
            }
        } catch (Exception ex)
        {
            j.put("_success", false);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", 0);
            j.put("_available", available);
            j.put("_exception", "Exception [" + ex.getClass().getName() + "]");
            j.put("_exceptionMessage", ex.getMessage());
            j.put("_content", "");

            if (Quorrabot.enableDebugging)
            {
                com.gmt2001.Console.err.printStackTrace(ex);
            } else
            {
                com.gmt2001.Console.err.logStackTrace(ex);
            }
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
                j.put("_available", available);
                j.put("_exception", "IOException");
                j.put("_exceptionMessage", ex.getMessage());
                j.put("_content", "");

                if (Quorrabot.enableDebugging)
                {
                    com.gmt2001.Console.err.printStackTrace(ex);
                } else
                {
                    com.gmt2001.Console.err.logStackTrace(ex);
                }
            }
        }

        if (Quorrabot.enableDebugging)
        {
            com.gmt2001.Console.out.println(">>>[DEBUG] DonationHandlerAPI.GetData Timers " + (preconnect.getTime() - start.getTime()) + " "
                    + (postconnect.getTime() - start.getTime()) + " " + (prejson.getTime() - start.getTime()) + " "
                    + (postjson.getTime() - start.getTime()) + " " + start.toString() + " " + postjson.toString());
            com.gmt2001.Console.out.println(">>>[DEBUG] DonationHandlerAPI.GetData Exception " + j.getString("_exception") + " " + j.getString("_exceptionMessage"));
            com.gmt2001.Console.out.println(">>>[DEBUG] DonationHandlerAPI.GetData HTTP/Available " + j.getInt("_http") + "(" + responsecode + ")/" + j.getInt("_available") + "(" + cl + ")");
            com.gmt2001.Console.out.println(">>>[DEBUG] DonationHandlerAPI.GetData RawContent[0,100] " + j.getString("_content").substring(0, Math.min(100, j.getString("_content").length())));
        }

        return j;
    }

    /**
     * Sets the API Client-ID header
     *
     * @param clientid
     */
    public void SetClientID(String clientid, String type)
    {
        if(type.equals("streamtip")) {
            this.st_clientid = clientid;
            return;
        }
    }

    /**
     * Sets the API Access Token
     *
     * @param access_token
     */
    public void SetAccessToken(String access_token, String type)
    {
        if(type.equals("twitchalerts")) {
            this.ta_access_token = access_token;
            return;
        }
        if(type.equals("streamtip")) {
            this.st_access_token = access_token;
            return;
        }
        if(type.equals("tpestream")) {
            this.tpe_access_token = access_token;
            return;
        }
    }
    
    public String[] taGetChannelDonations()
    {
        
        JSONObject j = GetData(DonationHandlerAPI.request_type.GET, ta_base_url + ta_access_token);
        if (j.getBoolean("_success") && !j.toString().contains("Bad Request") && !j.toString().contains("Not Found"))
        {
        
            if (j.getInt("_http") == 200)
            {
                try
                {
                    if (Quorrabot.enableDebugging)
                    {
                        com.gmt2001.Console.out.println(">>>[DEBUG] DonationHandlerAPI.GetChannelDonations Success");
                    }
                    
                    JSONArray donations = j.getJSONArray("donations");
                    //com.gmt2001.Console.out.println(donations.toString());
                    
                    JSONObject lastdonation = donations.getJSONObject(0);
                    String amount = lastdonation.getString("amount_label");
                    String donatormessage = "";
                    
                    String ld = lastdonation.toString();
                    if( !ld.substring(ld.indexOf("message"),ld.indexOf("message")+14).contains("null") ) {
                        donatormessage = lastdonation.getString("message");
                    }

                    
                    String createdat = lastdonation.getString("created_at");
                    
                    JSONObject donator = lastdonation.getJSONObject("donator");
                    String donatorname = donator.getString("name");
                    
                    return new String[]
                    {
                        donatorname, amount, donatormessage, createdat
                    };
                    
                } catch (Exception e)
                {
                    if (Quorrabot.enableDebugging)
                    {
                        com.gmt2001.Console.out.println(">>>[DEBUG] DonationHandlerAPI.GetChannelDonations Exception");
                    }

                    return new String[]
                    {
                        "", "", "", ""
                    };
                }
            } else {
                return new String[]
                {
                    "", "", "", ""
                };
            } 
        } else {
            return new String[]
            {
                "", "", "", ""
            };
        }
    }
    
    public String[] stGetChannelDonations()
    {
        
        JSONObject j = GetData(DonationHandlerAPI.request_type.GET, st_base_url + st_clientid + "&access_token=" + st_access_token);
        if (j.getBoolean("_success") && !j.toString().contains("Bad Request") && !j.toString().contains("Not Found"))
        {
        
            if (j.getInt("_http") == 200)
            {
                try
                {
                    if (Quorrabot.enableDebugging)
                    {
                        com.gmt2001.Console.out.println(">>>[DEBUG] DonationHandlerAPI.GetChannelDonations Success");
                    }
                    
                    JSONArray donations = j.getJSONArray("tips");
                    //com.gmt2001.Console.out.println(donations.toString());
                    
                    JSONObject lastdonation = donations.getJSONObject(0);
                    //com.gmt2001.Console.out.println(lastdonation.toString());
                    
                    String amount = lastdonation.getString("amount");
                    String cs = lastdonation.getString("currencySymbol");
                    
                    String donatormessage = "";
                    
                    String ld = lastdonation.toString();
                    if( !ld.substring(ld.indexOf("note"),ld.indexOf("note")+11).contains("null") ) {
                        donatormessage = lastdonation.getString("note");
                    }

                    String createdat = lastdonation.getString("date");
                    createdat = createdat.substring(0, createdat.indexOf(".")) + "Z";

                    String donatorname = lastdonation.getString("username");
                    
                    return new String[]
                    {
                        donatorname,  cs + amount, donatormessage, createdat
                    };
                    
                } catch (Exception e)
                {
                    if (Quorrabot.enableDebugging)
                    {
                        com.gmt2001.Console.out.println(">>>[DEBUG] DonationHandlerAPI.GetChannelDonations Exception");
                    }
                    com.gmt2001.Console.out.println(e.toString());
                    return new String[]
                    {
                        "", "", "", ""
                    };
                }
            } else {
                return new String[]
                {
                    "", "", "", ""
                };
            } 
        } else {
            return new String[]
            {
                "", "", "", ""
            };
        }
    }

    public String[] tpeGetChannelDonations()
    {
        
        JSONObject j = GetData(DonationHandlerAPI.request_type.GET, tpe_base_url + tpe_access_token + "&type[]=donation");
        if (j.getBoolean("_success") && !j.toString().contains("Bad Request") && !j.toString().contains("Not Found"))
        {
        
            if (j.getInt("_http") == 200)
            {
                try
                {
                    if (Quorrabot.enableDebugging)
                    {
                        com.gmt2001.Console.out.println(">>>[DEBUG] DonationHandlerAPI.GetChannelDonations Success");
                    }
                    JSONObject datas = j.getJSONObject("datas");
                    
                    JSONArray donations = datas.getJSONArray("items");
                    
                    JSONObject lastdonation = donations.getJSONObject(0);
                    
                    String amount = lastdonation.getString("formattedAmount");
                    
                    JSONObject parameters = lastdonation.getJSONObject("parameters");
                    String donatormessage = parameters.getString("formattedMessage");
                    String donatorname = parameters.getString("username");

                    String createdat = lastdonation.getString("created_at");
                    createdat = createdat.substring(0, createdat.indexOf("+")) + "Z";
                    
                    return new String[]
                    {
                        donatorname, amount, donatormessage, createdat
                    };
                    
                } catch (Exception e)
                {
                    if (Quorrabot.enableDebugging)
                    {
                        com.gmt2001.Console.out.println(">>>[DEBUG] DonationHandlerAPI.GetChannelDonations Exception");
                    }

                    return new String[]
                    {
                        "", "", "", ""
                    };
                }
            } else {
                return new String[]
                {
                    "", "", "", ""
                };
            } 
        } else {
            return new String[]
            {
                "", "", "", ""
            };
        }
    }


}
