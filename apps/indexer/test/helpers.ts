import fs from "fs";
import path from "path";
import * as yaml from "yaml";

type Contract = {
    handler: string;
    events: { event: string; name: string }[];
};

/**
 * Load events from the config YAML file
 * @param filePath Path to the YAML file
 * @returns Record of handler file names and their corresponding events
 */
export const loadYaml = (filePath: string): Record<string, string[]> => {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = yaml.parse(fileContents) as {
        contracts: Contract[];
    };

    const eventHandlers: Record<string, string[]> = {};

    data.contracts.forEach((contract: Contract) => {
        const handlerFile = path.basename(contract.handler); // Get handler file name
        eventHandlers[handlerFile] = contract.events.map(
            (event) => event.name || (event.event.split("(")[0] as string).trim(),
        );
    });
    return eventHandlers;
};

/**
 * Load handler functions from the handler directory
 * @param handlerDir Path to the handler directory
 * @returns Record of handler file names and their corresponding handler functions
 */
export const loadHandlerFunctions = (handlerDir: string): Record<string, string[]> => {
    const handlerFunctions: Record<string, string[]> = {};

    const handlerFiles = fs.readdirSync(handlerDir);

    handlerFiles.forEach((file) => {
        const filePath = path.join(handlerDir, file);
        const fileContents: string = fs.readFileSync(filePath, "utf8");

        const handlerRegex = /\.([A-Za-z0-9_]+)\.handler/g;
        const handlers: string[] = [];
        let match;
        while ((match = handlerRegex.exec(fileContents)) !== null) {
            handlers.push(match[1] as string); // Capture handler name
        }

        handlerFunctions[file] = handlers;
    });

    return handlerFunctions;
};

/**
 * Compare events and handler functions to check if all events are handled, log missing handlers
 * @param eventHandlers events from the config YAML file
 * @param handlerFunctions handler functions from the handler directory
 * @returns boolean indicating if there are missing handlers
 */
export const compareEventsAndHandlers = (
    eventHandlers: Record<string, string[]>,
    handlerFunctions: Record<string, string[]>,
): boolean => {
    let areMissingHandlers: boolean = false;

    Object.keys(eventHandlers).forEach((handlerFile) => {
        const events = eventHandlers[handlerFile] as string[];
        const functions = handlerFunctions[handlerFile] || [];

        const missingHandlers = events.filter((event) => !functions.includes(event));

        if (missingHandlers.length > 0) {
            console.log(`Missing handlers in ${handlerFile}:`, missingHandlers);
            areMissingHandlers = true;
        } else {
            console.log(`All events in ${handlerFile} are handled.`);
        }
    });
    return areMissingHandlers;
};
