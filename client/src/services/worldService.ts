import api from '../lib/api';

export interface World {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const worldService = {
  /**
   * Get all worlds owned by the current user
   * @returns Array of worlds
   */
  async getWorlds(): Promise<World[]> {
    const response = await api.get<World[]>('/worlds');
    return response.data;
  },

  /**
   * Get a single world by ID
   * @param worldId - The ID of the world to retrieve
   * @returns The world
   */
  async getWorld(worldId: string): Promise<World> {
    const response = await api.get<World>(`/worlds/${worldId}`);
    return response.data;
  },

  /**
   * Create a new world
   * @param worldData - The world data
   * @returns The ID of the created world
   */
  async createWorld(worldData: { name: string; description?: string }): Promise<string> {
    const response = await api.post<{ id: string }>('/worlds', worldData);
    return response.data.id;
  },

  /**
   * Update a world
   * @param worldId - The ID of the world to update
   * @param worldData - The fields to update
   * @returns The updated world
   */
  async updateWorld(worldId: string, worldData: { name?: string; description?: string }): Promise<World> {
    const response = await api.patch<World>(`/worlds/${worldId}`, worldData);
    return response.data;
  },
};

