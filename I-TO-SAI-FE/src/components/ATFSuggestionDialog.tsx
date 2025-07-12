import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { ATFSuggestionDetail } from "@/App";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

interface Props {
  goal: string;
  pastSuggestions: ATFSuggestionDetail[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updateATFResponses: (goal: string, reasonAndGuidance: ATFSuggestionDetail) => void;
}

export function ATFSuggestionDialog({ goal, pastSuggestions, open, onOpenChange, updateATFResponses }: Props) {
  const [reason, setReason] = useState("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const fetchSuggestion = () => {
    const trimmed = reason.trim().toLowerCase();
    const dupIdx = pastSuggestions.findIndex(s => s.reason.toLowerCase() === trimmed);
    if (dupIdx >= 0) {
      setHighlightedIndex(dupIdx);
      setTimeout(() => setHighlightedIndex(null), 800);
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestion(null);

    fetch(
      `${window.location.origin}/api/getATFSuggestion?goal=${encodeURIComponent(goal)}&reason=${encodeURIComponent(reason)}`,
      { credentials: "include" }
    )
      .then((res) => {
        if (!res.ok) throw new Error("AI suggestion failed");
        return res.text();
      })
      .then((text) => {
        setSuggestion(text);
        updateATFResponses(goal, {reason, guidance: text});
      })
      .catch(() => {
        setError("Failed to fetch suggestion. API error.");
      })
      .finally(() => setLoading(false));
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputText = e.target.value;
    inputText = inputText.replace(/\s{3,}/g, "  ");
    const words = inputText.trim().split(/\s+/);

    if (words.length <= 50) {
      setReason(inputText);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl border border-yellow-300 shadow-xl bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 px-6 py-4">
        <DialogHeader>
          <DialogTitle className="mt-5 text-orange-700 text-xl font-bold">
            Goal: <span className="text-gray-800">{goal}</span>
          </DialogTitle>
          {!suggestion && (
            <DialogDescription className="text-sm text-gray-600 mt-2">
              Please share what made this particularly difficult for you today.
            </DialogDescription>
          )}
        </DialogHeader>

        {pastSuggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-orange-600 mb-2">Past Suggestions</h3>
            <Accordion type="single" collapsible>
              {pastSuggestions.map((s, i) => (
                <AccordionItem key={i} value={`suggestion-${i}`}>  
                  <AccordionTrigger 
                    className={`bg-white p-3 rounded-lg border border-orange-200 hover:bg-orange-50
                                ${highlightedIndex === i ? "ring-2 ring-red-500 animate-pulse" : ""}`}
                  >
                    Reason: "{s.reason}"
                  </AccordionTrigger>
                  <AccordionContent className="bg-white/80 p-3 border-l-4 border-orange-300 rounded-b-lg">
                    <p className="text-gray-700 whitespace-pre-line">
                      {s.guidance}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {!suggestion && (
          <div className="mt-3">
            <Input
              placeholder="Type your reason... (max 50 words)"
              value={reason}
              onChange={handleReasonChange}
              maxLength={500}
              className="border-orange-300 focus:ring-orange-300 focus:border-orange-400 bg-white/80"
            />
            <p
              className={`text-sm mt-1 ${
                reason.trim().split(/\s+/).length > 50 ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {reason.trim() ? reason.trim().split(/\s+/).length : 0}/50 words
            </p>

            <DialogFooter className="mt-4">
              <Button
                onClick={fetchSuggestion}
                disabled={loading || !reason.trim()}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Fetching...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </DialogFooter>
            {error && (<p className="text-red-500 text-sm mt-2 font-medium">{error}</p>)}
          </div>
        )}

        {suggestion && (
          <div className="mt-4 bg-white/70 p-4 rounded-lg border border-orange-200 shadow-inner text-gray-700">
            <p className="whitespace-pre-line text-sm leading-relaxed">{suggestion}</p>
          </div>
        )}
        {suggestion && (
          <DialogFooter className="mt-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-orange-400 text-white hover:bg-orange-500"
            >
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
