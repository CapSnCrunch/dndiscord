import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes.ts';
import { globalErrorHandler } from './middleware/global-error.middleware.ts';
import logger, { httpLogger } from './lib/logger.ts';
import { DiscordBotService } from './services/discord-bot.service.ts';
import { BotService } from './services/bot.service.ts';
import { NPCService } from './services/npc.service.ts';
import { ImageService } from './services/image.service.ts';

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the configured HTTP logger
app.use(httpLogger);

app.use('/api', routes);

// Global error handling middleware (MUST be last)
app.use(globalErrorHandler);

// Initialize Discord bot
let discordBotService: DiscordBotService | null = null;

async function initializeDiscordBot() {
  const discordBotToken = process.env.DISCORD_BOT_TOKEN;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!discordBotToken) {
    logger.warn('DISCORD_BOT_TOKEN not set, Discord bot will not be started');
    return;
  }

  if (!openaiApiKey) {
    logger.warn('OPENAI_API_KEY not set, Discord bot will not be started');
    return;
  }

  try {
    const npcService = new NPCService();
    const imageService = new ImageService();
    const botService = new BotService(npcService, imageService);
    discordBotService = new DiscordBotService(botService);
    
    // Connect the services so botService can access discordBotService
    botService.setDiscordBotService(discordBotService);
    
    await discordBotService.start(discordBotToken, openaiApiKey);
    logger.info('Discord bot initialized successfully');
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize Discord bot');
  }
}

// Start server
app.listen(port, async () => {
  logger.info(`🚀 Server started on port ${port}`);
  await initializeDiscordBot();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (discordBotService) {
    await discordBotService.stop();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (discordBotService) {
    await discordBotService.stop();
  }
  process.exit(0);
});

