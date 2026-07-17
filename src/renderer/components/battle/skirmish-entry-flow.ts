// SPDX-FileCopyrightText: 2026 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

export type SkirmishEntryState = { step: "entry" } | { step: "custom-modes" };

export type SkirmishEntryEvent = { type: "select-custom" } | { type: "back" } | { type: "reset" };

export const initialSkirmishEntryState: SkirmishEntryState = { step: "entry" };

export function transitionSkirmishEntry(state: SkirmishEntryState, event: SkirmishEntryEvent): SkirmishEntryState {
    if (event.type === "select-custom" && state.step === "entry") {
        return { step: "custom-modes" };
    }

    if (event.type === "back" || event.type === "reset") {
        return initialSkirmishEntryState;
    }

    return state;
}
