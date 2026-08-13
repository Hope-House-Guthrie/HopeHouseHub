/**
 *  UA / Rapid Drug Screen Form Page
 * 
 *  Purpose: Digital replica of Hope House's paper UA / Rapid Drug Screen form
 * 
 *  IMPORTANT COMMENTS FOR FUTURE DEVELOPERS:
 *  - This form reproduces the existing paper form verbatim
 *  - Do NOT add extra fields beyond what's specified in the requirements
 *  - Signature areas are placeholders - determine digital signature method later
 *  - Backend integration: See uaForm.ts slice for REST API patterns needed
 * 
 *  Backend Connection Notes:
 *  - POST /api/ua-forms - Create new UA form (UA reason: Random/Pass Return/Intake)
 *  - PUT /api/ua-forms/:id - Update existing UA form
 *  - GET /api/ua-forms/:id - Retrieve specific UA form
 *  - GET /api/ua-forms?clientName=... - Search by client
 * 
 *  Data Flow:
 *       Redux Store (uaForm.ts) <---> Page Component <---> Future API Calls
 */

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
} from "@mui/material";
import { useAppDispatch } from "@/store/hooks";
import type { UAForm, DrugResult } from "@/store/slices/uaForm";

// Import the slice for creating initial form state
import { uaFormSlice, updateSpecimenTemp } from "@/store/slices/uaForm";
import SignatureCanvas from "@/components/SignatureCanvas";

// Create initial form state (mirrors uaForm.ts slice structure)
const createInitialForm = (): UAForm => ({
  id: crypto.randomUUID(),
  clientName: "",
  intakeDate: "",
  lastUaDate: "",
  drugPanels: [
    { id: "amp", abbreviation: "AMP", full_name: "Amphetamine", result: "Verify" as DrugResult },
    { id: "bar", abbreviation: "BAR", full_name: "Secobarbital", result: "Verify" as DrugResult },
    { id: "bup", abbreviation: "BUP", full_name: "Buprenorphine", result: "Verify" as DrugResult },
    { id: "bzo", abbreviation: "BZO", full_name: "Oxazepam", result: "Verify" as DrugResult },
    { id: "coc", abbreviation: "COC", full_name: "Cocaine", result: "Verify" as DrugResult },
    { id: "mdfa", abbreviation: "MDMA", full_name: "Methylenedioxymethamphetamine (MDMA/Ecstasy)", result: "Verify" as DrugResult },
    { id: "met", abbreviation: "MET", full_name: "Methamphetamine", result: "Verify" as DrugResult },
    { id: "mtd", abbreviation: "MTD", full_name: "Methadone", result: "Verify" as DrugResult },
    { id: "opi2000", abbreviation: "OPI 2000", full_name: "Opiates (2000 ng/mL cutoff)", result: "Verify" as DrugResult },
    { id: "oxy", abbreviation: "OXY", full_name: "Oxycodone", result: "Verify" as DrugResult },
    { id: "pcp", abbreviation: "PCP", full_name: "Phencyclidine", result: "Verify" as DrugResult },
    { id: "ppx", abbreviation: "PPX", full_name: "Propoxyphene", result: "Verify" as DrugResult },
    { id: "tca", abbreviation: "TCA", full_name: "Nortriptyline", result: "Verify" as DrugResult },
    { id: "thc50", abbreviation: "THC 50", full_name: "Cannabinoids / Marijuana (50 ng/mL cutoff)", result: "Verify" as DrugResult },
  ],
  observedBy: { staffName: "", time: "", observed: "Yes" },
  uaReason: "Random",
  remarks: "",
  collectorInfo: { collectorName: "", collectorPhone: "", collectionDate: "" },
  specimenTemp: "In Range",
  clientSignature: "",
  clientSignatureDate: "",
  adminSignature: "",
  adminSignatureDate: "",
  submittedAt: new Date().toISOString(),
  status: "pending",
});

// --- Helper: Capitalize each word in a name ---
const capitalize = (s: string) => {
  if (!s) return s;
  return s.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// --- Helper: Format phone number as (XXX) XXX-XXXX ---
const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.substr(0, 3)}) ${digits.substr(3, 3)}-${digits.substr(6)}`;
  }
  return value;
};

export default function UAFormPage() {
  const dispatch = useAppDispatch();
  
  // Local form state (will connect to Redux when needed)
  const [form, setForm] = useState<UAForm>(createInitialForm);
  
  // --- Handler: Update drug panel result ---
  const handleDrugResultChange = (panelId: string, result: DrugResult) => {
    setForm(prev => ({
      ...prev,
      drugPanels: prev.drugPanels.map(panel =>
        panel.id === panelId ? { ...panel, result } : panel
      ),
    }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h4" gutterBottom>
        UA / Rapid Drug Screen Form
      </Typography>
      
      {/* Step 3.4: Client Information Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Client Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Client Name"
              value={form.clientName}
              onChange={(e) => {
                const name = capitalize(e.target.value);
                setForm({ ...form, clientName: name });
                // TODO: When backend is ready, call client lookup API here:
                // fetchClientDates(name).then(dates => {
                //   setForm(prev => ({
                //     ...prev,
                //     intakeDate: dates.intakeDate || prev.intakeDate,
                //     lastUaDate: dates.lastUaDate || prev.lastUaDate
                //   }));
                // });
              }}
              required
            />
            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Intake Date</FormLabel>
              <TextField
                type="date"
                value={form.intakeDate}
                onChange={(e) => setForm({ ...form, intakeDate: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Last UA Date</FormLabel>
              <TextField
                type="date"
                value={form.lastUaDate}
                onChange={(e) => setForm({ ...form, lastUaDate: e.target.value })}
              />
            </FormControl>
          </Box>
        </CardContent>
      </Card>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Rapid Drug Screen Results
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {form.drugPanels.map((panel, index) => (
              <Box 
                key={panel.id} 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 2,
                  justifyContent: "space-between",
                  backgroundColor: index % 2 === 0 ? "white" : "grey.100"
                }}
              >
                <Typography variant="body2" sx={{ minWidth: 180 }}>
                  {panel.abbreviation} - {panel.full_name}
                </Typography>
                <Select
                  value={panel.result}
                  onChange={(e) => handleDrugResultChange(panel.id, e.target.value as DrugResult)}
                  sx={{ 
                    minWidth: 120,
                    backgroundColor: panel.result === "Negative" ? "#d4edda" :
                                       panel.result === "Positive" ? "#f8d7da" : "white",
                    '&.MuiSelect-select': {
                      color: panel.result === "Negative" ? "#155724" :
                             panel.result === "Positive" ? "#d32f2f" : "text.primary"
                    }
                  }}
                >
                  <MenuItem value="Positive">Positive</MenuItem>
                  <MenuItem value="Negative">Negative</MenuItem>
                </Select>
              </Box>
            ))}
          </Box>
        </CardContent>    
      </Card>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Observed By
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <TextField
              label="Staff Name"
              value={form.observedBy.staffName}
              onChange={(e) => setForm({ ...form, observedBy: { ...form.observedBy, staffName: e.target.value } })}
              required
            />
            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Time</FormLabel>
              <TextField
                type="time"
                value={form.observedBy.time}
                onFocus={(e) => {
                  if (!form.observedBy.time) {
                    const now = new Date().toLocaleString("en-US", {timeZone: "America/Chicago"});
                    const centralDate = new Date(now);
                    const hours = String(centralDate.getHours()).padStart(2, '0');
                    const minutes = String(centralDate.getMinutes()).padStart(2, '0');
                    setForm({ ...form, observedBy: { ...form.observedBy, time: `${hours}:${minutes}` } });
                  }
                }}
                onChange={(e) => setForm({ ...form, observedBy: { ...form.observedBy, time: e.target.value } })}
              />
            </FormControl>
            <FormControl component="fieldset">
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Observed</FormLabel>
              <RadioGroup
                row
                value={form.observedBy.observed}
                onChange={(e) => setForm({ ...form, observedBy: { ...form.observedBy, observed: e.target.value as "Yes" | "No" } })}
              >
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
        </CardContent>
      </Card>
      
      <FormControl fullWidth>
        <InputLabel sx={{ fontSize: 20, fontWeight: 1000 }}>UA Reason</InputLabel>
        <Select
          value={form.uaReason}
          onChange={(e) => setForm({ ...form, uaReason: e.target.value as "Random" | "Pass Return" | "Intake" })}
          label="UA Reason"
        >
          <MenuItem value="Random">Random</MenuItem>
          <MenuItem value="Pass Return">Pass Return</MenuItem>
          <MenuItem value="Intake">Intake</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Remarks</FormLabel>
        <TextField
          multiline
          rows={4}
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          placeholder="Enter notes, explanations, or other relevant information..."
        />
      </FormControl>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Collector Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Collector Name"
              value={form.collectorInfo.collectorName}
              onChange={(e) => setForm({ ...form, collectorInfo: { ...form.collectorInfo, collectorName: capitalize(e.target.value) } })}
              required
            />
            <TextField
              type="tel"
              label="Collector Phone Number"
              value={form.collectorInfo.collectorPhone}
              onChange={(e) => setForm({ ...form, collectorInfo: { ...form.collectorInfo, collectorPhone: formatPhone(e.target.value) } })}
              required
            />
            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Collection Date</FormLabel>
              <TextField
                type="date"
                value={form.collectorInfo.collectionDate}
                onChange={(e) => setForm({ ...form, collectorInfo: { ...form.collectorInfo, collectionDate: e.target.value } })}
                required
              />
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <FormControl component="fieldset">
        <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Specimen Temperature</FormLabel>
        <RadioGroup
          row
          value={form.specimenTemp}
          onChange={(e) => setForm({ ...form, specimenTemp: e.target.value as "In Range" | "Not In Range" })}
        >
          <FormControlLabel value="In Range" control={<Radio />} label="In Range" />
          <FormControlLabel value="Not In Range" control={<Radio />} label="Not In Range" />
        </RadioGroup>
      </FormControl>
      
      {/* Step 3.11: Client Signature Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Client Signature
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please sign above using your finger or stylus on this tablet screen.
          </Typography>

          <SignatureCanvas
            onSignatureChange={(base64) => setForm({ ...form, clientSignature: base64 })}
            height={150}
            disabled={form.status === "approved"}
          />

          <FormControl fullWidth sx={{ mt: 1 }}>
            <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Signature Date</FormLabel>
            <TextField
              type="date"
              value={form.clientSignatureDate || ""}
              onChange={(e) => setForm({ ...form, clientSignatureDate: e.target.value })}
              required
              disabled={!form.clientSignature}
            />
          </FormControl>
          {form.clientSignature && (
            <Box sx={{ mt: 2 }}>
              <img
                src={`data:image/png;base64,${form.clientSignature}`}
                alt="Client Signature Preview"
                style={{ maxWidth: "200px", border: "1px solid #ddd", padding: "5px" }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Step 3.12: Administration Signature Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Administration Signature
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Administration may sign at a later time after reviewing the form.
          </Typography>

          <SignatureCanvas
            onSignatureChange={(base64) => setForm({ ...form, adminSignature: base64 })}
            height={150}
            disabled={form.status === "signed"}
          />

          <FormControl fullWidth sx={{ mt: 1 }}>
            <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Signature Date</FormLabel>
            <TextField
              type="date"
              value={form.adminSignatureDate || ""}
              onChange={(e) => setForm({ ...form, adminSignatureDate: e.target.value })}
              required
              disabled={!form.adminSignature}
            />
          </FormControl>
          {form.adminSignature && (
            <Box sx={{ mt: 2 }}>
              <img
                src={`data:image/png;base64,${form.adminSignature}`}
                alt="Administration Signature Preview"
                style={{ maxWidth: "200px", border: "1px solid #ddd", padding: "5px" }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}