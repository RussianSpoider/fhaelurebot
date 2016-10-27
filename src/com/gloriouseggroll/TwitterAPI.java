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

import java.util.List;
import twitter4j.Status;
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
	public static String getlast() {
            try {
                List<Status> statuses = twitter.getUserTimeline();
                Status status = statuses.get(0);
                return status.getText();
            } catch (TwitterException te) {
		te.printStackTrace();
                return null;
            }
	}
    
}
