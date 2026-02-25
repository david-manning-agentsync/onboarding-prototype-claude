// ─── Types ────────────────────────────────────────────────────────────────────
export type Task = {
  id: string;
  name: string;
  type: string;
  status: string;
  owner: string;
  required: boolean;
  detail: string;
  rejectionNote: string;
};

export type ActivityEntry = {
  date: string;
  event: string;
  detail: string;
};

export type Producer = {
  id: number;
  name: string;
  npn: string;
  classification: string;
  status: string;
  invited: string;
  lastTask: string;
  resident: string;
  tasks: Task[];
  activityLog: ActivityEntry[];
};

export type PolicySet = {
  id: string;
  name: string;
  orgWide: boolean;
  tasks: number;
  desc: string;
};

export type SavedView = {
  id: string;
  name: string;
  filters: Record<string, string[]>;
  table: string;
};

// ─── Producers ────────────────────────────────────────────────────────────────
export const PRODUCERS_SEED: Producer[] = [
  { id:1, name:"Marcus Webb", npn:"9812374", classification:"Needs License", status:"In Progress", invited:"Jan 10, 2025", lastTask:"Jan 14, 2025", resident:"CA", tasks:[
    {id:"t1a",name:"Submit NPN",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"Provide your National Producer Number.",rejectionNote:""},
    {id:"t1b",name:"Background Check Authorization",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"Sign authorization form.",rejectionNote:""},
    {id:"t1c",name:"Upload Resident License",type:"Org",status:"Needs Approval",owner:"Producer",required:true,detail:"Upload current resident license.",rejectionNote:""},
    {id:"t1d",name:"E&O Insurance Verification",type:"Org",status:"Open",owner:"Producer",required:true,detail:"Upload E&O certificate.",rejectionNote:""},
    {id:"t1e",name:"IT Provisioning",type:"Org",status:"Open",owner:"Customer",required:true,detail:"IT sets up system access.",rejectionNote:""},
  ], activityLog:[
    {date:"Jan 14, 2025",event:"Task completed",detail:"Background Check Authorization marked done"},
    {date:"Jan 10, 2025",event:"Onboarding started",detail:"Producer invited"},
  ]},
  {id:2,name:"Samantha Lee",npn:"—",classification:"Needs License",status:"Invited",invited:"Jan 18, 2025",lastTask:"—",resident:"NY",tasks:[
    {id:"t2a",name:"Provide NPN or Confirm Unlicensed",type:"Regulatory",status:"Open",owner:"Producer",required:true,detail:"Enter NPN or indicate unlicensed.",rejectionNote:""},
    {id:"t2b",name:"Confirm Resident State",type:"Regulatory",status:"Open",owner:"Producer",required:true,detail:"Confirm primary state.",rejectionNote:""},
  ],activityLog:[{date:"Jan 18, 2025",event:"Onboarding started",detail:"Producer invited"}]},
  {id:3,name:"Trevor Banks",npn:"—",classification:"Needs License",status:"Waiting/Blocked",invited:"Jan 20, 2025",lastTask:"Jan 21, 2025",resident:"GA",tasks:[
    {id:"t3a",name:"Submit NPN",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"Provide NPN.",rejectionNote:""},
    {id:"t3b",name:"Background Check Authorization",type:"Regulatory",status:"Needs Approval",owner:"Producer",required:true,detail:"Awaiting review.",rejectionNote:""},
    {id:"t3c",name:"Upload Resident License",type:"Org",status:"Open",owner:"Producer",required:true,detail:"Upload once obtained.",rejectionNote:""},
  ],activityLog:[
    {date:"Jan 21, 2025",event:"Task submitted",detail:"Background Check submitted"},
    {date:"Jan 20, 2025",event:"Onboarding started",detail:"Producer invited"},
  ]},
  {id:4,name:"Anita Flores",npn:"2298103",classification:"Needs License",status:"Completed",invited:"Dec 5, 2024",lastTask:"Jan 2, 2025",resident:"AZ",tasks:[
    {id:"t4a",name:"Submit NPN",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"NPN submitted.",rejectionNote:""},
    {id:"t4b",name:"Background Check",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"Cleared.",rejectionNote:""},
    {id:"t4c",name:"Upload Resident License",type:"Org",status:"Done",owner:"Producer",required:true,detail:"Verified.",rejectionNote:""},
    {id:"t4d",name:"IT Provisioning",type:"Org",status:"Done",owner:"Customer",required:true,detail:"Provisioned.",rejectionNote:""},
  ],activityLog:[
    {date:"Jan 2, 2025",event:"Onboarding completed",detail:"All tasks approved"},
    {date:"Dec 5, 2024",event:"Onboarding started",detail:"Producer invited"},
  ]},
  {id:5,name:"Priya Nair",npn:"4430918",classification:"Needs LOAs",status:"Waiting/Blocked",invited:"Jan 8, 2025",lastTask:"Jan 11, 2025",resident:"TX",tasks:[
    {id:"t5a",name:"Submit NPN",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"NPN provided.",rejectionNote:""},
    {id:"t5b",name:"LOA Request - Life",type:"Regulatory",status:"Open",owner:"Producer",required:true,detail:"Request LOA for Life.",rejectionNote:""},
    {id:"t5c",name:"LOA Request - Health",type:"Regulatory",status:"Open",owner:"Producer",required:true,detail:"Request LOA for Health.",rejectionNote:""},
    {id:"t5d",name:"Carrier Appointment Form",type:"Org",status:"Done",owner:"Producer",required:true,detail:"Complete.",rejectionNote:""},
  ],activityLog:[
    {date:"Jan 11, 2025",event:"Task completed",detail:"Carrier Appointment Form done"},
    {date:"Jan 8, 2025",event:"Onboarding started",detail:"Producer invited"},
  ]},
  {id:6,name:"Fatima Al-Hassan",npn:"6614527",classification:"Needs LOAs",status:"In Progress",invited:"Jan 12, 2025",lastTask:"Jan 15, 2025",resident:"IL",tasks:[
    {id:"t6a",name:"LOA - P&C",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"Submitted.",rejectionNote:""},
    {id:"t6b",name:"Supplemental Questionnaire",type:"Org",status:"Needs Approval",owner:"Producer",required:false,detail:"Under review.",rejectionNote:""},
    {id:"t6c",name:"Manager Review",type:"Org",status:"Open",owner:"Customer",required:true,detail:"Manager verifies data.",rejectionNote:""},
  ],activityLog:[
    {date:"Jan 15, 2025",event:"Task submitted",detail:"Questionnaire submitted"},
    {date:"Jan 12, 2025",event:"Onboarding started",detail:"Producer invited"},
  ]},
  {id:7,name:"Derrick Holloway",npn:"8821033",classification:"Needs LOAs",status:"Invited",invited:"Jan 22, 2025",lastTask:"—",resident:"NC",tasks:[
    {id:"t7a",name:"Confirm Resident State",type:"Regulatory",status:"Open",owner:"Producer",required:true,detail:"Confirm residence.",rejectionNote:""},
    {id:"t7b",name:"LOA Request - Life",type:"Regulatory",status:"Open",owner:"Producer",required:true,detail:"Life LOA.",rejectionNote:""},
    {id:"t7c",name:"LOA Request - Annuities",type:"Regulatory",status:"Open",owner:"Producer",required:true,detail:"Annuities LOA.",rejectionNote:""},
  ],activityLog:[{date:"Jan 22, 2025",event:"Onboarding started",detail:"Producer invited"}]},
  {id:8,name:"Claire Sutton",npn:"3317402",classification:"Needs LOAs",status:"Completed",invited:"Nov 28, 2024",lastTask:"Dec 18, 2024",resident:"WA",tasks:[
    {id:"t8a",name:"LOA - Life",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"Approved.",rejectionNote:""},
    {id:"t8b",name:"LOA - Health",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"Approved.",rejectionNote:""},
    {id:"t8c",name:"Carrier Appointment",type:"Org",status:"Done",owner:"Producer",required:true,detail:"Confirmed.",rejectionNote:""},
  ],activityLog:[
    {date:"Dec 18, 2024",event:"Onboarding completed",detail:"All tasks approved"},
    {date:"Nov 28, 2024",event:"Onboarding started",detail:"Producer invited"},
  ]},
  {id:9,name:"Ravi Patel",npn:"5540293",classification:"Needs LOAs",status:"Terminated",invited:"Dec 10, 2024",lastTask:"Dec 14, 2024",resident:"NJ",tasks:[
    {id:"t9a",name:"LOA - P&C",type:"Regulatory",status:"Rejected",owner:"Producer",required:true,detail:"Rejected.",rejectionNote:"Application incomplete — missing supporting documentation."},
  ],activityLog:[
    {date:"Dec 14, 2024",event:"Status changed",detail:"Process terminated"},
    {date:"Dec 10, 2024",event:"Onboarding started",detail:"Producer invited"},
  ]},
  {id:10,name:"James Okon",npn:"3320481",classification:"Reg Tasks Only",status:"Completed",invited:"Dec 20, 2024",lastTask:"Jan 5, 2025",resident:"OH",tasks:[
    {id:"t10a",name:"Background Check",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"Complete.",rejectionNote:""},
    {id:"t10b",name:"Resident State Confirmation",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"Confirmed.",rejectionNote:""},
  ],activityLog:[
    {date:"Jan 5, 2025",event:"Onboarding completed",detail:"All tasks approved"},
    {date:"Dec 20, 2024",event:"Onboarding started",detail:"Producer invited"},
  ]},
  {id:11,name:"Maya Torres",npn:"7712904",classification:"Reg Tasks Only",status:"In Progress",invited:"Jan 14, 2025",lastTask:"Jan 17, 2025",resident:"CO",tasks:[
    {id:"t11a",name:"Background Check Authorization",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"Signed.",rejectionNote:""},
    {id:"t11b",name:"State Background Questions - CO",type:"Regulatory",status:"Open",owner:"Producer",required:true,detail:"Answer CO questions.",rejectionNote:""},
    {id:"t11c",name:"Confirm Resident State",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"CO confirmed.",rejectionNote:""},
  ],activityLog:[
    {date:"Jan 17, 2025",event:"Task completed",detail:"Confirm Resident State done"},
    {date:"Jan 14, 2025",event:"Onboarding started",detail:"Producer invited"},
  ]},
  {id:12,name:"Leon Pierce",npn:"9934812",classification:"Reg Tasks Only",status:"Waiting/Blocked",invited:"Jan 9, 2025",lastTask:"Jan 13, 2025",resident:"MI",tasks:[
    {id:"t12a",name:"State Background Questions - MI",type:"Regulatory",status:"Needs Approval",owner:"Producer",required:true,detail:"Submitted awaiting review.",rejectionNote:""},
    {id:"t12b",name:"Background Check Authorization",type:"Regulatory",status:"Done",owner:"Producer",required:true,detail:"Complete.",rejectionNote:""},
  ],activityLog:[
    {date:"Jan 13, 2025",event:"Task submitted",detail:"MI background questions submitted"},
    {date:"Jan 9, 2025",event:"Onboarding started",detail:"Producer invited"},
  ]},
  {id:13,name:"Ingrid Müller",npn:"—",classification:"Reg Tasks Only",status:"Invited",invited:"Jan 23, 2025",lastTask:"—",resident:"MN",tasks:[
    {id:"t13a",name:"Confirm Resident State",type:"Regulatory",status:"Open",owner:"Producer",required:true,detail:"Confirm MN residency.",rejectionNote:""},
    {id:"t13b",name:"State Background Questions - MN",type:"Regulatory",status:"Open",owner:"Producer",required:true,detail:"Complete MN questions.",rejectionNote:""},
  ],activityLog:[{date:"Jan 23, 2025",event:"Onboarding started",detail:"Producer invited"}]},
  {id:14,name:"Daniel Cruz",npn:"7751029",classification:"Org Requirements",status:"In Progress",invited:"Jan 15, 2025",lastTask:"Jan 16, 2025",resident:"FL",tasks:[
    {id:"t14a",name:"Compliance Training",type:"Org",status:"Done",owner:"Producer",required:true,detail:"Annual training complete.",rejectionNote:""},
    {id:"t14b",name:"Review Code of Conduct",type:"Org",status:"Open",owner:"Producer",required:true,detail:"Read and acknowledge.",rejectionNote:""},
    {id:"t14c",name:"Data Privacy Attestation",type:"Org",status:"Open",owner:"Producer",required:true,detail:"Confirm data privacy policies.",rejectionNote:""},
  ],activityLog:[
    {date:"Jan 16, 2025",event:"Task completed",detail:"Compliance Training done"},
    {date:"Jan 15, 2025",event:"Onboarding started",detail:"Producer invited"},
  ]},
  {id:15,name:"Keisha Monroe",npn:"1124577",classification:"Org Requirements",status:"Completed",invited:"Dec 15, 2024",lastTask:"Dec 29, 2024",resident:"TN",tasks:[
    {id:"t15a",name:"Compliance Training",type:"Org",status:"Done",owner:"Producer",required:true,detail:"Completed.",rejectionNote:""},
    {id:"t15b",name:"Code of Conduct Acknowledgment",type:"Org",status:"Done",owner:"Producer",required:true,detail:"Acknowledged.",rejectionNote:""},
    {id:"t15c",name:"IT Provisioning",type:"Org",status:"Done",owner:"Customer",required:true,detail:"Provisioned.",rejectionNote:""},
  ],activityLog:[
    {date:"Dec 29, 2024",event:"Onboarding completed",detail:"All tasks approved"},
    {date:"Dec 15, 2024",event:"Onboarding started",detail:"Producer invited"},
  ]},
  {id:16,name:"Omar Khalid",npn:"4489201",classification:"Org Requirements",status:"Waiting/Blocked",invited:"Jan 6, 2025",lastTask:"Jan 10, 2025",resident:"TX",tasks:[
    {id:"t16a",name:"Compliance Training",type:"Org",status:"Done",owner:"Producer",required:true,detail:"Complete.",rejectionNote:""},
    {id:"t16b",name:"Internal Background Review",type:"Org",status:"Needs Approval",owner:"Customer",required:true,detail:"HR review pending.",rejectionNote:""},
    {id:"t16c",name:"Data Privacy Attestation",type:"Org",status:"Open",owner:"Producer",required:true,detail:"After HR review.",rejectionNote:""},
  ],activityLog:[
    {date:"Jan 10, 2025",event:"Task submitted",detail:"Background Review submitted"},
    {date:"Jan 6, 2025",event:"Onboarding started",detail:"Producer invited"},
  ]},
  {id:17,name:"Bianca Rossi",npn:"—",classification:"Org Requirements",status:"Invited",invited:"Jan 24, 2025",lastTask:"—",resident:"CA",tasks:[
    {id:"t17a",name:"Compliance Training",type:"Org",status:"Open",owner:"Producer",required:true,detail:"Complete training module.",rejectionNote:""},
    {id:"t17b",name:"Code of Conduct Acknowledgment",type:"Org",status:"Open",owner:"Producer",required:true,detail:"Review and sign.",rejectionNote:""},
  ],activityLog:[{date:"Jan 24, 2025",event:"Onboarding started",detail:"Producer invited"}]},
  {id:18,name:"Harold Kim",npn:"6637890",classification:"Org Requirements",status:"Terminated",invited:"Nov 20, 2024",lastTask:"Nov 25, 2024",resident:"PA",tasks:[
    {id:"t18a",name:"Compliance Training",type:"Org",status:"Done",owner:"Producer",required:true,detail:"Completed.",rejectionNote:""},
    {id:"t18b",name:"Data Privacy Attestation",type:"Org",status:"Rejected",owner:"Producer",required:true,detail:"Failed attestation.",rejectionNote:"Attestation responses did not meet compliance requirements."},
  ],activityLog:[
    {date:"Nov 25, 2024",event:"Status changed",detail:"Process terminated"},
    {date:"Nov 20, 2024",event:"Onboarding started",detail:"Producer invited"},
  ]},
];

// ─── Policy Sets ──────────────────────────────────────────────────────────────
export const POLICY_SETS_SEED: PolicySet[] = [
  {id:"ps1",name:"Standard Onboarding",orgWide:true,tasks:5,desc:"Required for all producers"},
  {id:"ps2",name:"P&C Producer",orgWide:false,tasks:4,desc:"Property & casualty line producers"},
  {id:"ps3",name:"Life & Health Producer",orgWide:false,tasks:3,desc:"Life and health line producers"},
];

export const POLICY_REQS: Record<string, string[]> = {
  ps1:["CA Background Check","NPN Verification","E&O Insurance","IT Provisioning","Compliance Training"],
  ps2:["P&C LOA Request","Upload License","Carrier Appointment","Code of Conduct"],
  ps3:["Life LOA","Health LOA","Supplemental Questionnaire"],
};

// ─── Default Saved Views ──────────────────────────────────────────────────────
export const DEFAULT_PRODUCER_VIEWS: SavedView[] = [
  {id:"pv1",name:"In Progress",filters:{status:["In Progress"]},table:"producers"},
  {id:"pv2",name:"Needs License",filters:{classification:["Needs License"]},table:"producers"},
];

export const DEFAULT_TASK_VIEWS: SavedView[] = [
  {id:"tv1",name:"Needs Approval",filters:{status:["Needs Approval"]},table:"tasks"},
  {id:"tv2",name:"Open Tasks",filters:{status:["Open"]},table:"tasks"},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const countBy = (arr: any[], key: string) =>
  arr.reduce((a, x) => { a[x[key]] = (a[x[key]] || 0) + 1; return a; }, {} as Record<string, number>);

export const TIMEFRAMES = ["Last 7 days", "Last 30 days", "Last 90 days", "All time"];
