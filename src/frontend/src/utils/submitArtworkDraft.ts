const DRAFT_STORAGE_KEY = 'zart_submit_artwork_draft';

export interface SubmitArtworkDraft {
  title: string;
  description: string;
  price: string;
  imagePreview: string | null;
}

export function loadDraft(): SubmitArtworkDraft | null {
  try {
    const stored = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Validate the structure
    if (typeof parsed !== 'object' || parsed === null) return null;
    
    return {
      title: typeof parsed.title === 'string' ? parsed.title : '',
      description: typeof parsed.description === 'string' ? parsed.description : '',
      price: typeof parsed.price === 'string' ? parsed.price : '',
      imagePreview: typeof parsed.imagePreview === 'string' ? parsed.imagePreview : null,
    };
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

export function saveDraft(draft: SubmitArtworkDraft): void {
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}
