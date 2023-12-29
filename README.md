# THIS PLUGIN IS IN A ALPHA STATE
## Planned Updates
- Once the Master SquadJS Branch decides how they will log IPs to `dblog` I will add an option to detect and kick if an IP is joining your Server that already exists somewhere in your `dblog` Database.

## Installation
- Add the bits to your SquadJS
- Set your `ChannelID` and Embed `color`
- Set if you want to `sendDiscordMessage` when a VPN Join is Detected
- Set if you want to `kickVPNs` when they are Detected
- Set your `kickVPNsMessage` for when a VPN Detection is Kicked

## What it do?
- On Player Connection, this pulls the Player's IP and compares it to a list of [Known VPN IP Ranges](https://raw.githubusercontent.com/X4BNet/lists_vpn/main/ipv4.txt). If a Player's IP is within these ranges, it will Log and/or Kick the Player based upon your `config.json`

## Example Kick
![Example](https://raw.githubusercontent.com/IgnisAlienus/SquadJS-IP-Detection/master/example-kick.png)