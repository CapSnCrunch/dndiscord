import { Router, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.ts';
import { authenticateUser } from '../middleware/auth.middleware.ts';
import { asyncHandler } from '../middleware/global-error.middleware.ts';
import type { NPC, NPCService, CreateNPCData, UpdateNPCData } from '../services/npc.service.ts';
import { ImageService } from '../services/image.service.ts';
import type { Multer } from 'multer';
import {
  AuthenticationException,
  ValidationException,
  NotFoundException,
  AuthorizationException,
} from '../exceptions/AppException.ts';

export interface CreateNPCRequest {
  name: string;
  description: string;
  campaignId: string;
}

export interface UpdateNPCRequest {
  name?: string;
  description?: string;
}

export class NPCController {
  private npcService: NPCService;
  private imageService: ImageService;

  constructor(npcService: NPCService, imageService: ImageService) {
    this.npcService = npcService;
    this.imageService = imageService;
  }

  /**
   * Register all NPC-related routes at /npcs
   * @param router - Express Router instance
   * @param upload - Multer instance for file uploads
   */
  registerRoutes(router: Router, upload: Multer): void {
    // Create a new NPC (with optional image upload)
    router.post(
      '/',
      authenticateUser(),
      upload.single('image'),
      asyncHandler(async (req: AuthenticatedRequest<CreateNPCRequest>, res: Response) => {
        if (!req.body.campaignId || !req.body.campaignId.trim()) {
          throw new ValidationException('Campaign ID is required');
        }

        if (!req.body.name || !req.body.name.trim()) {
          throw new ValidationException('NPC name is required');
        }

        // If an image file was uploaded, upload it to storage
        if (req.file) {
          const campaignId = req.body.campaignId.trim();
          const npcId = await this.npcService.createNPC({
            name: req.body.name.trim(),
            description: req.body.description || '',
            campaignId,
          });

          // Upload image after creating NPC (so we have the NPC ID)
          const imagePath = await this.imageService.uploadNPCImage(
            req.file.buffer,
            req.file.mimetype,
            campaignId,
            npcId
          );

          // Update NPC with image path
          await this.npcService.updateNPC(npcId, { imagePath });

          res.status(StatusCodes.CREATED).json({ id: npcId });
        } else {
          // No image file, create NPC normally
          const npcId = await this.npcService.createNPC({
            name: req.body.name.trim(),
            description: req.body.description || '',
            campaignId: req.body.campaignId.trim(),
          });

          res.status(StatusCodes.CREATED).json({ id: npcId });
        }
      })
    );

    // Get all NPCs for a campaign
    router.get(
      '/',
      authenticateUser(),
      asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const campaignId = req.query.campaignId as string;
        if (!campaignId) {
          throw new ValidationException('campaignId query parameter is required');
        }

        const npcs = await this.npcService.getNPCs(campaignId);
        const npcsWithUrls = await Promise.all(
          npcs.map(npc => this.addSignedImageUrlToNPC(npc))
        );
        res.json(npcsWithUrls);
      })
    );

    // Get a single NPC by ID
    router.get(
      '/:npcId',
      authenticateUser(),
      asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const npc = await this.npcService.getNPC(req.params.npcId);
        const npcWithUrl = await this.addSignedImageUrlToNPC(npc);
        res.json(npcWithUrl);
      })
    );

    // Update an NPC (with optional image upload)
    router.patch(
      '/:npcId',
      authenticateUser(),
      upload.single('image'),
      asyncHandler(async (req: AuthenticatedRequest<UpdateNPCRequest>, res: Response) => {
        const updateData: UpdateNPCData = {
          ...(req.body.name !== undefined && { name: req.body.name }),
          ...(req.body.description !== undefined && { description: req.body.description }),
        };

        // If an image file was uploaded, upload it to storage
        if (req.file) {
          // Get the NPC to find its campaignId
          const npc = await this.npcService.getNPC(req.params.npcId);
          const imagePath = await this.imageService.uploadNPCImage(
            req.file.buffer,
            req.file.mimetype,
            npc.campaignId,
            req.params.npcId
          );
          updateData.imagePath = imagePath;
        }

        const updatedNPC = await this.npcService.updateNPC(req.params.npcId, updateData);
        const npcWithUrl = await this.addSignedImageUrlToNPC(updatedNPC);
        res.json(npcWithUrl);
      })
    );

    // Delete an NPC (soft delete)
    router.delete(
      '/:npcId',
      authenticateUser(),
      asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        await this.npcService.deleteNPC(req.params.npcId);
        res.status(StatusCodes.NO_CONTENT).send();
      })
    );
  }

  /**
   * Adds a signed image URL to an NPC object
   * @param npc - The NPC object
   * @returns NPC with imageUrl (signed URL) added
   */
  private async addSignedImageUrlToNPC(npc: NPC): Promise<NPC & { imageUrl?: string }> {
    const npcWithUrl = { ...npc } as NPC & { imageUrl?: string };
    
    if (npc.imagePath) {
      npcWithUrl.imageUrl = await this.imageService.getSignedUrl(npc.imagePath);
    }
    
    return npcWithUrl;
  }
}

