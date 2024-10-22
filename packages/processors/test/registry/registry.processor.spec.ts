import { afterEach, describe, expect, it, vi } from "vitest";

import type { ChainId, ProtocolEvent, RegistryEvent } from "@grants-stack-indexer/shared";

import { ProcessorDependencies, UnsupportedEventException } from "../../src/internal.js";
import { ProfileCreatedHandler } from "../../src/registry/handlers/profileCreated.handler.js";
import { RoleGrantedHandler } from "../../src/registry/handlers/roleGranted.handler.js";
import { RegistryProcessor } from "../../src/registry/registry.processor.js";

// Mock the handlers and their handle methods
vi.mock("../../src/registry/handlers/roleGranted.handler.js", () => {
    const RoleGrantedHandler = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    RoleGrantedHandler.prototype.handle = vi.fn();
    return {
        RoleGrantedHandler,
    };
});

// Mock the handlers and their handle methods
vi.mock("../../src/registry/handlers/profileCreated.handler.js", () => {
    const ProfileCreatedHandler = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ProfileCreatedHandler.prototype.handle = vi.fn();
    return {
        ProfileCreatedHandler,
    };
});

describe("RegistryProcessor", () => {
    const chainId: ChainId = 10 as ChainId; // Replace with appropriate chainId
    const dependencies: ProcessorDependencies = {} as ProcessorDependencies; // Replace with actual dependencies

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should throw UnsupportedEventException for unsupported events", async () => {
        const event: ProtocolEvent<"Registry", RegistryEvent> = {
            eventName: "UnsupportedEvent",
        } as unknown as ProtocolEvent<"Registry", RegistryEvent>;

        const processor = new RegistryProcessor(chainId, dependencies);

        await expect(processor.process(event)).rejects.toThrow(UnsupportedEventException);
    });

    it("should call ProfileCreatedHandler", async () => {
        const event: ProtocolEvent<"Registry", "ProfileCreated"> = {
            eventName: "ProfileCreated",
        } as ProtocolEvent<"Registry", "ProfileCreated">;

        vi.spyOn(ProfileCreatedHandler.prototype, "handle").mockResolvedValue([]);

        const processor = new RegistryProcessor(chainId, dependencies);
        const result = await processor.process(event);

        expect(ProfileCreatedHandler.prototype.handle).toHaveBeenCalled();
        expect(result).toEqual([]); // Check if handle returns []
    });

    it("should call RoleGrantedHandler", async () => {
        const event: ProtocolEvent<"Registry", "RoleGranted"> = {
            eventName: "RoleGranted",
        } as ProtocolEvent<"Registry", "RoleGranted">;

        vi.spyOn(RoleGrantedHandler.prototype, "handle").mockResolvedValue([]);

        const processor = new RegistryProcessor(chainId, dependencies);
        const result = await processor.process(event);

        expect(RoleGrantedHandler.prototype.handle).toHaveBeenCalled();
        expect(result).toEqual([]); // Check if handle returns []
    });
});
