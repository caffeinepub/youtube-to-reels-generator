import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Clip {
    id: string;
    title: string;
    voiceoverScript: string;
    createdAt: Time;
    description: string;
    imageUrl: string;
}
export type Time = bigint;
export interface backendInterface {
    createClip(id: string, title: string, description: string): Promise<Clip>;
    deleteClip(id: string): Promise<void>;
    getAllClips(): Promise<Array<Clip>>;
    getClip(id: string): Promise<Clip>;
    updateClipContent(id: string, voiceoverScript: string, imageUrl: string): Promise<void>;
}
