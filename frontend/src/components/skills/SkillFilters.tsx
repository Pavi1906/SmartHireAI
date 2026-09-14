import React from 'react';
import { 
  SkillCategory, 
  SkillProficiency, 
  SkillStatus 
} from '../../types/skills';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';

interface SkillFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedProficiency: string;
  onProficiencyChange: (prof: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
  categories: SkillCategory[];
  hasActiveFilters: boolean;
}

export function SkillFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedProficiency,
  onProficiencyChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  onClearFilters,
  categories,
  hasActiveFilters
}: SkillFiltersProps) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills by name, framework, or technology..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background h-10 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters and Sorters Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-10 px-3 py-1.5 text-xs bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Filter by Domain Category"
          >
            <option value="ALL">All Domains</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Proficiency Dropdown */}
          <select
            value={selectedProficiency}
            onChange={(e) => onProficiencyChange(e.target.value)}
            className="h-10 px-3 py-1.5 text-xs bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Filter by Proficiency"
          >
            <option value="ALL">All Proficiencies</option>
            <option value="Advanced">Advanced (88%+)</option>
            <option value="Proficient">Proficient (75-87%)</option>
            <option value="Intermediate">Intermediate (60-74%)</option>
            <option value="Foundational">Foundational (45-59%)</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-10 px-3 py-1.5 text-xs bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="strong">Strong (80%+)</option>
            <option value="developing">Developing (60-79%)</option>
            <option value="gap">Skill Gap (&lt;60%)</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-10 px-3 py-1.5 text-xs bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Sort skills"
          >
            <option value="score_desc">Score: High to Low</option>
            <option value="score_asc">Score: Low to High</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
