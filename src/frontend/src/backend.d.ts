import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PublicArtistProfile {
    id: bigint;
    bio: string;
    createdAt: bigint;
    publicSiteUsername: string;
    website: string;
}
export interface PublicArtwork {
    id: bigint;
    title: string;
    createdAt: bigint;
    sold: boolean;
    description: string;
    imageUrl: string;
    artist: PublicArtistProfile;
    price: bigint;
}
export interface Artwork {
    id: bigint;
    title: string;
    createdAt: bigint;
    sold: boolean;
    description: string;
    imageUrl: string;
    artist: ArtistProfile;
    price: bigint;
}
export interface SubmissionResult {
    submissionId: bigint;
}
export interface ArtworkSubmission {
    id: bigint;
    status: SubmissionStatus;
    submittedAt: bigint;
    reviewedAt?: bigint;
    artwork: Artwork;
    artistPrincipal: Principal;
    artist: ArtistProfile;
}
export interface PurchaseInquiry {
    id: bigint;
    artworkId: bigint;
    buyerEmail: string;
    createdAt: bigint;
    artwork: Artwork;
    message: string;
    buyerName: string;
}
export interface UserProfile {
    bio: string;
    name: string;
    email?: string;
    avatar?: string;
}
export interface ArtistProfile {
    id: bigint;
    bio: string;
    createdAt: bigint;
    publicSiteUsername: string;
    website: string;
    profileName: string;
}
export enum SubmissionStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveSubmission(submissionId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createArtistProfile(profileName: string, publicSiteUsername: string, bio: string, website: string): Promise<void>;
    createPurchaseInquiry(artworkId: bigint, buyerName: string, buyerEmail: string, message: string): Promise<void>;
    deleteArtwork(artworkId: bigint): Promise<void>;
    editArtwork(artworkId: bigint, newTitle: string, newDescription: string, newImageUrl: string, newPrice: bigint): Promise<void>;
    getAllPurchaseInquiries(): Promise<Array<PurchaseInquiry>>;
    getAllSubmissions(): Promise<Array<ArtworkSubmission>>;
    getArtistProfileByCaller(): Promise<ArtistProfile>;
    getArtistProfiles(): Promise<Array<PublicArtistProfile>>;
    getArtworkById(artworkId: bigint): Promise<PublicArtwork>;
    getArtworks(): Promise<Array<PublicArtwork>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInquiriesByArtwork(artworkId: bigint): Promise<Array<PurchaseInquiry>>;
    getPurchaseInquiry(inquiryId: bigint): Promise<PurchaseInquiry>;
    getSubmissionsByCaller(): Promise<Array<ArtworkSubmission>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectSubmission(submissionId: bigint): Promise<void>;
    replaceDataset(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitArtwork(title: string, description: string, imageUrl: string, price: bigint): Promise<SubmissionResult>;
    toggleArtworkSoldStatus(artworkId: bigint): Promise<void>;
    updateArtistProfile(newProfileName: string, newPublicSiteUsername: string, newBio: string, newWebsite: string): Promise<void>;
}
