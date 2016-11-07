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
package me.gloriouseggroll.quorrabot.cache;

import com.gmt2001.TwitchAPIv3;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import me.gloriouseggroll.quorrabot.Quorrabot;
import me.gloriouseggroll.quorrabot.event.EventBus;
import me.gloriouseggroll.quorrabot.event.twitch.follower.TwitchFollowEvent;
import me.gloriouseggroll.quorrabot.event.twitch.follower.TwitchFollowsInitializedEvent;
import me.gloriouseggroll.quorrabot.event.twitch.follower.TwitchUnfollowEvent;
import org.json.JSONArray;
import org.json.JSONObject;

public class FollowersCache implements Runnable {

    private static final Map<String, FollowersCache> instances = Maps.newHashMap();

    public static FollowersCache instance(String channel) {
        FollowersCache instance = instances.get(channel);
        if (instance == null) {
            instance = new FollowersCache(channel);

            instances.put(channel, instance);
            return instance;
        }

        return instance;
    }

    private Map<String, JSONObject> cache = Maps.newHashMap();
    private final String channel;
    private int count = 0;
    private final Thread updateThread;
    private boolean firstUpdate = true;
    private Date timeoutExpire = new Date();
    private Date nextFull = new Date();
    private Date lastFail = new Date();
    private int numfail = 0;
    private boolean hasFail = false;
    private boolean killed = false;

    @SuppressWarnings("CallToThreadStartDuringObjectConstruction")
    private FollowersCache(String channel) {
        if (channel.startsWith("#")) {
            channel = channel.substring(1);
        }

        this.channel = channel;
        this.updateThread = new Thread(this);

        Thread.setDefaultUncaughtExceptionHandler(com.gmt2001.UncaughtExceptionHandler.instance());
        this.updateThread.setUncaughtExceptionHandler(com.gmt2001.UncaughtExceptionHandler.instance());

        updateThread.start();
    }

    public int quickUpdate(String channel) throws Exception {
        JSONObject j = TwitchAPIv3.instance().GetChannelFollows(channel, 100, 0, false);

        if (j.getBoolean("_success")) {
            if (j.getInt("_http") == 200) {
                int i = j.getInt("_total");

                Map<String, JSONObject> newCache = Maps.newHashMap();
                JSONArray followers = j.getJSONArray("follows");

                for (int b = 0; b < followers.length(); b++) {
                    JSONObject follower = followers.getJSONObject(b);
                    newCache.put(follower.getJSONObject("user").getString("name"), follower);
                }

                for (String key : newCache.keySet()) {
                    if (cache == null || !cache.containsKey(key)) {
                        cache.put(key, newCache.get(key));
                        EventBus.instance().post(new TwitchFollowEvent(key, Quorrabot.getChannel(this.channel)));
                    }
                }

                if (cache != null) {
                    for (String key : cache.keySet()) {
                        if (!newCache.containsKey(key)) {
                            EventBus.instance().post(new TwitchUnfollowEvent(key, Quorrabot.getChannel(this.channel)));
                        }
                    }
                }

                this.count = cache.size();

                return i;
            } else {
                throw new Exception("[HTTPErrorException] HTTP " + j.getInt("_http") + " " + j.getString("error") + ". req="
                        + j.getString("_type") + " " + j.getString("_url") + " " + j.getString("_post") + "   "
                        + (j.has("message") && !j.isNull("message") ? "message=" + j.getString("message") : "content=" + j.getString("_content")));
            }
        } else {
            throw new Exception("[" + j.getString("_exception") + "] " + j.getString("_exceptionMessage"));
        }
    }

    public boolean is(String username) {
        return cache.containsKey(username);
    }

    public JSONObject get(String username) {
        return cache.get(username);
    }

    @Override
    @SuppressWarnings("SleepWhileInLoop")
    public void run() {
        try {
            Thread.sleep(25 * 1000);
        } catch (InterruptedException e) {
            com.gmt2001.Console.debug.println("FollowersCache.run: Failed to initial sleep: [InterruptedException] " + e.getMessage());
        }

        try {
            try {
                quickUpdate(channel);
            } catch (Exception e) {
                if (e.getMessage().startsWith("[SocketTimeoutException]") || e.getMessage().startsWith("[IOException]")) {
                    Calendar c = Calendar.getInstance();

                    if (lastFail.after(new Date())) {
                        numfail++;
                    } else {
                        numfail = 1;
                    }

                    c.add(Calendar.MINUTE, 1);

                    lastFail = c.getTime();

                    if (numfail >= 5) {
                        timeoutExpire = c.getTime();
                    }
                }

                com.gmt2001.Console.debug.println("FollowersCache.run: Failed to update followers: " + e.getMessage());
            }
        } catch (Exception e) {
            com.gmt2001.Console.err.printStackTrace(e);
        }
        if (firstUpdate) {
            firstUpdate = false;
            EventBus.instance().postAsync(new TwitchFollowsInitializedEvent(Quorrabot.getChannel(this.channel)));
            com.gmt2001.Console.out.println(">>Enabling new follower announcements");
        }

        while (!killed) {
            try {
                try {
                    if (new Date().after(timeoutExpire)) {
                        /*
                         * int newCount =
                         */
                        quickUpdate(channel);
                    }
                } catch (Exception e) {
                    if (e.getMessage().startsWith("[SocketTimeoutException]") || e.getMessage().startsWith("[IOException]")) {
                        Calendar c = Calendar.getInstance();

                        if (lastFail.after(new Date())) {
                            numfail++;
                        } else {
                            numfail = 1;
                        }

                        c.add(Calendar.MINUTE, 1);

                        lastFail = c.getTime();

                        if (numfail >= 5) {
                            timeoutExpire = c.getTime();
                        }
                    }

                    com.gmt2001.Console.debug.println("FollowersCache.run: Failed to update followers: " + e.getMessage());
                }
            } catch (Exception e) {
                com.gmt2001.Console.err.printStackTrace(e);
            }

            try {
                Thread.sleep(25 * 1000);
            } catch (InterruptedException e) {
                com.gmt2001.Console.debug.println("FollowersCache.run: Failed to sleep: [InterruptedException] " + e.getMessage());
            }
        }
    }

    public void addFollower(String username) {
        cache.put(username, null);
    }

    public void setCache(Map<String, JSONObject> cache) {
        this.cache = cache;
    }

    public Map<String, JSONObject> getCache() {
        return cache;
    }

    public void kill() {
        killed = true;
    }

    public static void killall() {
        for (Entry<String, FollowersCache> instance : instances.entrySet()) {
            instance.getValue().kill();
        }
    }
}
