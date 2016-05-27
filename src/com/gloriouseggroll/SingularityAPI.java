/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gloriouseggroll;

import com.gmt2001.UncaughtExceptionHandler;

import me.gloriouseggroll.quorrabot.Quorrabot;
import me.gloriouseggroll.quorrabot.event.EventBus;
import me.gloriouseggroll.quorrabot.event.gamewisp.GameWispChangeEvent;
import me.gloriouseggroll.quorrabot.event.gamewisp.GameWispBenefitsEvent;
import me.gloriouseggroll.quorrabot.event.gamewisp.GameWispSubscribeEvent;
import me.gloriouseggroll.quorrabot.event.gamewisp.GameWispAnniversaryEvent;

import java.security.NoSuchAlgorithmException;
import java.security.KeyManagementException;
import java.io.IOException;
import java.lang.IllegalArgumentException;
import java.lang.InterruptedException;
import java.security.cert.CertificateException;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import java.security.cert.X509Certificate;
import java.net.URISyntaxException;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.net.ssl.SSLSession;

import io.socket.emitter.Emitter;
import io.socket.client.IO;
import io.socket.client.IO.Options;
import io.socket.client.Manager;
import io.socket.client.On;
import io.socket.client.Socket;
import io.socket.client.Url;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONStringer;

/**
 *
 * @author Tom
 */
public class SingularityAPI {
    private static final SingularityAPI instance = new SingularityAPI();

    private static final String apiURL = "https://singularity.gamewisp.com";
    private static final String gwIdentifier = "790f895a60b74cc09975b92f72e34b53b1f74ee";

    private Socket webSocket;

    private boolean Authenticated = false;
    private boolean ChannelConnected = false;
    private String AccessToken = "";
    private String SessionID = "";

    public static SingularityAPI instance() {
        return instance;
    }

    public void SingularityAPI() {
    }

    public void StartService() {
        
        TrustManager[] trustAllCerts = new TrustManager[] {
            new X509TrustManager() {
                public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                    return new java.security.cert.X509Certificate[] {};
                }

                public void checkClientTrusted(X509Certificate[] chain,
                                               String authType) throws CertificateException {
                }

                public void checkServerTrusted(X509Certificate[] chain,
                                               String authType) throws CertificateException {
                }
            }
        };

        try {
            SSLContext mySSLContext = SSLContext.getInstance("TLS");
            mySSLContext.init(null, null, null);

            IO.Options opts = new IO.Options();
            opts.sslContext = mySSLContext;
            opts.hostnameVerifier = new NullHostnameVerifier();
            webSocket = IO.socket(apiURL);

            webSocket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    com.gmt2001.Console.out.println("SingularityWS: Connected to Singularity");
                    webSocket.emit("authentication", new JSONObject().put("key", gwIdentifier).put("access_token", AccessToken));
                }
            });

            webSocket.on("unauthorized", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    JSONObject jsonObject = new JSONObject(args[0].toString());
                    com.gmt2001.Console.err.println("SingularityWS: Authorization Failed: " + jsonObject.getString("message"));
                }
            });

            webSocket.on("authenticated", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    com.gmt2001.Console.out.println("SingularityWS: Authenticated");
                    JSONObject jsonObject = new JSONObject(args[0].toString());
                    if (!jsonObject.has("session")) {
                        com.gmt2001.Console.err.println("SingularityWS: Missing Session in Authenticated Return JSON");
                        Authenticated = false;
                        return;
                    }
                    SessionID = jsonObject.getString("session");
                    Authenticated = true;
                }
            });

            webSocket.on("app-channel-connected", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    if (Authenticated) {
                        if (Quorrabot.enableDebugging) {
                            com.gmt2001.Console.out.println("SingularityWS: Connected to Channel");
                        } else {
                            com.gmt2001.Console.out.println("SingularityWS: Connected and Ready for Requests");
                        }
                        ChannelConnected = true;
                    } else {
                        com.gmt2001.Console.out.println("SingularityWS: Connected to Channel; Missing Session ID; Unusable Session");
                        ChannelConnected = false;
                    }
                }
            });

            webSocket.on("subscriber-new", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    com.gmt2001.Console.out.println("SingularityWS: subscriber-new received");
                    JSONObject jsonObject = new JSONObject(args[0].toString());
                    if (!jsonObject.has("data")) {
                        return;
                    }
                    if (!jsonObject.getJSONObject("data").has("usernames")) {
                        return;
                    }
                    if (!jsonObject.getJSONObject("data").getJSONObject("usernames").has("twitch")) {
                        return;
                    }
                    if (!jsonObject.getJSONObject("data").has("tier")) {
                        return;
                    }
                    if (!jsonObject.getJSONObject("data").getJSONObject("tier").has("level")) {
                        return;
                    }
                    String username = jsonObject.getJSONObject("data").getJSONObject("usernames").getString("twitch");
                    int tier = jsonObject.getJSONObject("data").getJSONObject("tier").getInt("level");
                    EventBus.instance().post(new GameWispSubscribeEvent(username, tier));
                }
            });

            webSocket.on("subscriber-anniversary", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    com.gmt2001.Console.out.println("SingularityWS: subscriber-anniversary received");
                    JSONObject jsonObject = new JSONObject(args[0].toString());
                    if (!jsonObject.has("data")) {
                        return; 
                    }
                    if (!jsonObject.getJSONObject("data").has("subscriber")) {
                        return;
                    }
                    if (!jsonObject.getJSONObject("data").getJSONObject("subscriber").has("usernames")) {
                        return;
                    }
                    if (!jsonObject.getJSONObject("data").getJSONObject("subscriber").getJSONObject("usernames").has("twitch")) {
                        return;
                    }
                    if (!jsonObject.getJSONObject("data").has("month_count")) {
                        return;
                    }
                    String username = jsonObject.getJSONObject("data").getJSONObject("subscriber").getJSONObject("usernames").getString("twitch");
                    int tier = jsonObject.getJSONObject("data").getJSONObject("subscriber").getJSONObject("tier").getInt("level");
                    int months = jsonObject.getJSONObject("data").getInt("month_count");
                    EventBus.instance().post(new GameWispAnniversaryEvent(username, months, tier));
                }
            });

            webSocket.on("subscriber-benefits-change", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    com.gmt2001.Console.out.println("SingularityWS: subscriber-benefits-change received");
                    JSONObject jsonObject = new JSONObject(args[0].toString());
                    if (!jsonObject.has("data")) {
                        return;
                    }
                    if (!jsonObject.getJSONObject("data").has("usernames")) {
                        return;
                    }
                    if (!jsonObject.getJSONObject("data").getJSONObject("usernames").has("twitch")) {
                        return;
                    }
                    if (!jsonObject.has("tier")) {
                        return;
                    }
                    if (!jsonObject.getJSONObject("tier").has("level")) {
                        return;
                    }
                    String username = jsonObject.getJSONObject("data").getJSONObject("usernames").getString("twitch");
                    int tier = jsonObject.getJSONObject("tier").getInt("level");
                    EventBus.instance().post(new GameWispBenefitsEvent(username, tier));
                }
            });

            /**
             * Status Change Values: https://gamewisp.readme.io/docs/subscriber-new
             * active - a currently active subscriber
             * trial - a subscriber on a trial code
             * grace_period - a canceled subscriber that is still received benefits
             * billing_grace_period - a canceled subscriber still receiving benefits that was canceled due to a payment processing error
             * inactive - a subscriber that is canceled and receiving no benefits
             * twitch - a subscriber that is receiving free benefits from a partnered Twitch streamer.
             */
            webSocket.on("subscriber-status-change", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    com.gmt2001.Console.out.println("SingularityWS: subscriber-status-changed received");
                    JSONObject jsonObject = new JSONObject(args[0].toString());
                    if (!jsonObject.has("data")) {
                        return;
                    }
                    if (!jsonObject.getJSONObject("data").has("usernames")) {
                        return;
                    }
                    if (!jsonObject.getJSONObject("data").getJSONObject("usernames").has("twitch")) {
                        return;
                    }
                    if (!jsonObject.getJSONObject("data").has("status")) {
                        return;
                    }
                    String username = jsonObject.getJSONObject("data").getJSONObject("usernames").getString("twitch");
                    String status = jsonObject.getJSONObject("data").getString("status");
                    EventBus.instance().post(new GameWispChangeEvent(username, status));
                }
            });

            webSocket.on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    com.gmt2001.Console.out.println("SingularityWS: Disconnected");
                }
            });

            webSocket.connect();

        } catch (Exception ex) {
            com.gmt2001.Console.err.println("SingularityWS: Exception: " + ex.getMessage());
        }
    }

    public void setAccessToken(String AccessToken) {
        this.AccessToken = AccessToken;
    }

    public Boolean isAuthenticated() {
        return Authenticated;
    }

    public Boolean isChannelConnected() {
        return ChannelConnected;
    }

    private class NullHostnameVerifier implements HostnameVerifier {
        public boolean verify(String urlHostname, SSLSession sslSession) {
            return true;
        }
    }

}
