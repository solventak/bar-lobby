// SPDX-FileCopyrightText: 2026 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MapData } from "@main/content/maps/map-data";
import { Faction, GameModeID } from "@main/game/battle/battle-types";

const engineStore = vi.hoisted(() => ({
    selectedEngineVersion: {
        id: "engine-1",
        ais: [{ name: "BARb", shortName: "BARb", version: "1", description: "Beginner AI" }],
        installed: true,
    },
}));
const gameStore = vi.hoisted(() => ({
    selectedGameVersion: {
        gameVersion: "game-1",
        packageMd5: "checksum",
        luaOptionSections: [],
        ais: [],
    },
}));
const db = vi.hoisted(() => ({ maps: { toArray: vi.fn() } }));

vi.mock("@renderer/store/engine.store", () => ({ enginesStore: engineStore }));
vi.mock("@renderer/store/game.store", () => ({ gameStore, startBattle: vi.fn() }));
vi.mock("@renderer/store/db", () => ({ db }));
vi.mock("@renderer/store/me.store", () => ({
    me: { userId: 1, username: "Alex", battleRoomState: { isReady: false, isSpectator: false } },
}));
vi.mock("@renderer/store/maps.store", () => ({ getRandomMap: vi.fn() }));

import { battleActions, battleStore } from "@renderer/store/battle.store";

function map(): MapData {
    return {
        author: "Map author",
        certified: true,
        displayName: "Eligible map",
        filename: "Eligible map.sd7",
        images: { preview: "preview" },
        mapHeight: 8,
        mapLists: [],
        mapWidth: 8,
        playerCountMax: 6,
        playerCountMin: 2,
        springName: "Eligible map",
        startboxesSet: [{ maxPlayersPerStartbox: 3, startboxes: [{ poly: [] }, { poly: [] }] }],
        tags: ["3v3"],
        terrain: [],
        windMax: 0,
        windMin: 0,
    };
}

describe("battleActions.createBeginnerSkirmish", () => {
    beforeEach(() => {
        db.maps.toArray.mockResolvedValue([map()]);
        battleActions.resetToDefaultBattle();
    });

    it("uses Classic initialization before applying a complete beginner 3v3 preset", async () => {
        const result = await battleActions.createBeginnerSkirmish();

        expect(result).toEqual({ ok: true });
        expect(battleStore.battleOptions).toMatchObject({
            engineVersion: "engine-1",
            gameVersion: "game-1",
            gameMode: { id: GameModeID.CLASSIC },
            map: { springName: "Eligible map" },
            mapOptions: { startBoxesIndex: 0 },
        });
        expect(battleStore.teams.map((team) => team.participants)).toHaveLength(2);
        expect(battleStore.teams.map((team) => team.participants.length)).toEqual([3, 3]);
        expect(battleStore.me?.faction).toBe(Faction.Armada);

        const bots = battleStore.teams.flatMap((team) => team.participants.filter((participant) => "aiShortName" in participant));
        expect(bots).toHaveLength(5);
        expect(bots.every((bot) => bot.aiShortName === "BARb" && bot.faction === Faction.Armada && bot.aiOptions.difficultyLevel === 0)).toBe(true);
    });
});
