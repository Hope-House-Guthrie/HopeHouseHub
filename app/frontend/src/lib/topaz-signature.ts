/**
 * Frontend adapter boundary for Topaz signature capture.
 *
 * SignatureCanvas should only depend on this adapter. Keep device-specific
 * implementation details (USB, SDK, OS, service packaging, permissions,
 * startup) out of SignatureCanvas — they belong behind this boundary.
 *
 * DEV/POC endpoint note:
 * http://127.0.0.1:8765/capture is a localhost DEV/POC endpoint used to prove
 * Topaz capture end-to-end. The Linux proof succeeded with a physical Topaz
 * T-S460-HSB-R. That endpoint returned a normalized PNG as raw base64 in
 * { imageBase64: string }. SignatureCanvas successfully displayed the returned
 * signature and passed the base64 through its existing onSignatureChange
 * contract (raw base64, no "data:image/png;base64," prefix).
 *
 * The localhost URL/port and bridge implementation are NOT a production
 * architecture decision. Production hardware communication, service packaging,
 * endpoint/configuration, permissions, startup behavior, and Windows/Linux
 * integration remain backend/infrastructure handoff decisions.
 */
export interface TopazSignatureResult {
  imageBase64: string;
}

export async function captureTopazSignature(): Promise<TopazSignatureResult> {
  const response = await fetch("http://127.0.0.1:8765/capture", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Topaz capture failed with status ${response.status}.`);
  }

  return (await response.json()) as TopazSignatureResult;
}
