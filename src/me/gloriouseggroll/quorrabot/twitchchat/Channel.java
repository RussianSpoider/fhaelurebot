package me.gloriouseggroll.quorrabot.twitchchat;
import me.gloriouseggroll.quorrabot.twitchchat.Session;
import me.gloriouseggroll.quorrabot.event.EventBus;

import org.java_websocket.WebSocket;
import com.google.common.collect.Maps;

import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

public class Channel {

    private static final Map<String, Channel> instances = Maps.newHashMap();
    public static Channel channel;
    private IRC twitchIRC;
    private EventBus eventBus;
    private String channelName;
    private String botName;
    private String oAuth;
    private Session session;

    /*
     * Creates an instance for a channel.
     *
     * @param  channel  Twitch Channel
     */
    public static Channel instance(String channelName, String botName, String oAuth, EventBus eventBus) {
        Channel instance = instances.get(channelName);
        if (instance == null) {
            instance = new Channel(channelName, botName, oAuth, eventBus);
            instances.put(channelName, instance);
            channel = instance;
            return instance;
        }
        return instance;
    }

    /*
     * Constructor for the Channel object.
     *
     * @param  channelName  Twitch Channel
     * @param  webSocket    WebSocket object for writing data to
     */
    private Channel(String channelName, String botName, String oAuth, EventBus eventBus) {
        this.channelName = channelName;
        this.eventBus = eventBus;
        this.botName = botName;
        this.oAuth = oAuth;

        session = Session.instance(this, channelName, botName, oAuth, eventBus);
    }

    /*
     * Returns the name of the Channel.
     *
     * @return  String  Name of the channel.
     */
    public String getName() {
        return channelName;
    }

    /*
     * Returns the the Channel.
     *
     * @return  Channel  channel.
     */
    public Channel getChannel() {
        return channel;
    }
   
}
