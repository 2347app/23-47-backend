import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as auth from "../controllers/auth.controller";
import * as users from "../controllers/users.controller";
import * as friends from "../controllers/friends.controller";
import * as messages from "../controllers/messages.controller";
import * as rooms from "../controllers/rooms.controller";
import * as era from "../controllers/era.controller";
import * as ai from "../controllers/ai.controller";
import * as spotify from "../controllers/spotify.controller";
import * as memories from "../controllers/memories.controller";

export const apiRouter: Router = Router();

const wrap =
  (fn: (req: any, res: any) => Promise<unknown> | unknown) =>
  (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res)).catch(next);

// Auth
apiRouter.post("/auth/register", wrap(auth.register));
apiRouter.post("/auth/login", wrap(auth.login));
apiRouter.post("/auth/refresh", wrap(auth.refresh));
apiRouter.post("/auth/logout", authMiddleware, wrap(auth.logout));
apiRouter.get("/auth/me", authMiddleware, wrap(auth.me));

// Users
apiRouter.patch("/users/me", authMiddleware, wrap(users.updateMe));
apiRouter.get("/users/search", authMiddleware, wrap(users.searchUsers));
apiRouter.get("/users/:id", authMiddleware, wrap(users.getUserById));

// Friends
apiRouter.get("/friends", authMiddleware, wrap(friends.listFriends));
apiRouter.post("/friends", authMiddleware, wrap(friends.addFriend));
apiRouter.delete("/friends/:id", authMiddleware, wrap(friends.removeFriend));

// Messages
apiRouter.get("/messages/conversations", authMiddleware, wrap(messages.listConversations));
apiRouter.get("/messages/:userId", authMiddleware, wrap(messages.getConversation));
apiRouter.post("/messages", authMiddleware, wrap(messages.sendMessage));
apiRouter.delete("/messages/:messageId", authMiddleware, wrap(messages.deleteMessage));

// Rooms
apiRouter.get("/rooms/me", authMiddleware, wrap(rooms.getMyRoom));
apiRouter.patch("/rooms/me", authMiddleware, wrap(rooms.updateRoom));
apiRouter.post("/rooms/me/items", authMiddleware, wrap(rooms.addItem));
apiRouter.patch("/rooms/me/items/:itemId", authMiddleware, wrap(rooms.updateItem));
apiRouter.delete("/rooms/me/items/:itemId", authMiddleware, wrap(rooms.removeItem));
apiRouter.get("/rooms/user/:userId", authMiddleware, wrap(rooms.getRoomByUser));

// Eras
apiRouter.get("/eras", wrap(era.listEras));
apiRouter.get("/eras/:id", wrap(era.getEra));
apiRouter.post("/eras/travel", authMiddleware, wrap(era.travel));

// AI
apiRouter.post("/ai/era-experience", authMiddleware, wrap(ai.eraExperience));
apiRouter.post("/ai/nostalgia-recommendations", authMiddleware, wrap(ai.nostalgia));
apiRouter.post("/ai/rebuild-room", authMiddleware, wrap(ai.rebuild));
apiRouter.post("/ai/room/reconstruct", authMiddleware, wrap(ai.reconstruct));
apiRouter.get("/ai/cultural-memories", authMiddleware, wrap(ai.ambientMemories));
apiRouter.get("/ai/nostalgia-packs", authMiddleware, wrap(ai.nostalgiaPacks));
apiRouter.post("/ai/cultural-memories/event", authMiddleware, wrap(ai.trackMemoryEvent));
apiRouter.get("/ai/room/dna", authMiddleware, wrap(ai.getRoomDna));

// Memories
apiRouter.get("/memories", authMiddleware, wrap(memories.listMemories));
apiRouter.post("/memories", authMiddleware, wrap(memories.createMemory));

// Spotify
apiRouter.get("/spotify/login", authMiddleware, wrap(spotify.login));
apiRouter.get("/spotify/authorize", wrap(spotify.authorizeRedirect));
apiRouter.get("/spotify/callback", wrap(spotify.callback));
apiRouter.post("/spotify/disconnect", authMiddleware, wrap(spotify.disconnect));
apiRouter.get("/spotify/current-track", authMiddleware, wrap(spotify.currentTrack));
apiRouter.get("/spotify/playlists", authMiddleware, wrap(spotify.playlists));
apiRouter.get("/spotify/recommendations", authMiddleware, wrap(spotify.recommendations));
