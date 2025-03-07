
export interface Score {
  id: number;
  house: string;
  score: number;
}

export interface Event {
  id: number;
  name: string;
  date: string;
  description: string;
}

export interface House {
  name: string;
  color: string;
  colorClass: string;
  textColorClass: string;
  borderColorClass: string;
}

export const HOUSES: Record<string, House> = {
  "yellow": {
    name: "Atigala",
    color: "#FFE600",
    colorClass: "bg-house-yellow",
    textColorClass: "text-house-yellow",
    borderColorClass: "border-house-yellow"
  },
  "green": {
    name: "Parakrama",
    color: "#009900",
    colorClass: "bg-house-green",
    textColorClass: "text-house-green",
    borderColorClass: "border-house-green"
  },
  "red": {
    name: "Vijaya",
    color: "#FF0000",
    colorClass: "bg-house-red",
    textColorClass: "text-house-red",
    borderColorClass: "border-house-red"
  },
  "blue": {
    name: "Gemunu",
    color: "#0028FF",
    colorClass: "bg-house-blue",
    textColorClass: "text-house-blue",
    borderColorClass: "border-house-blue"
  }
};
