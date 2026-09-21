import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, RotateCcw, Calendar, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { mockUnits } from '@/data/users';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  unitFilter: string;
  onUnitFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  unitFilter,
  onUnitFilterChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  onReset,
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const hasActiveFilters =
    search ||
    roleFilter !== 'all' ||
    unitFilter !== 'all' ||
    statusFilter !== 'all';

  return (
    <div className="bg-card p-3 sm:p-4 rounded-xl border border-border shadow-sm space-y-3">
      {/* Top Search & Mobile Toggle */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        {/* Search Input (Always visible) */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau NIP pegawai..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Mobile Filter Toggle Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="sm:hidden flex items-center justify-between h-9 text-xs border-border"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
        >
          <span className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span>Filter Lanjutan</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </span>
          {mobileFilterOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Filter Options Grid (Visible on Desktop / Collapsible on Mobile) */}
      <div
        className={`${
          mobileFilterOpen ? 'grid' : 'hidden sm:grid'
        } grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 sm:pt-0`}
      >
        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        {/* Role Filter */}
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="h-9 text-xs sm:text-sm">
            <SelectValue placeholder="Semua Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            <SelectItem value="Dosen">Dosen</SelectItem>
            <SelectItem value="Tendik">Tendik</SelectItem>
            <SelectItem value="Pimpinan">Pimpinan</SelectItem>
          </SelectContent>
        </Select>

        {/* Unit Filter */}
        <Select value={unitFilter} onValueChange={onUnitFilterChange}>
          <SelectTrigger className="h-9 text-xs sm:text-sm truncate">
            <SelectValue placeholder="Semua Unit" />
          </SelectTrigger>
          <SelectContent>
            {mockUnits.map((unit) => (
              <SelectItem
                key={unit}
                value={unit === 'Semua Unit' ? 'all' : unit}
              >
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-9 text-xs sm:text-sm">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="hadir">Hadir</SelectItem>
            <SelectItem value="belum_absen">Belum Absen</SelectItem>
            <SelectItem value="izin">Izin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset Filter
          </Button>
        </div>
      )}
    </div>
  );
};
