export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Service {
  _id: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  image?: string | null;
  tags: string[];
  availability: string;
  location?: string;
  isActive: boolean;
  providerId?: {
    _id: string;
    businessName: string;
    rating: number;
    totalReviews: number;
    isVerified: boolean;
  };
  categoryId?: {
    _id: string;
    name: string;
  };
}

export interface RecommendedItem {
  id: string;
  title: string;
  reason: string;
}

export interface ChatResponse {
  intent: string;
  followUpQuestions: string[];
  recommendedProviders: RecommendedItem[];
  finalMessage: string;
  services: Service[];
}

export interface AssistantTurn {
  role: "assistant";
  content: string;
  followUpQuestions: string[];
  recommendedProviders: RecommendedItem[];
  providers: Service[];
}

export interface UserTurn {
  role: "user";
  content: string;
}

export type Turn = UserTurn | AssistantTurn;

// Keep Provider as alias so nothing else breaks
export type Provider = Service;
