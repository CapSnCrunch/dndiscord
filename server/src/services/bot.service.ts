import { firestore } from '../lib/firebase-admin.ts';
import { NotFoundException, ValidationException } from '../exceptions/AppException.ts';

export interface Bot {
  id: string;
  name: string;
  description?: string;
  discordBotToken: string;
  discordUserId?: string;
  worldId: string;
  npcId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBotData {
  name: string;
  description?: string;
  discordBotToken: string;
  discordUserId?: string;
  worldId: string;
  npcId: string;
  userId: string;
}

export interface UpdateBotData {
  name?: string;
  description?: string;
  discordBotToken?: string;
  discordUserId?: string;
  worldId?: string;
  npcId?: string;
}

export class BotService {
  private readonly botCollection = firestore.collection('bots');

  /**
   * Creates a new bot in the database
   * @param botData - The bot data
   * @returns The ID of the created bot
   */
  async createBot(botData: CreateBotData): Promise<string> {
    if (!botData.name || !botData.name.trim()) {
      throw new ValidationException('Bot name is required');
    }
    if (!botData.discordBotToken || !botData.discordBotToken.trim()) {
      throw new ValidationException('Discord bot token is required');
    }
    if (!botData.worldId) {
      throw new ValidationException('World ID is required');
    }
    if (!botData.npcId) {
      throw new ValidationException('NPC ID is required');
    }

    const docRef = await this.botCollection.add({
      ...botData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
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

    const updates: Record<string, string | Date> = {
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
    if (updateData.discordBotToken !== undefined) {
      if (!updateData.discordBotToken || !updateData.discordBotToken.trim()) {
        throw new ValidationException('Discord bot token cannot be empty');
      }
      updates.discordBotToken = updateData.discordBotToken;
    }
    if (updateData.discordUserId !== undefined) {
      updates.discordUserId = updateData.discordUserId;
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
}

