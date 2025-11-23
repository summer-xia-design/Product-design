export enum DesignStyle {
  REALISTIC = 'Photorealistic, Studio Lighting, 4K, High Detail',
  MINIMALIST = 'Dieter Rams Style, Matte White, Clean Lines, Soft Shadows',
  CYBERPUNK = 'Neon Lights, Dark Background, Glossy Tech Materials, Futuristic',
  SKETCHY = 'Marker Render Style, Alcohol Markers, Design Sketch, Dynamic Lines',
  WOODEN = 'Bent Plywood, Scandinavian Design, Warm Lighting, Natural Textures',
  TRANSPARENT = 'Translucent Polycarbonate, Internal Components Visible, Tech Aesthetic'
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  resultImage: string | null;
}

export interface ImageFile {
  file: File;
  preview: string;
  base64: string;
}
