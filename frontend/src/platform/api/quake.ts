import { requestHubApi } from "./client";
import type {
  HubQUAKEEntry,
  HubQUAKECompleteResponse,
  HubQUAKEDailyStatus,
  HubQUAKEStartResponse,
  HubQUAKEWeeklyLeaderboard,
  HubQUAKEProfile,
  HubQUAKERunPayload
} from "../types";

export const hubQUAKEApi = {
  async getLeaderboard(limit = 24, difficulty?: "easy" | "medium" | "hard") {
    return requestHubApi<HubQUAKEWeeklyLeaderboard>({
      method: "GET",
      path: "/quake/leaderboard",
      query: { difficulty, limit }
    });
  },
  async getLegacyLeaderboard(limit = 24) {
    return requestHubApi<HubQUAKEEntry[]>({
      method: "GET",
      path: "/quake/leaderboard",
      query: { legacy: true, limit }
    });
  },
  async getDailyStatus(token: string) {
    return requestHubApi<HubQUAKEDailyStatus>({
      method: "GET",
      path: "/quake/daily-status",
      token
    });
  },
  async getProfile(token: string) {
    return requestHubApi<HubQUAKEProfile>({
      method: "GET",
      path: "/quake/profile",
      token
    });
  },
  async startGame(token: string, difficulty: "easy" | "medium" | "hard") {
    return requestHubApi<HubQUAKEStartResponse>({
      body: { difficulty },
      method: "POST",
      path: "/quake/start",
      token
    });
  },
  async completeGame(
    token: string,
    payload: {
      cardsUsed: number;
      finalTotal: number;
      gameSessionId: string;
    }
  ) {
    return requestHubApi<HubQUAKECompleteResponse>({
      body: payload,
      method: "POST",
      path: "/quake/complete",
      token
    });
  },
  async saveRun(token: string, payload: HubQUAKERunPayload) {
    return requestHubApi<HubQUAKEEntry>({
      body: payload,
      method: "POST",
      path: "/quake/run",
      token
    });
  }
};
