/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package me.gloriouseggroll.quorrabot.event.gamewisp;

import me.gloriouseggroll.quorrabot.twitchchat.Channel;

/**
 *
 * @author Tom
 */
public class GameWispSubscribeEvent extends GameWispEvent {

    private final String username;
    private final int tier;

    public GameWispSubscribeEvent(String username, int tier) {
        this.username = username;
        this.tier = tier;
    }

    public GameWispSubscribeEvent(String username, int tier, Channel channel) {
        super(channel);
        this.username = username;
        this.tier = tier;
    }

    public String getUsername() {
        return username;
    }

    public int getTier() {
        return tier;
    }
}