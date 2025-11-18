import { firestore } from '../lib/firebase-admin.ts';
import { NotFoundException, ValidationException } from '../exceptions/AppException.ts';

export interface World {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorldData {
  name: string;
  description: string;
  userId: string;
}

export interface UpdateWorldData {
  name?: string;
  description?: string;
}

export class WorldService {
  private readonly worldCollection = firestore.collection('worlds');

  /**
   * Creates a new world in the database
   * @param worldData - The world data
   * @returns The ID of the created world
   */
  async createWorld(worldData: CreateWorldData): Promise<string> {
    if (!worldData.name || !worldData.name.trim()) {
      throw new ValidationException('World name is required');
    }

    const docRef = await this.worldCollection.add({
      ...worldData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  /**
   * Retrieves a world from the database by ID
   * @param id - The ID of the world to retrieve
   * @returns The world
   * @throws NotFoundException if world does not exist
   */
  async getWorld(id: string): Promise<World> {
    const doc = await this.worldCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('World not found');
    }
    
    return {
      id,
      ...(doc.data()),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as World;
  }

  /**
   * Gets all worlds for a user
   * @param userId - The ID of the user
   * @returns Array of worlds sorted by updatedAt (descending)
   */
  async getWorlds(userId: string): Promise<World[]> {
    const snapshot = await this.worldCollection
      .where('userId', '==', userId)
      .get();

    const worlds = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data()),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    })) as World[];

    // Sort by updatedAt descending in memory
    return worlds.sort((a, b) => {
      const aTime = a.updatedAt.getTime();
      const bTime = b.updatedAt.getTime();
      return bTime - aTime; // Descending order
    });
  }

  /**
   * Updates a world in the database
   * @param worldId - The ID of the world to update
   * @param updateData - The fields to update
   * @returns The updated world
   * @throws NotFoundException if world does not exist
   */
  async updateWorld(worldId: string, updateData: UpdateWorldData): Promise<World> {
    const docRef = this.worldCollection.doc(worldId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('World not found');
    }

    const updates: Record<string, string | Date> = {
      updatedAt: new Date(),
    };
    
    if (updateData.name !== undefined) {
      if (!updateData.name || !updateData.name.trim()) {
        throw new ValidationException('World name cannot be empty');
      }
      updates.name = updateData.name;
    }
    if (updateData.description !== undefined) {
      updates.description = updateData.description;
    }

    await docRef.update(updates);
    
    // Fetch and return the updated document
    const updatedDoc = await docRef.get();
    return {
      id: updatedDoc.id,
      ...(updatedDoc.data()),
      createdAt: updatedDoc.data()?.createdAt?.toDate(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate(),
    } as World;
  }
}

