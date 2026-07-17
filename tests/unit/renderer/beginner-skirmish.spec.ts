// SPDX-FileCopyrightText: 2026 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { describe, expect, it } from "vitest";
import type { GameAI } from "@main/content/game/game-version";
import type { MapData } from "@main/content/maps/map-data";
import { Faction, type Player } from "@main/game/battle/battle-types";
import { createBeginnerSkirmishTeams, getEligibleBeginnerSkirmishMaps } from "@renderer/utils/beginner-skirmish";

const player = {
    id: 1,
    name: "Alex",
    user: { userId: 1, username: "Alex" },
    contentSyncState: { engine: 1, game: 1, map: 1 },
    inGame: false,
} as unknown as Player;

const barbAi = {
    name: "BARb",
    shortName: "BARb",
    description: "Beginner AI",
} satisfies GameAI;

function map(overrides: Partial<MapData> = {}): MapData {
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
        ...overrides,
    };
}

describe("beginner skirmish preset", () => {
    it("keeps only 3v3 maps with a two-team, three-player start-box preset", () => {
        const eligible = map();
        const tooManyTeams = map({
            springName: "Four teams",
            startboxesSet: [{ maxPlayersPerStartbox: 3, startboxes: [{ poly: [] }, { poly: [] }, { poly: [] }, { poly: [] }] }],
        });
        const tooSmall = map({ springName: "Small boxes", startboxesSet: [{ maxPlayersPerStartbox: 2, startboxes: [{ poly: [] }, { poly: [] }] }] });
        const tooFewPlayers = map({ springName: "Four players", playerCountMax: 4 });
        const wrongMode = map({ springName: "1v1", tags: ["1v1"] });

        expect(getEligibleBeginnerSkirmishMaps([eligible, tooManyTeams, tooSmall, tooFewPlayers, wrongMode])).toEqual([{ map: eligible, startBoxesIndex: 0 }]);
    });

    it("creates one player and five equally configured Armada BARb bots in a 3v3", () => {
        let nextParticipantId = 2;
        const teams = createBeginnerSkirmishTeams({
            player,
            ai: barbAi,
            nextParticipantId: () => nextParticipantId++,
        });

        expect(teams).toHaveLength(2);
        expect(teams[0].participants).toHaveLength(3);
        expect(teams[1].participants).toHaveLength(3);
        expect(teams[0].participants[0]).toMatchObject({ id: player.id, faction: Faction.Armada });

        const bots = teams.flatMap((team) => team.participants.filter((participant) => "aiShortName" in participant));
        expect(bots).toHaveLength(5);
        expect(bots).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    aiShortName: "BARb",
                    faction: Faction.Armada,
                    aiOptions: { difficultyLevel: 0 },
                    host: player.id,
                }),
            ])
        );
        expect(new Set(bots.map((bot) => bot.id)).size).toBe(5);
    });
});
