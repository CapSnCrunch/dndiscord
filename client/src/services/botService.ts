import api from '../lib/api';

export interface Bot {
  id: string;
  name: string;
  description?: string;
  discordBotToken: string;
  discordUserId?: string;
  worldId: string;
  npcId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const botService = {
  /**
   * Get all bots owned by the current user
   * @returns Array of bots
   */
  async getBots(): Promise<Bot[]> {
    const response = await api.get<Bot[]>('/bots');
    return response.data;
  },

  /**
   * Get a single bot by ID
   * @param botId - The ID of the bot to retrieve
   * @returns The bot
   */
  async getBot(botId: string): Promise<Bot> {
    const response = await api.get<Bot>(`/bots/${botId}`);
    return response.data;
  },

  /**
   * Create a new bot
   * @param botData - The bot data
   * @returns The ID of the created bot
   */
  async createBot(botData: {
    name: string;
    description?: string;
    discordBotToken: string;
    discordUserId?: string;
    worldId: string;
    npcId: string;
  }): Promise<string> {
    const response = await api.post<{ id: string }>('/bots', botData);
    return response.data.id;
  },

  /**
   * Update a bot
   * @param botId - The ID of the bot to update
   * @param botData - The fields to update
   * @returns The updated bot
   */
  async updateBot(
    botId: string,
    botData: {
      name?: string;
      description?: string;
      discordBotToken?: string;
      discordUserId?: string;
      worldId?: string;
      npcId?: string;
    }
  ): Promise<Bot> {
    const response = await api.patch<Bot>(`/bots/${botId}`, botData);
    return response.data;
  },

  /**
   * Delete a bot
   * @param botId - The ID of the bot to delete
   */
  async deleteBot(botId: string): Promise<void> {
    await api.delete(`/bots/${botId}`);
  },
};

