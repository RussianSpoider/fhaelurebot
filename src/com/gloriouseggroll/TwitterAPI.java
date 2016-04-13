/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gloriouseggroll;

import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.auth.AccessToken;
import twitter4j.auth.RequestToken;

/**
 *
 * @author thomas
 */
public class TwitterAPI {
        private static final TwitterAPI instance = new TwitterAPI();
	public static String consumerKeyStr = "oZ91vatOx75m8dEf1ljTRq8Hr";
	public static String consumerSecretStr = "OKrghaoRfmWjdMXZuIJbAraUwMYnvyIrAk4h4Nvvz3WLghqX11";
        public static AccessToken access_token;
        public static Twitter twitter = TwitterFactory.getSingleton();
        public static RequestToken requestToken = getRequestToken();
        public static RequestToken getRequestToken() {
            twitter.setOAuthConsumer(consumerKeyStr, consumerSecretStr);
            try {
                return twitter.getOAuthRequestToken();
            } catch (TwitterException te) {
                te.printStackTrace();
                return null;
            }
        }

        

        public static TwitterAPI instance()
        {
            return instance;
        }
        
        private TwitterAPI()
        {
            Thread.setDefaultUncaughtExceptionHandler(com.gmt2001.UncaughtExceptionHandler.instance());
        }
        
        
        public void CreateAccessToken(String pin)
        {
            //this.access_token = access_token;
                try{
                    if(pin.length() > 0){
                        this.access_token = twitter.getOAuthAccessToken(requestToken, pin);
                    }else{
                        this.access_token = twitter.getOAuthAccessToken();
                    }
                } catch (TwitterException te) {
                    if(401 == te.getStatusCode()){
                            System.out.println("Unable to get the access token.");
                    }else{
                            te.printStackTrace();
                        }
                }
        }
        

        public void loadAccessToken(String token, String tokenSecret){
            this.access_token = new AccessToken(token, tokenSecret);
            twitter.setOAuthAccessToken(access_token);
        }
        
        public String getAccessToken()
        {
            return access_token.getToken();
        }
        public String getAccessTokenSecret()
        {
            return access_token.getTokenSecret();
        }        
        public static String getRequestTokenURL()
        {
            return requestToken.getAuthorizationURL();
        }
        
	public static void tweet(String args) {
		try {
			twitter.updateStatus(args);
		} catch (TwitterException te) {
			te.printStackTrace();
		}
	}
    
}
