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
package me.gloriouseggroll.quorrabot;

import com.gmt2001.DataStore;
import com.gmt2001.IniStore;
import com.gmt2001.SqliteStore;
import com.gmt2001.TempStore;
import com.gmt2001.TwitchAPIv3;
import com.gloriouseggroll.DonationHandlerAPI;
import com.gloriouseggroll.LastFMAPI;
import com.gloriouseggroll.TwitterAPI;
import com.gloriouseggroll.SingularityAPI;
import com.gloriouseggroll.GameWispAPI;
import com.gmt2001.YouTubeAPIv3;
import com.google.common.eventbus.Subscribe;
import de.simeonf.EventWebSocketSecureServer;
import de.simeonf.EventWebSocketServer;
import de.simeonf.MusicWebSocketSecureServer;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map.Entry;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import me.gloriouseggroll.quorrabot.cache.ChannelHostCache;
import me.gloriouseggroll.quorrabot.cache.ChannelUsersCache;
import me.gloriouseggroll.quorrabot.cache.FollowersCache;
import me.gloriouseggroll.quorrabot.cache.SubscribersCache;
import me.gloriouseggroll.quorrabot.cache.UsernameCache;
import me.gloriouseggroll.quorrabot.console.ConsoleInputListener;
import me.gloriouseggroll.quorrabot.event.Listener;
import me.gloriouseggroll.quorrabot.event.command.CommandEvent;
import me.gloriouseggroll.quorrabot.event.console.ConsoleInputEvent;
import me.gloriouseggroll.quorrabot.event.irc.channel.IrcChannelUserModeEvent;
import me.gloriouseggroll.quorrabot.event.irc.complete.IrcConnectCompleteEvent;
import me.gloriouseggroll.quorrabot.event.irc.complete.IrcJoinCompleteEvent;
import me.gloriouseggroll.quorrabot.event.irc.message.IrcChannelMessageEvent;
import me.gloriouseggroll.quorrabot.event.irc.message.IrcPrivateMessageEvent;
import me.gloriouseggroll.quorrabot.event.gamewisp.GameWispChangeEvent;
import me.gloriouseggroll.quorrabot.event.gamewisp.GameWispBenefitsEvent;
import me.gloriouseggroll.quorrabot.event.gamewisp.GameWispSubscribeEvent;
import me.gloriouseggroll.quorrabot.event.gamewisp.GameWispAnniversaryEvent;
import me.gloriouseggroll.quorrabot.jerklib.Channel;
import me.gloriouseggroll.quorrabot.jerklib.ConnectionManager;
import me.gloriouseggroll.quorrabot.jerklib.Profile;
import me.gloriouseggroll.quorrabot.jerklib.Session;
import me.gloriouseggroll.quorrabot.musicplayer.MusicWebSocketServer;
import me.gloriouseggroll.quorrabot.script.Script;
import me.gloriouseggroll.quorrabot.script.ScriptApi;
import me.gloriouseggroll.quorrabot.script.ScriptEventManager;
import me.gloriouseggroll.quorrabot.script.ScriptManager;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.SystemUtils;
import me.gloriouseggroll.quorrabot.event.EventBus;
import me.gloriouseggroll.quorrabot.event.twitch.host.TwitchHostedEvent;


public class Quorrabot implements Listener
{

    public final String username;
    public String hostedName;
    private final String oauth;
    private String apioauth;
    private String clientid;
    private final String channelName;
    private final String ownerName;
    private final String hostname;
    private String gamewispauth;
    private String gamewisprefresh;
    private int port;
    private int baseport;
    private double msglimit30;
    private String datastore;
    private String datastoreconfig;
    private String youtubekey;
    private String twitchalertstoken;
    private String lastfmuser;    
    private String tpetoken;
    private String twittertoken;    
    private String twittertokensecret;    
    private String streamtiptoken;
    private String streamtipid;
    private boolean webenable;
    private boolean musicenable;
	private boolean usehttps;
	private String keystorepath;
	private String keystorepassword;
	private String keypassword;
    private String channelStatus;
    private DataStore dataStoreObj;
    private SecureRandom rng;
    private TreeMap<String, Integer> pollResults;
    private TreeSet<String> voters;
    private Profile profile;
    private Profile tceProfile;
    private ConnectionManager connectionManager;
    private ConnectionManager tceConnectionManager;
    private final Session session;
    public static Session tceSession;    
    private Channel channel;
    private final HashMap<String, Channel> channels;
    private FollowersCache followersCache;
    private ChannelHostCache hostCache;
    private SubscribersCache subscribersCache;
    private ChannelUsersCache channelUsersCache;
    private MusicWebSocketServer musicsocketserver;
    private HTTPServer httpserver;
    private EventWebSocketServer eventsocketserver;
    private ConsoleInputListener cil;
    private static final boolean debugD = false;
    public static boolean enableDebugging = false;
    public static boolean interactive;
    public static boolean webenabled = false;
    public static boolean musicenabled = false;
    private boolean exiting = false;
    private Thread t;
    private static Quorrabot instance;

    public static Quorrabot instance()
    {
        return instance;
    }

    public Quorrabot(String username, String oauth, String apioauth, String clientid, String channel, String owner, int baseport,
            String hostname, int port, double msglimit30, String datastore, String datastoreconfig, String youtubekey, String gamewispauth, String gamewisprefresh, String twitchalertstoken, String lastfmuser, String tpetoken, String twittertoken, String twittertokensecret, String streamtiptoken, String streamtipid, boolean webenable,
            boolean musicenable, boolean usehttps, String keystorepath, String keystorepassword, String keypassword)
    {
        Thread.setDefaultUncaughtExceptionHandler(com.gmt2001.UncaughtExceptionHandler.instance());

        com.gmt2001.Console.out.println();
        com.gmt2001.Console.out.println("QuorraBot Core 1.12 04/28/2016");
        com.gmt2001.Console.out.println("Build revision: " + RepoVersion.getRepoVersion());
        com.gmt2001.Console.out.println("www.quorrabot.com");
        com.gmt2001.Console.out.println();
        com.gmt2001.Console.out.println("The working directory is: " + System.getProperty("user.dir"));


        interactive = System.getProperty("interactive") != null;

        this.username = username;
        this.oauth = oauth;
        this.apioauth = apioauth;
        this.channelName = channel;
        this.ownerName = owner;
        this.baseport = baseport;
        this.datastore = datastore;
        this.datastoreconfig = datastoreconfig;
        this.youtubekey = youtubekey;
        if (!youtubekey.isEmpty())
        {
            YouTubeAPIv3.instance().SetAPIKey(youtubekey);
        }
        this.gamewispauth = gamewispauth;
        this.gamewisprefresh = gamewisprefresh;
        this.twitchalertstoken = twitchalertstoken;
        if (!twitchalertstoken.isEmpty())
        {
            DonationHandlerAPI.instance().SetAccessToken(twitchalertstoken, "twitchalerts");
        }
        this.lastfmuser = lastfmuser;
        if (!lastfmuser.isEmpty())
        {
            LastFMAPI.instance().SetUsername(lastfmuser);
        }
        this.tpetoken = tpetoken;
        if (!tpetoken.isEmpty())
        {
            DonationHandlerAPI.instance().SetAccessToken(tpetoken, "tpestream");
        }
        this.streamtiptoken = streamtiptoken;
        if (!streamtiptoken.isEmpty())
        {
            DonationHandlerAPI.instance().SetAccessToken(streamtiptoken, "streamtip");
        }
        this.streamtipid = streamtipid;
        if (!streamtipid.isEmpty())
        {
            DonationHandlerAPI.instance().SetClientID(streamtipid, "streamtip");
        }
        this.twittertoken = twittertoken;
        this.twittertokensecret = twittertokensecret;
        if (!twittertoken.isEmpty() || !twittertokensecret.isEmpty())
        {
            TwitterAPI.instance().loadAccessToken(twittertoken,twittertokensecret);
        }

        this.webenable = webenable;
        this.musicenable = musicenable;
        this.usehttps = usehttps;
        this.keystorepath = keystorepath;
        this.keystorepassword = keystorepassword;
        this.keypassword = keypassword;

        this.profile = new Profile(username.toLowerCase());
        this.tceProfile = new Profile(channel.toLowerCase());
        this.connectionManager = new ConnectionManager(profile);
        this.tceConnectionManager = new ConnectionManager(tceProfile);
        
        if (clientid.length() == 0)
        {
            this.clientid = "pcaalhorck7ryamyg6ijd5rtnls5pjl";
        } else
        {
            this.clientid = clientid;
        }

        rng = new SecureRandom();
        pollResults = new TreeMap<>();
        voters = new TreeSet<>();
        

        if (hostname.isEmpty())
        {
            this.hostname = "irc.chat.twitch.tv";
            this.port = 6667;
        } else
        {
            this.hostname = hostname;
            this.port = port;
        }
        

        if (msglimit30 > 0)
        {
            this.msglimit30 = msglimit30;
        } else
        {
            this.msglimit30 = 18.75;
        }

        if (datastore.equalsIgnoreCase("TempStore"))
        {
            dataStoreObj = TempStore.instance();
        } else if (datastore.equalsIgnoreCase("IniStore"))
        {
            dataStoreObj = IniStore.instance();
        } else
        {
            dataStoreObj = SqliteStore.instance();
        }

        if (datastore.isEmpty() && IniStore.instance().GetFileList().length > 0 && SqliteStore.instance().GetFileList().length == 0)
        {
            ini2sqlite(true);
        }

        this.init();

        /*
         * try { Thread.sleep(3000); } catch (InterruptedException ex) { }
         */
        if (SystemUtils.IS_OS_LINUX && !interactive)
        {
            try
            {
                java.lang.management.RuntimeMXBean runtime = java.lang.management.ManagementFactory.getRuntimeMXBean();
                /*
                 * java.lang.reflect.Field jvm =
                 * runtime.getClass().getDeclaredField("jvm");
                 * jvm.setAccessible(true); sun.management.VMManagement mgmt =
                 * (sun.management.VMManagement) jvm.get(runtime);
                 * java.lang.reflect.Method pid_method =
                 * mgmt.getClass().getDeclaredMethod("getProcessId");
                 * pid_method.setAccessible(true);
                 *
                 * int pid = (Integer) pid_method.invoke(mgmt);
                 */
                int pid = Integer.parseInt(runtime.getName().split("@")[0]);

                //int pid = Integer.parseInt( ( new File("/proc/self")).getCanonicalFile().getName() ); 
                File f = new File("/var/run/QuorraBot." + this.username.toLowerCase() + ".pid");

                try (FileOutputStream fs = new FileOutputStream(f, false))
                {
                    PrintStream ps = new PrintStream(fs);

                    ps.print(pid);
                }

                f.deleteOnExit();
            } catch (/*
                     * NoSuchFieldException | IllegalAccessException |
                     * NoSuchMethodException |
                     * java.lang.reflect.InvocationTargetException |
                     */SecurityException | IllegalArgumentException | IOException ex)
            {
                com.gmt2001.Console.err.printStackTrace(ex);
            }
        }

        channels = new HashMap<>();
 
        this.session = connectionManager.requestConnection(this.hostname, this.port, oauth);

        TwitchChatEventHandler(apioauth, this.tceConnectionManager);

        TwitchAPIv3.instance().SetClientID(this.clientid);
        TwitchAPIv3.instance().SetOAuth(apioauth);

        this.session.addIRCEventListener(new IrcEventHandler());
    }
    
    public static void setDebugging(boolean debug)
    {
        Quorrabot.enableDebugging = debug;
    }

    public DataStore getDataStore()
    {
        return dataStoreObj;
    }

    public Session getSession()
    {
        return session;
    }
    public Session getTceSession()
    {
        return tceSession;
    }

    public boolean isExiting()
    {
        return exiting;
    }

    public Channel getChannel()
    {
        return channel;
    }

    public long getMessageInterval()
    {
        return (long) ((30.0 / this.msglimit30) * 1000);
    }

    public Channel getChannel(String channelName)
    {
        return channels.get(channelName);
    }

    public HashMap<String, Channel> getChannels()
    {
        return channels;
    }
    
    private void TwitchChatEventHandler(String oauth, ConnectionManager connManager)
    {
        int ceport = 6667;

        tceSession = connManager.requestConnection(hostname, ceport, apioauth);
        tceSession.addIRCEventListener(new IrcEventHandler());
    }

    public final void init()
    {
        if (webenable)
        {
            if (usehttps)
            {
                httpserver = new HTTPServer(baseport, oauth);
                if (musicenable)
                {
                    musicsocketserver = new MusicWebSocketSecureServer(baseport + 1, keystorepath, keystorepassword, keypassword);
                }
                eventsocketserver = new EventWebSocketSecureServer(baseport + 2, keystorepath, keystorepassword, keypassword);
            }
            else
            {
                httpserver = new HTTPServer(baseport, oauth);
                if (musicenable)
                {
                    musicsocketserver = new MusicWebSocketServer(baseport + 1);
                }
                eventsocketserver = new EventWebSocketServer(baseport + 2);
            }
            webenabled = true;
            httpserver.start();
            com.gmt2001.Console.out.println("HTTP server accepting connections on port " + baseport);
            
            if (musicenable)
            {
                musicenabled = true;
                musicsocketserver.start();
                int musicport = baseport+1;
                com.gmt2001.Console.out.println("MusicSockServer accepting connections on port " + musicport);
            }

            
            eventsocketserver.start();
            int eventport = baseport+2;
            com.gmt2001.Console.out.println("EventSocketServer accepting connections on port " + eventport);
            EventBus.instance().register(eventsocketserver);
            
            if (gamewispauth.length() > 0) {
                GameWispAPI.instance().SetAccessToken(gamewispauth);
                GameWispAPI.instance().SetRefreshToken(gamewisprefresh);
                SingularityAPI.instance().setAccessToken(gamewispauth);
                SingularityAPI.instance().StartService();
                doRefreshGameWispToken();
            }
        }

        if (interactive)
        {
            cil = new ConsoleInputListener();
            cil.start();
        }

        EventBus.instance().register(this);
        EventBus.instance().register(ScriptEventManager.instance());

        dataStoreObj.LoadConfig(datastoreconfig);

        Script.global.defineProperty("inidb", dataStoreObj, 0);
        Script.global.defineProperty("tempdb", TempStore.instance(), 0);
        Script.global.defineProperty("username", UsernameCache.instance(), 0);
        Script.global.defineProperty("twitch", TwitchAPIv3.instance(), 0);
        Script.global.defineProperty("followers", followersCache, 0);
        Script.global.defineProperty("hosts", hostCache, 0);
        Script.global.defineProperty("subscribers", subscribersCache, 0);
        Script.global.defineProperty("channelUsers", channelUsersCache, 0);
        Script.global.defineProperty("botName", username, 0);
        Script.global.defineProperty("channelName", channelName, 0);
        Script.global.defineProperty("channels", channels, 0);
        Script.global.defineProperty("ownerName", ownerName, 0);
        Script.global.defineProperty("channelStatus", channelStatus, 0);
        Script.global.defineProperty("musicplayer", musicsocketserver, 0);
        Script.global.defineProperty("random", rng, 0);
        Script.global.defineProperty("youtube", YouTubeAPIv3.instance(), 0);
        Script.global.defineProperty("gamewisp", GameWispAPI.instance(), 0);
        Script.global.defineProperty("donationhandler", DonationHandlerAPI.instance(), 0);
        Script.global.defineProperty("lastfm", LastFMAPI.instance(), 0);
        Script.global.defineProperty("baseport", baseport, 0);
        Script.global.defineProperty("twitter", TwitterAPI.instance(), 0);
        Script.global.defineProperty("pollResults", pollResults, 0);
        Script.global.defineProperty("pollVoters", voters, 0);
        Script.global.defineProperty("connmgr", connectionManager, 0);
        Script.global.defineProperty("tceconnmgr", tceConnectionManager, 0);
        Script.global.defineProperty("hostname", hostname, 0);

        t = new Thread(new Runnable()
        {
            @Override
            public void run()
            {
                onExit();
            }
        });

        Runtime.getRuntime().addShutdownHook(t);

        try
        {
            ScriptManager.loadScript(new File("./scripts/init.js"));
        } catch (IOException ex)
        {
            com.gmt2001.Console.err.printStackTrace(ex);
        }
    }

    @SuppressWarnings("SleepWhileInLoop")
    public void onExit()
    {
        com.gmt2001.Console.out.println("[SHUTDOWN] Bot shutting down...");

        com.gmt2001.Console.out.println("[SHUTDOWN] Stopping event & message dispatching...");
        exiting = true;

        if (webenabled)
        {
            com.gmt2001.Console.out.println("[SHUTDOWN] Terminating web server...");
            httpserver.dispose();
            eventsocketserver.dispose();
        }

        if (musicenabled)
        {
            com.gmt2001.Console.out.println("[SHUTDOWN] Terminating music server...");
            musicsocketserver.dispose();
        }

        com.gmt2001.Console.out.print("[SHUTDOWN] Waiting for running scripts to finish...");
        /*try
        {
            for (int i = 10; i > 0; i--)
            {
                com.gmt2001.Console.out.print("\r[SHUTDOWN] Waiting for running scripts to finish..." + i + " ");
                Thread.sleep(1000);
            }
        } catch (InterruptedException ex)
        {
            com.gmt2001.Console.err.printStackTrace(ex);
        }

        com.gmt2001.Console.out.println("\r[SHUTDOWN] Waiting for running scripts to finish...  ");*/

        com.gmt2001.Console.out.println("[SHUTDOWN] Terminating TwitchAPI caches...");
        ChannelHostCache.killall();
        ChannelUsersCache.killall();
        FollowersCache.killall();
        SubscribersCache.killall();

        com.gmt2001.Console.out.println("[SHUTDOWN] Terminating pending timers...");
        ScriptApi.instance().kill();

        com.gmt2001.Console.out.println("[SHUTDOWN] Terminating scripts...");
        HashMap<String, Script> scripts = ScriptManager.getScripts();

        for (Entry<String, Script> script : scripts.entrySet())
        {
            script.getValue().kill();
        }

        com.gmt2001.Console.out.println("[SHUTDOWN] Saving data...");
        dataStoreObj.SaveAll(true);

        com.gmt2001.Console.out.println("[SHUTDOWN] Disconnecting from Twitch IRC...");
        connectionManager.quit();
        tceConnectionManager.quit();

        com.gmt2001.Console.out.println("[SHUTDOWN] Waiting for JVM to exit...");
    }

    @Subscribe
    public void onIRCConnectComplete(IrcConnectCompleteEvent event)
    {
        if (event.getSession().equals(this.session))
        {
            this.session.sayRaw("CAP REQ :twitch.tv/tags");
            this.session.sayRaw("CAP REQ :twitch.tv/commands");
            this.session.sayRaw("CAP REQ :twitch.tv/membership");

            if (channelName.toLowerCase().contains(","))
            {
                String[] c = channelName.toLowerCase().split(",");

                for (String ch : c)
                {
                    this.session.join("#" + ch);
                }
            } else
            {
                this.session.join("#" + channelName.toLowerCase());
            }
        }

        if(event.getSession().equals(tceSession))
        {
            tceSession.sayRaw("CAP REQ :twitch.tv/tags");
            tceSession.sayRaw("CAP REQ :twitch.tv/commands");
            tceSession.sayRaw("CAP REQ :twitch.tv/membership");
        }

        //com.gmt2001.Console.out.println("Connected to server\nJoining channel #" + channelName.toLowerCase());
    }

    @Subscribe
    public void onIRCJoinComplete(IrcJoinCompleteEvent event)
    {
        this.channel = event.getChannel();

        this.channels.put(this.channel.getName(), this.channel);

        //com.gmt2001.Console.out.println("Joined channel: " + event.getChannel().getName());
        session.sayChannel(this.channel, ".mods");

        this.followersCache = FollowersCache.instance(this.channel.getName().toLowerCase());
        this.hostCache = ChannelHostCache.instance(this.channel.getName().toLowerCase());
        this.subscribersCache = SubscribersCache.instance(this.channel.getName().toLowerCase());
        //this.channelUsersCache = ChannelUsersCache.instance(this.channel.getName().toLowerCase());
    }

    @Subscribe
    public void onIRCPrivateMessage(IrcPrivateMessageEvent event)
    {
        if (event.getSender().equalsIgnoreCase("jtv"))
        {
            String message = event.getMessage().toLowerCase();

            if (message.startsWith("the moderators of this room are: "))
            {
                String[] spl = message.substring(33).split(", ");

                for (String spl1 : spl)
                {
                    if (spl1.equalsIgnoreCase(this.username))
                    {
                        channel.setAllowSendMessages(true);
                    }
                }
            }
            
            if (message.contains("is now hosting you"))
            {
                String hoster = message.substring(0, message.indexOf(" ", 1)).toString();
                EventBus.instance().post(new TwitchHostedEvent(hoster, channel));    
            }
        }
        if (!event.getSender().equalsIgnoreCase("jtv") && !event.getSender().equalsIgnoreCase("twitchnotify"))
        {
            if(event.getMessage().startsWith("!") && event.getSession()==session) {
                String command;
                String argsString;
                if(event.getMessage().indexOf(" ")==-1) {
                    command = event.getMessage().substring(1,event.getMessage().length());
                    argsString = "";
                } else {
                    command = event.getMessage().substring(1, event.getMessage().indexOf(" "));
                    argsString = event.getMessage().substring(event.getMessage().indexOf(" ") + 1, event.getMessage().length());
                }
                EventBus.instance().post(new CommandEvent(event.getSender(), command, argsString));
            }
        }
    }

    @Subscribe
    public void onIRCChannelMessage(IrcChannelMessageEvent event)
    {
        String message = event.getMessage();
        String sender = event.getSender();

        if (message.startsWith("!"))
        {
            String commandString = message.substring(1);
            handleCommand(sender, commandString);
        }

        if (sender.equalsIgnoreCase("jtv"))
        {
            message = message.toLowerCase();

            if (message.startsWith("the moderators of this room are: "))
            {
                String[] spl = message.substring(33).split(", ");

                for (String spl1 : spl)
                {
                    if (spl1.equalsIgnoreCase(this.username))
                    {
                        channel.setAllowSendMessages(true);
                    }
                }
            }
        }
    }

    @Subscribe
    public void onIRCChannelUserMode(IrcChannelUserModeEvent event)
    {
        if (event.getUser().equalsIgnoreCase(username) && event.getMode().equalsIgnoreCase("o")
                && this.channel != null && event.getChannel().getName().equalsIgnoreCase(channel.getName()))
        {
            if (!event.getAdd())
            {
                session.sayChannel(this.channel, ".mods");
            }

            channel.setAllowSendMessages(event.getAdd());
        }
    }

    @Subscribe
    public void onConsoleMessage(ConsoleInputEvent msg)
    {
        String message = msg.getMsg();
        boolean changed = false;
        if (message == null) {
             return;
         }

        if (message.equals("debugon"))
        {
            Quorrabot.setDebugging(true);
        }

        if (message.equals("debugoff"))
        {
            Quorrabot.setDebugging(false);
        }

        if (message.startsWith("inidb.get"))
        {
            String spl[] = message.split(" ", 4);

            com.gmt2001.Console.out.println(dataStoreObj.GetString(spl[1], spl[2], spl[3]));
        }

        if (message.startsWith("inidb.set"))
        {
            String spl[] = message.split(" ", 5);

            dataStoreObj.SetString(spl[1], spl[2], spl[3], spl[4]);
            com.gmt2001.Console.out.println(dataStoreObj.GetString(spl[1], spl[2], spl[3]));
        }

        if (message.equals("apioauth"))
        {
            com.gmt2001.Console.out.print("Please enter the bot owner's api oauth string: ");
            String newoauth = System.console().readLine().trim();

            TwitchAPIv3.instance().SetOAuth(newoauth);
            apioauth = newoauth;

            changed = true;
        }

        if (message.equals("clientid"))
        {
            com.gmt2001.Console.out.print("Please enter the bot api clientid string: ");
            String newclientid = System.console().readLine().trim();

            TwitchAPIv3.instance().SetClientID(newclientid);
            clientid = newclientid;

            changed = true;
        }

        if (message.equals("baseport"))
        {
            com.gmt2001.Console.out.print("Please enter a new base port: ");
            String newbaseport = System.console().readLine().trim();

            baseport = Integer.parseInt(newbaseport);

            changed = true;
        }

        if (message.equals("youtubekey"))
        {
            com.gmt2001.Console.out.print("Please enter a new YouTube API key: ");
            String newyoutubekey = System.console().readLine().trim();

            YouTubeAPIv3.instance().SetAPIKey(newyoutubekey);
            youtubekey = newyoutubekey;

            changed = true;
        }
        
        if (message.equals("twitchalerts"))
        {
            com.gmt2001.Console.out.print("Please enter a new TwitchAlerts Access Token: ");
            String newtwitchalertstoken = System.console().readLine().trim();

            DonationHandlerAPI.instance().SetAccessToken(newtwitchalertstoken, "twitchalerts");
            twitchalertstoken = newtwitchalertstoken;

            changed = true;
        }
        if (message.equals("lastfm"))
        {
            com.gmt2001.Console.out.print("Please enter a last.fm username: ");
            String newlastfmuser = System.console().readLine().trim();

            LastFMAPI.instance().SetUsername(newlastfmuser);
            lastfmuser = newlastfmuser;

            changed = true;
        }
        if (message.equals("tipeeestream"))
        {
            com.gmt2001.Console.out.print("Please enter a new Tipeeestream Access Token: ");
            String newtpetoken = System.console().readLine().trim();

            DonationHandlerAPI.instance().SetAccessToken(newtpetoken, "tpestream");
            tpetoken = newtpetoken;

            changed = true;
        }
        if (message.equals("twitter"))
        {
                com.gmt2001.Console.out.print("Please visit this url to grant QuorraBot twitter access, then enter your pin" + "\n");
                com.gmt2001.Console.out.print(TwitterAPI.instance().getRequestTokenURL() + "\n");
                com.gmt2001.Console.out.print("Twitter PIN:");

                String newtwittertoken = System.console().readLine().trim();

                TwitterAPI.instance().CreateAccessToken(newtwittertoken);
                twittertoken = TwitterAPI.instance().getAccessToken();
                twittertokensecret = TwitterAPI.instance().getAccessTokenSecret();

                changed = true;
        }
        
        if (message.equals("streamtip"))
        {
            com.gmt2001.Console.out.print("Please enter a new StreamTip Client ID: ");
            String newstreamtipid = System.console().readLine().trim();

            DonationHandlerAPI.instance().SetClientID(newstreamtipid, "streamtip");
            streamtipid = newstreamtipid;
            
            com.gmt2001.Console.out.print("Please enter a new StreamTip Access Token: ");
            String newstreamtiptoken = System.console().readLine().trim();

            DonationHandlerAPI.instance().SetAccessToken(newstreamtiptoken, "streamtip");
            streamtiptoken = newstreamtiptoken;
            
            changed = true;
        }
        
        if (message.equals("gamewisp"))
        {
            com.gmt2001.Console.out.print("Please enter a new GameWisp Access Token: ");
            String newgamewispauth = System.console().readLine().trim();
            gamewispauth = newgamewispauth;
            GameWispAPI.instance().SetAccessToken(gamewispauth);
            SingularityAPI.instance().setAccessToken(gamewispauth);
            
            com.gmt2001.Console.out.print("Please enter a new GameWisp Refresh Token: ");
            String newgamewisprefresh = System.console().readLine().trim();

            gamewisprefresh = newgamewisprefresh;
            GameWispAPI.instance().SetRefreshToken(gamewisprefresh);
            doRefreshGameWispToken();
            changed = true;
        }
        
        if (message.equals("testgwsub")) {
            com.gmt2001.Console.out.println("[CONSOLE] Executing testgwsub");
            EventBus.instance().post(new GameWispSubscribeEvent(this.username, 1));
            return;
        }

        if (message.equals("testgwresub")) {
            com.gmt2001.Console.out.println("[CONSOLE] Executing testgwresub");
            EventBus.instance().post(new GameWispAnniversaryEvent(this.username, 2, 3));
            return;
        }

        if (message.equals("webenable"))
        {
            com.gmt2001.Console.out.print("Please note that the music server will also be disabled if the web server is disabled. The bot will require a restart for this to take effect. Type true or false to enable/disable web server: ");
            String newwebenable = System.console().readLine().trim();
            changed = true;

            if (newwebenable.equalsIgnoreCase("1") || newwebenable.equalsIgnoreCase("true"))
            {
                webenable = true;
            } else
            {
                webenable = false;
            }
        }

        if (message.equals("musicenable"))
        {
            if (!webenable)
            {
                com.gmt2001.Console.out.println("Web server must be enabled first. ");
            } else
            {
                com.gmt2001.Console.out.print("The bot will require a restart for this to take effect. Please type true or false to enable/disable music server: ");
                String newmusicenable = System.console().readLine().trim();
                changed = true;
	
	            if (newmusicenable.equalsIgnoreCase("1") || newmusicenable.equalsIgnoreCase("true"))
	            {
	                musicenable = true;
	            } else
	            {
	                musicenable = false;
	            }
            }
        }

        if (changed)
        {
            try
            {
                String data = "";
                data += "user=" + username + "\r\n";
                data += "oauth=" + oauth + "\r\n";
                data += "apioauth=" + apioauth + "\r\n";
                data += "clientid=" + clientid + "\r\n";
                data += "channel=" + channel.getName().replace("#", "") + "\r\n";
                data += "owner=" + ownerName + "\r\n";
                data += "baseport=" + baseport + "\r\n";
                data += "hostname=" + hostname + "\r\n";
                data += "port=" + port + "\r\n";
                data += "msglimit30=" + msglimit30 + "\r\n";
                data += "datastore=" + datastore + "\r\n";
                data += "youtubekey=" + youtubekey + "\r\n";
                data += "twitchalertstoken=" + twitchalertstoken + "\r\n";
                data += "lastfmuser=" + lastfmuser + "\r\n";
                data += "tpetoken=" + tpetoken + "\r\n";
                data += "twittertoken=" + twittertoken + "\r\n";                
                data += "twittertokensecret=" + twittertokensecret + "\r\n";                
                data += "streamtiptoken=" + streamtiptoken + "\r\n";
                data += "streamtipid=" + streamtipid + "\r\n";
                data += "webenable=" + webenable + "\r\n";
                data += "musicenable=" + musicenable + "\r\n";
                data += "usehttps=" + usehttps + "\r\n";
                data += "keystorepath=" + keystorepath + "\r\n";
                data += "keystorepassword=" + keystorepassword + "\r\n";
                data += "keypassword=" + keypassword;

                Files.write(Paths.get("./botlogin.txt"), data.getBytes(StandardCharsets.UTF_8),
                        StandardOpenOption.CREATE, StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);
                
                SingularityAPI.instance().setAccessToken(gamewispauth);

                //Commented out since you need to restart the bot for port changes anyway
                /*
                 * if(webenabled) { httpserver.dispose(); httpserver = new
                 * HTTPServer(baseport); httpserver.start(); } if(musicenabled)
                 * { if(webenabled) { musicsocketserver.dispose();
                 * musicsocketserver = new MusicWebSocketServer(baseport + 1); }
                 * }
                 */
                com.gmt2001.Console.out.println("Changes have been saved. For web and music server settings to take effect you must restart the bot.");
            } catch (IOException ex)
            {
                com.gmt2001.Console.err.printStackTrace(ex);
            }
        }

        if (message.equals("save"))
        {
            dataStoreObj.SaveAll(true);
        }

        if (message.equals("quicksave"))
        {
            dataStoreObj.SaveChangedNow();
        }

        if (message.equals("exit"))
        {
            System.exit(0);
        }

        handleCommand(username, message);
    }

    public void handleCommand(String sender, String commandString)
    {
        String command, arguments;
        int split = commandString.indexOf(' ');

        if (split == -1)
        {
            command = commandString;
            arguments = "";
        } else
        {
            command = commandString.substring(0, split);
            arguments = commandString.substring(split + 1);
        }

        if (command.equalsIgnoreCase("save"))
        {
            dataStoreObj.SaveAll(true);
        }

        if (command.equalsIgnoreCase("d"))
        {
            if (debugD)
            {
                com.gmt2001.Console.out.println("Got !d");
            }

            String d = sender.toLowerCase();
            String validityCheck = this.ownerName.toLowerCase();

            if (debugD)
            {
                com.gmt2001.Console.out.println("d=" + d);
                com.gmt2001.Console.out.println("t=" + validityCheck);
            }

            if (d.equalsIgnoreCase(validityCheck) && arguments.startsWith("!"))
            {
                com.gmt2001.Console.out.println("!d command accepted");

                split = arguments.indexOf(' ');

                if (split == -1)
                {
                    command = arguments.substring(1);
                    arguments = "";
                } else
                {
                    command = arguments.substring(1, split);
                    arguments = arguments.substring(split + 1);
                }

                sender = username;

                com.gmt2001.Console.out.println("Issuing command as " + username + " [" + command + "] " + arguments);

                if (command.equalsIgnoreCase("exit"))
                {
                    dataStoreObj.SaveAll(true);
                    System.exit(0);
                }
            }
        }

        //Don't change this to postAsync. It cannot be processed in async or commands will be delayed
        EventBus.instance().post(new CommandEvent(sender, command, arguments));
    }
    
    public void hostEvent (String hostedName, String event) {
            this.hostedName = hostedName;
            if (channelName.toLowerCase().contains(","))
            {
                String[] c = channelName.toLowerCase().split(",");

                for (String ch : c)
                {
                    tceSession.join("#" + ch);
                }
            } else
            {
                tceSession.join("#" + channelName.toLowerCase());
            }
            if(event.equalsIgnoreCase("host")) {
                tceSession.sayChannel("/host " + hostedName.toLowerCase(), channel);
            } else if(event.equalsIgnoreCase("unhost")) {
                tceSession.sayChannel("/unhost", channel);
            }
            tceSession.leave("#" + channelName.toLowerCase()); 
    }

    

    private static void ini2sqlite(boolean delete)
    {
        com.gmt2001.Console.out.print(">>Initializing...");
        IniStore ini = IniStore.instance();
        SqliteStore sqlite = SqliteStore.instance();
        com.gmt2001.Console.out.println("done");

        com.gmt2001.Console.out.print(">>Wiping existing SqliteStore...");
        String[] deltables = sqlite.GetFileList();
        for (String table : deltables)
        {
            sqlite.RemoveFile(table);
        }
        com.gmt2001.Console.out.println("done");

        com.gmt2001.Console.out.print(">>Copying IniStore to SqliteStore...");
        String[] files = ini.GetFileList();
        int i = 0;
        String str;
        int maxlen = 0;
        int num;
        for (String file : files)
        {
            str = " " + i + " / " + files.length;
            num = maxlen - str.length();
            for (int n = 0; n < num; n++)
            {
                str += " ";
            }
            maxlen = Math.max(maxlen, str.length());
            com.gmt2001.Console.out.print("\r>>Copying IniStore to SqliteStore..." + str);
            sqlite.AddFile(file);

            String[] sections = ini.GetCategoryList(file);
            int b = 0;
            for (String section : sections)
            {
                str = " " + i + " / " + files.length
                        + " [" + b + " / " + sections.length + "]";
                num = maxlen - str.length();
                for (int n = 0; n < num; n++)
                {
                    str += " ";
                }
                maxlen = Math.max(maxlen, str.length());
                com.gmt2001.Console.out.print("\r>>Copying IniStore to SqliteStore..." + str);

                String[] keys = ini.GetKeyList(file, section);
                int k = 0;
                for (String key : keys)
                {
                    str = " " + i + " / " + files.length
                            + " [" + b + " / " + sections.length + "] <" + k + " / " + keys.length + ">";
                    num = maxlen - str.length();
                    for (int n = 0; n < num; n++)
                    {
                        str += " ";
                    }
                    maxlen = Math.max(maxlen, str.length());
                    com.gmt2001.Console.out.print("\r>>Copying IniStore to SqliteStore..." + str);

                    String value = ini.GetString(file, section, key);
                    sqlite.SetString(file, section, key, value);

                    k++;
                }

                b++;
            }

            i++;
        }

        str = "";
        for (i = 0; i < maxlen - 4; i++)
        {
            str += " ";
        }
        com.gmt2001.Console.out.println("\r>>Copying IniStore to SqliteStore...done" + str);

        if (delete)
        {
            com.gmt2001.Console.out.print(">>Deleting IniStore folder...");
            for (String file : files)
            {
                ini.RemoveFile(file);
            }

            File f = new File("./inistore");
            f.delete();
            com.gmt2001.Console.out.println("done");
        }
    }

    public static void main(String[] args) throws IOException
    {
        String user = "";
        String oauth = "";
        String apioauth = "";
        String clientid = "";
        String channel = "";
        String owner = "";
        String hostname = "";
        int baseport = 25300;
        int port = 0;
        double msglimit30 = 0;
        String datastore = "";
        String datastoreconfig = "";
        String youtubekey = "";
        String gamewispauth = "";
        String gamewisprefresh = "";
        String twitchalertstoken = "";
        String lastfmuser = "";
        String tpetoken = "";
        String twittertoken = "";
        String twittertokensecret = "";
        String streamtiptoken = "";
        String streamtipid = "";
        boolean webenable = true;
        boolean musicenable = true;
        boolean usehttps = false;
        String keystorepath = "";
        String keystorepassword = "";
        String keypassword = "";

        boolean changed = false;

        try
        {
            if (new File("./botlogin.txt").exists())
            {
                String data = FileUtils.readFileToString(new File("./botlogin.txt"));
                String[] lines = data.replaceAll("\\r", "").split("\\n");

                for (String line : lines)
                {
                    if (line.startsWith("user=") && line.length() > 8)
                    {
                        user = line.substring(5);
                    }
                    if (line.startsWith("oauth=") && line.length() > 9)
                    {
                        oauth = line.substring(6);
                    }
                    if (line.startsWith("apioauth=") && line.length() > 12)
                    {
                        apioauth = line.substring(9);
                    }
                    if (line.startsWith("clientid=") && line.length() > 12)
                    {
                        clientid = line.substring(9);
                    }
                    if (line.startsWith("channel=") && line.length() > 11)
                    {
                        channel = line.substring(8);
                    }
                    if (line.startsWith("owner=") && line.length() > 9)
                    {
                        owner = line.substring(6);
                    }
                    if (line.startsWith("baseport=") && line.length() > 10)
                    {
                        baseport = Integer.parseInt(line.substring(9));
                    }
                    if (line.startsWith("hostname=") && line.length() > 10)
                    {
                        hostname = line.substring(9);
                    }
                    if (line.startsWith("port=") && line.length() > 6)
                    {
                        port = Integer.parseInt(line.substring(5));
                    }
                    if (line.startsWith("msglimit30=") && line.length() > 12)
                    {
                        msglimit30 = Double.parseDouble(line.substring(11));
                    }
                    if (line.startsWith("datastore=") && line.length() > 11)
                    {
                        datastore = line.substring(10);
                    }
                    if (line.startsWith("youtubekey=") && line.length() > 12)
                    {
                        youtubekey = line.substring(11);
                    }
                    if (line.startsWith("gamewispauth=") && line.length() > 14) {
                        gamewispauth = line.substring(13);
                    }
                    if (line.startsWith("gamewisprefresh=") && line.length() > 17) {
                        gamewisprefresh = line.substring(16);
                    }
                    if (line.startsWith("twitchalertstoken=") && line.length() > 19)
                    {
                        twitchalertstoken = line.substring(18);
                    }
                    if (line.startsWith("lastfmuser=") && line.length() > 12)
                    {
                        lastfmuser = line.substring(11);
                    }
                    if (line.startsWith("tpetoken=") && line.length() > 10)
                    {
                        tpetoken = line.substring(9);
                    }
                    if (line.startsWith("twittertoken=") && line.length() > 14)
                    {
                        twittertoken = line.substring(13);
                    }
                    if (line.startsWith("twittertokensecret=") && line.length() > 20)
                    {
                        twittertokensecret = line.substring(19);
                    }
                    if (line.startsWith("streamtiptoken=") && line.length() > 16)
                    {
                        streamtiptoken = line.substring(15);
                    }
                    if (line.startsWith("streamtipid=") && line.length() > 13)
                    {
                        streamtipid = line.substring(12);
                    }
                    if (line.startsWith("webenable=") && line.length() > 11)
                    {
                        webenable = Boolean.valueOf(line.substring(10));
                    }
                    if (line.startsWith("musicenable=") && line.length() > 13)
                    {
                        musicenable = Boolean.valueOf(line.substring(12));
                    }
                    if (line.startsWith("usehttps=") && line.length() > 10)
                    {
                        usehttps = Boolean.valueOf(line.substring(9));
                    }
                    if (line.startsWith("keystorepath=") && line.length() > 14)
                    {
                    	keystorepath = line.substring(13);
                    }
                    if (line.startsWith("keystorepassword=") && line.length() > 18)
                    {
                        keystorepassword = line.substring(17);
                    }
                    if (line.startsWith("keypassword=") && line.length() > 13)
                    {
                        keypassword = line.substring(12);
                    }
                }
            }
        } catch (IOException ex)
        {
            com.gmt2001.Console.err.printStackTrace(ex);
        }


        try {
            if(user.isEmpty()) {
                com.gmt2001.Console.out.print("Please enter the bot's twitch username: ");
                user = System.console().readLine().trim().toLowerCase();
                changed = true;                
            }
            if(oauth.isEmpty()) {
                com.gmt2001.Console.out.println("Visit http://quorrabot.com/pages/twitchapi/ to generate oAuth tokens for both the bot and the channel owner accounts (including 'oauth:') & type it below.");
                com.gmt2001.Console.out.println("IMPORTANT: This MUST be done while logged in as the BOT account!" + "\n");
                com.gmt2001.Console.out.println("Please enter the bot's tmi oauth token: ");
                oauth = System.console().readLine().trim();
                changed = true;
            }
            if(channel.isEmpty()) {
                com.gmt2001.Console.out.print("Please enter the name of the twitch channel the bot should join (not the link, just the name): ");
                channel = System.console().readLine().trim().toLowerCase();
                changed = true;
            }
            if(apioauth.isEmpty()) {
                com.gmt2001.Console.out.println("Visit http://quorrabot.com/pages/twitchapi/ to generate oAuth tokens for both the bot and the channel owner accounts (including 'oauth:') & type it below.");
                com.gmt2001.Console.out.println("IMPORTANT: This MUST be done while logged in on the CHANNEL OWNER account!" + "\n");
                com.gmt2001.Console.out.println("Please enter the channel owner's tmi oauth token: ");
                apioauth = System.console().readLine().trim();
                changed = true;
            }
        } catch (NullPointerException ex)
        {
            com.gmt2001.Console.err.printStackTrace(ex);
        }


        if (owner.isEmpty())
        {
            owner = channel;

            changed = true;
        }

        if (args.length > 0)
        {
            for (String arg : args)
            {
                if (arg.equalsIgnoreCase("printlogin"))
                {
                    com.gmt2001.Console.out.println("user='" + user + "'");
                    com.gmt2001.Console.out.println("oauth='" + oauth + "'");
                    com.gmt2001.Console.out.println("apioauth='" + apioauth + "'");
                    com.gmt2001.Console.out.println("clientid='" + clientid + "'");
                    com.gmt2001.Console.out.println("channel='" + channel + "'");
                    com.gmt2001.Console.out.println("owner='" + owner + "'");
                    com.gmt2001.Console.out.println("baseport='" + baseport + "'");
                    com.gmt2001.Console.out.println("hostname='" + hostname + "'");
                    com.gmt2001.Console.out.println("port='" + port + "'");
                    com.gmt2001.Console.out.println("msglimit30='" + msglimit30 + "'");
                    com.gmt2001.Console.out.println("datastore='" + datastore + "'");
                    com.gmt2001.Console.out.println("youtubekey='" + youtubekey + "'");
                    com.gmt2001.Console.out.println("gamewispauth=" + gamewispauth);
                    com.gmt2001.Console.out.println("gamewisprefresh=" + gamewisprefresh);
                    com.gmt2001.Console.out.println("twitchalertstoken='" + twitchalertstoken + "'");
                    com.gmt2001.Console.out.println("lastfmuser='" + lastfmuser + "'");
                    com.gmt2001.Console.out.println("tpetoken='" + tpetoken + "'");
                    com.gmt2001.Console.out.println("twittertoken='" + twittertoken + "'");
                    com.gmt2001.Console.out.println("twittertokensecret='" + twittertokensecret + "'");
                    com.gmt2001.Console.out.println("streamtiptoken='" + streamtiptoken + "'");
                    com.gmt2001.Console.out.println("streamtipid='" + streamtipid + "'");
                    com.gmt2001.Console.out.println("webenable=" + webenable);
                    com.gmt2001.Console.out.println("musicenable=" + musicenable);
                    com.gmt2001.Console.out.println("usehttps=" + usehttps);
                    com.gmt2001.Console.out.println("keystorepath='" + keystorepath + "'");
                    com.gmt2001.Console.out.println("keystorepassword='" + keystorepassword + "'");
                    com.gmt2001.Console.out.println("keypassword='" + keypassword + "'");
                }
                if (arg.equalsIgnoreCase("debugon"))
                {
                    Quorrabot.enableDebugging = true;
                }
                if (arg.equalsIgnoreCase("ini2sqlite"))
                {
                    com.gmt2001.Console.out.println("Converting default IniStore to default SqliteStore...");
                    ini2sqlite(false);
                    com.gmt2001.Console.out.println("Operation complete. The bot will now exit");
                    System.exit(0);
                    return;
                }
                if (arg.toLowerCase().startsWith("user=") && arg.length() > 8)
                {
                    if (!user.equals(arg.substring(5)))
                    {
                        user = arg.substring(5).toLowerCase();
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("oauth=") && arg.length() > 9)
                {
                    if (!oauth.equals(arg.substring(6)))
                    {
                        oauth = arg.substring(6);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("apioauth=") && arg.length() > 12)
                {
                    if (!apioauth.equals(arg.substring(9)))
                    {
                        apioauth = arg.substring(9);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("clientid=") && arg.length() > 12)
                {
                    if (!clientid.equals(arg.substring(9)))
                    {
                        clientid = arg.substring(9);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("channel=") && arg.length() > 11)
                {
                    if (!channel.equals(arg.substring(8)))
                    {
                        channel = arg.substring(8).toLowerCase();
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("owner=") && arg.length() > 9)
                {
                    if (!owner.equals(arg.substring(6)))
                    {
                        owner = arg.substring(6).toLowerCase();
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("baseport=") && arg.length() > 10)
                {
                    if (baseport != Integer.parseInt(arg.substring(9)))
                    {
                        baseport = Integer.parseInt(arg.substring(9));
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("hostname=") && arg.length() > 10)
                {
                    if (!hostname.equals(arg.substring(9)))
                    {
                        hostname = arg.substring(9);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("port=") && arg.length() > 6)
                {
                    if (port != Integer.parseInt(arg.substring(5)))
                    {
                        port = Integer.parseInt(arg.substring(5));
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("msglimit30=") && arg.length() > 12)
                {
                    if (msglimit30 != Double.parseDouble(arg.substring(11)))
                    {
                        msglimit30 = Double.parseDouble(arg.substring(11));
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("datastore=") && arg.length() > 11)
                {
                    if (!datastore.equals(arg.substring(10)))
                    {
                        datastore = arg.substring(10);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("datastoreconfig=") && arg.length() > 17)
                {
                    datastoreconfig = arg.substring(16);
                }
                if (arg.toLowerCase().startsWith("youtubekey=") && arg.length() > 12)
                {
                    if (!youtubekey.equals(arg.substring(11)))
                    {
                        youtubekey = arg.substring(11);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("gamewispauth=") && arg.length() > 14) {
                    if (!gamewispauth.equals(arg.substring(13))) {
                        gamewispauth = arg.substring(13);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("gamewisprefresh=") && arg.length() > 17) {
                    if (!gamewisprefresh.equals(arg.substring(16))) {
                        gamewisprefresh = arg.substring(16);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("twitchalertstoken=") && arg.length() > 19)
                {
                    if (!twitchalertstoken.equals(arg.substring(18)))
                    {
                        twitchalertstoken = arg.substring(18);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("lastfmuser=") && arg.length() > 12)
                {
                    if (!lastfmuser.equals(arg.substring(11)))
                    {
                        lastfmuser = arg.substring(11);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("tpetoken=") && arg.length() > 10)
                {
                    if (!tpetoken.equals(arg.substring(9)))
                    {
                        tpetoken = arg.substring(9);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("twittertoken=") && arg.length() > 14)
                {
                    if (!twittertoken.equals(arg.substring(13)))
                    {
                        twittertoken = arg.substring(13);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("twittertokensecret=") && arg.length() > 20)
                {
                    if (!twittertokensecret.equals(arg.substring(19)))
                    {
                        twittertokensecret = arg.substring(19);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("streamtiptoken=") && arg.length() > 16)
                {
                    if (!streamtiptoken.equals(arg.substring(15)))
                    {
                        streamtiptoken = arg.substring(15);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("streamtipid=") && arg.length() > 13)
                {
                    if (!streamtipid.equals(arg.substring(12)))
                    {
                        streamtipid = arg.substring(12);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("webenable=") && arg.length() > 11)
                {
                    if (webenable != Boolean.valueOf(arg.substring(10)))
                    {
                        webenable = Boolean.valueOf(arg.substring(10));
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("musicenable=") && arg.length() > 13)
                {
                    if (musicenable != Boolean.valueOf(arg.substring(12)))
                    {
                    	musicenable = Boolean.valueOf(arg.substring(12));
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("usehttps=") && arg.length() > 10)
                {
                    if (usehttps != Boolean.valueOf(arg.substring(9)))
                    {
                    	usehttps = Boolean.valueOf(arg.substring(9));
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("keystorepath=") && arg.length() > 14)
                {
                    if (!keystorepath.equals(arg.substring(13)))
                    {
                    	keystorepath = arg.substring(13);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("keystorepassword=") && arg.length() > 18)
                {
                    if (!keystorepassword.equals(arg.substring(17)))
                    {
                    	keystorepassword = arg.substring(17);
                        changed = true;
                    }
                }
                if (arg.toLowerCase().startsWith("keypassword=") && arg.length() > 13)
                {
                    if (!keypassword.equals(arg.substring(12)))
                    {
                    	keypassword = arg.substring(12);
                        changed = true;
                    }
                }
                if (arg.equalsIgnoreCase("help") || arg.equalsIgnoreCase("--help") || arg.equalsIgnoreCase("-h") || arg.equalsIgnoreCase("-?"))
                {
                    com.gmt2001.Console.out.println("Usage: java -Dfile.encoding=UTF-8 -jar QuorraBot.jar [printlogin] [user=<bot username>] "
                            + "[oauth=<bot irc oauth>] [apioauth=<editor oauth>] [clientid=<oauth clientid>] [channel=<channel to join>] "
                            + "[owner=<bot owner username>] [baseport=<bot webserver port, music server will be +1>] [hostname=<custom irc server>] "
                            + "[port=<custom irc port>] [msglimit30=<message limit per 30 seconds>] "
                            + "[datastore=<DataStore type, for a list, run java -jar QuorraBot.jar storetypes>] "
                            + "[datastoreconfig=<Optional DataStore config option, different for each DataStore type>] "
                            + "[youtubekey=<youtube api key>] [webenable=<true | false>] [musicenable=<true | false>] "
                            + "[gamewispauth=<gamewisp oauth>] "
                            + "[gamewisprefresh=<gamewisp refresh key>] "
                            + "[twitchalertstoken=<TwitchAlerts access token>] "
                            + "[lastfmuser=<Last.FM username>] "
                            + "[tpetoken=<Tipeeestream access token>] "
                            + "[streamtiptoken=<StreamTip access token>] "
                            + "[streamtipid=<StreamTip Client ID>] "
                            + "[twittertoken=<Twitter access token>] "
                            + "[twittertokensecret=<Twitter access token secret>]");

                    return;
                }
                if (arg.equalsIgnoreCase("storetypes"))
                {
                    com.gmt2001.Console.out.println("DataStore types: IniStore (datastoreconfig parameter is folder name, stores in .ini files), "
                            + "TempStore (Stores in memory, lost on shutdown), "
                            + "SqliteStore (Default, Stores in a SQLite3 database, datastoreconfig parameter is a config file");
                    return;
                }
            }
        }

        if (changed)
        {
            String data = "";
            data += "user=" + user + "\r\n";
            data += "oauth=" + oauth + "\r\n";
            data += "apioauth=" + apioauth + "\r\n";
            data += "clientid=" + clientid + "\r\n";
            data += "channel=" + channel + "\r\n";
            data += "owner=" + owner + "\r\n";
            data += "baseport=" + baseport + "\r\n";
            data += "hostname=" + hostname + "\r\n";
            data += "port=" + port + "\r\n";
            data += "msglimit30=" + msglimit30 + "\r\n";
            data += "datastore=" + datastore + "\r\n";
            data += "youtubekey=" + youtubekey + "\r\n";
            data += "gamewispauth=" + gamewispauth + "\r\n";
            data += "gamewisprefresh=" + gamewisprefresh + "\r\n";
            data += "twitchalertstoken=" + twitchalertstoken + "\r\n";
            data += "lastfmuser=" + lastfmuser + "\r\n";
            data += "tpetoken=" + tpetoken + "\r\n";            
            data += "twittertoken=" + twittertoken + "\r\n";
            data += "twittertokensecret=" + twittertokensecret + "\r\n";
            data += "streamtiptoken=" + streamtiptoken + "\r\n";
            data += "streamtipid=" + streamtipid + "\r\n";
            data += "webenable=" + webenable + "\r\n";
            data += "musicenable=" + musicenable + "\r\n";
            data += "usehttps=" + usehttps + "\r\n";
            data += "keystorepath=" + keystorepath + "\r\n";
            data += "keystorepassword=" + keystorepassword + "\r\n";
            data += "keypassword=" + keypassword;

            Files.write(Paths.get("./botlogin.txt"), data.getBytes(StandardCharsets.UTF_8),
                    StandardOpenOption.CREATE, StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);
        }

        Quorrabot.instance = new Quorrabot(user, oauth, apioauth, clientid, channel, owner, baseport, hostname, port, msglimit30, datastore, datastoreconfig, youtubekey, gamewispauth, gamewisprefresh, twitchalertstoken, lastfmuser, tpetoken, twittertoken, twittertokensecret, streamtiptoken, streamtipid, webenable, musicenable, usehttps, keystorepath, keystorepassword, keypassword);
    }
    public void updateGameWispTokens(String[] newTokens) {
            String data = "";
            data += "user=" + username + "\r\n";
            data += "oauth=" + oauth + "\r\n";
            data += "apioauth=" + apioauth + "\r\n";
            data += "clientid=" + clientid + "\r\n";
            data += "channel=" + channel + "\r\n";
            data += "owner=" + ownerName + "\r\n";
            data += "baseport=" + baseport + "\r\n";
            data += "hostname=" + hostname + "\r\n";
            data += "port=" + port + "\r\n";
            data += "msglimit30=" + msglimit30 + "\r\n";
            data += "datastore=" + datastore + "\r\n";
            data += "youtubekey=" + youtubekey + "\r\n";
            data += "gamewispauth=" + gamewispauth + "\r\n";
            data += "gamewisprefresh=" + gamewisprefresh + "\r\n";
            data += "twitchalertstoken=" + twitchalertstoken + "\r\n";
            data += "lastfmuser=" + lastfmuser + "\r\n";
            data += "tpetoken=" + tpetoken + "\r\n";            
            data += "twittertoken=" + twittertoken + "\r\n";
            data += "twittertokensecret=" + twittertokensecret + "\r\n";
            data += "streamtiptoken=" + streamtiptoken + "\r\n";
            data += "streamtipid=" + streamtipid + "\r\n";
            data += "webenable=" + webenable + "\r\n";
            data += "musicenable=" + musicenable + "\r\n";
            data += "usehttps=" + usehttps + "\r\n";
            data += "keystorepath=" + keystorepath + "\r\n";
            data += "keystorepassword=" + keystorepassword + "\r\n";
            data += "keypassword=" + keypassword;

        try {
            Files.write(Paths.get("./botlogin.txt"), data.getBytes(StandardCharsets.UTF_8),
                        StandardOpenOption.CREATE, StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);
            com.gmt2001.Console.out.println("GameWisp Token has been refreshed.");
        } catch (IOException ex) {
            com.gmt2001.Console.err.println("!!!! CRITICAL !!!! Failed to update GameWisp Refresh Tokens into botlogin.txt! Must manually add!");
            com.gmt2001.Console.err.println("!!!! CRITICAL !!!! gamewispauth = " + newTokens[0] + " gamewisprefresh = " + newTokens[1]);
        }

        SingularityAPI.instance().setAccessToken(gamewispauth);
        
    }
    
    public void doRefreshGameWispToken() {

        long curTime = System.currentTimeMillis() / 1000l;

        if (!dataStoreObj.exists("settings", "gameWispRefreshTime")) {
            dataStoreObj.set("settings", "gameWispRefreshTime", String.valueOf(curTime));
        }

        ScheduledExecutorService service = Executors.newSingleThreadScheduledExecutor();
        service.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                long curTime = System.currentTimeMillis() / 1000l;
                String lastRunStr = dataStoreObj.GetString("settings", "", "gameWispRefreshTime");

                long lastRun = Long.parseLong(lastRunStr);
                if ((curTime - lastRun) > (10 * 24 * 60 * 60)) { // 10 days, token expires every 35.
                    dataStoreObj.set("settings", "gameWispRefreshTime", String.valueOf(curTime));
                    updateGameWispTokens(GameWispAPI.instance().refreshToken());
                }
            }
        }, 0, 1, TimeUnit.DAYS);
    }

}
