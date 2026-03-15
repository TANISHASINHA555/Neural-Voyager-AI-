export interface NeuralStats {
  dopamine: number;
  serotonin: number;
  heartRate: number;
  synapticActivity: number;
  oxygenLevel: number;
}

export interface SimulationParams {
  focusRegion: string;
  nearbyRegions: string[];
  activityType: 'burst' | 'flow' | 'pulse' | 'static';
  intensity: number;
  primaryColor: string;
  cameraPosition: [number, number, number];
}

export interface Message {
  id: string;
  role: 'user' | 'agent';
  text?: string;
  simulationParams?: SimulationParams;
  timestamp: number;
}
