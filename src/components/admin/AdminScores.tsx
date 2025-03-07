
import { useState, useEffect } from "react";
import { scoresAPI } from "@/lib/api";
import { Score, HOUSES } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminScores() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const response = await scoresAPI.getScores();
        setScores(response.data);
      } catch (error) {
        console.error("Failed to fetch scores", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  const handleScoreChange = (house: string, value: string) => {
    const updatedScores = scores.map((score) => {
      if (score.house === house) {
        return { ...score, score: parseInt(value) || 0 };
      }
      return score;
    });
    setScores(updatedScores);
  };

  const updateScore = async (house: string, score: number) => {
    try {
      setUpdating({ ...updating, [house]: true });
      await scoresAPI.updateScore(house, score);
      toast({
        title: "Score updated",
        description: `Successfully updated score for ${house}`,
      });
    } catch (error) {
      console.error("Failed to update score", error);
    } finally {
      setUpdating({ ...updating, [house]: false });
    }
  };

  return (
    <div className="p-6 pt-0">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {scores.map((score) => {
            const houseKey = Object.entries(HOUSES).find(
              ([_, h]) => h.name.toLowerCase() === score.house.toLowerCase()
            )?.[0];
            
            const house = houseKey ? HOUSES[houseKey] : null;
            const borderColor = house?.borderColorClass || "border-gray-200";
            
            return (
              <Card 
                key={score.id} 
                className={`overflow-hidden border-2 ${borderColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">{score.house}</h3>
                    <div 
                      className={`w-6 h-6 rounded-full ${house?.colorClass || "bg-gray-400"}`}
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <Input
                      type="number"
                      value={score.score}
                      onChange={(e) => handleScoreChange(score.house, e.target.value)}
                      min={0}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => updateScore(score.house, score.score)}
                      disabled={updating[score.house]}
                    >
                      {updating[score.house] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
