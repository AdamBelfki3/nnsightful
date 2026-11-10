/**
 * Data types for the generate tool (a chat reply or a text's continuation)
 */

export interface GenerationData {
    input_ids: number[];
    completion_ids: number[];
    completion: string[];
    text: string;
    finish_reason: "stop" | "length";
    /** A chat reply's thinking, kept apart from its text (gpt-oss's analysis channel, or a `<think>` block). */
    reasoning?: string | null;
}
