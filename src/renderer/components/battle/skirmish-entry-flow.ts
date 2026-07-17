// SPDX-FileCopyrightText: 2026 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

export type SkirmishEntryState =
    | { step: "entry" }
    | { step: "custom-modes" }
    | { step: "preparing-quick-start" }
    | { step: "quick-start-error"; message: string };

export type SkirmishEntryEvent =
    | { type: "select-custom" }
    | { type: "select-quick-start" }
    | { type: "quick-start-failed"; message: string }
    | { type: "retry-quick-start" }
    | { type: "back" }
    | { type: "reset" };

export const initialSkirmishEntryState: SkirmishEntryState = { step: "entry" };

export function transitionSkirmishEntry(state: SkirmishEntryState, event: SkirmishEntryEvent): SkirmishEntryState {
    if (event.type === "select-custom" && state.step === "entry") {
        return { step: "custom-modes" };
    }

    if ((event.type === "select-quick-start" && state.step === "entry") || (event.type === "retry-quick-start" && state.step === "quick-start-error")) {
        return { step: "preparing-quick-start" };
    }

    if (event.type === "quick-start-failed" && state.step === "preparing-quick-start") {
        return { step: "quick-start-error", message: event.message };
    }

    if (event.type === "back" || event.type === "reset") {
        return initialSkirmishEntryState;
    }

    return state;
}
