import assert from "assert";
import path from "path";

import { compareEventsAndHandlers, loadHandlerFunctions, loadYaml } from "./helpers";

describe("All events are handled", () => {
    it("handles all the events", () => {
        // File paths
        const yamlFilePath = path.join(__dirname, "../config.yaml"); // Path to your YAML file
        const handlersDir = path.join(__dirname, "../src/handlers"); // Path to your handlers directory

        // Load and compare
        const eventHandlers = loadYaml(yamlFilePath);
        const handlerFunctions = loadHandlerFunctions(handlersDir);

        assert.equal(compareEventsAndHandlers(eventHandlers, handlerFunctions), false);
    });
});
