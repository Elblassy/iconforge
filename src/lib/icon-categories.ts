export const ICON_CATEGORIES: Record<string, string[]> = {
  // Business types
  restaurant: [
    "utensils", "fork", "knife", "plate", "chef", "food", "dining", "pizza",
    "cup", "coffee", "mug", "spoon", "burger", "meal", "drink", "wine", "beer",
  ],
  pharmacy: [
    "pill", "capsule", "heart-pulse", "stethoscope", "medicine", "first-aid",
    "hospital", "health", "thermometer", "syringe", "drug", "bandage", "medic",
    "prescription", "tablet",
  ],
  hotel: [
    "bed", "building", "key", "door", "luggage", "concierge", "bell", "home",
    "house", "room", "resort", "sleep", "towel", "pool", "elevator",
  ],
  shop: [
    "cart", "bag", "store", "shop", "basket", "credit-card", "receipt", "barcode",
    "tag", "price", "purchase", "checkout", "market", "sale", "discount",
  ],
  education: [
    "book", "graduation", "school", "pencil", "pen", "notebook", "backpack",
    "apple", "mortarboard", "library", "study", "class", "learn", "teacher",
    "student", "diploma", "certificate",
  ],
  hospital: [
    "hospital", "heart", "pulse", "stethoscope", "ambulance", "cross", "bandage",
    "thermometer", "syringe", "pill", "nurse", "doctor", "surgery", "clinic",
    "emergency", "bed", "health",
  ],
  bank: [
    "bank", "dollar", "euro", "currency", "coin", "wallet", "credit-card",
    "piggy-bank", "safe", "vault", "finance", "money", "cash", "transfer",
    "account", "savings", "investment",
  ],
  gym: [
    "dumbbell", "heart", "running", "bicycle", "trophy", "medal", "timer",
    "activity", "fitness", "workout", "muscle", "weight", "exercise", "sport",
    "training", "jump", "barbell",
  ],
  salon: [
    "scissors", "brush", "palette", "sparkles", "star", "mirror", "comb",
    "haircut", "beauty", "nail", "spa", "makeup", "styling",
  ],
  car: [
    "car", "truck", "bus", "vehicle", "fuel", "gas", "parking", "wheel",
    "wrench", "gauge", "auto", "engine", "drive", "road", "speed", "repair",
  ],
  travel: [
    "plane", "globe", "map", "compass", "luggage", "passport", "camera", "sun",
    "mountain", "anchor", "ship", "train", "bus", "ticket", "vacation", "trip",
    "adventure", "destination",
  ],
  delivery: [
    "truck", "package", "box", "shipping", "clock", "route", "map-pin", "bike",
    "courier", "parcel", "dispatch", "logistics", "transport", "dropoff", "pickup",
  ],

  // Odoo modules
  sales: [
    "chart", "graph", "trending", "dollar", "receipt", "handshake", "target",
    "funnel", "deal", "quote", "order", "revenue", "pipeline", "opportunity",
  ],
  inventory: [
    "box", "package", "warehouse", "barcode", "clipboard", "truck", "forklift",
    "pallet", "stock", "shelf", "bin", "lot", "serial", "transfer", "quant",
  ],
  accounting: [
    "calculator", "receipt", "file-text", "dollar", "percent", "pie-chart",
    "ledger", "coins", "invoice", "journal", "tax", "balance", "debit", "credit",
    "fiscal", "audit", "reconcile",
  ],
  hr: [
    "people", "person", "users", "group", "id-card", "briefcase", "building",
    "calendar", "employee", "payroll", "leave", "attendance", "contract",
    "recruit", "onboard", "appraisal",
  ],
  crm: [
    "person", "handshake", "phone", "mail", "target", "funnel", "chart", "star",
    "lead", "prospect", "contact", "pipeline", "deal", "follow", "activity",
  ],
  manufacturing: [
    "gear", "cog", "settings", "wrench", "hammer", "factory", "tool", "bolt",
    "bom", "routing", "workorder", "mrp", "production", "machine", "operator",
    "quality", "batch",
  ],
  purchase: [
    "cart", "shopping", "bag", "credit-card", "receipt", "clipboard", "check",
    "rfq", "order", "vendor", "supplier", "tender", "contract", "procurement",
  ],
  project: [
    "kanban", "columns", "layout", "check-square", "list", "clipboard", "flag",
    "milestone", "task", "deadline", "sprint", "agile", "burndown", "gantt",
    "timesheet",
  ],
  website: [
    "globe", "browser", "layout", "code", "link", "share", "monitor",
    "smartphone", "page", "seo", "blog", "ecommerce", "shop", "landing",
  ],
  email: [
    "mail", "envelope", "inbox", "send", "at-sign", "forward", "reply",
    "paperclip", "compose", "newsletter", "campaign", "outbox", "spam",
  ],
  calendar: [
    "calendar", "clock", "alarm", "timer", "schedule", "event", "date",
    "appointment", "reminder", "meeting", "recurrence", "booking",
  ],
  chat: [
    "message", "chat", "comment", "bubble", "phone", "video", "mic",
    "headphone", "discuss", "channel", "dm", "notification", "live",
  ],
  settings: [
    "gear", "cog", "settings", "sliders", "toggle", "wrench", "tool", "config",
    "admin", "preference", "parameter", "option", "system", "configuration",
  ],
  report: [
    "chart", "bar-chart", "pie-chart", "line-chart", "graph", "trending",
    "analytics", "dashboard", "kpi", "metric", "insight", "export", "print",
  ],
  document: [
    "file", "document", "folder", "paper", "clipboard", "note", "book",
    "archive", "attachment", "pdf", "spreadsheet", "template", "sign", "dms",
  ],
  security: [
    "lock", "shield", "key", "fingerprint", "eye", "guard", "alert",
    "check-shield", "password", "access", "permission", "role", "audit",
    "privacy", "compliance",
  ],
  payment: [
    "credit-card", "dollar", "wallet", "bank", "coins", "receipt", "qr-code",
    "stripe", "paypal", "wire", "pos", "terminal", "refund", "checkout",
  ],
  social: [
    "share", "heart", "thumbs-up", "star", "bookmark", "comment", "users",
    "globe", "facebook", "twitter", "linkedin", "instagram", "youtube",
  ],
  logistics: [
    "truck", "route", "map", "warehouse", "package", "clock", "ship",
    "container", "freight", "customs", "manifest", "carrier", "tracking",
  ],
  "real-estate": [
    "home", "building", "house", "key", "door", "map-pin", "ruler", "blueprint",
    "lease", "rent", "property", "agent", "mortgage", "floor-plan",
  ],
  agriculture: [
    "leaf", "tree", "sun", "cloud", "droplet", "thermometer", "tractor",
    "sprout", "harvest", "crop", "farm", "soil", "irrigation", "greenhouse",
  ],
  technology: [
    "cpu", "server", "database", "code", "terminal", "wifi", "bluetooth",
    "cloud", "api", "software", "hardware", "network", "bug", "deploy",
  ],
  legal: [
    "scale", "gavel", "file-text", "shield", "stamp", "document", "briefcase",
    "contract", "law", "court", "judge", "compliance", "regulation",
  ],
  marketing: [
    "megaphone", "target", "chart", "share", "globe", "mail", "video",
    "camera", "campaign", "ad", "promotion", "brand", "seo", "funnel",
  ],
  support: [
    "headphone", "help-circle", "life-buoy", "message", "phone", "ticket",
    "tool", "faq", "chat", "helpdesk", "sla", "escalate", "resolve",
  ],
  warehouse: [
    "box", "package", "forklift", "pallet", "barcode", "clipboard", "truck",
    "shelf", "rack", "bin", "zone", "pick", "putaway", "transfer",
  ],
  pos: [
    "monitor", "credit-card", "receipt", "barcode", "printer", "cash",
    "scanner", "tablet", "cashier", "register", "session", "sale", "product",
  ],
  fleet: [
    "car", "truck", "bus", "fuel", "key", "route", "gauge", "wrench",
    "maintenance", "driver", "odometer", "service", "inspection", "lease",
  ],
  maintenance: [
    "wrench", "tool", "gear", "hammer", "hard-hat", "clipboard", "alert",
    "check", "equipment", "request", "schedule", "repair", "breakdown",
  ],
  quality: [
    "check", "award", "star", "badge", "shield", "clipboard", "search",
    "microscope", "inspection", "control", "test", "standard", "iso", "qc",
  ],
  subscription: [
    "repeat", "refresh", "calendar", "credit-card", "clock", "infinity",
    "cycle", "recurring", "plan", "billing", "renew", "contract",
  ],
  construction: [
    "hard-hat", "hammer", "wrench", "ruler", "building", "crane", "blueprint",
    "brick", "concrete", "scaffold", "site", "contractor",
  ],
  event: [
    "calendar", "ticket", "star", "mic", "video", "camera", "people",
    "trophy", "party", "stage", "conference", "speaker", "registration",
  ],
  finance: [
    "dollar", "euro", "pound", "chart", "trending", "calculator", "wallet",
    "bank", "coin", "ledger", "balance", "budget", "forecast", "cash",
  ],
  healthcare: [
    "heart", "pulse", "hospital", "doctor", "pill", "syringe", "bandage",
    "thermometer", "ambulance", "stethoscope", "patient", "appointment", "clinic",
  ],
  insurance: [
    "shield", "umbrella", "document", "contract", "check", "dollar", "car",
    "home", "health", "life", "policy", "claim", "coverage",
  ],
  media: [
    "video", "camera", "film", "music", "mic", "headphone", "image", "gallery",
    "play", "pause", "record", "broadcast", "stream", "podcast",
  ],
  nonprofit: [
    "heart", "hand", "people", "globe", "leaf", "charity", "donate", "volunteer",
    "community", "cause", "mission", "fund", "grant",
  ],
};
