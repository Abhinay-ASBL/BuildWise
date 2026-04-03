import type { BudgetCategory, BudgetLineItem, AreaStatement, ProjectMetadata } from '../types';

// ─── Categories from CSV ────────────────────────────────────────────
export const defaultCategories: BudgetCategory[] = [
  { id: 'cat-sitework', name: 'Site Work', section: 'capex', sortOrder: 0, isArchived: false, color: '#2ECC71', budgetCap: 4500000 },
  { id: 'cat-structure', name: 'Structure', section: 'capex', sortOrder: 1, isArchived: false, color: '#4A90D9', budgetCap: 55000000 },
  { id: 'cat-interiors', name: 'Interior Work', section: 'capex', sortOrder: 2, isArchived: false, color: '#7B68EE', budgetCap: 18000000 },
  { id: 'cat-landscape', name: 'Landscape', section: 'capex', sortOrder: 3, isArchived: false, color: '#27AE60', budgetCap: 5500000 },
  { id: 'cat-it', name: 'IT Infrastructure', section: 'capex', sortOrder: 4, isArchived: false, color: '#E67E22', budgetCap: 8500000 },
  { id: 'cat-scalemodel', name: 'Scale Model', section: 'capex', sortOrder: 5, isArchived: false, color: '#8E44AD', budgetCap: 4000000 },
  { id: 'cat-branding', name: 'Branding', section: 'capex', sortOrder: 6, isArchived: false, color: '#E74C3C', budgetCap: 3500000 },
  // OPEX categories
  { id: 'cat-utilities', name: 'Utilities', section: 'opex', sortOrder: 7, isArchived: false, color: '#F39C12', budgetCap: null },
  { id: 'cat-manpower', name: 'Manpower', section: 'opex', sortOrder: 8, isArchived: false, color: '#1ABC9C', budgetCap: null },
  { id: 'cat-hospitality', name: 'Hospitality', section: 'opex', sortOrder: 9, isArchived: false, color: '#D4A574', budgetCap: null },
];

// ─── Line Items — CSV data enriched with realistic estimates ────────
const now = Date.now();

export const defaultLineItems: BudgetLineItem[] = [
  // ─── Site Work ────────────────────────────────────────────────────
  { id: 'li-sw-1', categoryId: 'cat-sitework', name: 'Site Leveling', unitCost: 120, quantity: 7246, unit: 'sqft', status: 'Quoted', team: 'PMO', remark: 'Vendor: KR Earthworks', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-sw-2', categoryId: 'cat-sitework', name: 'Plinth Beam and Site Works', unitCost: 1850000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'PMO', remark: 'RCC plinth with waterproofing', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-sw-3', categoryId: 'cat-sitework', name: 'Driveway Paving', unitCost: 850, quantity: 1200, unit: 'sqft', status: 'Quoted', team: 'PMO', remark: 'Interlocking pavers, 80mm thick', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-sw-4', categoryId: 'cat-sitework', name: 'Compound Wall & Entry Gate', unitCost: 650000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'PMO', remark: 'MS frame with ACP cladding', sortOrder: 3, isArchived: false, createdAt: now, updatedAt: now },

  // ─── Structure ────────────────────────────────────────────────────
  { id: 'li-st-1', categoryId: 'cat-structure', name: 'Modular and PEB Structure (Including Flooring, Ceiling, Wall finishes, Electrical and Plumbing Fixtures, Facade Glazing)', unitCost: 5800, quantity: 6653, unit: 'sqft', status: 'Committed', team: 'AAED', remark: 'Vendor: Jindal PEB — PO raised', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-st-2', categoryId: 'cat-structure', name: 'Civil Works', unitCost: 2200000, quantity: 1, unit: 'lumpsum', status: 'Quoted', team: 'AAED', remark: '3 quotes received, L1 selected', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-st-3', categoryId: 'cat-structure', name: 'Air Conditioners (VRV System)', unitCost: 85000, quantity: 18, unit: 'nos', status: 'Quoted', team: 'AAED', remark: 'Daikin VRV IV — 18 indoor units', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-st-4', categoryId: 'cat-structure', name: 'Transportation + Crane Cost', unitCost: 1250000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'AAED', remark: 'Hyderabad to site, 40ft trailer × 6 trips', sortOrder: 3, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-st-5', categoryId: 'cat-structure', name: 'Facade Elements (Aluminum Fins, Concrete Portals, Semi-Covered Roofing)', unitCost: 3500000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'AAED', remark: 'Design finalization pending from AAED', sortOrder: 4, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-st-6', categoryId: 'cat-structure', name: 'Fire Safety & Compliance', unitCost: 450000, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'PMO', remark: 'NOC pending', sortOrder: 5, isArchived: false, createdAt: now, updatedAt: now },

  // ─── Interior Work ────────────────────────────────────────────────
  { id: 'li-int-1', categoryId: 'cat-interiors', name: 'Furniture (Reception, Lounge, Conference)', unitCost: 8500000, quantity: 1, unit: 'lumpsum', status: 'Quoted', team: 'AAED', remark: 'Vendor: Featherlite — custom designs', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-int-2', categoryId: 'cat-interiors', name: 'Additional Lighting (Feature & Accent)', unitCost: 3200000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'AAED', remark: 'LED profiles, cove lights, pendant fixtures', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-int-3', categoryId: 'cat-interiors', name: 'Styling, Decor & Art Installation', unitCost: 4500000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'AAED', remark: 'Art consultant engaged', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-int-4', categoryId: 'cat-interiors', name: 'Acoustic Treatment (Conference & AV Room)', unitCost: 1200, quantity: 850, unit: 'sqft', status: 'TBC', team: 'AAED', remark: 'Fabric-wrapped panels + ceiling baffles', sortOrder: 3, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-int-5', categoryId: 'cat-interiors', name: 'Window Blinds & Drapes', unitCost: 650000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'AAED', remark: 'Motorized roller blinds', sortOrder: 4, isArchived: false, createdAt: now, updatedAt: now },

  // ─── Landscape ────────────────────────────────────────────────────
  { id: 'li-ls-1', categoryId: 'cat-landscape', name: 'Indoor Landscape & Planters', unitCost: 1800000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'AAED', remark: 'Vertical garden wall + planter boxes', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-ls-2', categoryId: 'cat-landscape', name: 'Outdoor Landscape & Hardscape', unitCost: 750, quantity: 3750, unit: 'sqft', status: 'Quoted', team: 'AAED', remark: 'Vendor: GreenScapes — turf + shrubs + pathways', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-ls-3', categoryId: 'cat-landscape', name: 'Water Feature (Entry Area)', unitCost: 850000, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'AAED', remark: 'Cascading wall fountain — design pending', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-ls-4', categoryId: 'cat-landscape', name: 'Landscape Lighting', unitCost: 450000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'AAED', remark: 'LED bollards, tree uplighters, pathway lights', sortOrder: 3, isArchived: false, createdAt: now, updatedAt: now },

  // ─── IT Infrastructure ────────────────────────────────────────────
  { id: 'li-it-1', categoryId: 'cat-it', name: 'TV in Conference Rooms (75" 4K)', unitCost: 185000, quantity: 2, unit: 'nos', status: 'Quoted', team: 'AAED', remark: 'Samsung QN75 — wall mount', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-it-2', categoryId: 'cat-it', name: 'Screens for Discussion Tables', unitCost: 183000, quantity: 20, unit: 'nos', status: 'Committed', team: 'AAED', remark: 'PO raised — delivery in 3 weeks', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-it-3', categoryId: 'cat-it', name: 'Outdoor LED Screen-1 (P3.9)', unitCost: 1200000, quantity: 1, unit: 'nos', status: 'Quoted', team: 'AAED', remark: '3m × 2m outdoor LED — entry facade', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-it-4', categoryId: 'cat-it', name: 'Outdoor LED Screen-2 (P3.9)', unitCost: 950000, quantity: 1, unit: 'nos', status: 'Quoted', team: 'AAED', remark: '2.5m × 1.5m — drop-off area', sortOrder: 3, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-it-5', categoryId: 'cat-it', name: 'Auditorium AV System (Screen + Projector + Audio)', unitCost: 2800000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'AAED', remark: 'Epson laser projector + 5.1 surround', sortOrder: 4, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-it-6', categoryId: 'cat-it', name: 'WIFI & Networking Infrastructure', unitCost: 650000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'AAED', remark: 'Ubiquiti APs × 8 + structured cabling', sortOrder: 5, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-it-7', categoryId: 'cat-it', name: 'VR Experience Station', unitCost: 350000, quantity: 2, unit: 'nos', status: 'TBC', team: 'AAED', remark: 'Meta Quest Pro + gaming PC + content', sortOrder: 6, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-it-8', categoryId: 'cat-it', name: 'Background Music & PA System', unitCost: 280000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'AAED', remark: 'Zoned audio — Bose ceiling speakers', sortOrder: 7, isArchived: false, createdAt: now, updatedAt: now },

  // ─── Scale Model ──────────────────────────────────────────────────
  { id: 'li-sm-1', categoryId: 'cat-scalemodel', name: '1:100 Site Scale Model', unitCost: 3605000, quantity: 1, unit: 'nos', status: 'Committed', team: 'AAED', remark: 'Vendor: ModelCraft — PO raised, 6-week delivery', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },

  // ─── Branding ─────────────────────────────────────────────────────
  { id: 'li-br-1', categoryId: 'cat-branding', name: 'Main Signage (Illuminated)', unitCost: 1200000, quantity: 1, unit: 'lumpsum', status: 'Quoted', team: 'AAED', remark: '3D backlit letters — ACP + LED', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-br-2', categoryId: 'cat-branding', name: 'Flex Banners & Hoarding', unitCost: 800000, quantity: 1, unit: 'lumpsum', status: 'Committed', team: 'AAED', remark: 'Installed — around construction perimeter', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-br-3', categoryId: 'cat-branding', name: 'Wayfinding & Directional Signage', unitCost: 350000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'AAED', remark: 'Indoor + outdoor directional signs', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-br-4', categoryId: 'cat-branding', name: 'Brochure Stand & Collateral Display', unitCost: 180000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'AAED', remark: 'Custom SS stands × 4', sortOrder: 3, isArchived: false, createdAt: now, updatedAt: now },

  // ─── OPEX — Utilities ─────────────────────────────────────────────
  { id: 'li-ut-1', categoryId: 'cat-utilities', name: 'Electricity', unitCost: 185000, quantity: 1, unit: 'months', status: 'Estimated', team: null, remark: '50 KVA load, ₹9/unit avg', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-ut-2', categoryId: 'cat-utilities', name: 'Water Supply', unitCost: 25000, quantity: 1, unit: 'months', status: 'Estimated', team: null, remark: 'Tanker + municipal supply', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-ut-3', categoryId: 'cat-utilities', name: 'Misc. Supplies & Consumables', unitCost: 15000, quantity: 1, unit: 'months', status: 'Estimated', team: null, remark: 'Cleaning materials, paper, etc.', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-ut-4', categoryId: 'cat-utilities', name: 'DG Set Fuel & Maintenance', unitCost: 45000, quantity: 1, unit: 'months', status: 'Estimated', team: null, remark: '25 KVA backup, ~8 hrs/month usage', sortOrder: 3, isArchived: false, createdAt: now, updatedAt: now },

  // ─── OPEX — Manpower ──────────────────────────────────────────────
  { id: 'li-mp-1', categoryId: 'cat-manpower', name: 'Security Guards', unitCost: 25500, quantity: 3, unit: 'months', status: 'Committed', team: null, remark: 'Agency: SecureForce — 24/7 coverage', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-mp-2', categoryId: 'cat-manpower', name: 'Housekeeping Staff', unitCost: 23000, quantity: 5, unit: 'months', status: 'Committed', team: null, remark: 'Agency: CleanPro — daily service', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-mp-3', categoryId: 'cat-manpower', name: 'Valet Parking Attendants', unitCost: 23000, quantity: 3, unit: 'months', status: 'Committed', team: null, remark: 'Agency: ValetOne', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-mp-4', categoryId: 'cat-manpower', name: 'Receptionist', unitCost: 35000, quantity: 2, unit: 'months', status: 'Estimated', team: null, remark: 'Front desk — 2 shift coverage', sortOrder: 3, isArchived: false, createdAt: now, updatedAt: now },

  // ─── OPEX — Hospitality ───────────────────────────────────────────
  { id: 'li-hs-1', categoryId: 'cat-hospitality', name: 'F&B Pantry Setup (One-time)', unitCost: 450000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: null, remark: 'Coffee machine, crockery, pantry fit-out', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-hs-2', categoryId: 'cat-hospitality', name: 'Monthly F&B Consumables', unitCost: 65000, quantity: 1, unit: 'months', status: 'Estimated', team: null, remark: 'Tea, coffee, snacks, water', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-hs-3', categoryId: 'cat-hospitality', name: 'Guest Amenities & Gifts', unitCost: 40000, quantity: 1, unit: 'months', status: 'TBC', team: null, remark: 'Welcome kits for site visitors', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
];

// ─── Area Statement from CSV ────────────────────────────────────────
export const defaultAreaStatement: AreaStatement[] = [
  { id: 'area-gf', label: 'Ground Floor BUA', areaSqft: 6416.15 },
  { id: 'area-ff', label: 'First Floor BUA', areaSqft: 830.3 },
  { id: 'area-ls1', label: 'Landscape Area 1', areaSqft: 3050 },
  { id: 'area-ls2', label: 'Landscape Area 2', areaSqft: 700 },
];

// ─── Project Metadata ───────────────────────────────────────────────
export const defaultMetadata: ProjectMetadata = {
  projectName: 'Legacy Modular Sales Office',
  totalBUA: 7246.45, // GF 6416.15 + FF 830.3
  landscapeArea: 3750, // 3050 + 700
  totalArea: 10996.45, // BUA + landscape
  budgetCap: 105974400, // ₹10,59,74,400 from CSV header
  opexMonths: 24,
  createdAt: now,
  updatedAt: now,
};
