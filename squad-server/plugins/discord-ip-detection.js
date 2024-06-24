//Plugin by PSG - Ignis - Press Start Gaming
import DiscordBasePlugin from './discord-base-plugin.js';
import fetch from 'node-fetch';
import axios from 'axios';

export default class DiscordIPDetection extends DiscordBasePlugin {
  static get description() {
    return 'The <code>DiscordIPDetection</code> plugin will log possible VPN IPs that try to join the Server.';
  }

  static get defaultEnabled() {
    return false;
  }

  static get optionsSpecification() {
    return {
      ...DiscordBasePlugin.optionsSpecification,
      channelID: {
        required: true,
        description: 'The ID of the channel to log to.',
        default: '',
        example: '667741905228136459',
      },
      color: {
        required: false,
        description: 'The color of the embed.',
        default: 16711680,
      },
      sendDiscordMessage: {
        required: false,
        default: true,
        description:
          'Do you want to send a Discord Message when a VPN is detected?',
      },
      kickVPNs: {
        required: false,
        default: false,
        description: 'Do you want to Kick Detected VPNs?',
      },
      kickVPNsMessage: {
        required: false,
        default: 'Server Protection: VPN Detected - Please join without a VPN.',
        description:
          'Kick Message Displayed to the Player when they are Kicked for using a VPN.',
      },
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);
    this.onPlayerConnected = this.onPlayerConnected.bind(this);
  }

  async mount() {
    this.checkVersion();
    this.server.on('PLAYER_CONNECTED', this.onPlayerConnected);
  }

  async unmount() {
    this.server.removeEventListener('PLAYER_CONNECTED', this.onPlayerConnected);
  }

  // Check if current version is the latest version
  async checkVersion() {
    const owner = 'IgnisAlienus';
    const repo = 'SquadJS-IP-Detection';
    const currentVersion = 'v0.1.0';

    try {
      const latestVersion = await getLatestVersion(owner, repo);

      if (currentVersion !== latestVersion) {
        this.verbose(
          1,
          'A new version is available. Please update your plugin.'
        );
        this.sendDiscordMessage({
          content: `A new version of \`SquadJS-IP-Detection\` is available. Please update your plugin. Current version: \`${currentVersion}\` [Latest version](https://github.com/IgnisAlienus/SquadJS-IP-Detection): \`${latestVersion}\``,
        });
      } else {
        this.verbose(1, 'You are running the latest version.');
      }
    } catch (error) {
      this.verbose(1, 'Error retrieving the latest version:', error);
    }
  }

  async onPlayerConnected(info) {
    const ipAddress = info.ip;

    checkVPNIPAddress(ipAddress)
      .then((isVPN) => {
        if (isVPN === true) {
          this.verbose(
            1,
            `${ipAddress} | ${info.player.steamID} | ${info.eosID} | ${info.player.name} is a known VPN IP address.`
          );
          if (this.options.sendDiscordMessage === true) {
            this.sendDiscordMessage({
              embed: {
                title: 'VPN Detected',
                color: this.options.color,
                fields: [
                  {
                    name: 'Player',
                    value: info.player.name,
                  },
                  {
                    name: 'SteamID',
                    value: `[${info.player.steamID}](https://steamcommunity.com/profiles/${info.steamID})`,
                  },
                  {
                    name: 'EOSID',
                    value: info.eosID,
                  },
                  {
                    name: 'IP',
                    value: info.ip,
                  },
                ],
                timestamp: info.time.toISOString(),
              },
            });
          }
          if (this.options.kickVPNs === true) {
            this.server.rcon.kick(
              info.player.steamID,
              `${this.options.kickVPNsMessage}`
            );
          }
        } else {
          this.verbose(
            1,
            `${ipAddress} | ${info.player.steamID} | ${info.eosID} | ${info.player.name} is not a known VPN IP address.`
          );
        }
      })
      .catch((error) => {
        this.verbose(1, 'Error checking VPN IP address:', error);
      });
  }
}

async function checkVPNIPAddress(ipAddress) {
  try {
    const response = await axios.get(
      'https://raw.githubusercontent.com/X4BNet/lists_vpn/main/ipv4.txt'
    );
    const ipList = response.data.split('\n');

    for (const ip of ipList) {
      if (ip.includes('/')) {
        // If the IP is in CIDR notation
        if (isIPInRange(ipAddress, ip)) {
          console.log(`IP address ${ipAddress} matched on CIDR ${ip}`);
          return true;
        }
      } else {
        // If the IP is a single IP address
        if (ipAddress === ip) {
          console.log(`IP address ${ipAddress} matched on single IP ${ip}`);
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error fetching VPN IP list:', error);
    return false;
  }
}

function isIPInRange(ipAddress, cidr) {
  const [subnet, mask] = cidr.split('/');
  const subnetParts = subnet.split('.').map(Number);
  const ipParts = ipAddress.split('.').map(Number);

  const subnetBinary = subnetParts.reduce(
    (sum, part, index) => sum + (part << ((3 - index) * 8)),
    0
  );
  const ipBinary = ipParts.reduce(
    (sum, part, index) => sum + (part << ((3 - index) * 8)),
    0
  );

  const maskBinary = -1 << (32 - mask);

  return (subnetBinary & maskBinary) === (ipBinary & maskBinary);
}

// Retrieve the latest version from GitHub
async function getLatestVersion(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const response = await fetch(url);
  const data = await response.json();
  return data.tag_name;
}
