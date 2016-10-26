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
public class GameWispChangeEvent extends GameWispEvent {

    private final String username;
    private final String status;

    public GameWispChangeEvent(String username, String status) {
        this.username = username;
        this.status = status;
    }

    public GameWispChangeEvent(String username, String status, Channel channel) {
        super(channel);
        this.username = username;
        this.status = status;
    }

    public String getUsername() {
        return username;
    }

    public String getStatus() {
        return status;
    }
}