// SPDX-FileCopyrightText: 2026 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { describe, expect, it } from "vitest";
import { initialSkirmishEntryState, transitionSkirmishEntry } from "@renderer/components/battle/skirmish-entry-flow";

describe("skirmish entry flow", () => {
    it("starts at the quick-start or custom choice", () => {
        expect(initialSkirmishEntryState).toEqual({ step: "entry" });
    });

    it("drills into custom mode selection", () => {
        expect(transitionSkirmishEntry(initialSkirmishEntryState, { type: "select-custom" })).toEqual({ step: "custom-modes" });
    });

    it("returns from custom modes to the entry choice", () => {
        expect(transitionSkirmishEntry({ step: "custom-modes" }, { type: "back" })).toEqual({ step: "entry" });
    });

    it("shows preparation while Quick Start is being created", () => {
        expect(transitionSkirmishEntry(initialSkirmishEntryState, { type: "select-quick-start" })).toEqual({ step: "preparing-quick-start" });
    });

    it("keeps a failed Quick Start in the selector and allows retry", () => {
        const failed = transitionSkirmishEntry({ step: "preparing-quick-start" }, { type: "quick-start-failed", message: "No eligible maps" });
        expect(failed).toEqual({ step: "quick-start-error", message: "No eligible maps" });
        expect(transitionSkirmishEntry(failed, { type: "retry-quick-start" })).toEqual({ step: "preparing-quick-start" });
    });

    it("resets a nested flow when the overlay closes", () => {
        expect(transitionSkirmishEntry({ step: "custom-modes" }, { type: "reset" })).toEqual({ step: "entry" });
    });
});
