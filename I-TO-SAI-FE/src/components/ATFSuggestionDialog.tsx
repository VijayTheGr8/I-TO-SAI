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

interface Props {
  struggle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ATFSuggestionDialog({ struggle, open, onOpenChange }: Props) {
  const [reason, setReason] = useState("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestion = () => {
    setLoading(true);
    setError(null);
    setSuggestion(null);

    fetch(
      `http://localhost/api/getATFSuggestion?struggle=${encodeURIComponent(struggle)}&reason=${encodeURIComponent(reason)}`,
      { credentials: "include" }
    )
      .then((res) => {
        if (!res.ok) throw new Error("AI suggestion failed");
        return res.text();
      })
      .then((text) => {
        setSuggestion(text);
      })
      .catch(() => {
        setError("failed to fetch suggestion. api error.");
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
            Struggle: <span className="text-gray-800">{struggle}</span>
          </DialogTitle>
          {!suggestion && (
            <DialogDescription className="text-sm text-gray-600 mt-2">
              Please share what made this particularly difficult for you today.
            </DialogDescription>
          )}
        </DialogHeader>

        {!suggestion && (
          <div className="mt-3">
            <Input
                placeholder="Type your reason... (max 50 words)"
                value={reason}
                onChange={handleReasonChange}
                className="border-orange-300 focus:ring-orange-300 focus:border-orange-400 bg-white/80"
            />
            <p className={`text-sm mt-1 ${reason.trim().split(/\s+/).length > 50 ? 'text-red-500' : 'text-gray-500'}`}>
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
            {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
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
