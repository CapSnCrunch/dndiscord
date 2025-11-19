import { Client, GatewayIntentBits, Partials, Message } from 'discord.js';
import { BotService } from './bot.service.ts';
import { NPCService } from './npc.service.ts';
import { WorldService } from './world.service.ts';
import logger from '../lib/logger.ts';
import OpenAI from 'openai';

export class DiscordBotService {
  private client: Client | null = null;
  private botService: BotService;
  private openai: OpenAI | null = null;
  private isInitialized = false;
  // Cache to track the last NPC each user interacted with per channel
  // Key: `${userId}:${channelId}`, Value: npcId
  private userLastNPCCache: Map<string, string> = new Map();

  constructor(botService: BotService) {
    this.botService = botService;
  }

  /**
   * Initializes and starts the Discord bot
   * @param token - The Discord bot token
   * @param openaiApiKey - The OpenAI API key
   */
  async start(token: string, openaiApiKey: string): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Discord bot is already initialized');
      return;
    }

    if (!token) {
      throw new Error('Discord bot token is required');
    }

    if (!openaiApiKey) {
      throw new Error('OpenAI API key is required');
    }

    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Create Discord client
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Required to read message content
      ],
      partials: [Partials.Message, Partials.Channel],
    });

    // Set up message listener
    this.client.on('messageCreate', async (message: Message) => {
      await this.handleMessage(message);
    });

    // Handle ready event
    this.client.once('ready', () => {
      logger.info(`Discord bot logged in as ${this.client?.user?.tag}`);
      this.isInitialized = true;
    });

    // Handle errors
    this.client.on('error', (error) => {
      logger.error({ err: error }, 'Discord client error');
    });

    // Login to Discord
    try {
      await this.client.login(token);
      logger.info('Discord bot login initiated');
    } catch (error) {
      logger.error({ err: error }, 'Failed to login Discord bot');
      throw error;
    }
  }

  /**
   * Stops the Discord bot
   */
  async stop(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isInitialized = false;
      logger.info('Discord bot stopped');
    }
  }

  /**
   * Fetches recent webhook messages from Discord for a bot
   * @param bot - The bot configuration
   * @param limit - Maximum number of messages to retrieve
   * @returns Array of webhook messages with NPC information
   */
  async fetchRecentWebhookMessages(bot: any, limit: number = 10): Promise<Array<{
    content: string;
    npcId: string;
    npcName: string;
    channelId: string;
    createdAt: Date;
  }>> {
    if (!this.client || !this.isInitialized) {
      logger.warn('Discord client not initialized, cannot fetch messages');
      return [];
    }

    try {
      const messages: Array<{
        content: string;
        npcName: string;
        channelId: string;
        createdAt: Date;
      }> = [];

      // Get the guild (server)
      const guild = await this.client.guilds.fetch(bot.discordServerId);
      if (!guild) {
        logger.warn(`Guild ${bot.discordServerId} not found`);
        return [];
      }

      // Determine which channels to check
      const channelsToCheck: string[] = [];
      if (bot.discordChannelId) {
        // Check only the specific channel
        channelsToCheck.push(bot.discordChannelId);
      } else {
        // Check all text channels in the guild
        const channels = await guild.channels.fetch();
        channels.forEach((channel) => {
          if (channel?.isTextBased()) {
            channelsToCheck.push(channel.id);
          }
        });
      }

      // Fetch messages from each channel
      for (const channelId of channelsToCheck) {
        try {
          const channel = await guild.channels.fetch(channelId);
          if (!channel?.isTextBased()) continue;

          const fetchedMessages = await channel.messages.fetch({ limit: 50 });
          
          // Filter for webhook messages
          fetchedMessages.forEach((msg) => {
            if (msg.webhookId && msg.author.username) {
              messages.push({
                content: msg.content,
                npcName: msg.author.username,
                channelId: msg.channelId,
                createdAt: msg.createdAt,
              });
            }
          });
        } catch (error) {
          logger.error({ err: error, channelId }, 'Error fetching messages from channel');
        }
      }

      // Sort by creation date (newest first) and limit
      messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const limitedMessages = messages.slice(0, limit);

      // Match messages with NPCs from the world
      const npcService = new NPCService();
      const npcs = await npcService.getNPCs(bot.worldId);
      
      // Create a map of NPC names to IDs (case-insensitive)
      const npcNameToId = new Map<string, string>();
      npcs.forEach(npc => {
        npcNameToId.set(npc.name.toLowerCase(), npc.id);
      });

      // Map messages to include NPC IDs
      const messagesWithNPCIds = limitedMessages
        .map((msg) => {
          const npcId = npcNameToId.get(msg.npcName.toLowerCase());
          if (!npcId) return null;

          return {
            content: msg.content,
            npcId,
            npcName: msg.npcName,
            channelId: msg.channelId,
            createdAt: msg.createdAt,
          };
        })
        .filter((msg): msg is NonNullable<typeof msg> => msg !== null);

      return messagesWithNPCIds;
    } catch (error) {
      logger.error({ err: error, botId: bot.id }, 'Error fetching recent webhook messages');
      return [];
    }
  }

  /**
   * Handles incoming messages
   */
  private async handleMessage(message: Message): Promise<void> {
    // Ignore messages from bots
    if (message.author.bot) {
      return;
    }

    // Check if the bot is mentioned
    if (!message.mentions.has(this.client!.user!)) {
      return;
    }

    // Ignore if message is empty
    if (!message.content || message.content.trim().length === 0) {
      return;
    }

    // Get server and channel IDs
    const serverId = message.guild?.id;
    const channelId = message.channel.id;

    if (!serverId) {
      logger.warn('Message received in non-guild channel, ignoring');
      return;
    }

    try {
      // Extract the message content (remove the mention)
      const mentionPattern = new RegExp(`<@!?${this.client!.user!.id}>`, 'g');
      const messageContent = message.content.replace(mentionPattern, '').trim();

      if (!messageContent) {
        // Just a mention with no content, maybe send a greeting?
        return;
      }

      // Find all bot configurations for this server/channel
      const bots = await this.botService.findBotsForChannel(serverId, channelId);
      if (bots.length === 0) {
        logger.debug(`No bot configuration found for server ${serverId}, channel ${channelId}`);
        return;
      }

      // Since bots are now one-to-one with worlds and one per server/channel, there should only be one bot
      const bot = bots[0];

      // Find the NPC mentioned in the message, or use the user's last interacted NPC
      const npc = await this.selectNPCForUser(bot, messageContent, message.author.id, channelId);
      if (!npc) {
        logger.debug(`Could not determine which NPC to use for bot ${bot.id}`);
        // Could optionally send a message asking which NPC they want to talk to
        return;
      }

      // Update cache with the selected NPC
      const cacheKey = `${message.author.id}:${channelId}`;
      this.userLastNPCCache.set(cacheKey, npc.id);

      // Generate response using OpenAI (will fetch message history from Discord)
      const response = await this.generateNPCResponse(bot, npc, messageContent, message.author.id, message.channel);

      if (response) {
        // Send response via webhook
        await this.botService.sendNPCResponse(bot.id, npc.id, channelId, response);
      }
    } catch (error) {
      logger.error({ err: error }, 'Error handling message');
    }
  }

  /**
   * Selects the best NPC for a user's message
   * Priority: 1) NPC name in message, 2) User's last mentioned NPC (from cache), 3) First available NPC
   * @param bot - The bot configuration
   * @param messageContent - The message content
   * @param userId - The Discord user ID
   * @param channelId - The Discord channel ID
   * @returns The selected NPC or null
   */
  private async selectNPCForUser(
    bot: any,
    messageContent: string,
    userId: string,
    channelId: string
  ): Promise<any | null> {
    // First, try to find by NPC name in message
    const npcByName = await this.botService.findNPCByName(bot, messageContent);
    if (npcByName) {
      logger.debug(`Selected NPC ${npcByName.id} (${npcByName.name}) by name for user ${userId} in channel ${channelId}`);
      return npcByName;
    }

    // If no name match, check cache for user's last mentioned NPC
    const cacheKey = `${userId}:${channelId}`;
    const lastNPCId = this.userLastNPCCache.get(cacheKey);
    
    if (lastNPCId) {
      // Verify the cached NPC still exists in this world
      try {
        const npcService = new NPCService();
        const npc = await npcService.getNPC(lastNPCId);
        if (npc && npc.campaignId === bot.worldId) {
          logger.debug(`Selected NPC ${npc.id} (${npc.name}) from cache for user ${userId} in channel ${channelId}`);
          return npc;
      } else {
          // Cached NPC is no longer in this world, remove from cache
          this.userLastNPCCache.delete(cacheKey);
          logger.debug(`Cached NPC ${lastNPCId} no longer in world, removed from cache`);
        }
      } catch (error) {
        // NPC not found, remove from cache
        this.userLastNPCCache.delete(cacheKey);
        logger.debug(`Cached NPC ${lastNPCId} not found, removed from cache`);
      }
    }

    // Fallback to first NPC in the world
    try {
      const npcService = new NPCService();
      const npcs = await npcService.getNPCs(bot.worldId);
      if (npcs.length > 0) {
        const fallbackNPC = npcs[0];
        logger.debug(`Selected NPC ${fallbackNPC.id} (${fallbackNPC.name}) as fallback for user ${userId} in channel ${channelId}`);
        return fallbackNPC;
      }
    } catch (error) {
      logger.error({ err: error }, 'Error fetching NPCs for fallback selection');
    }

    // No NPCs available
    logger.debug(`No NPCs available in world ${bot.worldId}`);
    return null;
  }

  /**
   * Generates an NPC response using OpenAI
   */
  private async generateNPCResponse(bot: any, npc: any, userMessage: string, userId: string, channel: any): Promise<string | null> {
    if (!this.openai) {
      logger.error('OpenAI client not initialized');
      return null;
    }

    try {
      // Get World data
      const worldService = new WorldService();
      const world = await worldService.getWorld(bot.worldId);

      // Build system prompt with NPC and World information
      const systemPrompt = `You are ${npc.name}, a character in a role-playing game set in the world of ${world.name}.

${world.description ? `World Context: ${world.description}` : ''}

${npc.description ? `Character Description: ${npc.description}` : ''}

Stay in character as ${npc.name}. Respond naturally and engagingly to the user's message, keeping in mind the world context and your character's place within it. Keep responses concise (1-3 sentences typically, but can be longer if the conversation warrants it). Be authentic to your character's personality, background, and the world they inhabit.`;

      // Fetch recent messages from Discord channel for context
      const history = await this.fetchChannelHistory(channel, 20);

      // Create messages array starting with system prompt
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        {
          role: 'system',
          content: systemPrompt,
        },
      ];

      // Add conversation history (excluding the current user message which we'll add at the end)
      for (const msg of history) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }

      // Add the current user message
      messages.push({
        role: 'user',
        content: userMessage,
      });

      // Log the messages being sent to OpenAI for debugging
      logger.info({
        botId: bot.id,
        channelId: channel.id,
        messageCount: messages.length,
        historyCount: history.length,
        messages: messages.map((msg, idx) => ({
          index: idx,
          role: msg.role,
          content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''), // Truncate for logging
          fullLength: msg.content.length,
        })),
      }, 'Messages being sent to OpenAI');

      // Generate response
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using a cost-effective model
        messages: messages,
        temperature: 0.8, // Slightly creative for character responses
        max_tokens: 200, // Limit response length
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        logger.warn('No response generated from OpenAI');
        return null;
      }

      return response.trim();
    } catch (error) {
      logger.error({ err: error }, 'Error generating NPC response');
      return null;
    }
  }

  /**
   * Fetches recent message history from a Discord channel
   * Filters for messages where the bot was mentioned or that are part of the conversation
   * @param channel - The Discord channel object
   * @param limit - Maximum number of messages to fetch (default: 20)
   * @returns Array of messages in chronological order (oldest first)
   */
  private async fetchChannelHistory(channel: any, limit: number = 20): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
    try {
      // Fetch recent messages from the channel
      const messages = await channel.messages.fetch({ limit });

      // Filter and format messages
      const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
      const botUserId = this.client?.user?.id;

      // Convert to array and reverse to get chronological order (oldest first)
      const messagesArray = Array.from(messages.values()).reverse() as Message[];

      for (const msg of messagesArray) {
        // Check if this is a webhook message (our bot's responses)
        // Webhook messages have webhookId set and author.bot is false
        const isWebhookMessage = !!msg.webhookId;
        const isBotUser = msg.author.id === botUserId;
        
        // Skip messages from other bots (but include webhook messages which are our bot's responses)
        if (msg.author.bot && !isBotUser && !isWebhookMessage) {
          continue;
        }

        // Extract content
        let content = msg.content;

        // If bot is mentioned, remove the mention from content
        if (msg.mentions.has(this.client!.user!)) {
          const mentionPattern = new RegExp(`<@!?${this.client!.user!.id}>`, 'g');
          content = content.replace(mentionPattern, '').trim();
        }

        // Skip empty messages
        if (!content || content.length === 0) {
          continue;
        }

        // Determine role: 
        // - If it's a webhook message, it's an assistant message (our bot's responses via webhook)
        // - If it's from our bot user directly, it's an assistant message
        // - Otherwise it's a user message
        const isAssistant = isWebhookMessage || msg.author.id === botUserId;
        
        history.push({
          role: isAssistant ? 'assistant' : 'user',
          content: content,
        });
      }

      // Log what we found for debugging
      logger.debug({
        totalMessages: messagesArray.length,
        historyMessages: history.length,
        assistantCount: history.filter(m => m.role === 'assistant').length,
        userCount: history.filter(m => m.role === 'user').length,
        sampleMessages: messagesArray.slice(0, 5).map(msg => ({
          authorId: msg.author.id,
          authorBot: msg.author.bot,
          webhookId: msg.webhookId,
          authorUsername: msg.author.username,
          contentPreview: msg.content.substring(0, 50),
        })),
      }, 'Fetched channel history from Discord');

      return history;
    } catch (error) {
      logger.error({ err: error }, 'Error fetching channel history from Discord');
      return [];
    }
  }
}

