// SPDX-FileCopyrightText: 2026 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import type { GameAI } from "@main/content/game/game-version";
import type { MapData } from "@main/content/maps/map-data";
import { Faction, type Bot, type Player, type Team } from "@main/game/battle/battle-types";

const PLAYERS_PER_TEAM = 3;
const TOTAL_PARTICIPANTS = PLAYERS_PER_TEAM * 2;
export const BEGINNER_SKIRMISH_AI_SHORT_NAME = "BARb";
const BEGINNER_DIFFICULTY_LEVEL = 0;

export type EligibleBeginnerSkirmishMap = {
    map: MapData;
    startBoxesIndex: number;
};

export function getEligibleBeginnerSkirmishMaps(maps: MapData[]): EligibleBeginnerSkirmishMap[] {
    return maps.flatMap((map) => {
        if (!map.tags.includes("3v3") || map.playerCountMin > TOTAL_PARTICIPANTS || map.playerCountMax < TOTAL_PARTICIPANTS) {
            return [];
        }

        return map.startboxesSet.flatMap((startBoxes, startBoxesIndex) => {
            const isEligible = startBoxes.startboxes.length === 2 && startBoxes.maxPlayersPerStartbox >= PLAYERS_PER_TEAM;
            return isEligible ? [{ map, startBoxesIndex }] : [];
        });
    });
}

export function selectBeginnerSkirmishMap(
    maps: MapData[],
    random: () => number = Math.random
): EligibleBeginnerSkirmishMap | undefined {
    const eligibleMaps = getEligibleBeginnerSkirmishMaps(maps);
    return eligibleMaps[Math.floor(random() * eligibleMaps.length)];
}

export function createBeginnerSkirmishTeams({
    player,
    ai,
    nextParticipantId,
}: {
    player: Player;
    ai: GameAI;
    nextParticipantId: () => number;
}): Team[] {
    const playerWithFaction = { ...player, faction: Faction.Armada };
    let botNumber = 1;
    const createBot = (): Bot => ({
        id: nextParticipantId(),
        name: `${ai.name} ${botNumber++}`,
        aiShortName: ai.shortName,
        host: player.id,
        aiOptions: { difficultyLevel: BEGINNER_DIFFICULTY_LEVEL },
        faction: Faction.Armada,
    });

    return [
        { participants: [playerWithFaction, createBot(), createBot()] },
        { participants: [createBot(), createBot(), createBot()] },
    ];
}
