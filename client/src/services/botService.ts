import api from '../lib/api';

export interface Bot {
  id: string;
  name: string;
  description?: string;
  discordServerId: string;
  discordChannelId?: string;
  worldId: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BotResponse {
  content: string;
  npcId: string;
  npcName: string;
  npcImageUrl?: string;
  channelId: string;
  createdAt: string;
}

export const botService = {
  /**
   * Get all bots owned by the current user
   * @param worldId - Optional world ID to filter bots
   * @returns Array of bots
   */
  async getBots(worldId?: string): Promise<Bot[]> {
    const params = worldId ? { worldId } : {};
    const response = await api.get<Bot[]>('/bots', { params });
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
   * @returns The ID and invite URL of the created bot
   */
  async createBot(botData: {
    name: string;
    description?: string;
    discordServerId: string;
    discordChannelId?: string;
    worldId: string;
  }): Promise<{ id: string; inviteUrl?: string }> {
    const response = await api.post<{ id: string; inviteUrl?: string }>('/bots', botData);
    return response.data;
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
      discordServerId?: string;
      discordChannelId?: string;
      worldId?: string;
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

  /**
   * Start a bot (set isActive to true)
   * @param botId - The ID of the bot to start
   * @returns The updated bot
   */
  async startBot(botId: string): Promise<Bot> {
    const response = await api.post<Bot>(`/bots/${botId}/start`);
    return response.data;
  },

  /**
   * Stop a bot (set isActive to false)
   * @param botId - The ID of the bot to stop
   * @returns The updated bot
   */
  async stopBot(botId: string): Promise<Bot> {
    const response = await api.post<Bot>(`/bots/${botId}/stop`);
    return response.data;
  },

  /**
   * Get recent responses from a bot
   * @param botId - The ID of the bot
   * @param limit - Maximum number of responses to retrieve (default: 10)
   * @returns Array of recent bot responses with NPC information
   */
  async getRecentResponses(botId: string, limit: number = 10): Promise<BotResponse[]> {
    const response = await api.get<BotResponse[]>(`/bots/${botId}/responses`, {
      params: { limit },
    });
    return response.data;
  },
};

