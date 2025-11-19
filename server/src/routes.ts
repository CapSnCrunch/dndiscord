import { Router } from 'express';
import multer from 'multer';
import { WorldService } from './services/world.service.ts';
import { NPCService } from './services/npc.service.ts';
import { BotService } from './services/bot.service.ts';
import { ImageService } from './services/image.service.ts';
import { WorldController } from './controllers/world.controller.ts';
import { NPCController } from './controllers/npc.controller.ts';
import { BotController } from './controllers/bot.controller.ts';

const router = Router();

// Initialize services
const worldService = new WorldService();
const npcService = new NPCService();
const imageService = new ImageService();
const botService = new BotService(npcService, imageService);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

// World routes
const worldController = new WorldController(worldService);
const worldRouter = Router();
worldController.registerRoutes(worldRouter);
router.use('/worlds', worldRouter);

// NPC routes
const npcController = new NPCController(npcService, imageService);
const npcRouter = Router();
npcController.registerRoutes(npcRouter, upload);
router.use('/npcs', npcRouter);

// Bot routes
const botController = new BotController(botService);
const botRouter = Router();
botController.registerRoutes(botRouter);
router.use('/bots', botRouter);

export default router;

