"use client";
import { useState } from "react";

type Difficulty = "easy" | "medium" | "hard";
type FormDataState = {
  fandom: string;
  customFandom: string;
  difficulty: Difficulty;
  count: number;
};

export default function TriviaPage() {
  const [formData, setFormData] = useState<FormDataState>({
    fandom: "Dragon Ball",
    customFandom: "",
    difficulty: "easy",
    count: 5,
  });
  const [items, setItems] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 👇 Type the event to satisfy TS
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === "count") {
        const n = parseInt(value, 10);
        return { ...prev, count: Number.isFinite(n) ? n : prev.count };
      }
      // name matches a key on FormDataState
      return { ...prev, [name]: value } as FormDataState;
    });
  };

  // …rest of your component (generate, save, render, etc.)
}