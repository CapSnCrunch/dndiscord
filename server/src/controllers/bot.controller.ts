import { Router, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.ts';
import { authenticateUser } from '../middleware/auth.middleware.ts';
import { asyncHandler } from '../middleware/global-error.middleware.ts';
import type { Bot, BotService, CreateBotData, UpdateBotData, CreateBotResult } from '../services/bot.service.ts';
import {
  AuthenticationException,
  ValidationException,
  NotFoundException,
  AuthorizationException,
} from '../exceptions/AppException.ts';

export interface CreateBotRequest {
  name: string;
  description?: string;
  discordServerId: string;
  discordChannelId?: string;
  worldId: string;
  npcId: string;
}

export interface UpdateBotRequest {
  name?: string;
  description?: string;
  discordServerId?: string;
  discordChannelId?: string;
  worldId?: string;
  npcId?: string;
}

export class BotController {
  private botService: BotService;

  constructor(botService: BotService) {
    this.botService = botService;
  }

  /**
   * Register all bot-related routes
   * @param router - Express Router instance
   */
  registerRoutes(router: Router): void {
    // Create a new bot
    router.post(
      '/',
      authenticateUser(),
      asyncHandler(async (req: AuthenticatedRequest<CreateBotRequest>, res: Response) => {
        if (!req.body.name || !req.body.name.trim()) {
          throw new ValidationException('Bot name is required');
        }
        if (!req.body.discordServerId || !req.body.discordServerId.trim()) {
          throw new ValidationException('Discord server ID is required');
        }
        if (!req.body.worldId) {
          throw new ValidationException('World ID is required');
        }
        if (!req.body.npcId) {
          throw new ValidationException('NPC ID is required');
        }

        const result: CreateBotResult = await this.botService.createBot({
          name: req.body.name.trim(),
          description: req.body.description,
          discordServerId: req.body.discordServerId.trim(),
          discordChannelId: req.body.discordChannelId?.trim(),
          worldId: req.body.worldId,
          npcId: req.body.npcId,
          userId: req.userId!,
        });

        res.status(StatusCodes.CREATED).json({ id: result.id, inviteUrl: result.inviteUrl });
      })
    );

    // Get all bots for the authenticated user
    router.get(
      '/',
      authenticateUser(),
      asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const bots = await this.botService.getBots(req.userId!);
        res.json(bots);
      })
    );

    // Get a single bot by ID
    router.get(
      '/:botId',
      authenticateUser(),
      asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const bot = await this.validateBotOwnership(req.params.botId, req.userId!);
        res.json(bot);
      })
    );

    // Update a bot
    router.patch(
      '/:botId',
      authenticateUser(),
      asyncHandler(async (req: AuthenticatedRequest<UpdateBotRequest>, res: Response) => {
        await this.validateBotOwnership(req.params.botId, req.userId!);

        const updateData: UpdateBotData = {
          ...(req.body.name !== undefined && { name: req.body.name }),
          ...(req.body.description !== undefined && { description: req.body.description }),
          ...(req.body.discordServerId !== undefined && { discordServerId: req.body.discordServerId }),
          ...(req.body.discordChannelId !== undefined && { discordChannelId: req.body.discordChannelId }),
          ...(req.body.worldId !== undefined && { worldId: req.body.worldId }),
          ...(req.body.npcId !== undefined && { npcId: req.body.npcId }),
        };

        const updatedBot = await this.botService.updateBot(req.params.botId, updateData);
        res.json(updatedBot);
      })
    );

    // Delete a bot
    router.delete(
      '/:botId',
      authenticateUser(),
      asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        await this.validateBotOwnership(req.params.botId, req.userId!);
        await this.botService.deleteBot(req.params.botId);
        res.status(StatusCodes.NO_CONTENT).send();
      })
    );
  }

  /**
   * Validates that a bot exists and the user owns it.
   * @param botId - The ID of the bot to validate
   * @param userId - The ID of the user to check ownership
   * @returns The bot if validation succeeds
   * @throws AuthenticationException if userId is missing
   * @throws ValidationException if botId is missing
   * @throws NotFoundException if bot is not found
   * @throws AuthorizationException if user doesn't own the bot
   */
  private async validateBotOwnership(botId: string, userId: string): Promise<Bot> {
    if (!userId) {
      throw new AuthenticationException('User ID is required');
    }

    if (!botId) {
      throw new ValidationException('Bot ID is required');
    }

    const bot = await this.botService.getBot(botId);
    if (!bot) {
      throw new NotFoundException('Bot not found');
    }

    if (bot.userId !== userId) {
      throw new AuthorizationException('Access denied');
    }

    return bot;
  }
}

