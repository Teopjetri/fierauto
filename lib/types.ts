export type FuelType = "Benzina" | "Diesel" | "Ibrido" | "Elettrico";

export type CarShotType =
  | "threeQuarter"
  | "front"
  | "side"
  | "rear"
  | "interior"
  | "steering"
  | "headlights"
  | "wheels"
  | "dashboard";

export type PhotoOrientation = "portrait" | "landscape" | "square";

export interface CarPhoto {
  src: string;
  type: CarShotType;
  alt: string;
  orientation?: PhotoOrientation;
  focus?: "center" | "top" | "bottom" | "left" | "right";
}

export interface Car {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel: FuelType;
  transmission: string;
  mileage: number;
  power: string;
  color: string;
  featured: boolean;
  description: string;
  specifications: Record<string, string>;
  features: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
}
