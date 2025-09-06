import type { SandboxClient, SandboxSession } from "@codesandbox/sdk";
import { SandboxClient as SdkSandboxClient } from "@codesandbox/sdk";

// Functional in-memory registry for active sessions -> SandboxClient
// No classes used; simple closures over a Map

export type SessionKey = string; // sessionId

export type SessionRegistry = {
  get: (sessionId: SessionKey) => SandboxClient | undefined;
  set: (sessionId: SessionKey, client: SandboxClient) => void;
  has: (sessionId: SessionKey) => boolean;
  remove: (sessionId: SessionKey) => void;
  disposeAll: () => Promise<void>;
};

export const createSessionRegistry = (): SessionRegistry => {
  const map = new Map<SessionKey, SandboxClient>();

  const get = (sessionId: string) => map.get(sessionId);
  const set = (sessionId: string, client: SandboxClient) => {
    map.set(sessionId, client);
  };
  const has = (sessionId: string) => map.has(sessionId);
  const remove = (sessionId: string) => {
    const c = map.get(sessionId);
    if (c) {
      try {
        c.dispose();
      } catch {}
    }
    map.delete(sessionId);
  };
  const disposeAll = async () => {
    for (const c of map.values()) {
      try {
        c.dispose();
      } catch {}
    }
    map.clear();
  };

  return { get, set, has, remove, disposeAll };
};

// Helper to recreate a SandboxClient from a stored session description
export const resumeSandboxClient = async (
  session: SandboxSession,
  getSession: (id: string) => Promise<SandboxSession>
) => {
  return SdkSandboxClient.create(session, getSession);
};

