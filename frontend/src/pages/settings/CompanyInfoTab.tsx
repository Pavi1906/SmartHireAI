import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from './components/Input';
import { Label } from './components/Label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { getCompanyProfile, updateCompanyProfile } from '../../services/companyService';
export function CompanyInfoTab({ onChange }: { onChange: (data: any) => void }) {
  const { user } = useSelector((state: RootState) => state.auth);
  
  
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [company, setCompany] = useState({
    name: '',
    industry: '',
    size: '',
    website: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getCompanyProfile();
        setCompany(prev => ({
          ...prev,
          name: data.name,
          industry: data.industry ?? '',
          website: data.website ?? '',
        }));
      } catch (err) {
        alert('Failed to load company profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCompany(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (key: string, value: string) => {
    setCompany(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dto = {
        name: company.name,
        industry: company.industry,
        website: company.website,
      };
      const updated = await updateCompanyProfile(dto);
      setCompany(prev => ({
        ...prev,
        name: updated.name,
        industry: updated.industry ?? '',
        website: updated.website ?? '',
      }));
      alert('Company information has been updated successfully.');
    } catch (error) {
      alert('Failed to save company information.');
    } finally {
      setSaving(false);
    }
  };

  return loading ? (<div className="flex justify-center items-center h-64"><Loader2 className="mr-2 h-8 w-8 animate-spin" /></div>) : (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Configure your organizational details displayed on job postings and candidate touchpoints.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" name="name" value={company.name} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" name="industry" value={company.industry} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Select value={company.size} onValueChange={(val) => handleSelectChange('size', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-50 employees">1-50 employees</SelectItem>
                  <SelectItem value="50-200 employees">50-200 employees</SelectItem>
                  <SelectItem value="200-1000 employees">200-1000 employees</SelectItem>
                  <SelectItem value="1000+ employees">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input id="website" name="website" value={company.website} onChange={handleChange} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Headquarters Location</Label>
              <Input id="location" name="location" value={company.location} onChange={handleChange} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Company Description</Label>
              <textarea 
                id="description" 
                name="description" 
                value={company.description} 
                onChange={handleChange}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
