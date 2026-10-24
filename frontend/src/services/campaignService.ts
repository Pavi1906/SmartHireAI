import { apiClient } from './api';
import { Campaign } from '../types/recruiter';

export interface CampaignCreate {
  name: string;
  jobId?: string;
  criteria?: any;
  status?: string;
  results?: string[];
}

export interface CampaignUpdate {
  name?: string;
  jobId?: string;
  criteria?: any;
  status?: string;
  results?: string[];
}

export const campaignService = {
  listCampaigns: async (): Promise<Campaign[]> => {
    const response = await apiClient.get('/campaigns');
    return response.data;
  },

  getCampaign: async (id: string): Promise<Campaign> => {
    const response = await apiClient.get(`/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (data: CampaignCreate): Promise<Campaign> => {
    const response = await apiClient.post('/campaigns', data);
    return response.data;
  },

  updateCampaign: async (id: string, data: CampaignUpdate): Promise<Campaign> => {
    const response = await apiClient.put(`/campaigns/${id}`, data);
    return response.data;
  },

  deleteCampaign: async (id: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${id}`);
  }
};
