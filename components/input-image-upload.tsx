"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InputImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setLoading(true);
    try {
      const res = await fetch("/api/input", {
        method: "POST",
        body: formData,
      });
      const text = await res.text();
      if (res.ok) {
        try {
          setResult(JSON.stringify(JSON.parse(text), null, 2));
        } catch {
          setResult(text);
        }
      } else {
        setResult(text);
      }
    } catch (err) {
      setResult(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>Image to Input Data</CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button type="submit" disabled={!file || loading}>
            {loading ? "解析中..." : "送信"}
          </Button>
        </form>
        {result && (
          <pre className="mt-2 text-xs whitespace-pre-wrap">{result}</pre>
        )}
      </CardContent>
    </Card>
  );
}

