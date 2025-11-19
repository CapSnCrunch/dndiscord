import logger from '../lib/logger.ts';

export interface DiscordBotInfo {
  id: string;
  username: string;
  discriminator?: string;
}

export class DiscordService {
  private readonly discordApiBase = 'https://discord.com/api/v10';

  /**
   * Extracts the client ID from a Discord bot token
   * Discord bot tokens are base64 encoded strings where the first part contains the client ID
   * @param token - The Discord bot token
   * @returns The client ID
   */
  private extractClientIdFromToken(token: string): string | null {
    try {
      // Discord bot tokens are base64 encoded
      // The first part (before the dot) is the client ID encoded in base64
      const parts = token.split('.');
      if (parts.length >= 1) {
        try {
          // Decode the first part from base64
          const decoded = Buffer.from(parts[0], 'base64').toString('utf-8');
          // The decoded string should be a numeric client ID
          if (/^\d+$/.test(decoded)) {
            return decoded;
          }
        } catch (e) {
          // If base64 decode fails, try parsing the first part directly as a number
          if (/^\d+$/.test(parts[0])) {
            return parts[0];
          }
        }
      }
      return null;
    } catch (error) {
      logger.error({ err: error }, 'Error extracting client ID from token');
      return null;
    }
  }

  /**
   * Fetches bot information from Discord API
   * @param token - The Discord bot token
   * @returns Bot information including user ID
   */
  async getBotInfo(token: string): Promise<DiscordBotInfo | null> {
    try {
      const response = await fetch(`${this.discordApiBase}/users/@me`, {
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        logger.error(`Discord API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return {
        id: data.id,
        username: data.username,
        discriminator: data.discriminator,
      };
    } catch (error) {
      logger.error({ err: error }, 'Error fetching bot info from Discord');
      return null;
    }
  }

  /**
   * Generates a Discord bot invite URL
   * @param clientId - The Discord bot's client ID
   * @param permissions - Optional permissions integer (if not provided, uses comprehensive default set)
   * @returns The invite URL
   */
  generateInviteUrl(clientId: string, permissions?: number): string {
    // Comprehensive permission set including all necessary permissions:
    // - Manage Webhooks (required for creating webhooks)
    // - Send Messages, Read Message History, etc.
    const defaultPermissions = 2863576804359376;
    
    // Use provided permissions or default
    const perms = permissions ?? defaultPermissions;
    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${perms}&scope=bot%20applications.commands`;
  }

  /**
   * Gets the client ID from a bot token by fetching from Discord API
   * @param token - The Discord bot token
   * @returns The client ID
   */
  async getClientId(token: string): Promise<string | null> {
    // Try to get it from the bot's application info (most reliable method)
    try {
      const response = await fetch(`${this.discordApiBase}/oauth2/applications/@me`, {
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.id) {
          return data.id;
        }
      } else {
        logger.warn(`Discord API error when fetching application info: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      logger.error({ err: error }, 'Error fetching application info from Discord');
    }

    // Fallback: try to extract from token format (may not work with modern tokens)
    const extractedId = this.extractClientIdFromToken(token);
    if (extractedId) {
      logger.warn('Using fallback method to extract client ID from token');
      return extractedId;
    }

    return null;
  }

  /**
   * Validates a Discord bot token by attempting to fetch bot info
   * @param token - The Discord bot token
   * @returns True if token is valid, false otherwise
   */
  async validateToken(token: string): Promise<boolean> {
    const botInfo = await this.getBotInfo(token);
    return botInfo !== null;
  }

  /**
   * Creates a webhook for a Discord channel
   * @param token - The Discord bot token
   * @param channelId - The Discord channel ID
   * @param name - Optional webhook name (defaults to "NPC Bot")
   * @returns The webhook URL or null if creation failed
   */
  async createWebhook(token: string, channelId: string, name: string = 'NPC Bot'): Promise<string | null> {
    try {
      const response = await fetch(`${this.discordApiBase}/channels/${channelId}/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.substring(0, 80), // Discord limits webhook names to 80 characters
        }),
      });

      if (!response.ok) {
        logger.error(`Failed to create webhook: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      // Webhook URL format: https://discord.com/api/webhooks/{webhook.id}/{webhook.token}
      if (data.id && data.token) {
        return `https://discord.com/api/webhooks/${data.id}/${data.token}`;
      }

      return null;
    } catch (error) {
      logger.error({ err: error }, 'Error creating webhook');
      return null;
    }
  }

  /**
   * Gets existing webhooks for a channel
   * @param token - The Discord bot token
   * @param channelId - The Discord channel ID
   * @returns Array of webhook objects with id, token, and url
   */
  async getChannelWebhooks(token: string, channelId: string): Promise<Array<{ id: string; token: string; url: string }>> {
    try {
      const response = await fetch(`${this.discordApiBase}/channels/${channelId}/webhooks`, {
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        logger.error(`Failed to get webhooks: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return data.map((webhook: any) => ({
        id: webhook.id,
        token: webhook.token,
        url: `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`,
      }));
    } catch (error) {
      logger.error({ err: error }, 'Error getting channel webhooks');
      return [];
    }
  }

  /**
   * Gets or creates a webhook for a channel
   * Tries to reuse existing webhooks first, creates new one if none exist
   * @param token - The Discord bot token
   * @param channelId - The Discord channel ID
   * @param name - Optional webhook name
   * @returns The webhook URL or null if failed
   */
  async getOrCreateWebhook(token: string, channelId: string, name: string = 'NPC Bot'): Promise<string | null> {
    // First, try to get existing webhooks
    const existingWebhooks = await this.getChannelWebhooks(token, channelId);
    
    // If we have webhooks, use the first one (we can reuse them)
    if (existingWebhooks.length > 0) {
      return existingWebhooks[0].url;
    }

    // No existing webhooks, create a new one
    return await this.createWebhook(token, channelId, name);
  }

  /**
   * Sends a message via webhook with custom username and avatar
   * @param webhookUrl - The webhook URL (format: https://discord.com/api/webhooks/{id}/{token})
   * @param content - The message content
   * @param username - Custom username for the webhook message
   * @param avatarUrl - Optional avatar URL for the webhook message
   * @returns True if message was sent successfully, false otherwise
   */
  async sendWebhookMessage(
    webhookUrl: string,
    content: string,
    username: string,
    avatarUrl?: string
  ): Promise<boolean> {
    try {
      const payload: any = {
        content: content,
        username: username.substring(0, 80), // Discord limits usernames to 80 characters
      };

      if (avatarUrl) {
        payload.avatar_url = avatarUrl;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        logger.error(`Failed to send webhook message: ${response.status} ${response.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error({ err: error }, 'Error sending webhook message');
      return false;
    }
  }
}

