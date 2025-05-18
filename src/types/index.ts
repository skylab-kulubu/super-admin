export interface DecodedToken {
  sub: string; // Subject (user identifier)
  roles: string[]; // User roles
  exp: number; // Expiration time
  iat: number; // Issued at
  // Add other fields from your JWT payload as needed
}

export interface User { // This is the user object for AuthContext
  id: string; // or number, depending on what 'sub' from token represents
  email: string; 
  roles: string[];
}

// API specific types
export interface ApiUser {
  id: number;
  username: string;
  roles: string[];
  createdAt: string;
  lastLogin: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  httpStatus: string;
  data: T;
}

export const ALL_ROLES = [
  "ROLE_USER",
  "ROLE_ADMIN",
  "ROLE_BIZBIZE_ADMIN",
  "ROLE_GECEKODU_ADMIN",
  "ROLE_AGC_ADMIN",
] as const;

export type Role = typeof ALL_ROLES[number];

// Represents the ID returned by /photos/addPhoto endpoint's data field
export type PhotoId = number; // This was correctly defined here.

// BizBize Event Specific Types
export interface BizbizeEventPhoto {
  id: number;
  photoUrl: string;
  tenant: "BIZBIZE" | "GECEKODU" | "AGC";
}

export interface BizbizeEvent {
  id: number;
  title: string;
  guestName: string;
  linkedin?: string | null;
  description?: string | null;
  date: string; // Format "dd-MM-yyyy HH:mm"
  photos: BizbizeEventPhoto[];
  type: string; // e.g., "TALK", "WORKSHOP"
  formUrl?: string | null;
  isActive: boolean;
  tenant?: "BIZBIZE";
}

export interface AddBizbizeEventPayload {
  guestName: string;
  title: string;
  date: string; // "dd-MM-yyyy HH:mm"
  linkedin?: string;
  isActive: 0 | 1; // API expects 0 or 1 for addEvent
  tenant: "BIZBIZE";
  type: string;
  description?: string;
  formUrl?: string;
}

// This DTO is used for update, based on backend code.
// It seems to allow partial updates.
export interface UpdateBizbizeEventDto {
  id: number;
  title?: string;
  guestName?: string;
  linkedin?: string | null;
  description?: string | null;
  date?: string; // "dd-MM-yyyy HH:mm"
  type?: string;
  formUrl?: string | null;
  isActive?: boolean; // Backend uses boolean for update DTO
}

export interface ImageUploadResponseData {
  id: number;
  name: string;
  type: string;
  url: string; // This is the URL like "https://api.yildizskylab.com/api/images/getImageByUrl/..."
  createdBy: { 
    id: number;
    username: string;
  };
}

// BizBize Staff Specific Types
export interface BizbizeStaffPhoto {
  id: number; // This would be the photoId used in addStaff
  photoUrl: string;
  tenant: "BIZBIZE" | "GECEKODU" | "AGC";
}

export interface BizbizeStaff {
  id: number;
  firstName: string;
  lastName: string;
  linkedin?: string | null;
  department?: string | null;
  photo?: BizbizeStaffPhoto | null; // The photo object linked to the staff
  tenant: "BIZBIZE";
}

export interface AddStaffPayload {
  firstName: string;
  lastName: string;
  linkedin?: string;
  department?: string;
  photoId?: number | null; // ID from the 'Photos' table after uploading image and creating photo metadata
  tenant: "BIZBIZE";
}

export interface UpdateStaffPayload { // Based on GetStaffDto from backend
  id: number;
  firstName?: string;
  lastName?: string;
  department?: string;
  linkedin?: string;
  // Note: photoId is not part of the update payload as per backend
}

// BizBize Announcement Specific Types
export interface BizbizeAnnouncementPhoto { // If photos were to be used, similar to events
  id: number;
  photoUrl: string;
  tenant: "BIZBIZE" | "GECEKODU" | "AGC";
}

export interface BizbizeAnnouncement {
  id: number;
  title: string;
  description?: string | null; // From API response
  tenant: "BIZBIZE";
  content: string;
  date: string; // Format "dd-MM-yyyy HH:mm"
  type?: string | null; // From API response
  photos?: BizbizeAnnouncementPhoto[]; // From API response
  author?: string; // From API response
  formUrl?: string | null; // From API response
  isActive: boolean;
}

export interface AddAnnouncementPayload {
  title: string;
  content: string;
  tenant: "BIZBIZE";
  date: string; // "dd-MM-yyyy HH:mm"
  isActive: boolean;
}

export interface UpdateAnnouncementPayload { // Based on GetAnnouncementDto from backend
  id: number;
  title?: string;
  content?: string;
  // isActive and date are not in the provided update DTO
}

// GeceKodu Event Specific Types
export interface GecekoduEvent {
  id: number;
  title: string;
  description?: string | null;
  date: string; // Format "dd-MM-yyyy HH:mm"
  isActive: boolean;
  photos?: BizbizeEventPhoto[]; // Reusing BizbizeEventPhoto as structure is likely same
  type?: string | null;
  formUrl?: string | null;
  tenant?: "GECEKODU";
  // guestName is not present for Gecekodu events
}

export interface AddGecekoduEventPayload {
  title: string;
  description?: string;
  date: string; // "dd-MM-yyyy HH:mm"
  linkedin?: string; // Kept from CreateEventDto, though GetEventDto doesn't show it. Confirm if needed.
  isActive: boolean; // CreateEventDto uses boolean
  tenant: "GECEKODU";
  type?: string;
  formUrl?: string;
  // guestName is omitted
}

export interface UpdateGecekoduEventPayload { // Based on GetEventDto structure for GeceKodu
  id: number;
  title?: string;
  description?: string;
  date?: string; // "dd-MM-yyyy HH:mm"
  isActive?: boolean;
  type?: string;
  formUrl?: string;
  // photos are usually managed via separate endpoints
}

// GeceKodu Staff Specific Types (largely same as BizBize, just different tenant)
export interface GecekoduStaffPhoto extends BizbizeStaffPhoto {
  tenant: "GECEKODU";
}

export interface GecekoduStaff {
  id: number;
  firstName: string;
  lastName: string;
  linkedin?: string | null;
  department?: string | null;
  photo?: GecekoduStaffPhoto | null;
  tenant: "GECEKODU";
}

export interface AddGecekoduStaffPayload extends Omit<AddStaffPayload, 'tenant'> {
  tenant: "GECEKODU";
}

export interface UpdateGecekoduStaffPayload extends UpdateStaffPayload {
  // id is already in UpdateStaffPayload
  // tenant is usually part of the route or identified by auth, not in payload for update
}

// GeceKodu Announcement Specific Types (largely same as BizBize, just different tenant)
export interface GecekoduAnnouncement extends Omit<BizbizeAnnouncement, 'tenant' | 'photos'> {
  tenant: "GECEKODU";
  photos?: BizbizeAnnouncementPhoto[]; // Reusing BizbizeAnnouncementPhoto
}

export interface AddGecekoduAnnouncementPayload extends Omit<AddAnnouncementPayload, 'tenant'> {
  tenant: "GECEKODU";
}

export interface UpdateGecekoduAnnouncementPayload extends UpdateAnnouncementPayload {
  // id, title, content are already in UpdateAnnouncementPayload
}

// AGC Event Specific Types
export interface AgcEvent extends Omit<GecekoduEvent, 'tenant'> { // Assuming same structure as GecekoduEvent (no guestName)
  tenant?: "AGC";
}

export interface AddAgcEventPayload extends Omit<AddGecekoduEventPayload, 'tenant'> {
  tenant: "AGC";
}

export interface UpdateAgcEventPayload extends Omit<UpdateGecekoduEventPayload, 'id'> { // id is part of the base
  id: number;
  // tenant is usually part of the route or identified by auth, not in payload for update
}

// AGC Staff Specific Types
export interface AgcStaffPhoto extends BizbizeStaffPhoto {
  tenant: "AGC";
}

export interface AgcStaff extends Omit<GecekoduStaff, 'tenant' | 'photo'> {
  tenant: "AGC";
  photo?: AgcStaffPhoto | null;
}

export interface AddAgcStaffPayload extends Omit<AddGecekoduStaffPayload, 'tenant'> {
  tenant: "AGC";
}

export interface UpdateAgcStaffPayload extends UpdateGecekoduStaffPayload {
  // id is already in UpdateGecekoduStaffPayload
}

// AGC Announcement Specific Types
export interface AgcAnnouncement extends Omit<GecekoduAnnouncement, 'tenant'> {
  tenant: "AGC";
}

export interface AddAgcAnnouncementPayload extends Omit<AddGecekoduAnnouncementPayload, 'tenant'> {
  tenant: "AGC";
}

export interface UpdateAgcAnnouncementPayload extends UpdateGecekoduAnnouncementPayload {
  // id, title, content are already in UpdateGecekoduAnnouncementPayload
}

export interface PhotoMetadata {
    id: string;
    photoUrl: string;
    tenant: string;
  }
