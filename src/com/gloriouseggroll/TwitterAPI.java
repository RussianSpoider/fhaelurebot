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
	static String consumerKeyStr = "	au2DSbPirzPknSuzhICL9nGgL";
	static String consumerSecretStr = "2DKZMKWwospj1aqGFPMW6DWhsEWm1KFLGfp1QiCXC8poP2hsnO";
        static AccessToken access_token;
	static Twitter twitter = TwitterFactory.getSingleton();
        
        //static RequestToken requestToken = twitter.getOAuthRequestToken();
        
        
        
        public static TwitterAPI instance()
        {
            twitter.setOAuthConsumer(consumerKeyStr, consumerSecretStr);
            return instance;
        }
        
        private TwitterAPI()
        {
            Thread.setDefaultUncaughtExceptionHandler(com.gmt2001.UncaughtExceptionHandler.instance());
        }
        
        
        public void SetAccessToken(String access_token)
        {
            //this.access_token = access_token;
        }
        
        public void getOAuthRequestToken()
        {
            //return requestToken.getAuthorizationURL();
        }
        
	public static void tweet(String args) {

		try {

			AccessToken accessToken = null;

                        twitter.setOAuthAccessToken(accessToken);

			twitter.updateStatus(args);

			System.out.println("Successfully updated the status in Twitter.");
		} catch (TwitterException te) {
			te.printStackTrace();
		}
	}
    
}
