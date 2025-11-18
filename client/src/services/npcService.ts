import api from '../lib/api';

export interface NPC {
  id: string;
  name: string;
  description: string;
  imageUrl?: string; // Signed URL from server (never imagePath)
  campaignId: string;
  createdAt: string;
  updatedAt: string;
}

export const npcService = {
  /**
   * Get all NPCs for a campaign
   * @param campaignId - The ID of the campaign
   * @returns Array of NPCs
   */
  async getNPCs(campaignId: string): Promise<NPC[]> {
    const response = await api.get<NPC[]>(`/npcs?campaignId=${campaignId}`);
    return response.data;
  },

  /**
   * Get a single NPC by ID
   * @param npcId - The ID of the NPC to retrieve
   * @returns The NPC
   */
  async getNPC(npcId: string): Promise<NPC> {
    const response = await api.get<NPC>(`/npcs/${npcId}`);
    return response.data;
  },

  /**
   * Create a new NPC
   * @param npcData - The NPC data including campaignId
   * @returns The ID of the created NPC
   */
  async createNPC(npcData: { name: string; description?: string; campaignId: string }, imageFile?: File): Promise<string> {
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('name', npcData.name);
      if (npcData.description !== undefined) {
        formData.append('description', npcData.description);
      }
      formData.append('campaignId', npcData.campaignId);

      const response = await api.post<{ id: string }>('/npcs', formData);
      return response.data.id;
    } else {
      const response = await api.post<{ id: string }>('/npcs', npcData);
      return response.data.id;
    }
  },

  /**
   * Update an NPC
   * @param npcId - The ID of the NPC to update
   * @param npcData - The fields to update
   * @param imageFile - Optional image file to upload
   * @returns The updated NPC
   */
  async updateNPC(
    npcId: string, 
    npcData: { name?: string; description?: string },
    imageFile?: File
  ): Promise<NPC> {
    // If an image file is provided, use FormData
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Add other fields if provided
      if (npcData.name !== undefined) {
        formData.append('name', npcData.name);
      }
      if (npcData.description !== undefined) {
        formData.append('description', npcData.description);
      }

      const response = await api.patch<NPC>(`/npcs/${npcId}`, formData);
      return response.data;
    } else {
      // No image file, use regular JSON
      const response = await api.patch<NPC>(`/npcs/${npcId}`, npcData);
      return response.data;
    }
  },

  /**
   * Delete an NPC
   * @param npcId - The ID of the NPC to delete
   */
  async deleteNPC(npcId: string): Promise<void> {
    await api.delete(`/npcs/${npcId}`);
  },
};

