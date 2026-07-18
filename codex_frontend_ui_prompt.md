# Codex Prompt: Laboratory Management System Frontend UI

คุณคือ Senior Frontend Developer และ UX/UI Designer

โปรดอ่านไฟล์ `user_Journey.md` ในโปรเจกต์ และสร้าง Frontend UI สำหรับระบบ Laboratory Management System ให้ครบทุกหน้าตาม User Journey

## เป้าหมายของงานรอบนี้

งานรอบนี้ให้ทำเฉพาะหน้าเว็บฝั่ง Frontend ให้ครบทุกหน้า โดยเน้น:

- UI สวยและพร้อมนำเสนอ
- Navigation ไปมาระหว่างหน้าได้
- Responsive บน Desktop, Tablet และ Mobile
- มี Mock Data ที่สมจริง
- มี Interaction ฝั่งหน้าเว็บ
- Component มีโครงสร้างพร้อมเชื่อม Backend ภายหลัง

ยังไม่ต้องทำระบบหลังบ้านใด ๆ

## ห้ามทำในรอบนี้

ไม่ต้องสร้างหรือเชื่อมต่อ:

- Backend Server
- Database
- API Routes
- Server Actions
- Authentication จริง
- Authorization จริง
- AI API จริง
- QR Scanner จริง
- File Upload จริง
- PDF Generator จริง
- Excel Export จริง
- Email หรือ Notification Service
- ระบบบันทึกข้อมูลถาวร

ห้ามเสียเวลาออกแบบ Schema ฐานข้อมูลหรือสร้าง API ที่ยังไม่จำเป็น

ใช้ Mock Data, React State และ UI Simulation เท่านั้น

## Tech Stack

ตรวจสอบโปรเจกต์เดิมก่อน

หากโปรเจกต์มี Tech Stack อยู่แล้ว ให้ใช้ของเดิมและไม่เปลี่ยนโครงสร้างหลักโดยไม่จำเป็น

หากยังไม่มี ให้ใช้:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Recharts

## หน้าที่ต้องสร้างให้ครบ

### 1. Login

Route:

```text
/login
```

ประกอบด้วย:

- Logo และชื่อระบบ
- Email หรือ Username
- Password
- Show Password
- Remember Me
- Forgot Password
- Sign In
- Demo Account สำหรับเลือก Role
- Loading State
- Invalid Login State

เมื่อกด Sign In ให้ Navigate ไป Dashboard ทันทีแบบ Mock

ไม่ต้องตรวจสอบ Username หรือ Password จริง

### 2. Dashboard

Route:

```text
/dashboard
```

ประกอบด้วย:

- Welcome Message สำหรับ Dr. Kan
- KPI Cards
- Samples Summary
- Active Experiments
- Tasks Due Today
- Available Equipment
- Expiring Chemicals
- Pending Reports
- Sample Registration Chart
- Experiment Status Chart
- Equipment Usage Chart
- Today’s Tasks
- Alerts
- Upcoming Equipment Bookings
- Recent Activity

ใช้กราฟจาก Recharts และ Mock Data

### 3. Sample Management

Route:

```text
/samples
```

ประกอบด้วย:

- Summary Cards
- Search
- Filters
- Sample Data Table
- Status Badge
- Pagination
- Register Sample Button
- Register Sample Drawer หรือ Dialog
- Sample Detail Drawer
- Edit Sample UI
- Archive Confirmation
- QR Code Placeholder
- Success State หลัง Register Sample

Columns อย่างน้อย:

- Sample ID
- Sample Name
- Type
- Owner
- Collection Date
- Storage Location
- Status
- Last Updated
- Actions

ใช้ Mock Samples อย่างน้อย 20 รายการ

### 4. Sample Tracking

Route:

```text
/sample-tracking
```

ประกอบด้วย:

- QR Scanner Placeholder
- Search by Sample ID
- Search by Sample Name
- Recent Scans
- Sample Result Card
- Storage Location Visualization
- Sample Movement Timeline
- Related Experiments
- QR Scan Failed State
- No Result State

ไม่ต้องเข้าถึงกล้องจริง

เมื่อกด Scan ให้จำลอง Success หรือ Error State ได้

### 5. Experiment Management

Routes:

```text
/experiments
/experiments/new
/experiments/[id]
```

ประกอบด้วย:

- Experiment Summary Cards
- Search และ Filters
- Table View
- Kanban View
- Create Experiment Form
- Experiment Detail Page
- Progress
- Priority
- Status
- Selected Samples
- Protocol
- Research Team
- Timeline
- Notes
- Attachments Placeholder
- Activity Log

Experiment Status:

- Draft
- Planning
- Running
- On Hold
- Completed
- Archived

Kanban ไม่ต้อง Drag and Drop จริง แต่ต้องออกแบบให้ดูพร้อมรองรับ

### 6. Equipment Booking

Route:

```text
/equipment
```

ประกอบด้วย:

- Equipment Summary
- Equipment Cards
- Availability Status
- Equipment Search และ Filter
- Day View
- Week View
- Month View
- Booking Calendar
- Booking Drawer หรือ Dialog
- Upcoming Bookings
- Maintenance Status
- Booking Conflict Warning
- Alternative Time Suggestions

ใช้อุปกรณ์ตัวอย่าง:

- PCR Machine
- Centrifuge
- Spectrophotometer
- Incubator
- Biosafety Cabinet
- Autoclave
- Microscope
- DNA Sequencer

ไม่ต้องสร้างระบบตรวจสอบเวลาจริง

ให้จำลอง Conflict State เมื่อเลือกช่วงเวลาที่กำหนดไว้ใน Mock Data

### 7. Electronic Lab Notebook

Route:

```text
/lab-notebook
```

ประกอบด้วย:

- Notebook Sidebar
- Recent Notes
- Drafts
- Pinned Notes
- Archived Notes
- Note Editor
- Rich Text Toolbar Placeholder
- Objective
- Method
- Observation
- Results
- Conclusion
- Attach Image Placeholder
- Attach File Placeholder
- Autosave Status
- Offline Status
- Version History Drawer
- Restore Version Confirmation

ไม่ต้องสร้าง Rich Text Editor จริง

สามารถใช้ Textarea หรือ Content Area ที่ออกแบบให้เหมือน Editor

### 8. AI Laboratory Assistant

Route:

```text
/ai-assistant
```

ประกอบด้วย:

- Chat Layout
- Conversation Sidebar
- New Analysis
- Suggested Prompts
- Select Experiment
- Attach Data Placeholder
- User Message
- AI Message
- Loading State
- Analysis Summary
- Key Findings
- Possible Anomalies
- Confidence Level
- Recommended Next Steps
- Disclaimer
- AI Analysis Failed State
- Enter Result Manually

Quick Actions:

- Analyze Result
- Summarize Experiment
- Find Anomalies
- Compare Experiments
- Suggest Next Steps
- Generate Conclusion

ไม่ต้องเชื่อม AI จริง

เมื่อผู้ใช้ส่งข้อความ ให้แสดง Mock AI Response

### 9. Report Center

Route:

```text
/reports
```

ประกอบด้วย:

- Report Summary Cards
- Report Templates
- Generate Report Form
- Report Type
- Date Range
- Experiment Selector
- Sample Selector
- Output Format
- Include AI Summary
- Report Preview
- Report History Table
- PDF Button
- Excel Button
- Download Button
- Failed Report State
- Generating State
- Completed State

ไม่ต้องสร้างไฟล์ PDF หรือ Excel จริง

เมื่อกด Generate ให้แสดง Loading และ Success Simulation

### 10. Archive

Route:

```text
/archive
```

ประกอบด้วย:

- Archive Categories
- Global Search
- Category Filter
- Date Range
- Archived By
- Archive Data Table
- View Detail
- Restore Confirmation
- Permanent Delete Confirmation
- Empty Archive State
- No Search Result State

Categories:

- Samples
- Experiments
- Lab Notes
- Reports
- Audit Logs

### 11. Settings

Route:

```text
/settings
```

สร้าง UI เบื้องต้นสำหรับ:

- Profile
- Laboratory Information
- Appearance
- Notifications
- User Roles
- Security
- Integrations

ทุกส่วนเป็น UI Mock เท่านั้น

## Global Application Layout

ทุกหน้าหลัง Login ต้องใช้ Layout เดียวกัน

### Sidebar

ประกอบด้วย:

- Dashboard
- Samples
- Sample Tracking
- Experiments
- Equipment Booking
- Lab Notebook
- AI Assistant
- Reports
- Archive
- Settings

Sidebar ต้อง:

- แสดง Active Route
- Collapse และ Expand ได้
- เปลี่ยนเป็น Drawer บน Mobile
- มี User Profile
- มี Role Badge
- มี Logout Button

เมื่อกด Logout ให้กลับไปหน้า Login แบบ Mock

### Top Navigation

ประกอบด้วย:

- Breadcrumb
- Global Search
- Laboratory Selector
- Notification Button
- Theme Toggle
- User Profile Dropdown

## Design Direction

ออกแบบเป็น Modern Laboratory SaaS Application

ลักษณะที่ต้องการ:

- Professional
- Clean
- Modern
- น่าเชื่อถือ
- ใช้งานง่าย
- Data-rich แต่ไม่รก
- มี Visual Hierarchy ชัดเจน
- ใช้พื้นที่ว่างเหมาะสม
- ไม่ดูเหมือน Admin Template ทั่วไป

สีแนะนำ:

- Slate หรือ Navy สำหรับโครงสร้างหลัก
- Blue, Cyan หรือ Teal เป็น Primary
- Green สำหรับ Success
- Orange สำหรับ Warning
- Red สำหรับ Critical
- Neutral Gray สำหรับข้อมูลทั่วไป

รองรับ:

- Light Mode
- Dark Mode
- Desktop
- Tablet
- Mobile

หลีกเลี่ยง:

- Gradient มากเกินไป
- Shadow หนักเกินไป
- Card จำนวนมากจนหน้าดูรก
- สีสดหลายสีพร้อมกัน
- Font เล็กเกินไป

## Persona

ใช้ข้อมูลผู้ใช้งานหลัก:

- Name: Dr. Kan
- Position: Biotechnology Researcher
- Role: Researcher
- Laboratory: Molecular Biotechnology Lab

ใช้ข้อมูลนี้ใน:

- User Profile
- Welcome Message
- Task Assignee
- Experiment Owner
- Lab Notebook Editor
- Report Generator

## Mock Data

สร้าง Mock Data แยกออกจาก UI Component

อย่างน้อย:

- Samples 20 รายการ
- Experiments 10 รายการ
- Equipment 8 รายการ
- Equipment Bookings 10 รายการ
- Lab Notes 10 รายการ
- Reports 8 รายการ
- Tasks 10 รายการ
- Notifications 8 รายการ
- Audit Logs 15 รายการ
- Chemicals 10 รายการ

ใช้ข้อมูลจริงที่เหมาะกับ Biotechnology

ห้ามใช้ Lorem Ipsum

ตัวอย่าง Sample:

- Human Plasma
- DNA Extract
- RNA Sample
- Bacterial Culture
- Cell Culture
- Tissue Sample
- Serum Sample
- Protein Extract

ตัวอย่าง Experiment:

- CRISPR Gene Editing Validation
- Protein Expression Analysis
- Bacterial Growth Study
- RNA Sequencing Preparation
- Cell Viability Assay
- DNA Extraction Optimization

## Frontend Interactions

แม้ยังไม่มี Backend แต่ Interaction เหล่านี้ต้องทำงานด้วย Local State:

- Navigation
- Sidebar Collapse
- Mobile Sidebar
- Theme Toggle
- Tabs
- Dropdowns
- Dialogs
- Drawers
- Search
- Filters
- Table Pagination
- View Toggle
- Form Inputs
- Basic Validation
- Toast Notifications
- Confirmation Dialogs
- Loading Simulation
- Success Simulation
- Error Simulation
- Mock Add Item
- Mock Edit Item
- Mock Archive Item

ข้อมูลไม่จำเป็นต้องอยู่หลัง Refresh หน้า

ทุกปุ่มหลักต้องมีผลตอบสนอง

ห้ามมีปุ่มที่กดแล้วไม่เกิดอะไรขึ้น

## UI States

สร้าง State ที่เหมาะสมให้แต่ละหน้า:

- Default
- Loading
- Empty
- Error
- Success
- Disabled
- No Search Results
- Confirmation
- Offline
- Access Denied
- Booking Conflict
- QR Scan Failed
- AI Analysis Failed

สามารถใช้ Mock Toggle หรือปุ่ม Demo State เพื่อแสดงบางสถานะได้

## Suggested Structure

```text
app/
  login/
    page.tsx
  dashboard/
    page.tsx
  samples/
    page.tsx
  sample-tracking/
    page.tsx
  experiments/
    page.tsx
    new/
      page.tsx
    [id]/
      page.tsx
  equipment/
    page.tsx
  lab-notebook/
    page.tsx
  ai-assistant/
    page.tsx
  reports/
    page.tsx
  archive/
    page.tsx
  settings/
    page.tsx

components/
  layout/
  navigation/
  dashboard/
  samples/
  tracking/
  experiments/
  equipment/
  notebook/
  ai/
  reports/
  archive/
  shared/

data/
  samples.ts
  experiments.ts
  equipment.ts
  bookings.ts
  chemicals.ts
  tasks.ts
  reports.ts
  audit-logs.ts

types/
  sample.ts
  experiment.ts
  equipment.ts
  report.ts
```

ปรับตามโครงสร้างโปรเจกต์ปัจจุบันได้

## Code Quality

- ใช้ TypeScript
- หลีกเลี่ยง `any`
- แยก Reusable Components
- แยก Mock Data ออกจาก UI
- แยก Page Component ออกจาก Dialog และ Drawer
- หลีกเลี่ยงไฟล์ที่ใหญ่เกินไป
- ใช้ชื่อ Component ที่เข้าใจง่าย
- ไม่มี Broken Imports
- ไม่มี Runtime Error
- ไม่มี TypeScript Error
- ไม่มี ESLint Error

## Accessibility

- ทุก Form Field มี Label
- Icon Button มี `aria-label`
- รองรับ Keyboard Navigation
- มี Focus State
- Dialog ปิดด้วย Escape ได้
- ใช้ Semantic HTML
- สีมี Contrast อ่านง่าย
- ไม่ใช้สีเพียงอย่างเดียวเพื่อบอกสถานะ

## ลำดับการทำงาน

1. ตรวจสอบโครงสร้างโปรเจกต์และ Dependencies
2. อ่าน `user_Journey.md`
3. สร้าง Theme และ Design Tokens
4. สร้าง TypeScript Types
5. สร้าง Mock Data
6. สร้าง Shared Components
7. สร้าง Sidebar และ Top Navigation
8. สร้าง Login
9. สร้าง Dashboard
10. สร้าง Samples
11. สร้าง Sample Tracking
12. สร้าง Experiments
13. สร้าง Equipment Booking
14. สร้าง Lab Notebook
15. สร้าง AI Assistant
16. สร้าง Reports
17. สร้าง Archive
18. สร้าง Settings
19. ปรับ Responsive ทุกหน้า
20. ตรวจสอบ Interaction ทุกปุ่ม
21. รัน Type Check
22. รัน Lint
23. รัน Production Build
24. แก้ไข Error ทั้งหมด

ให้ทำงานต่อเนื่องจนครบทุกหน้าโดยไม่ต้องหยุดรอคำยืนยัน

## Definition of Done

งานรอบนี้ถือว่าเสร็จเมื่อ:

- มีหน้า UI ครบทุก Route
- Sidebar เชื่อมไปทุกหน้าได้
- Login เข้า Dashboard ได้แบบ Mock
- Logout กลับ Login ได้
- ทุกหน้ามี Mock Data
- Search และ Filter ทำงานแบบ Local
- Dialog และ Drawer เปิดปิดได้
- Forms มี Validation เบื้องต้น
- Dashboard Charts แสดงผล
- Theme Toggle ทำงาน
- Responsive ทุกหน้า
- ไม่มีปุ่มหลักที่กดแล้วไม่ตอบสนอง
- ไม่มี Runtime Error
- ไม่มี TypeScript Error
- ไม่มี ESLint Error
- Production Build ผ่าน

## สิ่งที่ไม่ถือเป็นงานรอบนี้

รายการต่อไปนี้ให้เตรียมโครงสร้างไว้เชื่อมภายหลัง แต่ยังไม่ต้องพัฒนา:

- Authentication Backend
- Role Permission Backend
- Database
- REST API
- GraphQL
- AI Service
- File Storage
- QR Code Hardware Integration
- Report Export Service
- Email Service
- Real-time Updates
- Audit Log Backend

## รายงานหลังทำเสร็จ

สรุปผลดังนี้:

1. หน้าที่สร้างครบแล้ว
2. Routes ที่เพิ่ม
3. Components สำคัญ
4. Mock Data ที่สร้าง
5. Interaction ที่ใช้งานได้
6. ส่วนที่เป็น UI Simulation
7. ไฟล์สำคัญที่เพิ่มหรือแก้
8. วิธีรันโปรเจกต์
9. ผล Type Check
10. ผล Lint
11. ผล Production Build
12. รายการที่ต้องเชื่อม Backend ในรอบถัดไป

เริ่มจากตรวจสอบโปรเจกต์และอ่าน `user_Journey.md` จากนั้นลงมือสร้าง Frontend UI ให้ครบทุกหน้า

**งานรอบนี้ให้สร้างเฉพาะ Frontend UI ทุกหน้า ใช้ Mock Data และ Local State เท่านั้น ห้ามสร้าง Backend, Database, API Routes หรือ Server Actions**
