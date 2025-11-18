import { firestore } from '../lib/firebase-admin.ts';
import { NotFoundException, ValidationException } from '../exceptions/AppException.ts';

export interface NPC {
  id: string;
  name: string;
  description: string;
  imagePath?: string;
  campaignId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNPCData {
  name: string;
  description: string;
  imagePath?: string;
  campaignId: string;
}

export interface UpdateNPCData {
  name?: string;
  description?: string;
  imagePath?: string;
}

export class NPCService {
  private readonly npcCollection = firestore.collection('npcs');

  /**
   * Creates a new NPC in the database
   * @param npcData - The NPC data
   * @returns The ID of the created NPC
   */
  async createNPC(npcData: CreateNPCData): Promise<string> {
    if (!npcData.name || !npcData.name.trim()) {
      throw new ValidationException('NPC name is required');
    }

    // Filter out undefined values for Firestore
    const dataToSave: Record<string, any> = {
      name: npcData.name,
      description: npcData.description,
      campaignId: npcData.campaignId,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Only add imagePath if it's defined
    if (npcData.imagePath !== undefined) {
      dataToSave.imagePath = npcData.imagePath;
    }

    const docRef = await this.npcCollection.add(dataToSave);
    return docRef.id;
  }

  /**
   * Retrieves an NPC from the database by ID
   * @param id - The ID of the NPC to retrieve
   * @returns The NPC
   * @throws NotFoundException if NPC does not exist
   */
  async getNPC(id: string): Promise<NPC> {
    const doc = await this.npcCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('NPC not found');
    }
    
    return {
      id,
      ...(doc.data()),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as NPC;
  }

  /**
   * Gets all NPCs for a campaign
   * @param campaignId - The ID of the campaign
   * @returns Array of active NPCs sorted by updatedAt (descending)
   */
  async getNPCs(campaignId: string): Promise<NPC[]> {
    const snapshot = await this.npcCollection
      .where('campaignId', '==', campaignId)
      .where('active', '==', true)
      .get();

    const npcs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data()),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    })) as NPC[];

    // Sort by updatedAt descending in memory
    return npcs.sort((a, b) => {
      const aTime = a.updatedAt.getTime();
      const bTime = b.updatedAt.getTime();
      return bTime - aTime; // Descending order
    });
  }

  /**
   * Updates an NPC in the database
   * @param npcId - The ID of the NPC to update
   * @param updateData - The fields to update
   * @returns The updated NPC
   * @throws NotFoundException if NPC does not exist
   */
  async updateNPC(npcId: string, updateData: UpdateNPCData): Promise<NPC> {
    const docRef = this.npcCollection.doc(npcId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('NPC not found');
    }

    const updates: Record<string, any> = {
      updatedAt: new Date(),
    };
    
    if (updateData.name !== undefined) {
      if (!updateData.name || !updateData.name.trim()) {
        throw new ValidationException('NPC name cannot be empty');
      }
      updates.name = updateData.name;
    }
    if (updateData.description !== undefined) {
      updates.description = updateData.description;
    }
    if (updateData.imagePath !== undefined) {
      updates.imagePath = updateData.imagePath;
    }

    await docRef.update(updates);
    
    // Fetch and return the updated document
    const updatedDoc = await docRef.get();
    return {
      id: updatedDoc.id,
      ...(updatedDoc.data()),
      createdAt: updatedDoc.data()?.createdAt?.toDate(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate(),
    } as NPC;
  }

  /**
   * Soft-deletes an NPC by setting active to false
   * @param npcId - The ID of the NPC to delete
   * @throws NotFoundException if NPC does not exist
   */
  async deleteNPC(npcId: string): Promise<void> {
    const docRef = this.npcCollection.doc(npcId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('NPC not found');
    }

    await docRef.update({
      active: false,
      updatedAt: new Date(),
    });
  }
}

