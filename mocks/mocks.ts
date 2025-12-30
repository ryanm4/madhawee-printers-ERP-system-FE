export const purchaseOrderMockData = [
  {
    "po_id": "PO-00001",
    "po_date": "2025-12-01",
    "delivery_date": "2025-12-05",
    "customer": {
      "name": "Star Packaging (PVT) LTD",
      "address": "Testing Road",
      "phone": "+94772309323",
      "email": "star@packaging.com"
    },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0001", "job_name": "Box Printing", "job_status": "Pending", "job_started_date": "2025-12-01" },
      { "job_id": "JO-0002", "job_name": "Cutting", "job_status": "In Progress", "job_started_date": "2025-12-02" }
    ]
  },
  {
    "po_id": "PO-00002",
    "po_date": "2025-12-02",
    "delivery_date": "2025-12-06",
    "customer": {
      "name": "Alpha Traders",
      "address": "Main Street",
      "phone": "+94770001122",
      "email": "alpha@traders.com"
    },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0003", "job_name": "Label Printing", "job_status": "Completed", "job_started_date": "2025-12-02" },
      { "job_id": "JO-0004", "job_name": "Packaging", "job_status": "Completed", "job_started_date": "2025-12-03" }
    ]
  },
  {
    "po_id": "PO-00003",
    "po_date": "2025-12-03",
    "delivery_date": "2025-12-07",
    "customer": {
      "name": "Green Leaf Pvt Ltd",
      "address": "Industrial Zone",
      "phone": "+94771112233",
      "email": "info@greenleaf.com"
    },
    "total_jobs": 3,
    "pending_jobs": [
      { "job_id": "JO-0005", "job_name": "Design", "job_status": "Completed", "job_started_date": "2025-12-03" },
      { "job_id": "JO-0006", "job_name": "Printing", "job_status": "In Progress", "job_started_date": "2025-12-04" },
      { "job_id": "JO-0007", "job_name": "Quality Check", "job_status": "Pending", "job_started_date": "2025-12-05" }
    ]
  },
  {
    "po_id": "PO-00004",
    "po_date": "2025-12-04",
    "delivery_date": "2025-12-08",
    "customer": {
      "name": "Ocean Foods",
      "address": "Harbor Road",
      "phone": "+94775556677",
      "email": "contact@oceanfoods.com"
    },
    "total_jobs": 1,
    "pending_jobs": [
      { "job_id": "JO-0008", "job_name": "Carton Printing", "job_status": "Cancelled", "job_started_date": "2025-12-04" }
    ]
  },
  {
    "po_id": "PO-00005",
    "po_date": "2025-12-05",
    "delivery_date": "2025-12-10",
    "customer": {
      "name": "Sunrise Bakers",
      "address": "Market Road",
      "phone": "+94778889900",
      "email": "orders@sunrise.com"
    },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0009", "job_name": "Bag Printing", "job_status": "In Progress", "job_started_date": "2025-12-06" },
      { "job_id": "JO-0010", "job_name": "Sealing", "job_status": "Pending", "job_started_date": "2025-12-07" }
    ]
  },
  {
    "po_id": "PO-00006",
    "po_date": "2025-12-06",
    "delivery_date": "2025-12-11",
    "customer": {
      "name": "Fresh Farm",
      "address": "Village Road",
      "phone": "+94770001234",
      "email": "fresh@farm.com"
    },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0011", "job_name": "Sticker Print", "job_status": "Completed", "job_started_date": "2025-12-06" },
      { "job_id": "JO-0012", "job_name": "Packing", "job_status": "Completed", "job_started_date": "2025-12-07" }
    ]
  },
  {
    "po_id": "PO-00007",
    "po_date": "2025-12-07",
    "delivery_date": "2025-12-12",
    "customer": {
      "name": "City Super",
      "address": "Town Center",
      "phone": "+94771110000",
      "email": "city@super.com"
    },
    "total_jobs": 3,
    "pending_jobs": [
      { "job_id": "JO-0013", "job_name": "Design", "job_status": "Completed", "job_started_date": "2025-12-07" },
      { "job_id": "JO-0014", "job_name": "Printing", "job_status": "In Progress", "job_started_date": "2025-12-08" },
      { "job_id": "JO-0015", "job_name": "Delivery Prep", "job_status": "Pending", "job_started_date": "2025-12-09" }
    ]
  },
  {
    "po_id": "PO-00008",
    "po_date": "2025-12-08",
    "delivery_date": "2025-12-13",
    "customer": {
      "name": "Golden Tea",
      "address": "Hill Road",
      "phone": "+94772223344",
      "email": "golden@tea.com"
    },
    "total_jobs": 1,
    "pending_jobs": [
      { "job_id": "JO-0016", "job_name": "Wrapper Printing", "job_status": "On Hold", "job_started_date": "2025-12-08" }
    ]
  },
  {
    "po_id": "PO-00009",
    "po_date": "2025-12-09",
    "delivery_date": "2025-12-14",
    "customer": {
      "name": "Blue Water",
      "address": "Lake Side",
      "phone": "+94773334455",
      "email": "blue@water.com"
    },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0017", "job_name": "Bottle Label", "job_status": "Completed", "job_started_date": "2025-12-09" },
      { "job_id": "JO-0018", "job_name": "Shrink Wrap", "job_status": "Completed", "job_started_date": "2025-12-10" }
    ]
  },
  {
    "po_id": "PO-00010",
    "po_date": "2025-12-10",
    "delivery_date": "2025-12-15",
    "customer": {
      "name": "Urban Mart",
      "address": "City Center",
      "phone": "+94774445566",
      "email": "urban@mart.com"
    },
    "total_jobs": 3,
    "pending_jobs": [
      { "job_id": "JO-0019", "job_name": "Design", "job_status": "Completed", "job_started_date": "2025-12-10" },
      { "job_id": "JO-0020", "job_name": "Print", "job_status": "Completed", "job_started_date": "2025-12-11" },
      { "job_id": "JO-0021", "job_name": "Inspection", "job_status": "Completed", "job_started_date": "2025-12-12" }
    ]
  },

  {
    "po_id": "PO-00011",
    "po_date": "2025-12-11",
    "delivery_date": "2025-12-16",
    "customer": { "name": "Quick Snacks", "address": "Food City", "phone": "+94775550111", "email": "quick@snacks.com" },
    "total_jobs": 1,
    "pending_jobs": [{ "job_id": "JO-0022", "job_name": "Pouch Printing", "job_status": "Pending", "job_started_date": "2025-12-11" }]
  },
  {
    "po_id": "PO-00012",
    "po_date": "2025-12-12",
    "delivery_date": "2025-12-17",
    "customer": { "name": "Eco Pack", "address": "Green Park", "phone": "+94776661234", "email": "eco@pack.com" },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0023", "job_name": "Design", "job_status": "Completed", "job_started_date": "2025-12-12" },
      { "job_id": "JO-0024", "job_name": "Print", "job_status": "In Progress", "job_started_date": "2025-12-13" }
    ]
  },
  {
    "po_id": "PO-00013",
    "po_date": "2025-12-13",
    "delivery_date": "2025-12-18",
    "customer": { "name": "Daily Dairy", "address": "Milk Road", "phone": "+94777778888", "email": "daily@dairy.com" },
    "total_jobs": 1,
    "pending_jobs": [{ "job_id": "JO-0025", "job_name": "Carton Print", "job_status": "Completed", "job_started_date": "2025-12-13" }]
  },
  {
    "po_id": "PO-00014",
    "po_date": "2025-12-14",
    "delivery_date": "2025-12-19",
    "customer": { "name": "Spice World", "address": "Market Yard", "phone": "+94779990011", "email": "spice@world.com" },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0026", "job_name": "Label Print", "job_status": "In Progress", "job_started_date": "2025-12-14" },
      { "job_id": "JO-0027", "job_name": "Packing", "job_status": "Pending", "job_started_date": "2025-12-15" }
    ]
  },
  {
    "po_id": "PO-00015",
    "po_date": "2025-12-15",
    "delivery_date": "2025-12-20",
    "customer": { "name": "Fresh Juice", "address": "Fruit Lane", "phone": "+94771112299", "email": "fresh@juice.com" },
    "total_jobs": 1,
    "pending_jobs": [{ "job_id": "JO-0028", "job_name": "Bottle Sticker", "job_status": "On Hold", "job_started_date": "2025-12-15" }]
  },

  {
    "po_id": "PO-00016",
    "po_date": "2025-12-16",
    "delivery_date": "2025-12-21",
    "customer": { "name": "Snack Hub", "address": "Highway Road", "phone": "+94778881234", "email": "snack@hub.com" },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0029", "job_name": "Print", "job_status": "Completed", "job_started_date": "2025-12-16" },
      { "job_id": "JO-0030", "job_name": "Seal", "job_status": "Completed", "job_started_date": "2025-12-17" }
    ]
  },
  {
    "po_id": "PO-00017",
    "po_date": "2025-12-17",
    "delivery_date": "2025-12-22",
    "customer": { "name": "Veggie Box", "address": "Farm Road", "phone": "+94770004567", "email": "veggie@box.com" },
    "total_jobs": 1,
    "pending_jobs": [{ "job_id": "JO-0031", "job_name": "Box Print", "job_status": "Pending", "job_started_date": "2025-12-17" }]
  },
  {
    "po_id": "PO-00018",
    "po_date": "2025-12-18",
    "delivery_date": "2025-12-23",
    "customer": { "name": "Choco Land", "address": "Sweet Street", "phone": "+94776665544", "email": "choco@land.com" },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0032", "job_name": "Foil Print", "job_status": "In Progress", "job_started_date": "2025-12-18" },
      { "job_id": "JO-0033", "job_name": "Wrap", "job_status": "Pending", "job_started_date": "2025-12-19" }
    ]
  },
  {
    "po_id": "PO-00019",
    "po_date": "2025-12-19",
    "delivery_date": "2025-12-24",
    "customer": { "name": "Paper Plus", "address": "Office Park", "phone": "+94775554433", "email": "paper@plus.com" },
    "total_jobs": 1,
    "pending_jobs": [{ "job_id": "JO-0034", "job_name": "Bulk Printing", "job_status": "Completed", "job_started_date": "2025-12-19" }]
  },
  {
    "po_id": "PO-00020",
    "po_date": "2025-12-20",
    "delivery_date": "2025-12-25",
    "customer": { "name": "Holiday Foods", "address": "Resort Road", "phone": "+94778889911", "email": "holiday@foods.com" },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0035", "job_name": "Design", "job_status": "Completed", "job_started_date": "2025-12-20" },
      { "job_id": "JO-0036", "job_name": "Print", "job_status": "Completed", "job_started_date": "2025-12-21" }
    ]
  },
  {
    "po_id": "PO-00021",
    "po_date": "2025-12-21",
    "delivery_date": "2025-12-26",
    "customer": { "name": "Smart Retail", "address": "Mall Road", "phone": "+94779998877", "email": "smart@retail.com" },
    "total_jobs": 1,
    "pending_jobs": [{ "job_id": "JO-0037", "job_name": "Tag Print", "job_status": "Cancelled", "job_started_date": "2025-12-21" }]
  },
  {
    "po_id": "PO-00022",
    "po_date": "2025-12-22",
    "delivery_date": "2025-12-27",
    "customer": { "name": "Fruit Basket", "address": "Wholesale Market", "phone": "+94772221100", "email": "fruit@basket.com" },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0038", "job_name": "Sticker Print", "job_status": "In Progress", "job_started_date": "2025-12-22" },
      { "job_id": "JO-0039", "job_name": "Packing", "job_status": "Pending", "job_started_date": "2025-12-23" }
    ]
  },
  {
    "po_id": "PO-00023",
    "po_date": "2025-12-23",
    "delivery_date": "2025-12-28",
    "customer": { "name": "Coffee Bean", "address": "Plantation Road", "phone": "+94773330099", "email": "coffee@bean.com" },
    "total_jobs": 1,
    "pending_jobs": [{ "job_id": "JO-0040", "job_name": "Bag Print", "job_status": "Completed", "job_started_date": "2025-12-23" }]
  },
  {
    "po_id": "PO-00024",
    "po_date": "2025-12-24",
    "delivery_date": "2025-12-29",
    "customer": { "name": "Mega Stores", "address": "Ring Road", "phone": "+94774442211", "email": "mega@stores.com" },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0041", "job_name": "Print", "job_status": "Completed", "job_started_date": "2025-12-24" },
      { "job_id": "JO-0042", "job_name": "Inspection", "job_status": "Completed", "job_started_date": "2025-12-25" }
    ]
  },
  {
    "po_id": "PO-00025",
    "po_date": "2025-12-25",
    "delivery_date": "2025-12-30",
    "customer": { "name": "Home Needs", "address": "Suburb Lane", "phone": "+94775556688", "email": "home@needs.com" },
    "total_jobs": 1,
    "pending_jobs": [{ "job_id": "JO-0043", "job_name": "Label Print", "job_status": "Pending", "job_started_date": "2025-12-25" }]
  },
  {
    "po_id": "PO-00026",
    "po_date": "2025-12-26",
    "delivery_date": "2025-12-31",
    "customer": { "name": "Daily Mart", "address": "Cross Road", "phone": "+94778880011", "email": "daily@mart.com" },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0044", "job_name": "Print", "job_status": "In Progress", "job_started_date": "2025-12-26" },
      { "job_id": "JO-0045", "job_name": "Pack", "job_status": "Pending", "job_started_date": "2025-12-27" }
    ]
  },
  {
    "po_id": "PO-00027",
    "po_date": "2025-12-27",
    "delivery_date": "2026-01-01",
    "customer": { "name": "Nature Foods", "address": "Eco Park", "phone": "+94772229988", "email": "nature@foods.com" },
    "total_jobs": 1,
    "pending_jobs": [{ "job_id": "JO-0046", "job_name": "Eco Print", "job_status": "Completed", "job_started_date": "2025-12-27" }]
  },
  {
    "po_id": "PO-00028",
    "po_date": "2025-12-28",
    "delivery_date": "2026-01-02",
    "customer": { "name": "Happy Kids", "address": "Play Street", "phone": "+94776667777", "email": "happy@kids.com" },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0047", "job_name": "Box Print", "job_status": "Completed", "job_started_date": "2025-12-28" },
      { "job_id": "JO-0048", "job_name": "Sticker", "job_status": "Completed", "job_started_date": "2025-12-29" }
    ]
  },
  {
    "po_id": "PO-00029",
    "po_date": "2025-12-29",
    "delivery_date": "2026-01-03",
    "customer": { "name": "Tech Supplies", "address": "IT Park", "phone": "+94779991122", "email": "tech@supplies.com" },
    "total_jobs": 1,
    "pending_jobs": [{ "job_id": "JO-0049", "job_name": "Barcode Print", "job_status": "On Hold", "job_started_date": "2025-12-29" }]
  },
  {
    "po_id": "PO-00030",
    "po_date": "2025-12-30",
    "delivery_date": "2026-01-04",
    "customer": { "name": "Urban Mart", "address": "City Center", "phone": "+94779998877", "email": "urban@mart.com" },
    "total_jobs": 2,
    "pending_jobs": [
      { "job_id": "JO-0050", "job_name": "Wrapper Print", "job_status": "Completed", "job_started_date": "2025-12-30" },
      { "job_id": "JO-0051", "job_name": "Final Check", "job_status": "Completed", "job_started_date": "2025-12-31" }
    ]
  }
]
