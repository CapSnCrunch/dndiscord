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
  npcId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBotData {
  name: string;
  description?: string;
  discordServerId: string;
  discordChannelId?: string;
  worldId: string;
  npcId: string;
  userId: string;
}

export interface UpdateBotData {
  name?: string;
  description?: string;
  discordServerId?: string;
  discordChannelId?: string;
  worldId?: string;
  npcId?: string;
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

  constructor(npcService?: NPCService, imageService?: ImageService) {
    this.discordService = new DiscordService();
    this.npcService = npcService || new NPCService();
    this.imageService = imageService || new ImageService();
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
    if (!botData.npcId) {
      throw new ValidationException('NPC ID is required');
    }

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
      npcId: botData.npcId,
      userId: botData.userId,
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
   * Gets all bots for a specific NPC
   * @param npcId - The ID of the NPC
   * @returns Array of bots sorted by updatedAt (descending)
   */
  async getBotsByNPC(npcId: string): Promise<Bot[]> {
    const snapshot = await this.botCollection
      .where('npcId', '==', npcId)
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
    if (updateData.npcId !== undefined) {
      updates.npcId = updateData.npcId;
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
   * Finds all bot configurations that match the given server and channel
   * Priority: exact channel match > server-wide match
   * @param serverId - The Discord server ID
   * @param channelId - The Discord channel ID (optional)
   * @returns Array of matching bot configurations
   */
  async findBotsForChannel(serverId: string, channelId?: string): Promise<Bot[]> {
    const bots: Bot[] = [];

    // First, try to find bots with exact server + channel match
    if (channelId) {
      const channelMatch = await this.botCollection
        .where('discordServerId', '==', serverId)
        .where('discordChannelId', '==', channelId)
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
   * Finds the best matching bot based on NPC name mentioned in the message
   * @param bots - Array of candidate bots
   * @param messageContent - The message content to search for NPC names
   * @returns The best matching bot and whether it was matched by name
   */
  async findBotByNPCName(bots: Bot[], messageContent: string): Promise<{ bot: Bot | null; matchedByName: boolean }> {
    if (bots.length === 0) {
      return { bot: null, matchedByName: false };
    }

    if (bots.length === 1) {
      return { bot: bots[0], matchedByName: false };
    }

    // Fetch NPC data for all bots to check names
    const npcPromises = bots.map(bot => 
      this.npcService.getNPC(bot.npcId).catch(() => null)
    );
    const npcs = await Promise.all(npcPromises);

    // Create a map of bot to NPC
    const botToNPC = new Map<Bot, NPC | null>();
    bots.forEach((bot, index) => {
      botToNPC.set(bot, npcs[index]);
    });

    // Normalize message content for matching (case-insensitive)
    const normalizedMessage = messageContent.toLowerCase();

    // Try to find exact name match first
    for (const bot of bots) {
      const npc = botToNPC.get(bot);
      if (npc) {
        const npcNameLower = npc.name.toLowerCase();
        // Check if NPC name appears in the message (as a whole word if possible)
        const nameRegex = new RegExp(`\\b${npcNameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (nameRegex.test(normalizedMessage)) {
          logger.debug(`Matched NPC "${npc.name}" from message content`);
          return { bot, matchedByName: true };
        }
      }
    }

    // If no exact match, try partial match
    for (const bot of bots) {
      const npc = botToNPC.get(bot);
      if (npc) {
        const npcNameLower = npc.name.toLowerCase();
        if (normalizedMessage.includes(npcNameLower)) {
          logger.debug(`Matched NPC "${npc.name}" from message content (partial match)`);
          return { bot, matchedByName: true };
        }
      }
    }

    // If no name match, return the first bot (channel-specific bots take priority due to findBotsForChannel ordering)
    logger.debug(`No NPC name match found, using first bot`);
    return { bot: bots[0], matchedByName: false };
  }

  /**
   * Stores a message in the conversation history
   * @param botId - The bot ID
   * @param channelId - The Discord channel ID
   * @param role - The role of the message sender ('user' or 'assistant')
   * @param content - The message content
   * @param userId - Optional user ID (for user messages)
   */
  async storeMessage(botId: string, channelId: string, role: 'user' | 'assistant', content: string, userId?: string): Promise<void> {
    const messagesCollection = firestore
      .collection('botMessages')
      .doc(botId)
      .collection('channels')
      .doc(channelId)
      .collection('messages');

    await messagesCollection.add({
      role,
      content,
      userId,
      createdAt: new Date(),
    });
  }

  /**
   * Gets recent message history for a bot in a channel
   * @param botId - The bot ID
   * @param channelId - The Discord channel ID
   * @param limit - Maximum number of messages to retrieve (default: 20)
   * @returns Array of messages ordered by creation time (oldest first)
   */
  async getMessageHistory(botId: string, channelId: string, limit: number = 20): Promise<Array<{ role: 'user' | 'assistant'; content: string; createdAt: Date }>> {
    const messagesCollection = firestore
      .collection('botMessages')
      .doc(botId)
      .collection('channels')
      .doc(channelId)
      .collection('messages');

    const snapshot = await messagesCollection
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const messages = snapshot.docs.map(doc => ({
      role: doc.data().role as 'user' | 'assistant',
      content: doc.data().content,
      createdAt: doc.data().createdAt.toDate(),
    }));

    // Reverse to get chronological order (oldest first)
    return messages.reverse();
  }

  /**
   * Sends an NPC response via webhook
   * This method handles getting the bot config, NPC data, image URL, and sending via webhook
   * @param botId - The bot ID
   * @param channelId - The Discord channel ID
   * @param messageContent - The message content to send
   * @returns True if message was sent successfully, false otherwise
   */
  async sendNPCResponse(botId: string, channelId: string, messageContent: string): Promise<boolean> {
    try {
      // Get bot configuration
      const bot = await this.getBot(botId);

      // Get the NPC data
      const npc = await this.npcService.getNPC(bot.npcId);
      
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

