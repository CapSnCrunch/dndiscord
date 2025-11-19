import { firestore } from '../lib/firebase-admin.ts';
import { NotFoundException, ValidationException } from '../exceptions/AppException.ts';
import { DiscordService } from './discord.service.ts';
import { NPCService, NPC } from './npc.service.ts';
import { ImageService } from './image.service.ts';
import logger from '../lib/logger.ts';

export interface Bot {
  id: string;
  name: string;
  description?: string;
  discordBotToken: string; // Stored for reference, but all bots use the shared token
  discordServerId: string;
  discordChannelId?: string; // Optional - if not provided, bot works in all channels of the server
  worldId: string;
  userId: string;
  isActive: boolean; // Whether the bot is currently active/running
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBotData {
  name: string;
  description?: string;
  discordServerId: string;
  discordChannelId?: string;
  worldId: string;
  userId: string;
}

export interface UpdateBotData {
  name?: string;
  description?: string;
  discordServerId?: string;
  discordChannelId?: string;
  worldId?: string;
}

export interface CreateBotResult {
  id: string;
  inviteUrl?: string;
}

export class BotService {
  private readonly botCollection = firestore.collection('bots');
  private readonly discordService: DiscordService;
  private readonly npcService: NPCService;
  private readonly imageService: ImageService;
  private discordBotService?: any; // DiscordBotService instance (optional to avoid circular dependency)

  constructor(npcService?: NPCService, imageService?: ImageService) {
    this.discordService = new DiscordService();
    this.npcService = npcService || new NPCService();
    this.imageService = imageService || new ImageService();
  }

  /**
   * Sets the Discord bot service instance
   * @param discordBotService - The Discord bot service instance
   */
  setDiscordBotService(discordBotService: any): void {
    this.discordBotService = discordBotService;
  }

  /**
   * Validates that creating a bot won't conflict with existing bots
   * Rules:
   * - If creating a server-level bot (no channelId), no other bots can exist for that server
   * - If creating a channel-level bot, no server-level bot can exist for that server and no bot for that channel
   * @param serverId - The Discord server ID
   * @param channelId - The optional Discord channel ID
   * @throws ValidationException if there are conflicts
   */
  private async validateNoBotConflicts(serverId: string, channelId?: string): Promise<void> {
    // Get all bots for this server
    const existingBots = await this.botCollection
      .where('discordServerId', '==', serverId)
      .get();

    if (existingBots.empty) {
      // No existing bots, no conflicts
      return;
    }

    // If creating a server-level bot (no channelId)
    if (!channelId) {
      // Cannot have ANY other bots in this server
      throw new ValidationException(
        'A bot already exists for this Discord server. Please delete the existing bot first, or specify a specific channel ID.'
      );
    }

    // If creating a channel-level bot, check for conflicts
    for (const doc of existingBots.docs) {
      const existingBot = doc.data();
      
      // Check if there's a server-level bot
      if (!existingBot.discordChannelId) {
        throw new ValidationException(
          'A server-wide bot already exists for this Discord server. Please delete it first to create channel-specific bots.'
        );
      }
      
      // Check if there's already a bot for this specific channel
      if (existingBot.discordChannelId === channelId) {
        throw new ValidationException(
          'A bot already exists for this Discord channel. Please delete it first or choose a different channel.'
        );
      }
    }
  }

  /**
   * Creates a new bot in the database
   * @param botData - The bot data
   * @returns The ID and invite URL of the created bot
   */
  async createBot(botData: CreateBotData): Promise<CreateBotResult> {
    if (!botData.name || !botData.name.trim()) {
      throw new ValidationException('Bot name is required');
    }
    if (!botData.discordServerId || !botData.discordServerId.trim()) {
      throw new ValidationException('Discord server ID is required');
    }
    if (!botData.worldId) {
      throw new ValidationException('World ID is required');
    }

    // Check for bot conflicts before creating
    await this.validateNoBotConflicts(botData.discordServerId, botData.discordChannelId);

    // Get shared bot token from environment
    const sharedBotToken = process.env.DISCORD_BOT_TOKEN;
    if (!sharedBotToken) {
      logger.error('DISCORD_BOT_TOKEN environment variable is not set');
      throw new ValidationException('Bot service is not properly configured. Please contact support.');
    }

    // Generate invite URL using shared bot
    let inviteUrl: string | undefined;
    try {
      const clientId = await this.discordService.getClientId(sharedBotToken);
      if (clientId) {
        inviteUrl = this.discordService.generateInviteUrl(clientId);
      } else {
        logger.warn('Could not generate invite URL: client ID not found');
      }
    } catch (error: any) {
      logger.error('Error generating invite URL:', error);
      // Don't fail bot creation if invite URL generation fails
    }

    // Build document data, only including defined fields
    const docData: Record<string, any> = {
      name: botData.name.trim(),
      discordBotToken: sharedBotToken, // Store the shared token for reference
      discordServerId: botData.discordServerId.trim(),
      worldId: botData.worldId,
      userId: botData.userId,
      isActive: true, // New bots are active by default
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Only add optional fields if they are defined
    if (botData.description !== undefined && botData.description !== null) {
      docData.description = botData.description;
    }
    if (botData.discordChannelId !== undefined && botData.discordChannelId !== null && botData.discordChannelId.trim()) {
      docData.discordChannelId = botData.discordChannelId.trim();
    }

    const docRef = await this.botCollection.add(docData);

    return {
      id: docRef.id,
      inviteUrl,
    };
  }

  /**
   * Retrieves a bot from the database by ID
   * @param id - The ID of the bot to retrieve
   * @returns The bot
   * @throws NotFoundException if bot does not exist
   */
  async getBot(id: string): Promise<Bot> {
    const doc = await this.botCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Bot not found');
    }
    
    return {
      id,
      ...(doc.data()),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Bot;
  }

  /**
   * Gets all bots for a user
   * @param userId - The ID of the user
   * @returns Array of bots sorted by updatedAt (descending)
   */
  async getBots(userId: string): Promise<Bot[]> {
    const snapshot = await this.botCollection
      .where('userId', '==', userId)
      .get();

    const bots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data()),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    })) as Bot[];

    // Sort by updatedAt descending in memory
    return bots.sort((a, b) => {
      const aTime = a.updatedAt.getTime();
      const bTime = b.updatedAt.getTime();
      return bTime - aTime; // Descending order
    });
  }

  /**
   * Gets all bots for a specific world
   * @param worldId - The ID of the world
   * @returns Array of bots sorted by updatedAt (descending)
   */
  async getBotsByWorld(worldId: string): Promise<Bot[]> {
    const snapshot = await this.botCollection
      .where('worldId', '==', worldId)
      .get();

    const bots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data()),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    })) as Bot[];

    // Sort by updatedAt descending in memory
    return bots.sort((a, b) => {
      const aTime = a.updatedAt.getTime();
      const bTime = b.updatedAt.getTime();
      return bTime - aTime; // Descending order
    });
  }


  /**
   * Updates a bot in the database
   * @param botId - The ID of the bot to update
   * @param updateData - The fields to update
   * @returns The updated bot
   * @throws NotFoundException if bot does not exist
   */
  async updateBot(botId: string, updateData: UpdateBotData): Promise<Bot> {
    const docRef = this.botCollection.doc(botId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Bot not found');
    }

    const updates: Record<string, string | Date | undefined> = {
      updatedAt: new Date(),
    };
    
    if (updateData.name !== undefined) {
      if (!updateData.name || !updateData.name.trim()) {
        throw new ValidationException('Bot name cannot be empty');
      }
      updates.name = updateData.name;
    }
    if (updateData.description !== undefined) {
      updates.description = updateData.description;
    }
    if (updateData.discordServerId !== undefined) {
      if (!updateData.discordServerId || !updateData.discordServerId.trim()) {
        throw new ValidationException('Discord server ID cannot be empty');
      }
      updates.discordServerId = updateData.discordServerId.trim();
    }
    if (updateData.discordChannelId !== undefined) {
      updates.discordChannelId = updateData.discordChannelId?.trim() || undefined;
    }
    if (updateData.worldId !== undefined) {
      updates.worldId = updateData.worldId;
    }

    await docRef.update(updates);
    
    // Fetch and return the updated document
    const updatedDoc = await docRef.get();
    return {
      id: updatedDoc.id,
      ...(updatedDoc.data()),
      createdAt: updatedDoc.data()?.createdAt?.toDate(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate(),
    } as Bot;
  }

  /**
   * Deletes a bot from the database
   * @param botId - The ID of the bot to delete
   * @throws NotFoundException if bot does not exist
   */
  async deleteBot(botId: string): Promise<void> {
    const docRef = this.botCollection.doc(botId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Bot not found');
    }

    await docRef.delete();
  }

  /**
   * Starts a bot (sets isActive to true)
   * @param botId - The ID of the bot to start
   * @returns The updated bot
   * @throws NotFoundException if bot does not exist
   */
  async startBot(botId: string): Promise<Bot> {
    const docRef = this.botCollection.doc(botId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Bot not found');
    }

    await docRef.update({
      isActive: true,
      updatedAt: new Date(),
    });

    const updatedDoc = await docRef.get();
    return {
      id: updatedDoc.id,
      ...(updatedDoc.data()),
      createdAt: updatedDoc.data()?.createdAt?.toDate(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate(),
    } as Bot;
  }

  /**
   * Stops a bot (sets isActive to false)
   * @param botId - The ID of the bot to stop
   * @returns The updated bot
   * @throws NotFoundException if bot does not exist
   */
  async stopBot(botId: string): Promise<Bot> {
    const docRef = this.botCollection.doc(botId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Bot not found');
    }

    await docRef.update({
      isActive: false,
      updatedAt: new Date(),
    });

    const updatedDoc = await docRef.get();
    return {
      id: updatedDoc.id,
      ...(updatedDoc.data()),
      createdAt: updatedDoc.data()?.createdAt?.toDate(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate(),
    } as Bot;
  }

  /**
   * Finds all bot configurations that match the given server and channel
   * Priority: exact channel match > server-wide match
   * Only returns active bots (isActive: true)
   * @param serverId - The Discord server ID
   * @param channelId - The Discord channel ID (optional)
   * @returns Array of matching active bot configurations
   */
  async findBotsForChannel(serverId: string, channelId?: string): Promise<Bot[]> {
    const bots: Bot[] = [];

    // First, try to find bots with exact server + channel match
    if (channelId) {
      const channelMatch = await this.botCollection
        .where('discordServerId', '==', serverId)
        .where('discordChannelId', '==', channelId)
        .where('isActive', '==', true) // Only get active bots
        .get();

      for (const doc of channelMatch.docs) {
        bots.push({
          id: doc.id,
          ...(doc.data()),
          createdAt: doc.data()?.createdAt?.toDate(),
          updatedAt: doc.data()?.updatedAt?.toDate(),
        } as Bot);
      }
    }

    // Also include server-wide bots (no channelId specified)
    // Note: Firestore doesn't support querying for null directly, so we get all server matches
    // and filter for those without channelId
    const serverMatches = await this.botCollection
      .where('discordServerId', '==', serverId)
      .where('isActive', '==', true) // Only get active bots
      .get();

    // Find bots without a channelId (server-wide bots)
    for (const doc of serverMatches.docs) {
      const data = doc.data();
      if (!data.discordChannelId) {
        // Avoid duplicates if this bot was already added as a channel match
        if (!bots.find(b => b.id === doc.id)) {
          bots.push({
            id: doc.id,
            ...data,
            createdAt: data?.createdAt?.toDate(),
            updatedAt: data?.updatedAt?.toDate(),
          } as Bot);
        }
      }
    }

    return bots;
  }

  /**
   * Finds a bot configuration that matches the given server and channel
   * Priority: exact channel match > server-wide match
   * @param serverId - The Discord server ID
   * @param channelId - The Discord channel ID (optional)
   * @returns The matching bot configuration or null
   * @deprecated Use findBotsForChannel instead for multi-NPC support
   */
  async findBotForChannel(serverId: string, channelId?: string): Promise<Bot | null> {
    const bots = await this.findBotsForChannel(serverId, channelId);
    return bots.length > 0 ? bots[0] : null;
  }

  /**
   * Finds the NPC mentioned in the message from the bot's world
   * @param bot - The bot configuration
   * @param messageContent - The message content to search for NPC names
   * @returns The matching NPC or null if no match found
   */
  async findNPCByName(bot: Bot, messageContent: string): Promise<NPC | null> {
    try {
      // Fetch all NPCs from the bot's world
      const npcs = await this.npcService.getNPCs(bot.worldId);
      
      if (npcs.length === 0) {
        logger.debug(`No NPCs found in world ${bot.worldId}`);
        return null;
      }

    // Normalize message content for matching (case-insensitive)
    const normalizedMessage = messageContent.toLowerCase();

    // Try to find exact name match first
      for (const npc of npcs) {
        const npcNameLower = npc.name.toLowerCase();
        // Check if NPC name appears in the message (as a whole word if possible)
        const nameRegex = new RegExp(`\\b${npcNameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (nameRegex.test(normalizedMessage)) {
          logger.debug(`Matched NPC "${npc.name}" from message content`);
          return npc;
      }
    }

    // If no exact match, try partial match
      for (const npc of npcs) {
        const npcNameLower = npc.name.toLowerCase();
        if (normalizedMessage.includes(npcNameLower)) {
          logger.debug(`Matched NPC "${npc.name}" from message content (partial match)`);
          return npc;
      }
    }

      // No match found
      logger.debug(`No NPC name match found in message`);
      return null;
    } catch (error) {
      logger.error({ err: error }, 'Error finding NPC by name');
      return null;
  }
  }


  /**
   * Gets recent bot responses from Discord
   * @param botId - The bot ID
   * @param limit - Maximum number of responses to retrieve (default: 10)
   * @returns Array of recent responses with NPC information
   */
  async getRecentResponses(botId: string, limit: number = 10): Promise<Array<{
    content: string;
    npcId: string;
    npcName: string;
    npcImageUrl?: string;
    channelId: string;
    createdAt: Date;
  }>> {
    try {
      // If Discord bot service is not available, return empty array
      if (!this.discordBotService) {
        logger.warn('Discord bot service not available, cannot fetch recent responses');
        return [];
      }

      // Get bot configuration
      const bot = await this.getBot(botId);

      // Fetch recent webhook messages from Discord
      const messages = await this.discordBotService.fetchRecentWebhookMessages(bot, limit);

      // Fetch NPC information and image URLs for each message
      const responsesWithImages = await Promise.all(
        messages.map(async (message: { content: string; npcId: string; npcName: string; channelId: string; createdAt: Date }) => {
          try {
            const npc = await this.npcService.getNPC(message.npcId);
            let npcImageUrl: string | undefined;
            
            if (npc.imagePath) {
              npcImageUrl = await this.imageService.getSignedUrl(npc.imagePath, 3600); // 1 hour expiry
            }

            return {
              content: message.content,
              npcId: message.npcId,
              npcName: message.npcName,
              npcImageUrl,
              channelId: message.channelId,
              createdAt: message.createdAt,
            };
          } catch (error) {
            logger.error({ err: error, npcId: message.npcId }, 'Error fetching NPC data for response');
            // Return without image if NPC fetch fails
            return {
              content: message.content,
              npcId: message.npcId,
              npcName: message.npcName,
              npcImageUrl: undefined,
              channelId: message.channelId,
              createdAt: message.createdAt,
            };
          }
        })
      );

      return responsesWithImages;
    } catch (error) {
      logger.error({ err: error, botId }, 'Error fetching recent bot responses');
      return [];
    }
  }

  /**
   * Sends an NPC response via webhook
   * This method handles getting the bot config, NPC data, image URL, and sending via webhook
   * @param botId - The bot ID
   * @param npcId - The NPC ID
   * @param channelId - The Discord channel ID
   * @param messageContent - The message content to send
   * @returns True if message was sent successfully, false otherwise
   */
  async sendNPCResponse(botId: string, npcId: string, channelId: string, messageContent: string): Promise<boolean> {
    try {
      // Get bot configuration
      const bot = await this.getBot(botId);

      // Get the NPC data
      const npc = await this.npcService.getNPC(npcId);
      
      // Get the NPC's image URL if available
      let avatarUrl: string | undefined;
      if (npc.imagePath) {
        avatarUrl = await this.imageService.getSignedUrl(npc.imagePath, 60); // 60 minute expiry
      }

      // Get or create webhook for this channel
      const webhookUrl = await this.discordService.getOrCreateWebhook(
        bot.discordBotToken,
        channelId,
        npc.name
      );

      if (!webhookUrl) {
        logger.error(`Failed to get or create webhook for channel ${channelId}`);
        return false;
      }

      // Send message via webhook with NPC name and avatar
      const success = await this.discordService.sendWebhookMessage(
        webhookUrl,
        messageContent,
        npc.name,
        avatarUrl
      );

      return success;
    } catch (error) {
      logger.error({ err: error }, 'Error sending NPC response via webhook');
      return false;
    }
  }
}

