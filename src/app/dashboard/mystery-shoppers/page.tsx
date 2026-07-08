"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

const LOCATION_ID = process.env.NEXT_PUBLIC_LOCATION_ID!;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  applied:    { label: "Applied",    color: "var(--gold-400)" },
  scheduled:  { label: "Scheduled",  color: "#7eb8d4" },
  completed:  { label: "Completed",  color: "#90cba8" },
  approved:   { label: "Approved",   color: "#a8d5a2" },
  reimbursed: { label: "Reimbursed", color: "var(--onyx-500)" },
  rejected:   { label: "Rejected",   color: "#e57373" },
};

function StarDisplay({ rating }: { rating?: number | null }) {
  if (!rating) return <span style={{ color: "var(--onyx-600)", fontSize: 12 }}>—</span>;
  return (
    <span style={{ letterSpacing: 1, fontSize: 13 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < rating ? "var(--gold-400)" : "var(--onyx-700)" }}>★</span>
      ))}
    </span>
  );
}

function ApproveModal({
  visitId,
  receiptAmount,
  onClose,
  onApproved,
}: {
  visitId: string;
  receiptAmount: number | null | undefined;
  onClose: () => void;
  onApproved: () => void;
}) {
  const [amount, setAmount] = useState(String(receiptAmount ?? ""));
  const [notes, setNotes] = useState("");

  const approve = trpc.mysteryShoppers.approve.useMutation({
    onSuccess: () => { onApproved(); onClose(); },
  });

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: "var(--onyx-900)", border: "1px solid var(--onyx-700)",
        borderRadius: 2, padding: 28, maxWidth: 400, width: "100%",
        boxShadow: "6px 8px 0 rgba(0,0,0,0.7)",
      }}>
        <div style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 24, fontWeight: 300, fontStyle: "italic",
          color: "var(--cream-100)", marginBottom: 20,
        }}>
          Approve Reimbursement
        </div>

        <label style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--onyx-500)", display: "block", marginBottom: 6,
        }}>
          Reimbursement Amount (R)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "100%", background: "var(--onyx-800)",
            border: "1px solid var(--onyx-700)", borderRadius: 2,
            padding: "10px 14px", color: "var(--cream-100)",
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14,
          }}
        />

        <label style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--onyx-500)", display: "block", marginBottom: 6,
        }}>
          Admin Notes (optional)
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            width: "100%", background: "var(--onyx-800)",
            border: "1px solid var(--onyx-700)", borderRadius: 2,
            padding: "10px 14px", color: "var(--cream-100)",
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 13, outline: "none", boxSizing: "border-box",
            resize: "none", marginBottom: 20,
          }}
        />

        {approve.error && (
          <div style={{ color: "#e57373", fontSize: 12, marginBottom: 12,
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}>
            {approve.error.message}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => approve.mutate({
              visitId,
              reimbursementAmount: parseFloat(amount),
              adminNotes: notes || undefined,
            })}
            disabled={!amount || approve.isPending}
            style={{
              flex: 1, padding: "11px 16px",
              background: "transparent",
              border: "1px solid rgba(201,168,92,0.55)",
              borderRadius: 2, cursor: "pointer",
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 16, fontWeight: 300, fontStyle: "italic",
              color: "var(--gold-400)",
              opacity: !amount || approve.isPending ? 0.5 : 1,
            }}
          >
            {approve.isPending ? "Approving…" : "Approve"}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "11px 18px",
              background: "transparent",
              border: "1px solid var(--onyx-700)",
              borderRadius: 2, cursor: "pointer",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
              color: "var(--onyx-400)",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MysteryShoppersAdminPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [approveTarget, setApproveTarget] = useState<{ id: string; amount?: number | null } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: visits, refetch } = trpc.mysteryShoppers.listForAdmin.useQuery({
    locationId: LOCATION_ID,
    status: statusFilter || undefined,
  });

  const markReimbursed = trpc.mysteryShoppers.markReimbursed.useMutation({
    onSuccess: () => refetch(),
  });

  const statusTabs = [
    { value: "", label: "All" },
    { value: "applied", label: "Applied" },
    { value: "completed", label: "Completed" },
    { value: "approved", label: "Approved" },
    { value: "reimbursed", label: "Reimbursed" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "var(--onyx-950)", padding: "32px 24px 80px" }}>
      {approveTarget && (
        <ApproveModal
          visitId={approveTarget.id}
          receiptAmount={approveTarget.amount}
          onClose={() => setApproveTarget(null)}
          onApproved={() => refetch()}
        />
      )}

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase",
            color: "var(--gold-400)", marginBottom: 6,
          }}>
            Admin
          </div>
          <h1 style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 34, fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-100)", lineHeight: 1,
          }}>
            Mystery Shoppers
          </h1>
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              style={{
                padding: "6px 14px",
                background: statusFilter === tab.value ? "rgba(201,168,92,0.12)" : "transparent",
                border: statusFilter === tab.value ? "1px solid rgba(201,168,92,0.55)" : "1px solid var(--onyx-700)",
                borderRadius: 2, cursor: "pointer",
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                color: statusFilter === tab.value ? "var(--gold-400)" : "var(--onyx-400)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Summary counts */}
        {!statusFilter && visits && (
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => {
              const count = visits.filter((v) => v.status === key).length;
              if (!count) return null;
              return (
                <div key={key} style={{
                  background: "var(--onyx-900)", border: "1px solid var(--onyx-800)",
                  borderRadius: 2, padding: "8px 14px",
                  boxShadow: "2px 3px 0 rgba(0,0,0,0.4)",
                }}>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 18, fontWeight: 600, color, lineHeight: 1,
                  }}>
                    {count}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "var(--onyx-500)", marginTop: 2,
                  }}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Visit cards */}
        {!visits ? (
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 13, color: "var(--onyx-500)", padding: "40px 0", textAlign: "center",
          }}>
            Loading…
          </div>
        ) : visits.length === 0 ? (
          <div style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 20, fontWeight: 300, fontStyle: "italic",
            color: "var(--onyx-500)", padding: "40px 0", textAlign: "center",
          }}>
            No visits found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visits.map((visit) => {
              const statusInfo = STATUS_LABELS[visit.status] ?? { label: visit.status, color: "var(--onyx-400)" };
              const isExpanded = expanded === visit.id;

              return (
                <div
                  key={visit.id}
                  style={{
                    background: "var(--onyx-900)", border: "1px solid var(--onyx-800)",
                    borderRadius: 2, overflow: "hidden",
                    boxShadow: "3px 4px 0 rgba(0,0,0,0.45)",
                  }}
                >
                  {/* Row header */}
                  <div
                    style={{
                      padding: "16px 20px", display: "flex",
                      alignItems: "center", gap: 16, flexWrap: "wrap", cursor: "pointer",
                    }}
                    onClick={() => setExpanded(isExpanded ? null : visit.id)}
                  >
                    {/* Status */}
                    <div style={{
                      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                      fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                      color: statusInfo.color, flexShrink: 0, width: 76,
                    }}>
                      {statusInfo.label}
                    </div>

                    {/* Client */}
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{
                        fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                        fontSize: 17, fontWeight: 300, fontStyle: "italic",
                        color: "var(--cream-100)", lineHeight: 1,
                      }}>
                        {visit.client.name ?? "—"}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                        fontSize: 11, color: "var(--onyx-500)", marginTop: 2,
                      }}>
                        {visit.client.email}
                      </div>
                    </div>

                    {/* Service */}
                    <div style={{
                      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                      fontSize: 11, color: "var(--cream-400)", minWidth: 100,
                    }}>
                      {visit.serviceToEvaluate ?? <span style={{ color: "var(--onyx-600)" }}>Any</span>}
                    </div>

                    {/* Overall rating */}
                    <div style={{ flexShrink: 0 }}>
                      <StarDisplay rating={visit.overallRating} />
                    </div>

                    {/* Receipt amount */}
                    <div style={{
                      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                      fontSize: 13, fontWeight: 600, color: "var(--cream-100)",
                      flexShrink: 0, minWidth: 60, textAlign: "right",
                    }}>
                      {visit.receiptAmount != null ? `R${visit.receiptAmount.toFixed(2)}` : "—"}
                    </div>

                    {/* Applied date */}
                    <div style={{
                      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                      fontSize: 11, color: "var(--onyx-500)", flexShrink: 0,
                    }}>
                      {new Date(visit.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                    </div>

                    {/* Expand chevron */}
                    <div style={{
                      color: "var(--onyx-600)", fontSize: 12, flexShrink: 0,
                      transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.15s",
                    }}>
                      ▾
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{
                      borderTop: "1px solid var(--onyx-800)",
                      padding: "20px 20px 20px",
                    }}>
                      {/* Ratings grid */}
                      {visit.status !== "applied" && (
                        <div style={{ marginBottom: 18 }}>
                          <div style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
                            color: "var(--onyx-500)", marginBottom: 10,
                          }}>
                            Ratings
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px 16px" }}>
                            {[
                              ["Overall", visit.overallRating],
                              ["First Impression", visit.firstImpressionRating],
                              ["Cleanliness", visit.cleanlinessRating],
                              ["Treatment Quality", visit.treatmentQualityRating],
                              ["Staff Friendliness", visit.staffFriendlinessRating],
                              ["Product Knowledge", visit.productKnowledgeRating],
                              ["Value", visit.valueRating],
                            ].map(([label, rating]) => (
                              <div key={label as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{
                                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                                  fontSize: 11, color: "var(--onyx-400)",
                                }}>
                                  {label as string}
                                </span>
                                <StarDisplay rating={rating as number | undefined} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedback */}
                      {visit.highlightsFeedback && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
                            color: "var(--onyx-500)", marginBottom: 5,
                          }}>
                            Highlights
                          </div>
                          <p style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 13, color: "var(--cream-300)", lineHeight: 1.6, margin: 0,
                          }}>
                            {visit.highlightsFeedback}
                          </p>
                        </div>
                      )}
                      {visit.improvementFeedback && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
                            color: "var(--onyx-500)", marginBottom: 5,
                          }}>
                            Improvements
                          </div>
                          <p style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 13, color: "var(--cream-300)", lineHeight: 1.6, margin: 0,
                          }}>
                            {visit.improvementFeedback}
                          </p>
                        </div>
                      )}
                      {visit.staffFeedback && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
                            color: "var(--onyx-500)", marginBottom: 5,
                          }}>
                            Staff Feedback
                          </div>
                          <p style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 13, color: "var(--cream-300)", lineHeight: 1.6, margin: 0,
                          }}>
                            {visit.staffFeedback}
                          </p>
                        </div>
                      )}

                      {/* Pre-visit notes */}
                      {visit.preVisitNotes && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
                            color: "var(--onyx-500)", marginBottom: 5,
                          }}>
                            Pre-Visit Notes
                          </div>
                          <p style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 13, color: "var(--onyx-400)", lineHeight: 1.6, margin: 0, fontStyle: "italic",
                          }}>
                            {visit.preVisitNotes}
                          </p>
                        </div>
                      )}

                      {/* Receipt link */}
                      {visit.receiptUrl && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
                            color: "var(--onyx-500)", marginBottom: 5,
                          }}>
                            Receipt
                          </div>
                          <a href={visit.receiptUrl} target="_blank" rel="noopener noreferrer" style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 12, color: "var(--gold-400)", textDecoration: "underline",
                          }}>
                            View Receipt
                          </a>
                          {visit.visitedAt && (
                            <span style={{
                              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                              fontSize: 11, color: "var(--onyx-500)", marginLeft: 12,
                            }}>
                              Visited: {new Date(visit.visitedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Would return */}
                      {visit.wouldReturn != null && (
                        <div style={{ marginBottom: 16 }}>
                          <span style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 11, color: "var(--onyx-400)",
                          }}>
                            Would return:{" "}
                          </span>
                          <span style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 11, color: visit.wouldReturn ? "#90cba8" : "#e57373",
                          }}>
                            {visit.wouldReturn ? "Yes" : "No"}
                          </span>
                        </div>
                      )}

                      {/* Admin notes */}
                      {visit.adminNotes && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
                            color: "var(--onyx-500)", marginBottom: 5,
                          }}>
                            Admin Notes
                          </div>
                          <p style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 13, color: "var(--onyx-400)", lineHeight: 1.6, margin: 0,
                          }}>
                            {visit.adminNotes}
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                        {visit.status === "completed" && (
                          <button
                            onClick={() => setApproveTarget({ id: visit.id, amount: visit.receiptAmount })}
                            style={{
                              padding: "9px 18px",
                              background: "transparent",
                              border: "1px solid rgba(201,168,92,0.55)",
                              borderRadius: 2, cursor: "pointer",
                              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                              fontSize: 15, fontWeight: 300, fontStyle: "italic",
                              color: "var(--gold-400)",
                            }}
                          >
                            Approve Reimbursement
                          </button>
                        )}
                        {visit.status === "approved" && (
                          <button
                            onClick={() => markReimbursed.mutate({ visitId: visit.id })}
                            disabled={markReimbursed.isPending}
                            style={{
                              padding: "9px 18px",
                              background: "transparent",
                              border: "1px solid rgba(144,203,168,0.5)",
                              borderRadius: 2, cursor: "pointer",
                              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                              fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                              color: "#90cba8",
                              opacity: markReimbursed.isPending ? 0.5 : 1,
                            }}
                          >
                            {markReimbursed.isPending ? "Marking…" : "Mark Reimbursed"}
                          </button>
                        )}
                        {visit.status === "reimbursed" && visit.reimbursementAmount != null && (
                          <div style={{
                            padding: "9px 18px",
                            background: "var(--onyx-800)",
                            border: "1px solid var(--onyx-700)",
                            borderRadius: 2,
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 11, color: "var(--onyx-400)",
                          }}>
                            Reimbursed R{visit.reimbursementAmount.toFixed(2)}
                            {visit.reimbursedAt && (
                              <span style={{ marginLeft: 8, color: "var(--onyx-600)" }}>
                                {new Date(visit.reimbursedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
