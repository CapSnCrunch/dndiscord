import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.ts';
import { authenticateUser } from '../middleware/auth.middleware.ts';
import { asyncHandler } from '../middleware/global-error.middleware.ts';
import type { World, WorldService, CreateWorldData, UpdateWorldData } from '../services/world.service.ts';
import {
  AuthenticationException,
  ValidationException,
  NotFoundException,
  AuthorizationException,
} from '../exceptions/AppException.ts';

export interface CreateWorldRequest {
  name: string;
  description: string;
}

export interface UpdateWorldRequest {
  name?: string;
  description?: string;
}

export class WorldController {
  private worldService: WorldService;

  constructor(worldService: WorldService) {
    this.worldService = worldService;
  }

  /**
   * Register all world-related routes
   * @param router - Express Router instance
   */
  registerRoutes(router: Router): void {
    // Create a new world
    router.post(
      '/',
      authenticateUser(),
      asyncHandler(async (req: AuthenticatedRequest<CreateWorldRequest>, res) => {
        if (!req.body.name || !req.body.name.trim()) {
          throw new ValidationException('World name is required');
        }

        const worldId = await this.worldService.createWorld({
          name: req.body.name.trim(),
          description: req.body.description || '',
          userId: req.userId!,
        });

        res.status(StatusCodes.CREATED).json({ id: worldId });
      })
    );

    // Get all worlds for the authenticated user
    router.get(
      '/',
      authenticateUser(),
      asyncHandler(async (req: AuthenticatedRequest, res) => {
        const worlds = await this.worldService.getWorlds(req.userId!);
        res.json(worlds);
      })
    );

    // Get a single world by ID
    router.get(
      '/:worldId',
      authenticateUser(),
      asyncHandler(async (req: AuthenticatedRequest, res) => {
        const world = await this.validateWorldOwnership(req.params.worldId, req.userId!);
        res.json(world);
      })
    );

    // Update a world
    router.patch(
      '/:worldId',
      authenticateUser(),
      asyncHandler(async (req: AuthenticatedRequest<UpdateWorldRequest>, res) => {
        await this.validateWorldOwnership(req.params.worldId, req.userId!);

        const updateData: UpdateWorldData = {
          ...(req.body.name !== undefined && { name: req.body.name }),
          ...(req.body.description !== undefined && { description: req.body.description }),
        };

        const updatedWorld = await this.worldService.updateWorld(req.params.worldId, updateData);
        res.json(updatedWorld);
      })
    );
  }

  /**
   * Validates that a world exists and the user owns it.
   * @param worldId - The ID of the world to validate
   * @param userId - The ID of the user to check ownership
   * @returns The world if validation succeeds
   * @throws AuthenticationException if userId is missing
   * @throws ValidationException if worldId is missing
   * @throws NotFoundException if world is not found
   * @throws AuthorizationException if user doesn't own the world
   */
  private async validateWorldOwnership(worldId: string, userId: string): Promise<World> {
    if (!userId) {
      throw new AuthenticationException('User ID is required');
    }

    if (!worldId) {
      throw new ValidationException('World ID is required');
    }

    const world = await this.worldService.getWorld(worldId);
    if (!world) {
      throw new NotFoundException('World not found');
    }

    if (world.userId !== userId) {
      throw new AuthorizationException('Access denied');
    }

    return world;
  }
}

