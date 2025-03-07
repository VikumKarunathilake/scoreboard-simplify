
import { useState, useEffect } from "react";
import { scoresAPI } from "@/lib/api";
import { Score } from "@/types";
import { HOUSES } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ScoreBoard() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getHouseColorClass = (houseName: string) => {
    for (const [key, house] of Object.entries(HOUSES)) {
      if (house.name.toLowerCase() === houseName.toLowerCase()) {
        return house.colorClass;
      }
    }
    return "bg-gray-400"; // Default color
  };

  const getMaxScore = () => {
    if (scores.length === 0) return 0;
    return Math.max(...scores.map((score) => score.score));
  };

  // Sort scores in descending order
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  if (loading) {
    return (
      <div className="space-y-4 w-full max-w-4xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-center mb-6">House Scores</h2>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between mb-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const maxScore = getMaxScore();

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm animate-scale-in">
      <h2 className="text-2xl font-semibold text-center mb-6">House Scores</h2>
      <div className="space-y-6">
        {sortedScores.map((score) => {
          const progressPercentage = maxScore > 0 ? (score.score / maxScore) * 100 : 0;
          const colorClass = getHouseColorClass(score.house);
          
          return (
            <div key={score.id} className="space-y-2">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{score.house}</span>
                <span className="font-semibold">{score.score}</span>
              </div>
              <div className="h-8 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000 ease-out", colorClass)}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
